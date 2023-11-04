import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
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
        let hostname = url.hostname
        if (!hostname.startsWith("www."))
            hostname = "www." + hostname
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 3
            && (pathParts[2] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}`

        return url.protocol + "//" + hostname + path
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
        let hostname = url.hostname
        if (!hostname.startsWith("www."))
            hostname = "www." + hostname
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 2
            && (pathParts[1] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}`

        return url.protocol + "//" + hostname + path
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
        let hostname = url.hostname
        if (!hostname.startsWith("www."))
            hostname = "www." + hostname
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 2
            && (pathParts[1] !== "tag")
        )
            path = `/${pathParts[1]}/${pathParts[2]}`

        return url.protocol + "//" + hostname + path
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second === '') return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (first.startsWith("گفتگو") && second.startsWith("سیاسی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Political }
        else if (first.startsWith("گفتگو") && second.startsWith("اقتصاد"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Economics }
        else if (first.startsWith("گفتگو") && second.startsWith("فرهنگ و هنر"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Culture }
        else if (first.startsWith("گفتگو") && second.startsWith("جامعه"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Social }
        else if (first.startsWith("گفتگو") && second.startsWith("ورزشی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Sport }
        else if (first.startsWith("گفتگو") && second.startsWith("بین الملل"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("گزارش تصویری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("سیاسی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("ورزشی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport  }
        else if (second.startsWith("جامعه"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("فرهنگی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("بین الملل"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("اقتصاد"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (second.startsWith("کسب و کار"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (second.startsWith("عکس"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("فیلم"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("فرهنگ و هنر"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("علم و فناوری"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }

        return { major: enuMajorCategory.News }
    }
}

