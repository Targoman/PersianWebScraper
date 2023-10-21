import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsWebSmanehBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "section.single",
                aboveTitle: ".uptitle, .up-title",
                title: "h1",
                subtitle: ".lead",
                content: { main: '.con>*, .box-inline img   ' },
                comments: {
                    container: ".comments-list li, .new_gallery_list>*",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: (article: HTMLElement) =>
                    article.querySelectorAll("a").filter(a => a.getAttribute("href")?.startsWith("/tag/")),
                datetime: {
                    conatiner: '.top-meta li:nth-child(2)',
                    splitter: '-'
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".meta-cat")?.querySelectorAll("a"),
                    startIndex: 1,
                }
            },
            url:{
                removeWWW: true
            }
        }

        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

/***********************************************************/
export class ictnews extends clsWebSmanehBased {
    constructor() {
        super(enuDomains.ictnews, "ictnews.ir")
    }
}

