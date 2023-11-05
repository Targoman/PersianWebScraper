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
    lastsecond = "lastsecond",

    fardanews = "fardanews",
    bultannews = "bultannews",
    boursenews = "boursenews",
    shahr = "shahr",
    fararu = "fararu",
    parsine = "parsine",
    shianews = "shianews",
    hawzahnews = "hawzahnews",
    khabarfoori = "khabarfoori",
    bartarinha = "bartarinha",
    iribnews = "iribnews",
    mizanonline = "mizanonline",
    kayhan = "kayhan",
    basijnews = "basijnews",
    shahraranews = "shahraranews",
    rasanews = "rasanews",
    didarnews = "didarnews",
    faradeed = "faradeed",
    niniban = "niniban",
    roozno = "roozno",
    noandish = "noandish",
    javanonline = "javanonline",
    aghigh = "aghigh",
    paydarymelli = "paydarymelli",
    danakhabar = "danakhabar",
    niknews = "niknews",
    iraneconomist = "iraneconomist",
    barghnews = "barghnews",
    shohadayeiran = "shohadayeiran",
    sedayiran = "sedayiran",
    tejaratonline = "tejaratonline",
    sarmadnews = "sarmadnews",
    goftareno = "goftareno",
    tejaratemrouz = "tejaratemrouz",
    vananews = "vananews",
    tabnakbato = "tabnakbato",
    shoaresal = "shoaresal",
    bankdariirani = "bankdariirani",
    tebyan = "tebyan",
    digikala = "digikala",
    romanman = "romanman",
    webhostingtalk = "webhostingtalk",
    barnamenevis = "barnamenevis",
    p30world = "p30world",
    tarfandestan = "tarfandestan",
    boursy = "boursy",
    soft98 = "soft98",
    persiantools = "persiantools",
    majidonline = "majidonline",
    lioncomputer = "lioncomputer",
    wikifa = "wikifa",
    yekpezeshk = "yekpezeshk",
    digiato = "digiato",
    blogir = "blogir",
    yektanet = "yektanet",
    bazmineh = "bazmineh",
    namnak = "namnak",
    beytoote = "beytoote",
    blogsky = "blogsky",
    technolife = "technolife",
    sid = "sid",
    sakhtafzarmag = "sakhtafzarmag",
    bazicenter = "bazicenter",
    wppersian = "wppersian",
    joomlafarsi = "joomlafarsi",
    moshaver = "moshaver",
    oghyanos = "oghyanos",
    naghdfarsi = "naghdfarsi",
    arzdigital = "arzdigital",
    ramzarz = "ramzarz",
    ///////////// Not Ready
    zoomit = "zoomit",
    /* javabyab="javabyab",
        digiato = "digiato",
        asreertebat = "asreertebat",
        ictnn = "ictnn",
        techna = "techna",
        itpress = "itpress",
        jamaran = "jamaran",
        aryanews = "aryanews",
        sinapress = "sinapress",
        ion = "ion",
        shomalnews = "shomalnews",
        nakhostnews = "nakhostnews",
        wnn = "wnn",
        berasad = "berasad",
        jomhouriat = "jomhouriat",
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
        tehranpardis = "tehranpardis",
        khabartehran = "khabartehran",
        otaghnews = "otaghnews",
        asretech = "asretech",
        sarkhat = "sarkhat",
        afraca = "afraca",*/
}

export interface IntfGlobalConfigs {
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

export interface IntfDocFilecontent {
    url: string,
    category: string,
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

export enum enuMajorCategory {
    News = "News",
    Literature = "Literature",
    Forum = "Forum",
    Undefined = "Undefined",
    Weblog = "Weblog",
    Wiki = "Wiki",
    SocialMedia = "SocialMedia"
}

export enum enuMinorCategory {
    Political = "Political",
    Social = "Social",
    Health = "Health",
    Economics = "Economics",
    Culture = "Art&Culture",
    Sport = "Sport",
    ScienceTech = "Science&Tech",
    Undefined = "Undefined",
    Generic = "Generic",
    Multimedia = "Multimedia",
    Talk = "Talk",
    Discussion = "Discussion",
    Poem = "Poem",
    Text = "Text",
    Local = "Local",
    Religious = "Religious",
    Law = "Law",
    LifeStyle = "LifeStyle",
    Game = "Game",
    Education = "Education",
    Literature = "Literature",
}

export enum enuSubMinorCategory {
    IT = "IT",
    Car = "Car",
    Gadgets = "Gadgets",
    AI = "AI",
    Intl = "Intl",
    Accident = "Accident",
    Art = "Art",
    Cinema = "Cinema",
    Music = "Music",
    Theatre = "Theatre",
    Futbol = "Futbol",
    Ball = "Ball",
    Wrestling = "Wrestling"
}

export interface IntfMappedCatgory {
    major: enuMajorCategory,
    minor?: enuMinorCategory,
    subminor?: enuSubMinorCategory | enuMinorCategory
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
    ignoreContentOnPath?: string[],
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
            splitter?: string | IntfDateSplitter,
            acceptNoDate?: boolean
        }
        category?: {
            selector?: string | IntfSelectAllFunction,
            startIndex?: number,
        }
    },
    url?: IntfURLNormaliziztionConf
    preHTMLParse?: (html: string) => string
}

