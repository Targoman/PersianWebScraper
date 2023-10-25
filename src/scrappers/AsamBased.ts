import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsAsamBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: (parsedHTML: HTMLElement) => parsedHTML.querySelector("article") || parsedHTML.querySelector(".news_content, main"),
                aboveTitle: ".uptitle, .up-title",
                title: ".title, h1",
                subtitle: ".lead",
                content: {
                    main: '.article_body .echo_detail>*, .article_body #echo_detail>*, .article_body #echo_details>*, .album_content>*, .primary_files img',
                    ignoreTexts: [/.*tavoos_init_player.*/]
                },
                comments: {
                    container: ".comments-list li, .new_gallery_list>*",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.article_tags li',
                datetime: {
                    conatiner: '[itemprop="datePublished"], [itemprop="datepublished"]',
                    splitter: ' '
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb_list, .breadcrumb")?.querySelectorAll("li a"),
                    startIndex: 1,
                }
            },
        }

        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    protected normalizePath(url: URL): string {
        try {
            let hostname = url.hostname
            if (!hostname.startsWith("www."))
                hostname = "www." + hostname
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if (pathParts.length > 2
                && pathParts[1] !== "tags"
                && pathParts[1] !== "links"
                && pathParts[1] !== "fa"
                && pathParts[2] !== "")
                path = `/fa/tiny/news-${pathParts[2].split("-")[0]}` //+ "--->" + url.pathname

            return url.protocol + "//" + hostname + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }
}

/***********************************************************/
export class mojnews extends clsAsamBased {
    constructor() {
        super(enuDomains.mojnews, "mojnews.com", {
            selectors: {
                article: "body.news article,body.news  .news_content, .album_main",
                content: { ignoreTexts: ['بیشتر بخوانید:'] }
            }
        })
    }
}

/***********************************************************/
export class ilna extends clsAsamBased {
    constructor() {
        super(enuDomains.ilna, "ilna.ir")
    }
}

/***********************************************************/
export class rokna extends clsAsamBased {
    constructor() {
        super(enuDomains.rokna, "rokna.net", {
            selectors: {
                title: 'h1',
                subtitle: '.lead, h1+p',
                datetime: {
                    conatiner: 'time'
                },
                content: {
                    main: ".primary-files, #CK_editor>*",
                    ignoreNodeClasses: ["noprint", 'video-js-container']
                },
                category:{
                    startIndex:2
                }
            }
        })
    }
}

/***********************************************************/
export class iana extends clsAsamBased {
    constructor() {
        super(enuDomains.iana, "iana.ir", {
            selectors: {
                article: "main .right-hand, #modal-page",
                subtitle: (article: HTMLElement) => article.querySelector("div.lead p.lead") || article.querySelector(".lead"),
                content: {
                    main: ".echo-detail-inner>*, .primary-files"
                },
                datetime: {
                    conatiner: '.code-time time, [itemprop="datepublished"]'
                },
                category: {
                    selector: ".breadcrumb-inner li",
                    startIndex: 1,
                }
            }
        })
    }
}

/***********************************************************/
export class fardanews extends clsAsamBased {
    constructor() {
        super(enuDomains.fardanews, "fardanews.com", {
            selectors: {
                article: "article",
                datetime: {
                    conatiner: ".news-time"
                },
                content: {
                    main: "#echo_detail, ul"
                },
            }
        })
    }
}

/***********************************************************/
export class khabarfoori extends clsAsamBased {
    constructor() {
        super(enuDomains.khabarfoori, "khabarfoori.com", {
            selectors: {
                datetime: {
                    conatiner: 'time',
                },
                content: {
                    main: ".article_content"
                },
                tags:(article: HTMLElement) => article.querySelector(".news_tags")?.querySelectorAll("a"),
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb_cnt ul.bread_crump")?.querySelectorAll("li a"),
                    startIndex: 1,
                }
            }
        })
    }
}

/***********************************************************/
export class bartarinha extends clsAsamBased {
    constructor() {
        super(enuDomains.bartarinha, "bartarinha.ir", {
            selectors: {
                datetime: {
                    conatiner: '.news_time',
                },
                tags: (article: HTMLElement) => article.querySelector(".article_tags")?.querySelectorAll("a")
            }
        })
    }
}

/***********************************************************/
export class faradeed extends clsAsamBased {
    constructor() {
        super(enuDomains.faradeed, "faradeed.ir", {
            selectors: {
                tags: "a.tag_item"
            }
        })
    }
}