import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs, IntfProxy } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { getArvanCookie } from "../modules/request";

class clsNastoohBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article",
                aboveTitle: ".rutitr, .kicker",
                title: ".title",
                subtitle: ".introtext",
                summary: ".item-summary",
                content: {
                    main: '.item-body .item-text>*, .introtext+figure, .item-header+figure, section.photoGall li, .item-text .gallery figure, .item-summary figure',
                    alternative: '.item-body>*',
                    textNode: ".item-body .item-text"
                },
                comments: {
                    container: ".comments-list li",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: (article: HTMLElement) => article.querySelector('.tags')?.querySelectorAll('li'),
                datetime: {
                    conatiner: '.item-date>span',
                    splitter: "-"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb")?.querySelectorAll("li"),
                    startIndex: 0,
                }
            },
            url: {
                extraInvalidStartPaths: ["/old/upload", '/d/'],
                pathToCheckIndex: 1,
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

/***********************************************************/
export class hamshahrionline extends clsNastoohBased {
    constructor() {
        super(enuDomains.hamshahrionline, "hamshahrionline.ir", {
            selectors: {
                article: ".main-content"
            }
        })
    }
}

/***********************************************************/
export class irna extends clsNastoohBased {
    constructor() {
        super(enuDomains.irna, "irna.ir", { selectors: { datetime: { splitter: "،" } } })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.irna.ir", this.baseURL, proxy)
    }


    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("استان"))
            return { ...mappedCat, minor: enuMinorCategory.Local }

        if (false
            || first.startsWith("ملٹی میڈیا")
            || first.startsWith("عکس")
            || first.startsWith("چندرسانه‌ای")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
        } else if (first.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("صفحات")) {
            if (second.startsWith("جام")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
            return { ...mappedCat, minor: enuMinorCategory.Political }
        } else if (first.startsWith("علم")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.startsWith("دانشگاه") || second.includes("دانشجو") || second.includes("سنجش")) mappedCat.minor = enuMinorCategory.University
            else if (second.startsWith("فرهنگیان") || second.includes("دانشجو")) mappedCat.minor = enuMinorCategory.University
            else if (second.startsWith("شورای") || second.startsWith("وزارت") || second.startsWith("معاونت")) mappedCat.minor = enuMinorCategory.Political
        } else if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.startsWith("کتاب")) mappedCat.subminor = enuSubMinorCategory.Book
            else if (second.endsWith("تلویزیون")) mappedCat.subminor = enuSubMinorCategory.TV
            else if (second.startsWith("سینما")) mappedCat.subminor = enuSubMinorCategory.Cinema
            else if (second.startsWith("قرآن") || second.startsWith("قران") || second.startsWith("ایثار") || second.startsWith("حج")) mappedCat.subminor = enuMinorCategory.Religious
            else if (second.startsWith("موسیقی")) mappedCat.subminor = enuSubMinorCategory.Music
            else if (second.startsWith("گردشگری") || second.includes("میراث") || second.includes("ایران")) mappedCat.subminor = enuSubMinorCategory.Turism
            else if (second.startsWith("هنر")) mappedCat.subminor = enuSubMinorCategory.Art
        } else if (first.startsWith("پژوهش")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.includes("جعلی") || second.includes("راستی")) mappedCat.minor = enuMinorCategory.Generic
            else if (second.includes("ایران")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
            else if (second.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
            else if (second.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
            else if (second.includes("بین‌الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
            else if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
            else if (second.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
            else if (second.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Law }
            else if (second.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
            else if (second.includes("میزگرد")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        } else if (first.startsWith("ورزش")) {
            mappedCat.minor = enuMinorCategory.Sport
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.startsWith("توپ") || second.includes("راکتی")) mappedCat.subminor = enuSubMinorCategory.Ball
            if (second.startsWith("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
            if (second.includes("رزمی")) mappedCat.subminor = enuSubMinorCategory.Martial
            if (second.includes("زنان")) mappedCat.subminor = enuSubMinorCategory.Women
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
        }
        return mappedCat
    }
}

/***********************************************************/
export class mashreghnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.mashreghnews, "mashreghnews.ir", {
            selectors: {
                comments: {
                    container: (_: HTMLElement, fullHtml: HTMLElement) => {
                        return fullHtml.querySelectorAll(".comments li")
                    }
                }
            }
        })
    }
}

/***********************************************************/
export class khabaronline extends clsNastoohBased {
    constructor() {
        super(enuDomains.khabaronline, "khabaronline.ir", {
            selectors: { content: { ignoreTexts: ["بیشتر بخوانید:"] } },
            url: {
                validPathsItemsToNormalize: ["news", "live", "photo", "media"]
            }
        })
    }

    textNodeMustBeIgnored(tag: HTMLElement, index: number, allElements: HTMLElement[]) {
        return index > allElements.length - 5
            && (tag.innerText.match(/^[۱۲۳۴۵۶۷۸۹۰1234567890]+$/) ? true : false)
    }
}

/***********************************************************/
export class mehrnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.mehrnews, "mehrnews.com", {
            selectors: {
                datetime: {
                    splitter: (el: HTMLElement, fullHtml?: HTMLElement) => {
                        const photoPage = fullHtml?.querySelector("#photo")
                        return super.extractDate((photoPage?.querySelector(".item-date>span") || el), photoPage ? "-" : "،") || "DATE NOT FOUND"
                    }
                }
            }
        })
    }
}

/***********************************************************/
export class imna extends clsNastoohBased {
    constructor() {
        super(enuDomains.imna, "imna.ir", {
            url: {
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.imna.ir", this.baseURL, proxy)
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("عکس") || first.startsWith("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
        } else if (first.startsWith("سیاست")) {
            mappedCat.minor = enuMinorCategory.Political
            if (second.includes("الملل")) return { ...mappedCat, subminor: enuSubMinorCategory.Intl }
        } else if (first.startsWith("شهر")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.includes("موسیقی")) return { ...mappedCat, subminor: enuSubMinorCategory.Music }
            else if (second.includes("دین")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            else if (second.includes("کتاب")) return { ...mappedCat, subminor: enuSubMinorCategory.Book }
            else if (second.includes("ادبیات")) return { ...mappedCat, subminor: enuMinorCategory.Literature }
            else if (second.includes("سینما")) return { ...mappedCat, subminor: enuSubMinorCategory.Cinema }
            else if (second.includes("گردشگری")) return { ...mappedCat, subminor: enuSubMinorCategory.Turism }
        } else if (first.startsWith("علم")) {
            if (second.includes("پزشکی")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            else if (second.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        }
        else if (cat.includes("ورزش")) {
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.startsWith("توپ") || second.includes("راکتی")) mappedCat.subminor = enuSubMinorCategory.Ball
            if (second.startsWith("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
            if (second.includes("رزمی")) mappedCat.subminor = enuSubMinorCategory.Martial
            if (second.includes("زنان")) mappedCat.subminor = enuSubMinorCategory.Women
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
        }
        else if (cat.includes("کرونا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }

        return mappedCat
    }
}

/***********************************************************/
export class shana extends clsNastoohBased {
    constructor() {
        super(enuDomains.shana, "shana.ir", {
            selectors: {
                datetime: { conatiner: ".item-nav.row>div>span, .item-date" }
            },
            url: {
                extraInvalidStartPaths: ["/tender/"]
            }
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.shana.ir", this.baseURL, proxy)
    }
}

/***********************************************************/
export class chtn extends clsNastoohBased {
    constructor() {
        super(enuDomains.chtn, "chtn.ir", {
            selectors: {
                article: ".main-content, #photo"
            },
            url: {
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }

        if (second.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.startsWith("گردشگری")) return { ...mappedCat, subminor: enuSubMinorCategory.Turism }

        return mappedCat
    }
}

/***********************************************************/
export class shahr extends clsNastoohBased {
    constructor() {
        super(enuDomains.shahr, "shahr.ir", {
            selectors: {
                aboveTitle: ".subtitle",
            }
        })
    }
}

/***********************************************************/
export class ibna extends clsNastoohBased {
    constructor() {
        super(enuDomains.ibna, "ibna.ir", {
            selectors: {
                article: "article",
                title: ".item-title",
                datetime: {
                    conatiner: ".item-date",
                    splitter: "-",
                }
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("کودک") || second.startsWith("مدیریت") || second.startsWith("ادبیات") || second.startsWith("تازه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Local }
        else if (cat.includes("چندرسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.includes("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class hawzahnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.hawzahnews, "hawzahnews.com", {
            selectors: {
                article: "div[id='main']",
                datetime: {
                    conatiner: '.item-date>span, .gallery-desc',
                    splitter: "-"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector("ol.breadcrumb")?.querySelectorAll("li"),
                    startIndex: 0,
                }
            }
        })
    }
}