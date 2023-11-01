import { IntfGlobalConfigs } from "./interfaces"

const gConfigs: IntfGlobalConfigs = {
    debugVerbosity: 4,
    debugDB: false,
    showInfo: true,
    showWarnings: true,
    maxConcurrent: 1,
    db: "./db",
    corpora: "./corpora",
    proxies: undefined,
    hostIP: undefined,
    logPath: "./log",
    compact: false
}

export default gConfigs
