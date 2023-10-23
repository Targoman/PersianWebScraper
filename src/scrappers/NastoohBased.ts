import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs, IntfProxy } from "../modules/interfaces";
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
                pathToCheckIndex:1,
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
            url:{
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
        super(enuDomains.imna, "imna.ir",{
            url:{
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.imna.ir", this.baseURL, proxy)
    }
}

/***********************************************************/
export class shana extends clsNastoohBased {
    constructor() {
        super(enuDomains.shana, "shana.ir", {
            selectors: {
                datetime: {conatiner: ".item-nav.row>div>span, .item-date"}
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
            url:{
                extraInvalidStartPaths: ["/d/"]
            }
        })
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