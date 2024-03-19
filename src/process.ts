import { string, optional, number, positional, option, oneOf, flag } from 'cmd-ts';
import { command, run } from 'cmd-ts';
import { enuDomains, enuMajorCategory, IntfDocFilecontent, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log } from "./modules/logger";
import gConfigs from './modules/gConfigs';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { formatNumber, date2Gregorian, normalizeText, wordCount } from './modules/common';
import { clsScrapper } from './modules/clsScrapper';
import * as scrappers from './scrappers'

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
    dateResolution: option({ type: optional(oneOf(Object.keys(enuDateResolution))), long: 'dateRes', description: `Target path date resolution can be:  ${Object.keys(enuCommands).join(", ")}` }),
    minDate: option({ type: optional(string), long: 'minDate', description: "Min date to extract texts" }),
}

function processDir(args: any, processor: { (scrapper: clsScrapper, doc: IntfDocFilecontent | any, filePath: string): void }, isCSV = false) {
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
            if (isCSV) {
                if (absPath.endsWith(".csv")) {
                    const scrapperName = item.replace(".csv", "")
                    if (args.domain && args.domain != scrapperName)
                        return
                    processor(getScrapper(scrapperName), readFileSync(absPath, 'utf8'), absPath);
                } else
                    return
            } else if (statSync(absPath).isDirectory())
                processDirInternal(absPath, scrapper || getScrapper(item));
            else if (scrapper && typeof scrapper !== "string") {
                if (absPath.endsWith('.updated')) return
                try {
                    const data = readFileSync(absPath, 'utf8')
                    processor(scrapper, JSON.parse(data), absPath);
                }
                catch (e) {
                    log.error("Invalid JSON File: ", absPath, e)
                }
            }
        });
    }
    processDirInternal((gConfigs.corpora || "./corpora/") + "/" + (isCSV ? "" : args.domain || ""), getScrapper(args.domain))
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

        let ignoredBySize = 0
        let ignoredByDate = 0
        let ignoredByCategory = 0

        const baseSpecs = (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string, defaultTarget: string) => {
            const fileName = filePath.split("/").pop()?.replace(".json", "")
            const baseOutpath = (args.targetPath || "./" + defaultTarget) + "/" + scrapper.name() + "/"
            const docTimeStamp = Date.parse(doc.date || "INVALID")

            if (processedCount % 1000 === 0)
                log.status({
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

            return { fileName, baseOutpath, docTimeStamp, dateOnPath }
        }

        const isFiltered = (doc: IntfDocFilecontent, docTimeStamp: number) => {
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

        const normalizeDoc = (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
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
                doc.category = scrapper.mapCategory(typeof docCategory === 'string' ? docCategory : doc.category['original'], doc['tags']);
                if (typeof docCategory === 'string')
                    doc.category['original'] = docCategory;
                anythingChanged = true
            }

            return { doc, anythingChanged }
        }

        switch (args.command) {
            case enuCommands.checkCategories: {
                const outdir = gConfigs.corpora + "/processed"
                if (!existsSync(outdir))
                    mkdirSync(outdir)
                processDir(args, (scrapper: clsScrapper, doc: any, filePath: string) => {
                    const spec = baseSpecs(scrapper, doc, filePath, "cat")
                    if (!spec) return

                    const outPath = outdir + "/" + scrapper.name() + ".csv"
                    writeFileSync(outPath, "domain,category,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,qaCount,qaWC,Cat-major,Cat-minor,Cat-subminor,sumWC\n")
                    doc.split("\n").forEach((line, index) => {
                        if (index === 0) return
                        const parts = line.split(",")
                        if (parts.length > 14) {
                            const cat = scrapper.mapCategory(parts[1]);
                            const outStr = parts.slice(0, 14).join(",") + "," + cat.major + "," + cat.minor + "," + cat.subminor + "," + parts[17]
                            appendFileSync(outPath, outStr + "\n")
                            console.log({ org: parts[1], cat })
                        }
                    })


                }, true)
                log.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });
                break;
            }
            case enuCommands.toJsonl: {
                processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
                    const spec = baseSpecs(scrapper, doc, filePath, "jsonl")
                    if (!spec) return
                    //const path = `${spec.baseOutpath}/${spec.dateOnPath}.jsonl`
                    //appendFileSync(path, )
                })
                log.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });

            }
                break;

            case enuCommands.toText: {
                processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
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
                        if (!existsSync(path)) mkdirSync(path, { recursive: true })
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

                log.status({ processed: formatNumber(processedCount), ignoredByDate: formatNumber(ignoredByDate), ignoredBySize: formatNumber(ignoredBySize) });

            }
                break;
            case enuCommands.normalize: {
                let updatedCount = 0;
                processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
                    const res = normalizeDoc(scrapper, doc, filePath)
                    doc = res.doc
                    let anythingChanged = res.anythingChanged

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
                            writeFileSync(args.statFile, "domain,category,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,qaCount,qaWC,Cat-major,Cat-minor,Cat-subminor, sumWC\n")
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
                                    s.commentWC +
                                    s.qaWC
                                if (args.statFile)
                                    appendFileSync(args.statFile, `${dom}, ${cat}, ${s.docs}, ${s.mainParagraphs}, ${s.mainWC}, ${s.titleWC}, ${s.surtitleWC}, ${s.subtitleWC}, ${s.summaryWC}, ${s.altWC}, ${s.commentCount}, ${s.commentWC}, ${s.qaCount}, ${s.qaWC}, ${cat.split('.').at(0)}, ${cat.split('.').at(1) || ""}, ${cat.split('.').at(2) || ""}, ${curCatWC}\n`)
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
                        let qaWC = 0
                        let qaCount = 0
                        doc.content?.forEach(c => { parCount++; mainWC += wordCount(c.text) })
                        doc.images?.forEach(c => { altWC += c.alt ? wordCount(c.alt) : 0 })
                        doc.comments?.forEach(c => { commentCount++; commentsWC += c.text ? wordCount(c.text) : 0 })
                        doc.qa?.forEach(qa => {
                            qaCount++; qaWC += wordCount(qa.q.text)
                            qa.a?.forEach(a => { qaWC += wordCount(a.text) })
                        })

                        const domain = scrapper.name();
                        const docCategory = !doc.category ? "undefined" : doc.category;
                        if (typeof docCategory === 'string') {
                            doc.category = scrapper.mapCategory(docCategory);
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
                                qaCount: 0, qaWC: 0
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
                        domainCats[domain][catStr].qaCount += qaCount;
                        domainCats[domain][catStr].qaWC += qaWC;

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
