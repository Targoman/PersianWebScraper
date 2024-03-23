import { string, optional, number, positional, option, oneOf, flag } from 'cmd-ts';
import { command, run } from 'cmd-ts';
import { enuDomains, enuMajorCategory, IntfDocFilecontent as IntfDocFileContent, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log as gLogger } from "./modules/logger";
import gConfigs from './modules/gConfigs';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { formatNumber, date2Gregorian, normalizeText, wordCount } from './modules/common';
import { clsScrapper } from './modules/clsScrapper';
import * as scrappers from './scrappers'
import clsDB from "./modules/db"
import util from 'util'
import { exec } from 'child_process'
const pExec = util.promisify(exec);

enum enuCommands {
    catStats = 'catStats',
    normalize = "normalize",
    toText = "toText",
    toJsonl = "toJsonl",
    checkCategories = "checkCategories"
}

enum enuDateResolution {
    day = "day",
    month = "month",
    year = "year"
}

enum enuCategory {
    fullStr,
    full,
    major,
    minor,
    none
}

interface IntfCatStats {
    [key: string]: {
        docs: number
        oldestArticleDate: Date | undefined,
        newestArticleDate: Date | undefined,
        mainWC: number
        mainParagraphs: number
        titleWC: number
        subtitleWC: number
        surtitleWC: number
        summaryWC: number
        altWC: number
        commentCount: number
        commentWC: number
        qaCount: number
        qaWC: number
        totalWC: number
    }
}
const args = {
    command: positional({ type: oneOf(Object.keys(enuCommands).concat(Object.values(enuCommands).map(e => e.toLowerCase()))), displayName: "Command", description: `Command to be executed can be one of:  ${Object.keys(enuCommands).join(", ")}` }),
    configFile: option({ type: optional(string), long: 'configFile', short: "c", description: "set configFile to be used" }),
    debugVerbosity: option({ type: optional(number), long: 'verbosity', short: "v", description: "set verbosity level from 0 to 10" }),

    corporaPath: option({ type: optional(string), long: 'corporaPath', description: "Path to corpora" }),
    targetPath: option({ type: optional(string), long: 'target', short: "t", description: "Target Folder to store results on converting to text or jsonl" }),
    statFile: option({ type: optional(string), long: 'statFile', short: "s", description: "path to store result CSV" }),

    domain: option({ type: optional(oneOf(Object.keys(enuDomains).concat(Object.values(enuDomains)))), long: 'domain', short: "d", description: `Domain to be checked${Object.keys(enuDomains).join(", ")}. If ommited all domains will be checked` }),

    keepOriginalCat: flag({ long: "keepOriginalCat", description: "reports original category even if there are mapped category" }),
    forceNormal: flag({ long: "forceNormal", description: "forces normalization of category even if the category was set priorly" }),

    minDocWC: option({ type: optional(number), long: 'minwc', description: "Minimum word count of target document file" }),

    justFormal: flag({ long: "justFormal", description: "limits extraction to Title, AboveTitle, subtitle, summary, main content, alt" }),
    justInformal: flag({ long: "justInformal", description: "limits extraction to comments" }),
    validMajorCats: option({ type: optional(string), long: 'validMajorCats', description: "Comma separated major cats" }),
    validMinorCats: option({ type: optional(string), long: 'validMinorCats', description: "Comma separated minor cats" }),
    invalidMajorCats: option({ type: optional(string), long: 'invalidMajorCats', description: "Comma separated major cats to exclude" }),
    invalidMinorCats: option({ type: optional(string), long: 'invalidMinorCats', description: "Comma separated minor cats to exclude" }),

    altAsFormalText: flag({ long: "altAsFormalText", description: "output ALT text as formal text" }),
    dateResolution: option({ type: optional(oneOf(Object.keys(enuDateResolution))), long: 'dateRes', description: `Target path date resolution can be:  ${Object.keys(enuDateResolution).join(", ")}` }),
    minDate: option({ type: optional(string), long: 'minDate', description: "Min date to extract texts" }),
}

let scLog: clsLogger

async function processDir(args: any,
    processor: { (scrapper: clsScrapper, doc: IntfDocFileContent | any, filePath: string): void },
    beforeProcess: { (scrapper: clsScrapper): Promise<void> } | undefined = undefined,
    afterProcess: { (scrapper: clsScrapper): Promise<void> } | undefined = undefined,
    isCSV = false) {
    function getScrapper(domain?: string) {
        if (!domain) return undefined
        const scrapper = new scrappers[domain];
        if (!scrapper)
            throw new Error(`domain ${domain} is not supported yet`);
        scLog = new clsLogger(domain)
        scLog.progress("Processing ", domain);
        return scrapper
    }
    async function processDirInternal(dir: string, scrapper?: clsScrapper) {
        const dirItems = readdirSync(dir)
        for (const item of dirItems) {
            const absPath = path.join(dir, item);
            if (isCSV) {
                if (absPath.endsWith(".csv")) {
                    const scrapperName = item.replace(".csv", "")
                    if (args.domain && args.domain != scrapperName)
                        continue
                    processor(getScrapper(scrapperName), readFileSync(absPath, 'utf8'), absPath);
                } else
                    continue
            } else if (statSync(absPath).isDirectory()) {
                const activeScrapper = scrapper || getScrapper(item)
                if (!scrapper && beforeProcess) await beforeProcess(activeScrapper)
                await processDirInternal(absPath, activeScrapper);
                if (!scrapper && afterProcess) await afterProcess(activeScrapper)
            } else if (scrapper && typeof scrapper !== "string") {
                if (absPath.endsWith('.updated')) continue
                try {
                    const data = readFileSync(absPath, 'utf8')
                    processor(scrapper, JSON.parse(data), absPath);
                } catch (e) {
                    scLog.error("Invalid JSON File: ", absPath, e)
                }
            }
        }
    }
    const activeScrapper = getScrapper(args.domain)
    if (args.domain && beforeProcess) await beforeProcess(activeScrapper)
    await processDirInternal((gConfigs.corpora || "./corpora/") + "/" + (isCSV ? "" : args.domain || ""), activeScrapper)
    if (args.domain && afterProcess)
        await afterProcess(activeScrapper)

}

const app = command({
    name: 'tgscrapprocessor',
    args,
    handler: async (args: any) => {
        void args
        let conf: IntfGlobalConfigs = {}
        if (args.configFile) {
            try {
                /* eslint-disable */
                conf = require(args.configFile)
                /* eslint-enable */
                gLogger.info("Config file loaded")
            } catch (e) {
                throw new Error("Unable to load config file: " + args.configFile)
            }
        } else {
            try {
                /* eslint-disable */
                conf = require(process.cwd() + "/.config.json")
                /* eslint-enable */
                gLogger.info("Default config file loaded")
            } catch (e) {
                /* */
            }
        }

        for (const key in gConfigs)
            gConfigs[key] = (args[key] !== undefined ? args[key] : (conf[key] !== undefined ? conf[key] : gConfigs[key]))
        clsLogger.setVerbosity(args.verbosity || gConfigs.debugVerbosity || 0)

        gLogger.info({ activeConfigs: gConfigs })

        if (args.validMajorCats)
            args.validMajorCats = args.validMajorCats.split(",").map((cat: string) => { if (!enuCategory[cat]) throw new Error("Invalid Major category: " + cat); return cat })
        if (args.validMinorCats)
            args.validMinorCats = args.validMinorCats.split(",").map((cat: string) => { if (!enuCategory[cat]) throw new Error("Invalid Minor category: " + cat); return cat })
        if (args.invalidMajorCats)
            args.invalidMajorCats = args.invalidMajorCats.split(",").map((cat: string) => { if (!enuCategory[cat]) throw new Error("Invalid Major category: " + cat); return cat })
        if (args.invalidMinorCats)
            args.invalidMinorCats = args.invalidMinorCats.split(",").map((cat: string) => { if (!enuCategory[cat]) throw new Error("Invalid Minor category: " + cat); return cat })
        if (args.corporaPath)
            gConfigs.corpora = args.corporaPath

        let processedCount = 0
        let ignoredBySize = 0
        let ignoredByDate = 0
        let ignoredByCategory = 0

        const baseTargetPath = (defaultTarget: string) => (args.targetPath || "./" + defaultTarget)
        const baseSpecs = (scrapper: clsScrapper, doc: IntfDocFileContent, filePath: string, defaultTarget: string) => {
            const fileName = filePath.split("/").pop()?.replace(".json", "")
            const baseOutPath = baseTargetPath(defaultTarget) + "/" + scrapper.domainName + "/"
            const docTimeStamp = Date.parse(doc.date || "INVALID")

            if (processedCount % 100 === 0)
                scLog.status({
                    processed: formatNumber(processedCount),
                    ignoredByDate: formatNumber(ignoredByDate),
                    ignoredBySize: formatNumber(ignoredBySize),
                    ignoredByCategory: formatNumber(ignoredByCategory),
                });
            processedCount++
            if (isFiltered(doc, docTimeStamp))
                return null

            let dateOnPath = doc.date || "NOT_SET"
            if (!isNaN(docTimeStamp)) {
                const docDate = new Date(doc.date || "")
                switch (args.dateResolution) {
                    case enuDateResolution.year:
                        dateOnPath = docDate.getFullYear() + ""; break;
                    case enuDateResolution.month:
                        dateOnPath = docDate.getFullYear() + "-" + (docDate.getMonth() + 1 + "").padStart(2, "0")
                }
            }

            return { fileName, baseOutpath: baseOutPath, docTimeStamp, dateOnPath }
        }

        const isFiltered = (doc: IntfDocFileContent, docTimeStamp: number) => {
            if ((args.validMajorCats && typeof doc.category !== "string" && args.validMajorCats.includes(doc.category.major) != true)
                || (args.validMinorCats && typeof doc.category !== "string" && args.validMinorCats.includes(doc.category.minor) != true)
                || (args.invalidMajorCats && typeof doc.category !== "string" && args.validMajorCats.includes(doc.category.major))
                || (args.invalidMinorCats && typeof doc.category !== "string" && args.invalidMinorCats.includes(doc.category.minor))
            ) {
                ignoredByCategory++
                return true
            }

            if (args.minDate) {
                const minTimeStamp = Date.parse(args.minDate)
                if (!isNaN(docTimeStamp) && docTimeStamp < minTimeStamp) {
                    ignoredByDate++
                    return true
                }
            }
            return false
        }

        const normalizeDoc = (scrapper: clsScrapper, doc: IntfDocFileContent, filePath: string) => {
            const docCategory = !doc.category ? "undefined" : doc.category;
            let anythingChanged = false

            const normalize = (text?: string) => {
                if (!text) return text
                const normalizedText = normalizeText(text)
                if (normalizedText != text) {
                    scLog.debug({ text, normalizedText })
                    anythingChanged = true
                }
                return normalizedText
            }

            const normalizeDate = (date?: string) => {
                const gregorianDate = date2Gregorian(date)
                if (date === "IGNORED" || date === "NO_DATE")
                    return "NOT_SET"
                if (gregorianDate?.startsWith("INVALID:"))
                    scLog.file(scrapper.domainName, filePath, date)

                if (gregorianDate != date) {
                    scLog.debug({ date })
                    anythingChanged = true
                }
                return gregorianDate
            }

            const normalizeArray = (arr: any) => {
                for (let i = 0; i < arr.length; ++i) {
                    if (typeof arr[i] === "string")
                        arr[i] = normalize(arr[i])
                    else
                        for (const innerKey in arr[i]) {
                            if (innerKey === "date")
                                arr[i][innerKey] = normalizeDate(arr[i][innerKey])
                            else
                                arr[i][innerKey] = normalize(arr[i][innerKey])
                        }
                }
                return arr
            }

            for (const key in doc) {
                if (key === "category")
                    continue
                else if (key === "date")
                    doc[key] = normalizeDate(doc[key])
                else if (typeof doc[key] === "string")
                    doc[key] = normalize(doc[key])
                else if (key === "qa" && doc["qa"]) {
                    for (let i = 0; i < doc["qa"].length; ++i) {
                        doc["qa"][i].q = normalizeArray([doc["qa"][i].q])[0]
                        if (doc["qa"][i].a)
                            normalizeArray(doc["qa"][i].a)
                    }
                } else
                    normalizeArray(doc[key])
            }

            if (args.force || typeof docCategory === 'string' || docCategory['major'] === enuMajorCategory.Undefined) {
                doc.category = scrapper.mapCategory(typeof docCategory === 'string' ? docCategory : doc.category['original'], doc.url);
                if (typeof docCategory === 'string')
                    doc.category['original'] = docCategory;
                anythingChanged = true
            }

            return { doc, anythingChanged }
        }

        let domainCategories: { [key: string]: IntfCatStats } = {}
        let catStr: string = ""
        let totalWC = 0
        let totalDocs = 0
        let oldestArticleDate: Date | undefined = undefined
        let newestArticleDate: Date | undefined = undefined

        const resetStats = () => {
            totalWC = 0;
            totalDocs = 0;
            domainCategories = {};
            catStr = ""
            oldestArticleDate = undefined
            newestArticleDate = undefined
        }

        const writeStatsFile = (filePath?: string) => {
            if (filePath)
                writeFileSync(filePath, "domain,category,oldest,newest,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,qaCount,qaWC,Cat-major,Cat-minor,Cat-subminor, sumWC\n")
            for (const dom in domainCategories) {
                for (const cat in domainCategories[dom]) {
                    const s = domainCategories[dom][cat]
                    if (filePath)
                        appendFileSync(filePath, `${dom}, ${cat}, ${s.oldestArticleDate?.toISOString().split("T").at(0) || ""}, ${s.newestArticleDate?.toISOString().split("T").at(0) || ""},  ${s.docs}, ${s.mainParagraphs}, ${s.mainWC}, ${s.titleWC}, ${s.surtitleWC}, ${s.subtitleWC}, ${s.summaryWC}, ${s.altWC}, ${s.commentCount}, ${s.commentWC}, ${s.qaCount}, ${s.qaWC}, ${cat.split('.').at(0)}, ${cat.split('.').at(1) || ""}, ${cat.split('.').at(2) || ""}, ${s.totalWC}\n`)

                    if (s.oldestArticleDate && (!oldestArticleDate || oldestArticleDate > s.oldestArticleDate))
                        oldestArticleDate = s.oldestArticleDate
                    if (s.newestArticleDate && (!newestArticleDate || newestArticleDate < s.newestArticleDate))
                        newestArticleDate = s.newestArticleDate
                }
            }
        }

        const updateDomainStats = (scrapper: clsScrapper, doc: IntfDocFileContent) => {
            let mainWC = 0
            let parCount = 0
            let altCount = 0
            let altWC = 0
            let commentsWC = 0
            let commentCount = 0
            let qaWC = 0
            let qaCount = 0
            doc.content?.forEach(c => { parCount++; mainWC += wordCount(c.text) })
            doc.images?.forEach(c => { altCount++; altWC += c.alt ? wordCount(c.alt) : 0 })
            doc.comments?.forEach(c => { commentCount++; commentsWC += c.text ? wordCount(c.text) : 0 })
            doc.qa?.forEach(qa => {
                qaCount++; qaWC += wordCount(qa.q.text)
                qa.a?.forEach(a => { qaWC += wordCount(a.text) })
            })

            const domain = scrapper.domainName;
            const docCategory = !doc.category ? "undefined" : doc.category;
            if (typeof docCategory === 'string') {
                doc.category = scrapper.mapCategory(docCategory, doc.url);
                doc.category['original'] = docCategory;
            }

            catStr = doc.category['original'];
            if (!args.keepOriginalCat && doc.category['major'] && doc.category['major'] !== enuMajorCategory.Undefined) {
                catStr = doc.category['major'];
                if (doc.category['minor'])
                    catStr += "." + doc.category['minor'];
                if (doc.category['subminor'])
                    catStr += "." + doc.category['subminor'];
            }

            if (!domainCategories || !domainCategories[domain] || !domainCategories[domain][catStr]) {
                const initial = {
                    docs: 0,
                    totalWC: 0,
                    titleWC: 0, surtitleWC: 0, subtitleWC: 0, summaryWC: 0,
                    mainWC: 0, mainParagraphs: 0,
                    altCount: 0, altWC: 0,
                    commentCount: 0, commentWC: 0,
                    qaCount: 0, qaWC: 0,
                    oldestArticleDate: undefined,
                    newestArticleDate: undefined
                }

                if (!domainCategories)
                    domainCategories = { [domain]: { [catStr]: initial } };
                else if (!domainCategories[domain])
                    domainCategories[domain] = { [catStr]: initial };
                else
                    domainCategories[domain][catStr] = initial;
            }

            const titleWC = wordCount(doc.title)
            const surtitleWC = wordCount(doc.aboveTitle)
            const subtitleWC = wordCount(doc.subtitle)
            const summaryWC = wordCount(doc.title)

            domainCategories[domain][catStr].docs++;
            domainCategories[domain][catStr].mainWC += mainWC;
            domainCategories[domain][catStr].mainParagraphs += parCount;
            domainCategories[domain][catStr].titleWC += titleWC
            domainCategories[domain][catStr].surtitleWC += surtitleWC;
            domainCategories[domain][catStr].subtitleWC += subtitleWC;
            domainCategories[domain][catStr].summaryWC += summaryWC;
            domainCategories[domain][catStr].summaryWC += altCount;
            domainCategories[domain][catStr].altWC += altWC;
            domainCategories[domain][catStr].commentCount += commentCount;
            domainCategories[domain][catStr].commentWC += commentsWC;
            domainCategories[domain][catStr].qaCount += qaCount;
            domainCategories[domain][catStr].qaWC += qaWC;
            const currWC = mainWC + titleWC + surtitleWC + subtitleWC + summaryWC + titleWC + altWC + commentsWC + qaWC
            domainCategories[domain][catStr].totalWC += currWC
            totalWC += currWC
            totalDocs++
            if (doc.date && /^(19|20)[0-9][0-9]-[0-1][0-9]-[0-3][0-9]/.test(doc.date)) {
                const docDate = new Date(doc.date)
                const oad = domainCategories[domain][catStr].oldestArticleDate
                const nad = domainCategories[domain][catStr].newestArticleDate
                if (!oad || oad > docDate)
                    domainCategories[domain][catStr].oldestArticleDate = docDate
                if (!nad || nad < docDate)
                    domainCategories[domain][catStr].newestArticleDate = docDate
            }
        }

        switch (args.command) {
            case enuCommands.checkCategories: {
                const outdir = gConfigs.corpora + "/processed"
                if (!existsSync(outdir)) if (!mkdirSync(outdir, { recursive: true })) throw new Error("Unable to create path: " + outdir)
                await processDir(args, (scrapper: clsScrapper, doc: any, filePath: string) => {
                    console.log("Mehran")
                    const spec = baseSpecs(scrapper, doc, filePath, "cat")
                    if (!spec) return

                    const outPath = outdir + "/" + scrapper.domainName + ".csv"
                    writeFileSync(outPath, "domain,category,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,qaCount,qaWC,Cat-major,Cat-minor,Cat-subminor,sumWC\n")
                    doc.split("\n").forEach((line: string, index: number) => {
                        if (index === 0) return
                        const parts = line.split(",")
                        if (parts.length > 14) {
                            const cat = scrapper.mapCategory(parts[1], doc['url']);
                            const outStr = parts.slice(0, 14).join(",") + "," + cat.major + "," + cat.minor + "," + cat.subminor + "," + parts[17]
                            appendFileSync(outPath, outStr + "\n")
                            console.log({ org: parts[1], cat })
                        }
                    })
                }, undefined, undefined, true)
                scLog.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });
                break;
            }
            case enuCommands.toJsonl: {
                await processDir(args,
                    (scrapper: clsScrapper, doc: IntfDocFileContent, filePath: string) => {
                        scLog.debug(filePath)
                        const res = normalizeDoc(scrapper, doc, filePath)
                        const spec = baseSpecs(scrapper, res.doc, filePath, "jsonl")
                        if (!spec) return
                        const path = `${spec.baseOutpath}/${spec.dateOnPath}.jsonl`

                        updateDomainStats(scrapper, res.doc)
                        if (processedCount % 100 === 0) {
                            scLog.status(`--------- ${catStr} - docs: ${formatNumber(processedCount)} - wc: ${formatNumber(totalWC)} ----------`);
                            for (const cat in domainCategories[scrapper.domainName])
                                scLog.status({ [cat]: domainCategories[scrapper.domainName][cat] });
                        }

                        appendFileSync(path, JSON.stringify(res.doc) + "\n")
                    },
                    async (scrapper: clsScrapper) => {
                        resetStats()
                        const baseOutpath = baseTargetPath('jsonl') + "/" + scrapper.domainName
                        if (existsSync(baseOutpath))
                            rmdirSync(baseOutpath, { recursive: true })
                        if (!mkdirSync(baseOutpath, { recursive: true })) throw new Error("Unable to create path: " + baseOutpath)
                    },
                    async (scrapper: clsScrapper) => {
                        const db = new clsDB(scrapper.domainName)
                        await db.init()
                        const stats = await db.stats() || {}
                        scLog.progress("compressing JSONL files")
                        const baseOutpath = baseTargetPath('jsonl') + "/" + scrapper.domainName
                        const dirItems = readdirSync(baseOutpath)
                        for (const item of dirItems) {
                            scLog.progress("compressing " + item)
                            await pExec(`gzip ${baseOutpath}/${item}`)
                        }

                        scLog.progress("Storing Statistics CSV")
                        writeStatsFile(`${baseTargetPath("jsonl")}/${scrapper.domainName}-cats.csv`)
                        scLog.progress("Storing Statistics JSON")
                        const normalizedDomainCategories = () => {
                            const normalized = domainCategories[scrapper.domainName]
                            for (const cat of Object.keys(normalized)) {
                                normalized[cat]['oldestArticle'] = normalized[cat].oldestArticleDate?.toISOString().split("T").at(0) || null
                                normalized[cat]['newestArticle'] = normalized[cat].newestArticleDate?.toISOString().split("T").at(0) || null
                                delete normalized[cat].oldestArticleDate
                                delete normalized[cat].newestArticleDate
                            }
                            return normalized
                        }
                        const finalStats = {
                            domain: scrapper.domainURL,
                            oldestArticle: oldestArticleDate?.toISOString().split("T").at(0) || null,
                            newestArticle: newestArticleDate?.toISOString().split("T").at(0) || null,
                            urls: stats['total'],
                            fetched: stats['processed'],
                            discarded: stats['discarded'],
                            errors: stats['error'],
                            documents: totalDocs,
                            totalWordCount: totalWC,
                            categories: normalizedDomainCategories()
                        }
                        writeFileSync(`${baseTargetPath("jsonl")}/${scrapper.domainName}-stats.json`, JSON.stringify(finalStats, null, 2))
                        scLog.progress(finalStats)
                        await db.close()
                    })
            }
                break;

            case enuCommands.toText: {
                await processDir(args, (scrapper: clsScrapper, doc: IntfDocFileContent, filePath: string) => {
                    const spec = baseSpecs(scrapper, doc, filePath, "out")
                    if (!spec) return

                    let paragraphs: string[] = []
                    const addToParagraphs = (item?: string | string[]) => {
                        if (Array.isArray(item))
                            paragraphs = [...paragraphs, ...item]
                        else if (typeof item === "string")
                            paragraphs.push(item)
                    }

                    const store = (type: string) => {
                        const text = paragraphs.join("\n")
                        if (paragraphs.length === 0) return
                        if (wordCount(text) < (args.minDocWC || 10)) {
                            ignoredBySize++
                            return
                        }
                        const path = `${spec.baseOutpath}/${type}/${spec.dateOnPath}`
                        if (!existsSync(path)) if (!mkdirSync(path, { recursive: true })) throw new Error("Unable to create path: " + path)
                        writeFileSync(`${path}/${spec.fileName}.txt`, text)
                    }

                    if (!args.justInformal) {
                        paragraphs = []
                        addToParagraphs(doc.aboveTitle)
                        addToParagraphs(doc.title)
                        addToParagraphs(doc.subtitle)
                        addToParagraphs(doc.summary)
                        addToParagraphs(doc.content?.map(c => (c.type !== "alt" || args.altAsFormalText) && c.text))
                        store('formal')
                    }

                    if (!args.justFormal) {
                        paragraphs = []
                        addToParagraphs(doc.comments?.map(c => c.text))
                        store("informal")
                    }

                })

                scLog.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });

            }
                break;
            case enuCommands.normalize: {
                let updatedCount = 0;
                await processDir(args, (scrapper: clsScrapper, doc: IntfDocFileContent, filePath: string) => {
                    const res = normalizeDoc(scrapper, doc, filePath)
                    doc = res.doc
                    let anythingChanged = res.anythingChanged

                    const filePathParts: string[] = filePath.split("/")
                    const pathDate = filePathParts.at(filePathParts.length - 2)
                    if (pathDate !== doc["date"])
                        anythingChanged = true

                    scLog.debug({ filePath, pathDate, d: doc["date"], anythingChanged, f: filePathParts.slice(0, filePathParts.length - 2) + (doc["date"] || "NO_DATE") + filePathParts[filePathParts.length - 1] + '.updated' })

                    if (anythingChanged) {
                        filePath = `${filePathParts.slice(0, filePathParts.length - 2).join("/")}/${(doc["date"] || "NO_DATE")}`
                        if (!existsSync(filePath)) if (!mkdirSync(filePath, { recursive: true })) throw new Error("Unable to create path: " + filePath)
                        writeFileSync(`${filePath}/${filePathParts[filePathParts.length - 1]}.updated`, JSON.stringify(doc));
                        updatedCount++;
                    }

                    if (processedCount % 1000 === 0)
                        scLog.status({ processed: formatNumber(processedCount), updated: formatNumber(updatedCount) });
                    processedCount++
                })
                scLog.status({ processed: formatNumber(processedCount), updated: formatNumber(updatedCount) });
                break
            }
            case enuCommands.catStats:
                {
                    await processDir(args,
                        (scrapper: clsScrapper, doc: IntfDocFileContent) => {
                            updateDomainStats(scrapper, doc)
                            if (processedCount % 1000 === 0) {
                                writeStatsFile(args.statFile);
                                scLog.status(`--------- ${catStr} - docs: ${formatNumber(processedCount)} - wc: ${formatNumber(totalWC)} ----------`);
                                for (const cat in domainCategories[scrapper.domainName])
                                    scLog.status({ [cat]: domainCategories[scrapper.domainName][cat] });
                            }
                            processedCount++;
                        },
                        async () => resetStats(),
                        async () => {
                            scLog.status(domainCategories, 3)
                            writeStatsFile(args.statFile)
                        }
                    )
                }
                break
        }

        process.exit()
    },
});

run(app, process.argv.slice(2))
