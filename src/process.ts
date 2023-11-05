import { string, optional, number, positional, option, oneOf } from 'cmd-ts';
import { command, run } from 'cmd-ts';
import { enuDomains, enuMajorCategory, IntfDocFilecontent, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log } from "./modules/logger";
import gConfigs from './modules/gConfigs';
import { appendFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { formatNumber } from './modules/common';
import { clsScrapper } from './modules/clsScrapper';
import * as scrappers from './scrappers'

enum enuCommands {
    catStats = 'catStats'
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
    command: positional({ type: oneOf(Object.keys(enuCommands).concat(Object.values(enuCommands))), displayName: "Command", description: `Command to be executed can be one of:  ${Object.keys(enuCommands).join(", ")}` }),
    configFile: option({ type: optional(string), long: 'configFile', short: "c", description: "set configFile to be used" }),
    debugVerbosity: option({ type: optional(number), long: 'verbosity', short: "v", description: "set verbosity level from 0 to 10" }),
    statFile: option({ type: optional(string), long: 'statFile', short: "s", description: "path to store result CSV" }),

    domain: option({ type: optional(oneOf(Object.keys(enuDomains).concat(Object.values(enuDomains)))), long: 'domain', short: "d", description: `Domain to be checked${Object.keys(enuDomains).join(", ")}` }),
}

const lastDomain: string = ""
function processDir(args: any, jsonProcessor: { (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string): void }) {
    function processDirInternal(scrapper: undefined | string | clsScrapper, dir: string) {
        if (typeof scrapper === "string") {
            const domain = scrapper;
            scrapper = new scrappers[domain];
            if (!scrapper)
                throw new Error(`domain ${domain} is not supported yet`);
            log.progress("Processing ", domain);
        }

        readdirSync(dir).forEach(item => {
            const absPath = path.join(dir, item);
            if (statSync(absPath).isDirectory())
                processDirInternal(scrapper || item, absPath);
            else if (scrapper && typeof scrapper !== "string") {
                try {
                    jsonProcessor(scrapper, JSON.parse(readFileSync(absPath, 'utf8')), absPath);
                }
                catch (e) {
                    log.error("Invalid JSON File: ", absPath, e)
                }
            }
        });
    }
    processDirInternal(args.domain, gConfigs.corpora || "./corpora" + "/" + (args.domain || ""))
}

function wordCount(str?: string): number {
    return str?.split(" ").length || 0
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

        switch (args.command) {
            case enuCommands.catStats:
                {
                    let domainCats: { [key: string]: IntfCatStats } = {}
                    let docCount = 0
                    let wc = 0
                    const writeStatsFile = () => {
                        if (args.statFile)
                            writeFileSync(args.statFile, "domain,category,keywords,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC,majorCat,minorCat\n")
                        wc = 0
                        for (const dom in domainCats) {
                            for (const cat in domainCats[dom]) {
                                const s = domainCats[dom][cat]
                                if (args.statFile)
                                    appendFileSync(args.statFile, `${dom}, ${cat},  ${s.docs}, ${s.mainParagraphs}, ${s.mainWC}, ${s.titleWC}, ${s.surtitleWC}, ${s.subtitleWC}, ${s.summaryWC}, ${s.altWC}, ${s.commentCount}, ${s.commentWC}\n`)
                                wc += s.mainWC +
                                    s.titleWC +
                                    s.surtitleWC +
                                    s.subtitleWC +
                                    s.summaryWC +
                                    s.titleWC +
                                    s.altWC +
                                    s.commentWC
                            }
                        }
                    }

                    processDir(args, (scrapper: clsScrapper, doc: IntfDocFilecontent, filePath: string) => {
                        let mainWC = 0
                        let parCount = 0
                        let altWC = 0
                        let commentsWC = 0
                        let commentCount = 0
                        doc.content?.forEach(c => { parCount++; mainWC += wordCount(c.text) })
                        doc.images?.forEach(c => { altWC += c.alt ? wordCount(c.alt) : 0 })
                        doc.comments?.forEach(c => { commentCount++; commentsWC += c.text ? wordCount(c.text) : 0 })

                        const domain = scrapper.name();
                        const docCategory = !doc.category || doc.category == "undefined" ? undefined : doc.category;
                        if (typeof docCategory === 'string') {
                            doc.category = scrapper.mapCategory(docCategory);
                            doc.category['original'] = docCategory;
                        }
                        let catStr = doc.category['original'];
                        if (doc.category['major'] && doc.category['major'] !== enuMajorCategory.Undefined) {
                            catStr = doc.category['major'];
                            if (doc.category['minor'])
                                catStr += "." + doc.category['minor'];
                            if (doc.category['subminor'])
                                catStr += "." + doc.category['subminor'];
                        }
                        if (catStr === doc.category['original'])
                            writeFileSync(filePath + '.new', JSON.stringify(doc));

                        if (!domainCats || !domainCats[catStr] || !domainCats[domain][catStr]) {
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
                        if (docCount % 10000 === 0) {
                            writeStatsFile();
                            log.status(`--------- ${catStr} - docs: ${formatNumber(docCount)} - wc: ${formatNumber(wc)} ----------`);
                            for (const cat in domainCats[domain])
                                log.status({ [cat]: domainCats[domain][cat] });
                        }
                        docCount++;
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
