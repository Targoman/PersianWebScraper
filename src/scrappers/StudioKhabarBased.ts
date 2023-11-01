import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
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
}

