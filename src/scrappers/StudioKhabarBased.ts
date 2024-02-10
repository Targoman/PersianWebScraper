import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsStudioKhabarBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: ".doc_content, .col-lg-36 .col-lg-36",
                aboveTitle: "#docDiv3TitrRou", //.subtitle
                title: "#docDiv3TitrMain",
                summary: "#docDivLead1, #docDivLead",
                content: {
                    main: '#doctextarea article, .thumbnail, #docContentdiv article',
                    alternative: '.item-body>*',
                    textNode: ".item-body .item-text"
                },
                comments: {
                    container: ".comments-list li, .user-comment-area",
                    datetime: ".date, .user-comment-date",
                    author: ".author, .user-comment-name",
                    text: ".comment-body, .user-comment-content"
                },
                tags: '.tags a',
                datetime: {
                    conatiner: ".doc_date, .docDiv3Date",
                    splitter: "-"
                },
                category: {
                    selector: '.doc-section-info a'
                }
            },
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    protected normalizePath(url: URL): string {
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 3
            && (pathParts[2] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}`

        return url.protocol + "//" + url.hostname + path
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (false
            || first.startsWith("عکس")
            || first.startsWith("فیلم")
            || first.startsWith("صوت")
            || first.startsWith("گزارش تصویری")
            || first.startsWith("فوتوتیتر")
        ) mappedCat.minor = enuMinorCategory.Multimedia

        if (first.startsWith("گفتگو") || first.startsWith("مصاحبه"))
            mappedCat.minor = enuMinorCategory.Talk

        if (second.startsWith("سیاس") || second.startsWith("انتخابات") || second.startsWith("الملل")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Political; else mappedCat.minor = enuMinorCategory.Political
        } else if (second.startsWith("جامعه")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.startsWith("علم")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.ScienceTech; else mappedCat.minor = enuMinorCategory.ScienceTech
        } else if (second.startsWith("اقتصاد") || second.startsWith("بازرگانی") || second.startsWith("کسب")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economics; else mappedCat.minor = enuMinorCategory.Economics
        } else if (second.startsWith("فرهنگ")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Culture; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.startsWith("ورزش")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Sport; else mappedCat.minor = enuMinorCategory.Sport
        } else if (second.startsWith("عکس") || second.startsWith("فیلم") || second.startsWith(" صوت")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Multimedia; else mappedCat.minor = enuMinorCategory.Multimedia
        }

        return mappedCat
    }
}

/***********************************************************/
export class jahannews extends clsStudioKhabarBased {
    constructor() {
        super(enuDomains.jahannews, "jahannews.com", {
            selectors: {

            }
        })
    }

    protected normalizePath(url: URL): string {
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 2
            && (pathParts[1] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}`

        return url.protocol + "//" + url.hostname + path
    }
}


/***********************************************************/
export class baharnews extends clsStudioKhabarBased {
    constructor() {
        super(enuDomains.baharnews, "baharnews.ir", {
            selectors: {
                content: {
                    main: "#doctextarea, #doc_div1Img img"
                },
                datetime: {
                    conatiner: "#docDiv3Date",
                    splitter: (el: HTMLElement) => el.innerText.split("ساعت")?.at(0)?.replace("تاریخ انتشار :", "").trim() || "DATE NOT FOUND",
                }
            },
        })
    }

    protected normalizePath(url: URL): string {
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 2
            && (pathParts[1] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}`

        return url.protocol + "//" + url.hostname + path
    }


}

