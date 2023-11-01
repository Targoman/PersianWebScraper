import { string, optional, number, positional, option, oneOf, flag } from 'cmd-ts';
import { enuDomains, IntfGlobalConfigs } from './modules/interfaces';
import { clsLogger, log } from "./modules/logger";
import { command, run } from 'cmd-ts';
import { parseEnum } from "./modules/common";
import gConfigs from './modules/gConfigs';
import { clsScrapper } from './modules/clsScrapper';
import * as scrappers from './scrappers'
import { existsSync, mkdirSync } from 'fs';

const args = {
    domain: positional({ type: oneOf(Object.keys(enuDomains).concat(Object.values(enuDomains))), displayName: "Domain", description: `Domain to be be scrapped ${Object.keys(enuDomains).join(", ")}` }),
    configFile: option({ type: optional(string), long: 'configFile', short: "c", description: "set configFile to be used" }),
    debugVerbosity: option({ type: optional(number), long: 'verbosity', short: "v", description: "set verbosity level from 0 to 10" }),
    delay: option({ type: optional(number), long: 'delay', short: "d", description: "Delay between requests to same address in seconds" }),
    maxConcurrent: option({ type: optional(number), long: 'max-concurent', short: "m", description: "max concurrent requests" }),
    proxies: option({ type: optional(string), long: 'proxies', short: "p", description: "proxy or proxies to be used" }),
    hostIP: option({ type: optional(string), long: 'hostIP', description: "proxy host IP to be used" }),
    url: option({ type: optional(string), long: 'url', short: "u", description: "URL to be retrieved just to check" }),
    logPath: option({ type: optional(string), long: 'logPath', short: "l", description: "Path to store error logs" }),
    runQuery: option({ type: optional(string), long: 'runQuery', description: "Query to run on local DB" }),
    recheck: flag({ long: "recheck", description: "reset status to rescrap excluding old data" })
}

const app = command({
    name: 'tgscrap',
    args,
    handler: async (args: any) => {
        void args

        try {
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

            if (gConfigs.proxies) {
                if (!gConfigs.hostIP)
                    throw new Error("Using proxies without hostIP is invalid")
                const proxiesStr = gConfigs.proxies
                if (typeof proxiesStr === "string") {
                    gConfigs.proxies = []
                    if (proxiesStr.includes('-'))
                        for (let i = parseInt(proxiesStr.split('-')[0]); i <= parseInt(proxiesStr.split('-')[1]); ++i)
                            gConfigs.proxies.push(`${i}`);
                    else if (proxiesStr.includes(','))
                        gConfigs.proxies = proxiesStr.split(",")
                    else
                        gConfigs.proxies = [proxiesStr]
                }
            }
            log.info({ activeConfigs: gConfigs })


            if (!existsSync(gConfigs.logPath || "NO LOG PATH") && !mkdirSync(gConfigs.logPath || "NO LOG PATH", { recursive: true }))
                throw new Error("Unable to create log path: " + gConfigs.logPath)
            clsLogger.setVerbosity(args.verbosity || gConfigs.debugVerbosity || 0)

            args.domain = parseEnum(enuDomains, args.domain)
            const scrapper: clsScrapper = new scrappers[args.domain]
            if (!scrapper)
                throw new Error(`domain ${args.domain} is not supported yet`)

            if (args.recheck) {
                await scrapper.start(true);
            } else if (args.runQuery)
                await scrapper.runQuery(args.runQuery)
            else if (args.url)
                await scrapper.check(args.url)
            else
                await scrapper.start();
        } catch (e: any) {
            log.debug(e)
            log.error(e.message)
        }
        process.exit()
    },
});


run(app, process.argv.slice(2))
