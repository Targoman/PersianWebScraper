import { string, optional, number, positional, option, oneOf, flag } from 'cmd-ts';
import { command, run } from 'cmd-ts';
import { enuDomains, enuMajorCategory, IntfDocFilecontent, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log } from "./modules/logger";
import gConfigs from './modules/gConfigs';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { formatNumber, normalizeCategory, date2Gregorian, normalizeText, wordCount } from './modules/common';
import { clsScrapper } from './modules/clsScrapper';
import * as scrappers from './scrappers'

enum enuCommands {
    catStats = 'catStats',
    normalize = "normalize",
    toText = "toText"
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
        mainWC: number
        mainParagraphs: number
        titleWC: number
        subtitleWC: number
        surtitleWC: number
        summaryWC: number
        altWC: number
        commentCount: number
        commentWC: number
    }
}
const args = {
    command: positional({ type: oneOf(Object.keys(enuCommands).concat(Object.values(enuCommands).map(e => e.toLowerCase()))), displayName: "Command", description: `Command to be executed can be one of:  ${Object.keys(enuCommands).join(", ")}` }),
    configFile: option({ type: optional(string), long: 'configFile', short: "c", description: "set configFile to be used" }),
    debugVerbosity: option({ type: optional(number), long: 'verbosity', short: "v", description: "set verbosity level from 0 to 10" }),
    statFile: option({ type: optional(string), long: 'statFile', short: "s", description: "path to store result CSV" }),
    keepOriginalCat: flag({ long: "keepOriginalCat", description: "reports original category even if there are mapped category" }),

    force: flag({ long: "force", description: "forces normalization of category even if the category was set priorly" }),
    domain: option({ type: optional(oneOf(Object.keys(enuDomains).concat(Object.values(enuDomains)))), long: 'domain', short: "d", description: `Domain to be checked${Object.keys(enuDomains).join(", ")}. If ommited all domains will be checked` }),
    minDocWC: option({ type: optional(number), long: 'minwc', description: "Minimum word count of target document file" }),
    justFormal: flag({ long: "justFormal", description: "limits extraction to Title, AboveTitle, subtitle, summary, main content, alt" }),
    justInformal: flag({ long: "justInformal", description: "limits extraction to comments" }),
    altAsFormalText: flag({ long: "altAsFormalText", description: "output ALT text as formal text" }),
    targetPath: option({ type: optional(string), long: 'target', short: "t", description: "Target Folder to store results" }),
    dateResolution: option({ type: optional(oneOf(Object.keys(enuDateResolution))), long: 'dateRes', description: `Target path date resolution can be:  ${Object.keys(enuCommands).join(", ")}` }),
    minDate: option({ type: optional(string), long: 'minDate', description: "Min date to extract texts" }),
    keepCat: option({ type: optional(oneOf(Object.keys(enuCategory))), long: 'dateRes', description: `Target path date resolution can be:  ${Object.keys(enuCommands).join(", ")}` }),
}

function processDir(args: any, jsonProcessor: { (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string): void }) {
    function getScrapper(domain?: string) {
        if (!domain) return undefined
        const scrapper = new scrappers[domain];
        if (!scrapper)
            throw new Error(`domain ${domain} is not supported yet`);
        log.progress("Processing ", domain);
        return scrapper
    }
    function processDirInternal(dir: string, scrapper?: clsScrapper) {
        readdirSync(dir).forEach(item => {
            const absPath = path.join(dir, item);
            if (statSync(absPath).isDirectory())
                processDirInternal(absPath, scrapper || getScrapper(item));
            else if (scrapper && typeof scrapper !== "string") {
                if (absPath.endsWith('.updated')) return
                try {
                    jsonProcessor(scrapper, JSON.parse(readFileSync(absPath, 'utf8')), absPath);
                }
                catch (e) {
                    log.error("Invalid JSON File: ", absPath, e)
                }
            }
        });
    }
    processDirInternal((gConfigs.corpora || "./corpora/") + "/" + (args.domain || ""), getScrapper(args.domain))
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
                log.info("Config file loaded")
            } catch (e) {
                throw new Error("Unable to load config file: " + args.configFile)
            }
        } else {
            try {
                /* eslint-disable */
                conf = require(process.cwd() + "/.config.json")
                /* eslint-enable */
                log.info("Default config file loaded")
            } catch (e) {
                /* */
            }
        }

        for (const key in gConfigs)
            gConfigs[key] = (args[key] !== undefined ? args[key] : (conf[key] !== undefined ? conf[key] : gConfigs[key]))
        clsLogger.setVerbosity(args.verbosity || gConfigs.debugVerbosity || 0)

        log.info({ activeConfigs: gConfigs })
        let processedCount = 0

        switch (args.command) {
            case enuCommands.toText: {
                let ignoredBySize = 0
                let ignoredByDate = 0

                processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
                    const fileName = filePath.split("/").pop()?.replace(".json", "")
                    const baseOutpath = (args.targetPath || "./out") + "/" + scrapper.name() + "/"
                    const docTimeStamp = Date.parse(doc.date || "INVALID")
                    if (processedCount % 1000 === 0)
                        log.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });
                    processedCount++

                    if (args.minDate) {
                        const minTimeStamp = Date.parse(args.minDate)
                        if (!isNaN(docTimeStamp) && docTimeStamp < minTimeStamp) {
                            ignoredByDate++
                            return
                        }
                    }

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
                        const path = `${baseOutpath}/${type}/${dateOnPath}`
                        if (!existsSync(path)) mkdirSync(path, { recursive: true })
                        writeFileSync(`${path}/${fileName}.txt`, text)
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

                log.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });

            }
                break;
            case enuCommands.normalize: {
                let updatedCount = 0;
                processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
                    const docCategory = !doc.category ? "undefined" : doc.category;
                    let anythingChanged = false

                    const normalize = (text?: string) => {
                        if (!text) return text
                        const normalizedText = normalizeText(text)
                        if (normalizedText != text) {
                            log.debug({ text })
                            anythingChanged = true
                        }
                        return normalizedText
                    }

                    const normalizeDate = (date?: string) => {
                        const gregorianDate = date2Gregorian(date)
                        if (date === "IGNORED" || date === "NO_DATE")
                            return "NOT_SET"
                        if (gregorianDate?.startsWith("INVALID:"))
                            log.file(scrapper.name(), filePath, date)

                        if (gregorianDate != date) {
                            log.debug({ date })
                            anythingChanged = true
                        }
                        return gregorianDate
                    }

                    for (const key in doc) {
                        if (key === "category")
                            continue
                        else if (key === "date")
                            doc[key] = normalizeDate(doc[key])
                        else if (typeof doc[key] === "string")
                            doc[key] = normalize(doc[key])
                        else
                            for (let i = 0; i < doc[key].length; ++i) {
                                if (typeof doc[key][i] === "string")
                                    doc[key][i] = normalize(doc[key][i])
                                else
                                    for (const innerKey in doc[key][i])
                                        if (innerKey === "date")
                                            doc[key][i][innerKey] = normalizeDate(doc[key][i][innerKey])
                                        else
                                            doc[key][i][innerKey] = normalize(doc[key][i][innerKey])
                            }
                    }

                    if (args.force || typeof docCategory === 'string' || docCategory['major'] === enuMajorCategory.Undefined) {
                        doc.category = scrapper.mapCategory(normalizeCategory(typeof docCategory === 'string' ? docCategory : doc.category['original']), doc['tags']);
                        if (typeof docCategory === 'string')
                            doc.category['original'] = docCategory;
                        anythingChanged = true
                    }
                    const filePathParts: string[] = filePath.split("/")
                    const pathDate = filePathParts.at(filePathParts.length - 2)
                    if (pathDate !== doc["date"])
                        anythingChanged = true

                    log.debug({ filePath, pathDate, d: doc["date"], anythingChanged, f: filePathParts.slice(0, filePathParts.length - 2) + (doc["date"] || "NO_DATE") + filePathParts[filePathParts.length - 1] + '.updated' })

                    if (anythingChanged) {
                        filePath = `${filePathParts.slice(0, filePathParts.length - 2).join("/")}/${(doc["date"] || "NO_DATE")}`
                        if (!existsSync(filePath))
                            mkdirSync(filePath)
                        writeFileSync(`${filePath}/${filePathParts[filePathParts.length - 1]}.updated`, JSON.stringify(doc));
                        updatedCount++;
                    }

                    if (processedCount % 1000 === 0)
                        log.status({ processed: formatNumber(processedCount), updated: formatNumber(updatedCount) });
                    processedCount++
                })
                log.status({ processed: formatNumber(processedCount), updated: formatNumber(updatedCount) });
                break
            }
            case enuCommands.catStats:
                {
                    let domainCats: { [key: string]: IntfCatStats } = {}
                    let wc = 0
                    const writeStatsFile = () => {
                        if (args.statFile)
                            writeFileSync(args.statFile, "domain,category,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,Cat-major,Cat-minor,Cat-subminor, sumWC\n")
                        wc = 0
                        for (const dom in domainCats) {
                            for (const cat in domainCats[dom]) {
                                const s = domainCats[dom][cat]
                                const curCatWC = s.mainWC +
                                    s.titleWC +
                                    s.surtitleWC +
                                    s.subtitleWC +
                                    s.summaryWC +
                                    s.titleWC +
                                    s.altWC +
                                    s.commentWC
                                if (args.statFile)
                                    appendFileSync(args.statFile, `${dom}, ${cat}, ${s.docs}, ${s.mainParagraphs}, ${s.mainWC}, ${s.titleWC}, ${s.surtitleWC}, ${s.subtitleWC}, ${s.summaryWC}, ${s.altWC}, ${s.commentCount}, ${s.commentWC}, ${cat.split('.').at(0)}, ${cat.split('.').at(1) || ""}, ${cat.split('.').at(2) || ""}, ${curCatWC}\n`)
                                wc += curCatWC
                            }
                        }
                    }

                    processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent) => {
                        let mainWC = 0
                        let parCount = 0
                        let altWC = 0
                        let commentsWC = 0
                        let commentCount = 0
                        doc.content?.forEach(c => { parCount++; mainWC += wordCount(c.text) })
                        doc.images?.forEach(c => { altWC += c.alt ? wordCount(c.alt) : 0 })
                        doc.comments?.forEach(c => { commentCount++; commentsWC += c.text ? wordCount(c.text) : 0 })

                        const domain = scrapper.name();
                        const docCategory = !doc.category ? "undefined" : doc.category;
                        if (typeof docCategory === 'string') {
                            doc.category = scrapper.mapCategory(normalizeCategory(docCategory));
                            doc.category['original'] = docCategory;
                        }

                        let catStr = doc.category['original'];
                        if (!args.keepOriginalCat && doc.category['major'] && doc.category['major'] !== enuMajorCategory.Undefined) {
                            catStr = doc.category['major'];
                            if (doc.category['minor'])
                                catStr += "." + doc.category['minor'];
                            if (doc.category['subminor'])
                                catStr += "." + doc.category['subminor'];
                        }

                        if (!domainCats || !domainCats[domain] || !domainCats[domain][catStr]) {
                            const initial = {
                                mainWC: 0, mainParagraphs: 0,
                                altWC: 0, docs: 0,
                                commentCount: 0, commentWC: 0,
                                titleWC: 0, surtitleWC: 0, subtitleWC: 0, summaryWC: 0,
                            };
                            if (!domainCats)
                                domainCats = { [domain]: { [catStr]: initial } };
                            else if (!domainCats[domain])
                                domainCats[domain] = { [catStr]: initial };
                            else
                                domainCats[domain][catStr] = initial;
                        }
                        domainCats[domain][catStr].docs++;
                        domainCats[domain][catStr].mainWC += mainWC;
                        domainCats[domain][catStr].mainParagraphs += parCount;
                        domainCats[domain][catStr].titleWC += wordCount(doc.title);
                        domainCats[domain][catStr].surtitleWC += wordCount(doc.aboveTitle);
                        domainCats[domain][catStr].subtitleWC += wordCount(doc.subtitle);
                        domainCats[domain][catStr].summaryWC += wordCount(doc.summary);
                        domainCats[domain][catStr].titleWC += wordCount(doc.title);
                        domainCats[domain][catStr].altWC += altWC;
                        domainCats[domain][catStr].commentCount += commentCount;
                        domainCats[domain][catStr].commentWC += commentsWC;
                        if (processedCount % 1000 === 0) {
                            writeStatsFile();
                            log.status(`--------- ${catStr} - docs: ${formatNumber(processedCount)} - wc: ${formatNumber(wc)} ----------`);
                            for (const cat in domainCats[domain])
                                log.status({ [cat]: domainCats[domain][cat] });
                        }
                        processedCount++;
                    })
                    log.status(domainCats, 3)
                    writeStatsFile()
                }
                break
        }

        process.exit()
    },
});


run(app, process.argv.slice(2))
