import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { isIranProvinceString } from "../modules/common";

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
        else if (cat.startsWith("الملل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("چندرسانه‌ایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصاد/بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاست/بین الملل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("جامعه/حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class iqna extends clsIransamaneh {
    constructor() {
        super(enuDomains.iqna, "iqna.ir", {
            selectors: { article: ".box_news" }
        })
    }

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class ana extends clsIransamaneh {
    constructor() {
        super(enuDomains.ana, "ana.press", { selectors: { article: ".news_content, .container-newsMedia" } })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("اقتصاد") || first.startsWith("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (first.startsWith("فرهنگ") && second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگ") && second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (first.startsWith("علم") || cat.includes("دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (first.startsWith("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("حقوق")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        else if (cat.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("خانه") || first.startsWith("هومیانا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("هوش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        else if (first.startsWith("ارتباطات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }

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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("توییترگرام")
            || cat.startsWith("روزنما")
            || cat.startsWith("نگاه")
            || cat.startsWith("رقم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.startsWith("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("بین")
            || cat.includes("خارجی")
            || cat.includes("انرژی هسته")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی")
            || cat.includes("مجلس")
            || cat.includes("رهبری")
            || cat.includes("دولت")
            || cat.includes("احزاب")
            || cat.includes("شورا")
            || cat.includes("مجمع")
            || cat.includes("داخلی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("اجتماعی")
            || cat.includes("جامعه")
            || cat.includes("محیط")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگ")
            || cat.includes("دفاع مقدس")
            || cat.includes("جغرافیا")
            || cat.includes("رادیو")
            || cat.includes("نمایش")
            || cat.includes("رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("دفاع")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("علمی")
            || cat.includes("فناوری")
            || cat.includes("مجازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("حیات وحش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        else if (cat.includes("بهداشت") || cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("شرکت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("ساعت صفر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("آگهی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("مذهب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if(cat.startsWith("استان")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if(cat.startsWith("سرگرمی") 
            || cat.startsWith("کمدی") 
            || cat.startsWith("تلخند")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if(cat.includes("آشپزی")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.includes("بازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Game }
        else if (cat.includes("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("ادیبستان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Poem }
        else if (cat.includes("مستند")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentry }
        else if (cat.includes("مد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.includes("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (first.startsWith("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("بین") || (second.includes("خارجی"))) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("اقتصاد بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("اقتصاد سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Political }
        else if (first.startsWith("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزش جهان") || second.startsWith("فوتبال جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (second.startsWith("رزمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (second.includes("بانوان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        else if (second.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (first.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (second.startsWith("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (second.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (second.startsWith("قضایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (first.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("دین و اندیشه") || first.startsWith("حسینیه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.includes("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (second.includes("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (second.includes("طنز")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (first.startsWith("دیگر رسانه‌")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Media }
        else if (first.startsWith("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (first.startsWith("فرهنگی") && second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگی") && second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگی") && second.includes("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia, subminor: enuSubMinorCategory.Music }
        else if (first.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("فیلم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (first.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (second.startsWith("بهداشت") || second.startsWith("کلینیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (first.startsWith("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (first.startsWith("وب") || cat.includes("اخبار داغ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.startsWith("سیاسی") || cat.includes("مجلس") || cat.includes("اخبار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
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
            },
            url: {
                ignoreContentOnPath: ["/fa/tags"]
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("بین الملل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("دین و اندیشه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.startsWith("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("هنری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("بولتن2")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (second.startsWith("فرهنگ و هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("هسته ای")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (second.startsWith("IT")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (second.startsWith("انرژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("فیلم") || cat.includes("عکس") || cat.includes("صوت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("آگهی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Advert }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("ویدیو") || cat.includes("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("فوتبال جهان") 
            || cat.includes("جام ") 
            || cat.includes("المپیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Media }
        else if (cat.includes("سینما") || cat.includes("فیلم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.includes("فرهنگ و هنر/تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("ارزهای دیجیتال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.CryptoCurrency }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد") 
            || cat.includes("بازار") 
            || cat.includes("مدیریت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("اپلیکیشن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
        else if (cat.includes("فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (cat.includes("علم و تکنولوژی/پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Health }  
        else if (cat.includes("علم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Historical }
        else if (cat.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("جامعه/حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("تبلیغات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }
        else if (cat.includes("سلامتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Health }
        else if (cat.includes("آشپزی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("تناسب") 
            || cat.includes("دکوراسیون") 
            || cat.includes("آداب") 
            || cat.includes("مد") 
            || cat.includes("موفقیت")
            || cat.includes("رابطه")
            || cat.includes("زیبایی")
            || cat.includes("رشد")
            || cat.includes("گل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("قانون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.includes("سفر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("طنز") 
            || cat.includes("پیامک") 
            || cat.includes("چهره") 
            || cat.includes("کاریکاتور")
            || cat.includes("فال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (cat.includes("بازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.Game }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("چندرسانه") 
            || cat.includes("عکس") 
            || cat.includes("فیلم")
            || cat.includes("طنزیکاتور")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصاد") || cat.includes("بانک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.includes("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("بسکتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Basketball }
        else if (cat.includes("رزمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("ورزش") || cat.includes("بازیهای")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین") || cat.includes("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("سلامت") || cat.includes("طب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (cat.includes("تبلیغ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }
        else if(cat.includes("گردشگری")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Turism }
        else if(cat.includes("خانواده") 
            || cat.includes("عروسی") 
            || cat.includes("دکوراسیون")
            || cat.includes("سبک")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("حقوق") || cat.includes("قضایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.includes("شورا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Local }
        else if (cat.includes("دفاعی") || cat.includes("نظامی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاست") || cat.includes("مجلس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if(cat.includes("آشپزی")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("سرگرمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (cat.includes("مذهب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("گوناگون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("مصاحبه")) return { major: enuMajorCategory.News, subminor: enuMinorCategory.Talk }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.includes("عکس") 
            || cat.includes("فیلم") 
            || cat.includes("پادکست")
            || cat.includes("صوت")
            || cat.includes("چندرسانه")
            || cat.includes("اینفوگرافیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("علمی") || cat.includes("تکنولوژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاسی") 
            || cat.includes("سیاست") 
            || cat.includes("بشر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("دیده") || cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("رزمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("اخبار خارجی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("سبک") || cat.includes("مشاوره")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("گردشگری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if(cat.includes("آشپزی")) return  { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("عمومی") 
            || cat.includes("مجازی") 
            || cat.includes("نوشته") 
            || cat.includes("گوناگون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("شیعه") 
            || cat.includes("دین")
            || cat.includes("حوزه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("حقوق") 
            || cat.includes("لاریجانی") 
            || cat.includes("رئیسی")
            || cat.includes("قضا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.includes("رپورتاژ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }

        return { major: enuMajorCategory.News }
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

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        if (false
            || first.startsWith("فیلم و نماهنگ")
            || first.startsWith("عکس")
            || first.startsWith("کاریکاتور")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("باشگاه") || isIranProvinceString(first)) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (first.startsWith("اجتماعی")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.startsWith("انتظامی")) return { ...mappedCat, subminor: enuSubMinorCategory.Police }
            if (second.startsWith("بهداشت")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.startsWith("زن")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
            if (second.startsWith("عفاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.startsWith("قضایی")) return { ...mappedCat, subminor: enuMinorCategory.Law }
        } else if (first.startsWith("اساتید")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (first.startsWith("اقتصاد") || first.endsWith("تعاون"))
            return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.includes("روابط بین"))
            return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("اقشار") || first.startsWith("بسیج") || first.startsWith("محور") || first.startsWith("رزمایش"))
            return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.includes("رسانه") || first.includes("فرهنگی"))
            return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (first.includes("علمی"))
            return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        return { ...mappedCat, minor: enuMinorCategory.Generic }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.includes("گرافیک") 
            || cat.includes("ویدئو") 
            || cat.includes("فیلم") 
            || cat.includes("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("گفتگو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk }
        else if (cat.includes("دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("بازار") || cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("سبک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("حوزه") || cat.includes("سیره")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News }
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

        if (first.startsWith("فیلم")
            || first.startsWith("عکس")
            || first.startsWith("صوت")
        ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }

        if (isIranProvinceString(first))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }
        if (second.startsWith("گفتگو") || second.startsWith("میزگرد") || second.startsWith("مصاحبه")) {
            mappedCat.minor = enuMinorCategory.Talk
            if (first.startsWith("سیاسی")) return { ...mappedCat, subminor: enuMinorCategory.Political }
            else if (first.startsWith("اقتصاد")) return { ...mappedCat, subminor: enuMinorCategory.Economy }
            else if (first.startsWith("اجتماعی")) return { ...mappedCat, subminor: enuMinorCategory.Social }
            else if (first.startsWith("ورزشی")) return { ...mappedCat, subminor: enuMinorCategory.Sport }
            else if (first.startsWith("الملل")) return { ...mappedCat, subminor: enuMinorCategory.Political }
            else if (first.startsWith("سبک")) return { ...mappedCat, subminor: enuMinorCategory.LifeStyle }
        }
        else if (second.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (first.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (first.startsWith("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return mappedCat
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("ویدئو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("سبک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
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

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("بین") || cat.includes("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("علم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("هنری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("جامعه") || cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("خودرو") ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("طنز")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }
        if (false
            || first.startsWith("چندرسانه‌ای")
            || first.startsWith("عکس")
            || first.startsWith("کاریکاتور")
        ) mappedCat.minor = enuMinorCategory.Multimedia

        if (first.startsWith("ایثار") || first.startsWith("دین"))
            mappedCat.minor = enuMinorCategory.Religious
        else if (first.startsWith("دانش"))
            mappedCat.minor = enuMinorCategory.University
        else if (first.startsWith("تاریخ"))
            mappedCat.minor = enuMinorCategory.Historical
        else if (first.startsWith("زنان") || first.startsWith("سبک"))
            mappedCat.minor = enuMinorCategory.LifeStyle
        else if (first.startsWith("جامعه"))
            mappedCat.minor = enuMinorCategory.Social
        else if (first.startsWith("فرهنگ"))
            mappedCat.minor = enuMinorCategory.Culture
        else if (first.startsWith("ورزش")) {
            if (second.startsWith("رزمی"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
            if (second.startsWith("فوتبال") || second.startsWith("جام"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
            if (second.startsWith("وزنه"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Weightlifting }
            if (second.startsWith("کشتی"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
            if (second.startsWith("توپ"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
            if (second.startsWith("بانوان"))
                return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        }
        else if (first.startsWith("سیاست"))
            mappedCat.minor = enuMinorCategory.Political
        else if (isIranProvinceString(first))
            mappedCat.minor = enuMinorCategory.Local
        else if (first.startsWith("الملل") || second.startsWith("الملل")) {
            mappedCat.minor = enuMinorCategory.Political
            mappedCat.subminor = enuSubMinorCategory.Intl
        }

        if (second.startsWith("سیاسی") || second.startsWith("الملل")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Political; else mappedCat.minor = enuMinorCategory.Political
        } else if (second.startsWith("اجتماعی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.startsWith("اقتصاد") || second.startsWith("بازرگانی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economy; else mappedCat.minor = enuMinorCategory.Economy
        } else if (second.startsWith("فرهنگ") || second.startsWith("بسیج") || second.startsWith("پایداری")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Culture; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.startsWith("هنری")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Art; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.startsWith("ورزش")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Sport; else mappedCat.minor = enuMinorCategory.Sport
        } else if (second.startsWith("دفاعی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Defence; else mappedCat.minor = enuMinorCategory.Defence
        } else if (second.startsWith("حقوق")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Law; else mappedCat.minor = enuMinorCategory.Law
        } else if (second.includes("حجاب")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Religious; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("دانشگاه")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.University; else mappedCat.minor = enuMinorCategory.University
        } else if (second.startsWith("عمومی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Generic; else mappedCat.minor = enuMinorCategory.Generic
        } else if (second.startsWith("سینما") || second.includes("فیلم")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Cinema; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("تلویزیون")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.TV; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("دفاع")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Defence; else mappedCat.minor = enuMinorCategory.Defence
        } else if (second.includes("کتاب")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Book; else mappedCat.minor = enuMinorCategory.Culture
        }
        return mappedCat
    }
}
export class aghigh extends clsIransamaneh {
    constructor() {
        super(enuDomains.aghigh, "aghigh.ir")
    }

    mapCategory(cat?: string): IntfMappedCatgory {
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("عکس") 
            || cat.includes("فیلم") 
            || cat.includes("گرافیک") 
            || cat.includes("اینفوگرافی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("دفاع اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Defence }
        else if (cat.includes("اقتصاد") || cat.includes("انرژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("مصاحبه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk }
        else if (cat.includes("پدافند") 
            || cat.includes("فنی") 
            || cat.includes("راهبرد") 
            || cat.includes("زیر")
            || cat.includes("اخبار")
            || cat.includes("ریاست")
            || cat.includes("مردم")
            || cat.includes("طرح")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Defence }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Defence  }
        else if (cat.includes("ارتباطات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("استان") || cat.includes("شهری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("نخست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
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

    mapCategory(cat?: string): IntfMappedCatgory {
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.startsWith("چهره") || second.startsWith("دیدنی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }


        else if (cat.includes("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("فرهنگی")
            || cat.includes("هجوم")
            || cat.includes("ایثار")
            || cat.includes("پویا نمایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("چند رسانه") || cat.includes("مجازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("مذهبی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("عمومی") || cat.includes("خبری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("طنز")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (second.includes("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("شعر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        else if (second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگی") || cat.includes("گردشگری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.startsWith("فیلم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("مجلس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("اقتصاد") || second.startsWith("استخدام")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (second.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.University }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.includes("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (second.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }


        else if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("مسکن")
            || cat.includes("صنعت")
            || cat.includes("اصناف")
            || cat.includes("گزارش")
            || cat.includes("یادداشت")
            || cat.includes("بیمه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("فیلم") || cat.includes("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("خواندنی") || cat.includes("ایران")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("شهروندی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("بهداشت")) return { major: enuMajorCategory.News, subminor: enuMinorCategory.Health }
        else if (cat.includes("قوانین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("حیات وحش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        else if (cat.includes("اجتماعی") 
            || cat.includes("زیست") 
            || cat.includes("محیط")
            || cat.includes("منابع")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("فن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد") 
            || cat.includes("بانکی") 
            || cat.includes("نظام") 
            || cat.includes("شرکت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("سبک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("هوا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Weather }

        return { major: enuMajorCategory.News }
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

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.includes("سیاست خارجی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("گردشگری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("تلفن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        else if (cat.includes("اینترنت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("شبکه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Political }
        else if (cat.includes("اقتصاد ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Sport }
        else if (cat.includes("اقتصاد")
            || cat.includes("مالی")
            || cat.includes("تجارت")
            || cat.includes("مدیریت")
            || cat.includes("انرژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("سیاسی") || cat.includes("انتخابات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("هنری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("خواندنی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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
    
    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("علم و فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (second.startsWith("زنگ تفریح")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
    }
}

export class sabakhabar extends clsIransamaneh {
    constructor() {
        super(enuDomains.sabakhabar, "sabakhabar.ir", {
            selectors: {
                article: ".single-news",
                title: "h2",
                subtitle: ".leadi",
                datetime: {
                    conatiner: "li.time"
                },
                content: {
                    main: ".news-content"
                },
                category: {
                    selector: "ul.list-inline li a"
                },
                tags: ".news-tags a"
            },
        })
    }
}

export class avayekhazar extends clsIransamaneh {
    constructor() {
        super(enuDomains.avayekhazar, "avayekhazar.ir", {
            selectors: {
                article: ".khabar-contents, div[style='direction: right;']",
                title: "h1 a",
                subtitle: ".subtitle, .photo_subtitle",
                content: {
                    main: ".body, .lead_image, .body div div"
                },
            },
        })
    }
}

export class titre20 extends clsIransamaneh {
    constructor() {
        super(enuDomains.titre20, "titre20.ir", {
            selectors: {
                article: ".news-continer-p",
                aboveTitle: ".rutitr-news",
                title: "h1 a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("span.news-nav-times"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class khabaredagh extends clsIransamaneh {
    constructor() {
        super(enuDomains.khabaredagh, "khabaredagh.ir", {
            selectors: {
                article: ".news_body",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}