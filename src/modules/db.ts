import DatabaseConstructor, { Database } from 'better-sqlite3';
import { log } from './logger';
import { INVALID_URL, enuDomains } from './interfaces';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'fs';
import gConfigs from './gConfigs';
import { Md5 } from 'ts-md5';
import { always, date2Gregorian } from './common';
import * as scrappers from '../scrappers'
import { clsScrapper } from './clsScrapper';

export enum enuURLStatus {
    New = 'N',
    InProcess = 'I',
    Error = 'E',
    Discarded = 'D',
    Content = "C",
    Finished = 'F'
}

export default class clsDB {
    private db: Database
    private oldDB: Database
    private domain: enuDomains

    constructor(domain: enuDomains) {
        this.domain = domain
    }

    init(checkURLWithFiles = false) {
        if (!gConfigs.db)
            throw new Error("db config not set")

        if (!existsSync(gConfigs.db))
            if (!mkdirSync(gConfigs.db, { recursive: true }))
                throw new Error("Unable to create db directory: " + gConfigs.db)

        this.db = new DatabaseConstructor(`${gConfigs.db}/${this.domain}.new.db`, {
            verbose: (command) => log.db(command)
        });
        this.db.pragma('journal_mode = WAL');

        ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(
            signal => process.on(signal, () => { log.info("Closing DB on exit"); try { this.db.close(); this.oldDB.close(); process.exit() } catch (e) {/**/ } })
        )

        this.db.exec(`CREATE TABLE IF NOT EXISTS tblURLs(
                'id' INTEGER PRIMARY KEY AUTOINCREMENT, 
                'url' TEXT NOT NULL UNIQUE, 
                'hash' TEXT NOT NULL UNIQUE,
                'creation' TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                'lastChange' TIMESTAMP DEFAULT NULL,
                'status' CHAR CHECK( status IN ('N','I','E', 'D', 'C', 'F') ) DEFAULT 'N',
                'wc' INTEGER DEFAULT 0,
                'docDate' TEXT DEFAULT NULL,
                'lastError' TEXT DEFAULT NULL
            )`)

        const listAllFiles = () => {
            const fileMap = {}
            const listAllFiles = (dir: string) => {
                log.progress("loading " + dir)
                if (!existsSync(dir)) {
                    if (existsSync(dir + ".tgz"))
                        throw new Error("Directory not found but there is the compressed version!")
                    else
                        throw new Error("Directory not found!")
                }
                const files = readdirSync(dir);

                for (const file of files) {
                    const filePath = `${dir}/${file}`;
                    const fileStat = statSync(filePath);
                    if (fileStat.isDirectory())
                        listAllFiles(filePath);
                    else
                        fileMap[file.replace(".json", "")] = { d: date2Gregorian(dir.split('/').at(-1)), p: filePath }
                }
            }

            log.info("Listing files")
            listAllFiles(gConfigs.corpora + "/" + this.domain)
            log.info(`There are ${Object.keys(fileMap).length} entries`)
            return fileMap
        }

        if (!this.hasAnyURL() && existsSync(`${gConfigs.db}/${this.domain}.db`)) {
            const fileMap = listAllFiles()
            log.warn("moving old DB to new structure")
            let lastID = 0
            let count = 0
            this.oldDB = new DatabaseConstructor(`${gConfigs.db}/${this.domain}.db`, {
                verbose: (command) => log.db(command)
            });
            this.oldDB.pragma('journal_mode = WAL');

            try {
                while (always) {
                    const orc: any = this.oldDB.prepare(`SELECT * FROM tblURLs WHERE id > ? LIMIT 1`).get(lastID)
                    if (orc) {
                        const insert = this.db.prepare(`INSERT OR IGNORE INTO tblURLs 
                                                        (url,hash,creation,lastChange,status,wc,docDate,lastError) 
                                                    VALUES (?  ,?   ,?       ,?         ,?     ,? ,?      ,?  )`)
                        const hash = Md5.hashStr(orc.url)
                        let docDate: string | undefined = undefined
                        if (orc.status === 'C') {
                            docDate = fileMap[hash]?.d
                            if (!docDate || docDate === "IGNORED" || docDate === "NO_DATE")
                                docDate = "NOT_SET"

                            log.debug(`Inserting: ${orc.url} =>${hash}: ${docDate}`)
                        }

                        if (count % 1000 === 0)
                            log.status({ i: `Migration progress: `, count, lastID })

                        insert.run(orc.url, hash, orc.creation, orc.lastChange, orc.status, orc.wc, docDate || null, orc.lastError)
                        lastID = orc.id
                        count++
                    } else
                        break
                }
                this.oldDB.close()
                log.status({ 'Moved from oldDB': count })
                const trashBin = gConfigs.db + "/trash"
                if (!existsSync(trashBin))
                    if (!mkdirSync(trashBin, { recursive: true }))
                        throw new Error("Unable to create trash directory: " + trashBin)
                renameSync(`${gConfigs.db}/${this.domain}.db`, `${trashBin}/${this.domain}.db`)
            } catch (e) {
                log.error(e)
                process.exit()
            }
        }

        if (checkURLWithFiles) {
            const fileMap = listAllFiles()
            let lastID = 0
            let count = 0
            let updated = 0
            let deleted = 0

            const scrapper: clsScrapper = new scrappers[this.domain]
            if (!scrapper)
                throw new Error("Unable to find scrapper for: " + this.domain)

            while (always) {
                const rc: any = this.db.prepare(`SELECT * FROM tblURLs WHERE status!='D' AND id > ? LIMIT 1`).get(lastID)
                if (!rc)
                    break;

                const normalizedURL = scrapper.normalizeURL(rc.url)
                const oldHash = Md5.hashStr(rc.url)
                const newHash = Md5.hashStr(normalizedURL || "")
                const docSpec = fileMap[oldHash]

                if (normalizedURL != rc.url) {
                    log.warn("Stored URL has changed", rc.url, normalizedURL)

                    if (rc.status !== enuURLStatus.Content) {
                        if (normalizedURL === INVALID_URL)
                            this.safeUpdate(rc.url, enuURLStatus.Discarded, rc.url, oldHash)
                        else
                            this.safeUpdate(rc.url, rc.status, normalizedURL, newHash)
                    } else {
                        if (fileMap[oldHash]) {
                            const content = readFileSync(fileMap[oldHash].p, 'utf8')
                            const json = JSON.parse(content)
                            json.url = normalizedURL
                            const path = fileMap[oldHash].p.split("/")
                            log.warn("Stored URL is being updated", rc.url, normalizedURL)
                            path.pop()
                            const newFile = path.join("/") + "/" + newHash + ".json"
                            try {
                                writeFileSync(newFile, JSON.stringify(json))
                                rmSync(fileMap[oldHash].p)
                                this.safeUpdate(rc.url, enuURLStatus.Content, normalizedURL, newHash)
                                updated++
                            } catch (e) {
                                log.debug(e)
                                log.warn("Unable to inplace update so removing and adding to fetch")
                                this.db.prepare(`DELETE FROM tblURLs WHERE url=?`).run(rc.url)
                                this.addToMustFetch(normalizedURL)
                                deleted++
                            }
                        } else {
                            log.warn("File not stored: ", oldHash)
                            this.safeUpdate(rc.url, enuURLStatus.New, normalizedURL, newHash)
                            updated++
                        }
                    }
                }

                if (rc.status === enuURLStatus.Content) {
                    if (normalizedURL.includes("//www.cdn") || rc.url.includes("//www.static")) {
                        this.db.prepare(`DELETE FROM tblURLs WHERE id=?`).run(normalizedURL)
                        log.progress("DELETED FROM DB: ", normalizedURL)
                        deleted++
                    } else if (!docSpec) {
                        this.db.prepare(`UPDATE tblURLs SET status='N', wc=0 WHERE id=?`).run(rc.id)
                        log.progress("RE-FETCH: ", normalizedURL)
                        updated++
                    }
                }

                if (count % 1000 === 0)
                    log.status({ i: `DB process: `, count, updated, deleted, lastID })

                lastID = rc.id
                count++
            }

            log.status("Removing extra files")
            const hashes = Object.keys(fileMap)
            let filesChecked = 0
            hashes.forEach(hash => {
                const rc: any = this.db.prepare(`SELECT status FROM tblURLs WHERE hash = ? AND status = 'C' LIMIT 1`).get(hash)
                if (!rc) {
                    if (existsSync(fileMap[hash].p)) {
                        rmSync(fileMap[hash].p)
                        log.progress("DELETED FILE: ", fileMap[hash].p)
                        deleted++
                    }
                }
                if (filesChecked % 1000 === 0)
                    log.status({ i: `FileCheck progress: `, progress: ((filesChecked / hashes.length) * 10000) / 100, updated, deleted })
                filesChecked++
            })

            log.status({ i: `All finished: `, count, updated, deleted })
        }

        this.db.prepare(`UPDATE tblURLs set wc=0 WHERE status != 'C' LIMIT 1`).run()
    }

    safeUpdate(oldURL: string, newStatus: enuURLStatus, newURL: string, newHash: string) {
        try {
            const q = this.db.prepare("SELECT url, status FROM tblURLs WHERE url =? ").get(oldURL)
            if (q) {
                log.warn("Normalized URL was stored before: ", q['url'], q['status'])
                this.db.prepare("UPDATE tblURLs SET status='D' WHERE url=?").run(oldURL)
            } else {
                this.db.prepare("UPDATE tblURLs SET url=?, status=?, hash=? WHERE url=?").run(newURL, newStatus, newHash, oldURL)
            }
        } catch (e) {
            log.debug(e)
            process.exit()
        }
    }

    runQuery(query: string) {
        if (query.toUpperCase().startsWith("SELECT"))
            return this.db.prepare(query).all()
        else
            return this.db.prepare(query).run()
    }

    addToMustFetch(url: string) {
        return this.db.prepare(`INSERT OR IGNORE INTO tblURLs (url, hash) VALUES (?,?)`).run(url, Md5.hashStr(url))
    }

    setStatus(id: number, status: enuURLStatus, err: string | null = null, wc: number | null = null, docDate: string | null = null) {
        this.db.prepare(`UPDATE tblURLs 
                                SET status = ?,
                                    lastError = ?,
                                    lastChange = strftime('%Y-%m-%d %H-%M-%S','now'),
                                    wc = ?,
                                    docDate = ?
                              WHERE id = ?`)
            .run(status, err, wc, docDate, id)
    }

    hasAnyURL() {
        return this.db.prepare(`SELECT 1 FROM tblURLs LIMIT 1`).get()
    }

    stats() {
        return this.db.prepare(`
            SELECT SUM(CASE WHEN(status = 'N') THEN 1 ELSE 0 END) AS remaining, 
                   SUM(1) AS total,
                   SUM(CASE WHEN(status = 'E') THEN 1 ELSE 0 END) AS error, 
                   SUM(CASE WHEN(status = 'D') THEN 1 ELSE 0 END) AS discarded, 
                   SUM(CASE WHEN(status = 'F' OR status = 'C') THEN 1 ELSE 0 END) AS processed,
                   SUM(CASE WHEN(status = 'C') THEN 1 ELSE 0 END) AS docs, 
                   SUM(wc) AS wc,
                   SUM(CASE WHEN(status = 'I') THEN 1 ELSE 0 END) AS fetching
              FROM tblURLs
        `).get()
    }

    reset() {
        return this.db.prepare(`UPDATE tblURLs 
                            SET status = 'N',
                                lastError = null,
                                lastChange = strftime('%Y-%m-%d %H-%M-%S','now')
                            WHERE status IN ('I','N')`)
            .run()
    }

    nextURL(status: enuURLStatus) {
        const select = this.db.prepare(`SELECT id, url 
                                          FROM tblURLs 
                                         WHERE status = ? 
                                           AND (
                                            lastError IS NULL 
                                            OR (status = 'E'
                                                AND lastError NOT LIKE '%code 400%' 
                                                AND lastError NOT LIKE '%code 403%' 
                                                AND lastError NOT LIKE '%code 404%' 
                                                AND lastError NOT LIKE '%code 414%' 
                                                AND lastError NOT LIKE 'Invalid date%'
                                            ))
                                         ORDER BY lastChange ASC, creation ASC
                                         LIMIT 1`)
        const update = this.db.prepare(`UPDATE tblURLs 
                                           SET status = 'I', 
                                               lastChange = strftime('%Y-%m-%d %H-%M-%S','now')
                                         WHERE id = ? `)
        let result: any
        const transaction = this.db.transaction(() => {
            result = select.get(status)
            if (result)
                update.run(result.id)
        })

        transaction()
        return result
    }

}

