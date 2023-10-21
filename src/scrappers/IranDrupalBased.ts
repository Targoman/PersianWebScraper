import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsIranDrupal extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article", //, .news_content
                aboveTitle: ".rutitr",
                title: ".title",
                subtitle: ".lead",
                content: {
                    main: '.body>*',
                    alternative: '.album_content>*',
                    textNode: ".body"
                },
                comments: {
                    container: ".comments-list li",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.tags li',
                datetime: {
                    conatiner: '.date-display-single',
                    splitter: '-'
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".category-breadcrumb")?.querySelectorAll("a"),
                    startIndex: 0,
                }
            },
            url: {
                pathToCheckIndex:1,
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}


/***********************************************************/
export class rajanews extends clsIranDrupal {
    constructor() {
        super(enuDomains.rajanews, "rajanews.com")
    }
}
