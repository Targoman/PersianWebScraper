import gConfigs from "./gConfigs";
import blessed, { Widgets } from "blessed"
import util from "util"
import fs from 'fs'

function logTime() {
    return new Date(Date.now() + 0 * 14.58).toISOString()
}

function caller() {
    const errStack = (new Error()).stack?.split("\n")
    if (!errStack || errStack.length < 5)
        return { name: "unknown", line: null }
    const errStr = errStack[4]
    const name = (errStr.substring(errStr.indexOf("at") + 3, errStr.indexOf("(")) || "anoynmous").trim();
    const line = errStr.substring(errStr.indexOf(":") + 1, errStr.lastIndexOf(":")).trim()
    return { name, line };
}
enum vb {
    Full = 10,
    API = 9,
    Results = 8,
    Progress = 4,
    Base = 1,
    Off = 100
}
interface IntfBlessed {
    body: Widgets.TextElement,
    inputBar: Widgets.TextboxElement,
    screen: Widgets.Screen
}

export class clsLogger {
    moduleName: string
    private static verbosity: number
    private blessed: IntfBlessed

    constructor(module: string) {
        this.moduleName = module;
    }

    static setVerbosity(v: number) {
        this.verbosity = v
    }

    private initBlessed() {
        this.blessed.screen = blessed.screen({
            smartCSR: true
        });
        this.blessed.body = blessed.box({
            top: 0,
            left: 0,
            height: '100%-1',
            width: '100%',
            keys: true,
            mouse: true,
            alwaysScroll: true,
            scrollable: true,
            scrollbar: {
                style: {
                    ch: ' ',
                    bg: 'red'
                }
            }
        });
        this.blessed.inputBar = blessed.textbox({
            bottom: 0,
            left: 0,
            height: 1,
            width: '100%',
            keys: true,
            mouse: true,
            inputOnFocus: true,
            style: {
                fg: 'white',
                bg: 'blue'	// Blue background so you see this is different from body
            }
        });

        // Add body to blessed screen
        this.blessed.screen.append(this.blessed.body);
        this.blessed.screen.append(this.blessed.inputBar);

        // Close the example on Escape, Q, or Ctrl+C
        this.blessed.screen.key(['escape', 'q', 'C-c'], () => (process.exit(0)));

    }

    status(statusObj: any, depth = 1) {
        if (this.blessed) {
            this.blessed.inputBar.setText(this.formatArgs(statusObj));
            this.blessed.screen.render()
        } else {
            console.log(`\x1b[45m[${logTime()}][STATS]:\x1b[0m`, util.inspect(statusObj, {breakLength: Infinity, depth, colors: true, compact: true}), '\x1b[0m')
        }
    }

    private formatArgs(...theArgs: any) {
        return util.format.apply(util.format, Array.prototype.slice.call(theArgs));
    }

    error(...theArgs: any) {
        if (this.blessed)
            this.blessed.body.pushLine(`\x1b[31m[${logTime()}][ERR][${this.moduleName}]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m');
        else
            console.error(`\x1b[31m[${logTime()}][ERR][${this.moduleName}]:\x1b[0m`, util.inspect(theArgs, false, clsLogger.verbosity ? 5 : 3, true), '\x1b[0m');
    }
    info(...theArgs: any) {
        if (gConfigs.showInfo) {
            if (this.blessed)
                this.blessed.body.pushLine(`\x1b[36m[${logTime()}][INF][${this.moduleName}]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m')
            else
                console.info(`\x1b[36m[${logTime()}][INF][${this.moduleName}]:\x1b[0m`, util.inspect(theArgs, {depth: clsLogger.verbosity ? 5 : 3, colors: true, maxArrayLength: 500}), '\x1b[0m');
        }
    }
    warn(...theArgs: any) {
        if (gConfigs.showWarnings) {
            if (this.blessed)
                this.blessed.body.pushLine(`\x1b[43m[${logTime()}][WRN][${this.moduleName}]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m')
            else
                console.warn(`\x1b[43m[${logTime()}][WRN][${this.moduleName}]:\x1b[0m`, util.inspect(theArgs, false, clsLogger.verbosity ? 5 : 3, true), '\x1b[0m')
        }
    }
    file(scraper:string, ...theArgs:any) {
        try {
            fs.appendFileSync(`${gConfigs.logPath}/${scraper}.err.log`, `${new Date(Date.now() + 864000 * 14.58).toISOString()}: ${JSON.stringify(theArgs)}\n`)
        } catch (ex) {
            fs.appendFileSync(`${gConfigs.logPath}/${scraper}.err.log`, `${new Date(Date.now() + 864000 * 14.58).toISOString()}: theArgs\n`)
        }
    }

    private debugImpl(level: vb, ...theArgs: any) {
        if (clsLogger.verbosity >= level) {
            if (clsLogger.verbosity > 9) {
                const c = caller()
                if (this.blessed)
                    this.blessed.body.pushLine(`\x1b[35m[${logTime()}][DBG][${level}][${this.moduleName}][${c.name}:${c.line}]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m')
                else
                    console.debug(`\x1b[35m[${logTime()}][DBG][${level}][${this.moduleName}][${c.name}:${c.line}]:\x1b[0m`, util.inspect(theArgs, false, clsLogger.verbosity ? 5 : 3, true), '\x1b[0m')

            } else {
                if (this.blessed)
                    this.blessed.body.pushLine(`\x1b[35m[${logTime()}][DBG][${level}][${this.moduleName}]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m')
                else
                    console.debug(`\x1b[35m[${logTime()}][DBG][${level}][${this.moduleName}]:\x1b[0m`, util.inspect(theArgs, false, clsLogger.verbosity ? null : 3, true), '\x1b[0m')
            }
        }
    }
    debug(...theArgs: any) {
        this.debugImpl(vb.Full, ...theArgs)
    }
    api(...theArgs: any) {
        this.debugImpl(vb.API, ...theArgs)
    }
    progress(...theArgs: any) {
        this.debugImpl(vb.Progress, ...theArgs)
    }
    baseDebug(...theArgs: any) {
        this.debugImpl(vb.Base, ...theArgs)
    }

    json(...theArgs: any) {
        if (clsLogger.verbosity >= vb.Base)
            console.debug(`\x1b[35m[${logTime()}][JSON]\x1b[0m`, JSON.stringify(theArgs, null, 2))
    }
    db(...theArgs: any) {
        if (gConfigs.debugDB) {
            if (this.blessed)
                this.blessed.body.pushLine(`\x1b[35m[${logTime()}][DBG][DB]:\x1b[0m` + this.formatArgs(theArgs) + '\x1b[0m')
            else
                console.debug(`\x1b[35m[${logTime()}][DBG][DB]:\x1b[0m`, util.inspect(theArgs, false, clsLogger.verbosity ? null : 3, true), '\x1b[0m')
        }
    }
    apiDebugError(err: any) {
        if (clsLogger.verbosity < vb.API)
            return
        if (err.config)
            this.error({ code: err.code, url: err.config.url, data: err.config.data, resp: err.response })
        else this.error({ axios: err })
    }
}

export const log = new clsLogger("Main")
