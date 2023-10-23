import { SocksProxyAgent } from "socks-proxy-agent"
import { HTMLElement } from "node-html-parser"
import { IntfRequestParams } from "./request"

export enum enuDomains {
    farsnews = "farsnews",
    hamshahrionline = "hamshahrionline",
    irna = "irna",
    mashreghnews = "mashreghnews",
    khabaronline = "khabaronline",
    mehrnews = "mehrnews",
    aftabnews = "aftabnews",
    seratnews = "seratnews",
    rajanews = "rajanews",
    alef = "alef",
    mojnews = "mojnews",
    iqna = "iqna",
    isna = "isna",
    ilna = "ilna",
    imna = "imna",
    shana = "shana",
    ana = "ana",
    chtn = "chtn",
    tasnim = "tasnim",
    tabnak = "tabnak",
    spnfa = "spnfa",
    sputnikaf = "sputnikaf",
    pana = "pana",
    ibna = "ibna",
    iana = "iana",
    snn = "snn",
    yjc = "yjc",
    virgool = "virgool",
    baharnews = "baharnews",
    khamenei = "khamenei",
    citna = "citna",
    rokna = "rokna",
    itna = "itna",
    ninisite = "ninisite",
    ictnews = "ictnews",
    asriran = "asriran",
    jahannews = "jahannews",
    varzesh3 = "varzesh3",
    tarafdari = "tarafdari",
    fardanews = "fardanews",
    bultannews = "bultannews",
    boursenews = "boursenews",

    ///////////// Not Ready
    zoomit = "zoomit",
    blogir = "blogir",
    /* javabyab="javabyab",
        digiato = "digiato",
        asreertebat = "asreertebat",
        ictnn = "ictnn",
        techna = "techna",
        itpress = "itpress",
        jamaran = "jamaran",
        sepahnews = "sepahnews",
        aryanews = "aryanews",
        sinapress = "sinapress",
        hawzahnews = "hawzahnews",
        ion = "ion",
        parsine = "parsine",
        fararu = "fararu",
        shianews = "shianews",
        shomalnews = "shomalnews",
        sarna = "sarna",
        shahr = "shahr",
        nakhostnews = "nakhostnews",
        wnn = "wnn",
        sabairan = "sabairan",
        berasad = "berasad",
        khabarfori = "khabarfori",
        jomhouriat = "jomhouriat",
        tadbir24 = "tadbir24",
        artanpress = "artanpress",
        tasna = "tasna",
        manbaekhabar = "manbaekhabar",
        melatebidaronline = "melatebidaronline",
        hamraznews = "hamraznews",
        partianemrooz = "partianemrooz",
        sedanews = "sedanews",
        bamdad = "bamdad",
        hajnews = "hajnews",
        armaneghtesadi = "armaneghtesadi",
        raby = "raby",
        iranetavana = "iranetavana",
        ekhtebar = "ekhtebar",
        ferghenews = "ferghenews",
        tehranpardis = "tehranpardis",
        khabartehran = "khabartehran",
        otaghnews = "otaghnews",
        asretech = "asretech",
        sarkhat = "sarkhat",
        afraca = "afraca",*/
}

export interface IntfGlobalconfigs {
    debugVerbosity?: number,
    showInfo?: boolean,
    debugDB?: boolean,
    showWarnings?: boolean,
    db?: string,
    maxConcurrent?: number,
    delay?: number,
    corpora?: string,
    proxies?: string[] | string,
    hostIP?: string,
    logPath?: string,
    compact?: boolean
}

export enum enuTextType {
    paragraph = "p",
    caption = "caption",
    cite = "cite",
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    alt = "alt",
    link = "link",
    ilink = "ilink",
    li = "li",
    blockquote = "blockquote"
}

export interface IntfKeyVal { [key: string]: string }
export interface IntfText { text: string, type: enuTextType, ref?: string }
export interface IntfComment { text: string, author?: string, date?: string }
export interface IntfImage { src: string, alt?: string }
export interface IntfContentHolder { texts: IntfText[], images: IntfImage[] }

export interface IntfPageContent {
    url: string,
    category?: string,
    article?: {
        date?: string,
        title?: string,
        aboveTitle?: string,
        subtitle?: string,
        summary?: string,
        content?: IntfText[],
        comments?: IntfComment[]
        images?: IntfImage[],
        tags?: string[],
    }
    links: string[],
}

export interface IntfProxy {
    agent: SocksProxyAgent,
    port: string
}

export interface IntfSelectorFunction {
    (article: HTMLElement, fullHtml: HTMLElement): HTMLElement | null | undefined
}

export interface IntfIsValidFunction {
    (article: HTMLElement, fullHtml: HTMLElement): boolean
}

export interface IntfSelectAllFunction {
    (article: HTMLElement, fullHtml: HTMLElement): HTMLElement[] | undefined
}

export interface IntfIgnoreTextElementFunction {
    (el: HTMLElement, index: number, allElements: HTMLElement[]): boolean
}
export interface IntfGetCommentsByAPI {
    (url: URL, reParams: IntfRequestParams): Promise<IntfComment[]>
}

export interface IntfDateSplitter {
    (element: HTMLElement, fullHtml?: HTMLElement): string
}

export interface IntfURLNormaliziztionConf {
    extraValidDomains?: string[]
    extraInvalidStartPaths?: string[],
    removeWWW?: boolean,
    pathToCheckIndex?: number | null
    validPathsItemsToNormalize?: string[]
}

export interface IntfProcessorConfigs {
    selectors?: {
        article?: string | IntfSelectorFunction,
        aboveTitle?: string | IntfSelectorFunction,
        title?: string | IntfSelectorFunction,
        subtitle?: string | IntfSelectorFunction,
        summary?: string | IntfSelectorFunction,
        content?: {
            main?: string | IntfSelectAllFunction,
            alternative?: string | IntfSelectAllFunction,
            textNode?: string | IntfSelectorFunction,
            ignoreTexts?: string[] | RegExp[],
            ignoreNodeClasses?: string[] | IntfIsValidFunction,
        },
        comments?: {
            container?: string | IntfSelectAllFunction,
            datetime?: string | IntfDateSplitter,
            author?: string | IntfSelectorFunction,
            text?: string | IntfSelectorFunction
        } | IntfGetCommentsByAPI,
        tags?: string | IntfSelectAllFunction,
        datetime?: {
            conatiner?: string | IntfSelectorFunction,
            splitter?: string | IntfDateSplitter
        }
        category?: {
            selector?: string | IntfSelectAllFunction,
            startIndex?: number,
        }
    },
    url?: IntfURLNormaliziztionConf
    preHTMLParse?: (html: string) => string
}

