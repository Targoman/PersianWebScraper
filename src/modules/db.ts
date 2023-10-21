import DatabaseConstructor, { Database } from 'better-sqlite3';
import { log } from './logger';
import { enuDomains } from './interfaces';
import { existsSync, mkdirSync } from 'fs';
import gConfigs from './gConfigs';

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
    private domain: enuDomains

    constructor(domain: enuDomains) {
        this.domain = domain
    }

    init() {
        if (!gConfigs.db)
            throw new Error("db config not set")

        if (!existsSync(gConfigs.db))
            if (!mkdirSync(gConfigs.db, { recursive: true }))
                throw new Error("Unable to create db directory: " + gConfigs.db)

        this.db = new DatabaseConstructor(`${gConfigs.db}/urls-${this.domain}.db`, {
            verbose: (command) => log.db(command)
        });
        this.db.pragma('journal_mode = WAL');
        ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(
            signal => process.on(signal, () => { log.info("Closing DB on exit"); try { this.db.close(); process.exit() } catch (e) {/**/ } })
        )

        this.db.exec(`CREATE TABLE IF NOT EXISTS tblURLs(
                'id' INTEGER PRIMARY KEY AUTOINCREMENT, 
                'url' TEXT NOT NULL UNIQUE, 
                'creation' TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                'lastChange' TIMESTAMP DEFAULT NULL,
                'status' CHAR CHECK( status IN ('N','I','E', 'D', 'C', 'F') ) DEFAULT 'N',
                'wc' INTEGER DEFAULT 0,
                'lastError' TEXT DEFAULT NULL
            )`)
    }

    runQuery(query: string) {
        if (query.toUpperCase().startsWith("SELECT"))
            return this.db.prepare(query).all()
        else
            return this.db.prepare(query).run()
    }

    addToMustFetch(url: string) {
        const insert = this.db.prepare(`INSERT OR IGNORE INTO tblURLs (url) VALUES (?)`)
        return insert.run(url)
    }

    setStatus(id: number, status: enuURLStatus, err: string | null = null, wc: number | null = null) {
        this.db.prepare(`UPDATE tblURLs 
                                SET status = ?,
                                    lastError = ?,
                                    lastChange = strftime('%Y-%m-%d %H-%M-%S','now'),
                                    wc = ?
                              WHERE id = ?`)
            .run(status, err, wc, id)
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
                            WHERE status='I'`)
            .run()
    }

    nextURL(status: enuURLStatus) {
        const select = this.db.prepare(`SELECT id, url 
                                          FROM tblURLs 
                                         WHERE status = ? 
                                           AND (
                                            lastError IS NULL 
                                            OR ( 
                                                    lastError NOT LIKE '%code 400%' 
                                                AND lastError NOT LIKE '%code 403%' 
                                                AND lastError NOT LIKE '%code 404%' 
                                                AND lastError NOT LIKE '%code 414%' 
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

