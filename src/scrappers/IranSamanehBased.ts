import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

export class clsIransamaneh extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article",
                aboveTitle: ".rutitr, .news-rutitr",
                title: ".title, .news-title",
                subtitle: ".subtitle, .news-subtitle",
                summary: ".sub_ax, .subtitle_photo",
                content: {
                    main: '.body>*, .lead_image, .album_listi>*',
                    alternative: '.album_content>*',
                    textNode: ".body"
                },
                comments: {
                    container: ".comments_item, .comm_answer_line, .comm_answer",
                    datetime: ".comm_info_date,.comment_answer_5",
                    author: ".comm_info_name,.comment_answer_2",
                    text: (el: HTMLElement) => {
                        if (el.classNames.includes("comm_answer_line"))
                            return el.childNodes[el.childNodes.length - 1] as HTMLElement
                        return el.querySelector(".comments")
                    }
                },
                tags: ".tags li, .tags_title a",
                datetime: {
                    conatiner: ".item-date span, .news_pdate_c, .autor_ax, .news-date, .fa_date",
                    splitter: "-"
                },
                category: {
                    selector: ".news_path a",
                    startIndex: 0,
                }
            },
            url: {
                pathToCheckIndex: 2,
                validPathsItemsToNormalize: ["news", "photos"]
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    /*protected normalizePath(url: URL): string {
        let hostname = url.hostname
        if (!hostname.startsWith("www."))
            hostname = "www." + hostname
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        if (pathParts.length > 3
            && (pathParts[2] === "news"
                || pathParts[2] === "photos"
            )
        )
            path = `/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}`

        return url.protocol + "//" + hostname + path
    }*/
}

/***********************************************************/
export class aftabnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.aftabnews, "aftabnews.ir", {
            selectors: {
                article: ".col_r_inner_news",
                content: {
                    ignoreTexts: ['آفتاب‌‌نیوز :']
                }


            },
        })
    }

    mustBeIgnored(tag: HTMLElement, index: number, allElements: HTMLElement[]) {
        void index, allElements
        return tag.classNames === "aftab_news" && tag.tagName === "DIV"
    }
}


/***********************************************************/
export class seratnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.seratnews, "seratnews.com", {
            selectors: { article: '.body-news, .body_news' }
        })
    }
}

/***********************************************************/
export class iqna extends clsIransamaneh {
    constructor() {
        super(enuDomains.iqna, "iqna.ir", {
            selectors: { article: ".box_news" }
        })
    }
}

/***********************************************************/
export class ana extends clsIransamaneh {
    constructor() {
        super(enuDomains.ana, "ana.press", { selectors: { article: ".news_content, .container-newsMedia" } })
    }
}

/***********************************************************/
export class tabnak extends clsIransamaneh {
    constructor() {
        super(enuDomains.tabnak, "tabnak.ir", {
            selectors: {
                article: ".gutter_news",
                category: {
                    startIndex: 1
                }

            }
        })
    }
}

/***********************************************************/
export class snn extends clsIransamaneh {
    constructor() {
        super(enuDomains.snn, "snn.ir", {
            selectors: {
                article: ".main_col, .photo_news_content",
                content: {
                    ignoreTexts: ['کد ویدیو دانلود فیلم اصلی']
                },
                datetime: {
                    conatiner: (el: HTMLElement, fullHtml?: HTMLElement) => {
                        if (fullHtml?.querySelector('.live_news')) return fullHtml.querySelector("body")
                        return el.querySelector(".news_pdate_c, .photo_pdate")
                    },
                    splitter: (el: HTMLElement, fullHtml?: HTMLElement) => {
                        if (fullHtml?.querySelector('.live_news')) return "LIVE"
                        return super.extractDate(el, "-")?.replace("تاریخ انتشار", "") || "DATE NOT FOUND"
                    }
                }
            },
        })
    }
}

/***********************************************************/
export class yjc extends clsIransamaneh {
    constructor() {
        super(enuDomains.yjc, "yjc.ir", {
            selectors: {
                article: ".news-box, .news_body_serv2",
                title: ".title-news, .baznashr-title",
                subtitle: ".news_strong, .baznashr-subtitle",
                content: {
                    main: ".baznashr-body>*, .col-grid-album-photo>, .parent-lead-img img",
                    ignoreNodeClasses: ["path_bottom_body", "wrapper", "det-1", "parent-lead-img"]
                },
                datetime: {
                    conatiner: ".details-box-news .photo-newspage-date .date-color-news:last-child, .date-color-news:first-child",
                },
                category: {
                    selector: ".path_bottom_body a",
                    startIndex: 1
                },
                comments: {
                    datetime: ".date-news-com"
                },
            }
        })
    }
}

/***********************************************************/
export class asriran extends clsIransamaneh {
    constructor() {
        super(enuDomains.asriran, "asriran.com", {
            selectors: {
                article: ".col1-news",
                title: "h1",
                
            }
        })
    }
}

export class bultannews extends clsIransamaneh {
    constructor() {
        super(enuDomains.bultannews, "bultannews.com", {
            selectors: {
                article: ".main_body .col-md-27",
                title: "h1",
                aboveTitle: ".rutitr",
                subtitle: ".subtitle",
                content: {
                    main: ".body>*",
                },
                datetime: {
                    conatiner: "time",
                },
            }
        })
    }
}

export class boursenews extends clsIransamaneh {
    constructor() {
        super(enuDomains.boursenews, "boursenews.ir", {
            selectors: {
                article: ".newsContent",
                aboveTitle: ".newsPreTitle",
                title: "h1",
                datetime: {
                    conatiner: ".newsDate",
                },
                category: {
                    selector: "a.newsSubjectName",
                },
            }
        })
    }
}

export class fararu extends clsIransamaneh {
    constructor() {
        super(enuDomains.fararu, "fararu.com", { 
            selectors: {
                article: ".col-main-news",
                subtitle: ".content-lead-news"
            }
        })
    }
}

export class parsine extends clsIransamaneh {
    constructor() {
        super(enuDomains.parsine, "parsine.com", { 
            selectors: {
                article: ".general-news-body",
            }
        })
    }
}

export class shianews extends clsIransamaneh {
    constructor() {
        super(enuDomains.shianews, "shia-news.com", { 
            selectors: {
                article: ".news-body",
                datetime: {
                    conatiner: ".news_pdate_c, .news-info-inner-photo",
                    splitter: "-"
                },
            }
        })
    }
}

export class iribnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.iribnews, "iribnews.ir", { 
            selectors: {
                article: ".news_general_dl, .photo_body",
                title: ".title, .video_title",
                subtitle: "p.subtitle, .photo_subtitle",
                datetime: {
                    conatiner: ".news_pdate_c, .photo_pub_date",
                    splitter: "/, -"
                },
                content: {
                    main: ".news_album_main_part, .video_content",
                },
                category: {
                    selector: ".news_path2 a, .news_path a",
                },
            }
        })
    }
}

export class mizanonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.shianews, "mizanonline.ir", { 
            selectors: {
                article: ".main_news_body, .main-body",
            }
        })
    }
}

export class kayhan extends clsIransamaneh {
    constructor() {
        super(enuDomains.kayhan, "kayhan.ir", { 
            selectors: {
                article: ".margin_bt_fari div[style='direction: rtl;']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                }
            }
        })
    }
}

export class basijnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.basijnews, "basijnews.ir", { 
            selectors: {
                article: ".page",
            }
        })
    }
}

export class shahraranews extends clsIransamaneh {
    constructor() {
        super(enuDomains.shahraranews, "shahraranews.ir", { 
            selectors: {
                article: ".news-content, .news-main",
                datetime: {
                    conatiner: "ul.up-news-tools, span:nth-child(5),  li:nth-child(2) > span"
                },
                title: ".title, h1.photoshahr-title",
                subtitle: ".subtitle, .photoshahr-subtitle",
                category: {
                    selector: ".path-cover a",
                },
                tags: ".tags_container a"
            }
        })
    }
}

export class rasanews extends clsIransamaneh {
    constructor() {
        super(enuDomains.rasanews, "rasanews.ir", { 
            selectors: {
                article: ".news_content",
            }
        })
    }
}

export class didarnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.didarnews, "didarnews.ir", { 
            selectors: {
                article: ".news-body",
                title: ".title_c",
                datetime: {
                    conatiner: ".publish-date"
                },
                tags: ".tags_container a"
            }
        })
    }
}

export class niniban extends clsIransamaneh {
    constructor() {
        super(enuDomains.niniban, "niniban.com", { 
            selectors: {
                article: ".col-md-24",
                datetime: {
                    conatiner: "time.news_path_time",
                    splitter: "/"
                },
                tags: ".tags_container a"
            }
        })
    }
}

export class roozno extends clsIransamaneh {
    constructor() {
        super(enuDomains.roozno, "roozno.com", { 
            selectors: {
                article: ".news-content",
                tags: ".tags_title a"
            }
        })
    }
}

export class noandish extends clsIransamaneh {
    constructor() {
        super(enuDomains.noandish, "noandish.com", { 
            selectors: {
                article: ".middle_news_body",
                subtitle: ".newspage_subtitle"
            }
        })
    }
}

export class javanonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.javanonline, "javanonline.ir", { 
            selectors: {
                article: ".over-hide",
            }
        })
    }
}
export class aghigh extends clsIransamaneh {
    constructor() {
        super(enuDomains.aghigh, "aghigh.ir")
    }
}

export class paydarymelli extends clsIransamaneh {
    constructor() {
        super(enuDomains.paydarymelli, "paydarymelli.ir", { 
            selectors: {
                article: "div[style='direction: rtl;']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                }
            }
        })
    }
}

export class danakhabar extends clsIransamaneh {
    constructor() {
        super(enuDomains.danakhabar, "danakhabar.com", { 
            selectors: {
                article: ".main-body-page-news",
            }
        })
    }
}

export class iraneconomist extends clsIransamaneh {
    constructor() {
        super(enuDomains.iraneconomist, "iraneconomist.com", { 
            selectors: {
                article: ".main_news_col",
            }
        })
    }
}