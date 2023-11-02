import { string, optional, number, positional, option, oneOf } from 'cmd-ts';
import { command, run } from 'cmd-ts';
import { enuDomains, IntfDocFilecontent, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log } from "./modules/logger";
import gConfigs from './modules/gConfigs';
import { appendFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';

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
function processDir(args: any, jsonProcessor: { (domain: string, doc: IntfDocFilecontent): void }) {
    function processDirInternal(domain: string, dir: string) {
        if (lastDomain != domain)
            log.progress("Processing ", domain)
        readdirSync(dir).forEach(item => {
            const absPath = path.join(dir, item);
            if (statSync(absPath).isDirectory()) {
                processDirInternal(domain || item, absPath);
            } else if (domain) {
                try {
                    jsonProcessor(domain, JSON.parse(readFileSync(absPath, 'utf8')))
                } catch (e) {
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
                /**/
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
                    processDir(args, (domain: string, doc: IntfDocFilecontent) => {
                        let mainWC = 0
                        let parCount = 0
                        let altWC = 0
                        let commentsWC = 0
                        let commentCount = 0
                        doc.content?.forEach(c => { parCount++; mainWC += wordCount(c.text) })
                        doc.images?.forEach(c => { altWC += c.alt ? wordCount(c.alt) : 0 })
                        doc.comments?.forEach(c => { commentCount++; commentsWC += c.text ? wordCount(c.text) : 0 })

                        const category = !doc.category || doc.category == "undefined" ? "NoCat" : doc.category
                        if (!domainCats || !domainCats[domain] || !domainCats[domain][category]) {
                            const initial = {
                                mainWC: 0, mainParagraphs: 0,
                                altWC: 0, docs: 0,
                                commentCount: 0, commentWC: 0,
                                titleWC: 0, surtitleWC: 0, subtitleWC: 0, summaryWC: 0,
                            }
                            if (!domainCats)
                                domainCats = { [domain]: { [category]: initial } }
                            else if (!domainCats[domain])
                                domainCats[domain] = { [category]: initial }
                            else
                                domainCats[domain][category] = initial
                        }

                        domainCats[domain][category].docs++
                        domainCats[domain][category].mainWC += mainWC
                        domainCats[domain][category].mainParagraphs += parCount
                        domainCats[domain][category].titleWC += wordCount(doc.title)
                        domainCats[domain][category].surtitleWC += wordCount(doc.aboveTitle)
                        domainCats[domain][category].subtitleWC += wordCount(doc.subtitle)
                        domainCats[domain][category].summaryWC += wordCount(doc.summary)
                        domainCats[domain][category].titleWC += wordCount(doc.title)
                        domainCats[domain][category].altWC += altWC
                        domainCats[domain][category].commentCount += commentCount
                        domainCats[domain][category].commentWC += commentsWC
                        if (docCount % 10000 === 0) {
                            log.status("--------- " + domain + " ----------")
                            for (const cat in domainCats[domain]) {
                                log.status({cat: domainCats[domain][cat]})
                            }
                        }
                        docCount++
                    })
                    log.status(domainCats, 3)
                    if (args.statFile) {
                        writeFileSync(args.statFile, "domain,category,docs,mainPars,mainWC,titleWC,surtitleWC,subtitleWC,summaryWC,altWC,comments,commentsWC")
                        for (const dom in domainCats)
                            for (const cat in domainCats[dom]) {
                                const s = domainCats[dom][cat]
                                appendFileSync(args.statFile, `${dom},${cat},${s.docs},${s.mainParagraphs},${s.mainWC},${s.titleWC},${s.surtitleWC},${s.subtitleWC},${s.summaryWC},${s.altWC},${s.commentCount},${s.commentWC}`)
                            }
                    }
                }
                break
        }

        process.exit()
    },
});


run(app, process.argv.slice(2))
