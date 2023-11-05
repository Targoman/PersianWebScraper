import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Discussion }
        else if (cat.startsWith("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("چندرسانه‌ایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.startsWith("علم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.endsWith("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("اقتصاد") || first.startsWith("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (first.startsWith("فرهنگ") && second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگ") && second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (first.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (first.startsWith("علم") || cat.includes("دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (first.startsWith("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("خانه") || first.startsWith("هومیانا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (first.startsWith("ارتباطات"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
        
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second === '') return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (second.startsWith("سیاسی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("اجتماعی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("فرهنگی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("بین الملل"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("دین و اندیشه"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("اقتصادی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (second.startsWith("ورزشی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.startsWith("علمی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("هنری"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("بولتن2"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("عکس"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("حوادث"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (second.startsWith("فرهنگ و هنر"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("هسته ای"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("IT"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
        else if (second.startsWith("انرژی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        
        return { major: enuMajorCategory.News }
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
            },
            url: {
                removeWWW: true
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

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (first.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (first.startsWith("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (first.startsWith("عکس") || first.startsWith("فیلم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("روابط بین الملل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("محور مقاومت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.includes("کشاورزی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (first.startsWith("رزمایش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Local }
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
            },
            url: {
                extraInvalidStartPaths: ["/fa/search"]
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("گفتگو") && first.startsWith("سیاسی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Political }
        else if (second.startsWith("گفتگو") && first.startsWith("اقتصاد"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Economics }
        else if (second.startsWith("گفتگو") && first.startsWith("اجتماعی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Social }
        else if (second.startsWith("گفتگو") && first.startsWith("ورزشی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuMinorCategory.Sport }
        else if (second.startsWith("گفتگو") && first.startsWith("بین"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("سیاسی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("ورزش"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport  }
        else if (first.startsWith("اجتماعی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (first.startsWith("بین"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("اقتصاد"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (second.startsWith("حوادث"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("عکس"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("فیلم"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("صوت"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("سبک"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (first.startsWith("صفحه نخست")) return { major: enuMajorCategory.News }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
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

    mapCategory(cat?: string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("خانه")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Generic }
        else if (first.startsWith("گفت‌و‌گو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk }
        
        else if (first.startsWith("سرویس صوت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("گزارش تصویری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("برنامه تلویزیونی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        
        else if (second.endsWith("هیئت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.endsWith("هیات ها")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.endsWith("مذهبی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("اخبار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("تیتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }

        else if (second.startsWith("نقد شعر")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Talk }
        else if (second.startsWith("شعر جوان")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Poem }
        else if (second.startsWith("مداحی")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Poem }
        else if (second.startsWith("شب های دلتنگی")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Text }
        else if (second.startsWith("حرف دل")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Text }
        else if (first.startsWith("شعر آیینی")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Talk }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (first.startsWith("دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("ایرانشناسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (first.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (second.startsWith("راهبرد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("خبر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
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

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.startsWith("چهره") || second.startsWith("دیدنی"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class barghnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.barghnews, "barghnews.com", {
            selectors: {
                article: "div[style='direction: rtl;']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                }
            },
        })
    }

    mapCategory() : IntfMappedCatgory{
        return {major: enuMajorCategory.News, minor: enuMinorCategory.Economics}
    }
}

export class shohadayeiran extends clsIransamaneh {
    constructor() {
        super(enuDomains.shohadayeiran, "shohadayeiran.com", {
            selectors: {
                article: ".news_body",
            },
        })
    }
}

export class sedayiran extends clsIransamaneh {
    constructor() {
        super(enuDomains.sedayiran, "sedayiran.com", {
            selectors: {
                article: ".marg-news, #photo",
                datetime: {
                    conatiner: ".news_pdate_c, .decription_d_i"
                },
                title: ".title-news, .description_d",
                content: {
                    main: ".body_news"
                }
            },
        })
    }
}

export class tejaratonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.tejaratonline, "tejaratonline.ir", {
            selectors: {
                article: ".news_content",
            },
        })
    }
}

export class sarmadnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.sarmadnews, "sarmadnews.com", {
            selectors: {
                article: ".col2_inner",
            },
        })
    }
}

export class goftareno extends clsIransamaneh {
    constructor() {
        super(enuDomains.goftareno, "goftareno.ir", {
            selectors: {
                article: ".newspage_right_col",
                aboveTitle: ".newspage_rutitr",
                subtitle: "newspage_subtitle"
            },
        })
    }
}

export class tejaratemrouz extends clsIransamaneh {
    constructor() {
        super(enuDomains.tejaratemrouz, "tejaratemrouz.ir", {
            selectors: {
                article: ".body_news",
            },
        })
    }
}

export class vananews extends clsIransamaneh {
    constructor() {
        super(enuDomains.vananews, "vananews.com", {
            selectors: {
                article: ".body_news",
                datetime: {
                    conatiner: ".news_path"
                },
            },
        })
    }
}

export class tabnakbato extends clsIransamaneh {
    constructor() {
        super(enuDomains.tabnakbato, "tabnakbato.ir", {
            selectors: {
                article: ".khabar-body",
            },
        })
    }
}

export class shoaresal extends clsIransamaneh {
    constructor() {
        super(enuDomains.shoaresal, "shoaresal.ir", {
            selectors: {
                article: ".nopadd",
                title: ".title_news"
            },
        })
    }
}

export class bankdariirani extends clsIransamaneh {
    constructor() {
        super(enuDomains.bankdariirani, "bankdariirani.ir", {
            selectors: {
                article: ".news_body",
            },
        })
    }

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return {major: enuMajorCategory.News, minor: enuMinorCategory.Economics}
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("علم و فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (second.startsWith("زنگ تفریح")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return {major: enuMajorCategory.News, minor: enuMinorCategory.Economics}
    }
}