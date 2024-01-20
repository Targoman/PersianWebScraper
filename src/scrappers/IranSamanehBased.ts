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
                    main: '.body>*, .lead_image, .album_listi>*, .image_set a',
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.Discussion }
        if (!cat) return mappedCat
        else if (cat.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.startsWith("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.startsWith("چندرسانه‌ایی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.startsWith("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.endsWith("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        else if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصاد/بین")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاست/بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("جامعه/حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return mappedCat
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (first.startsWith("اقتصاد") || first.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("فرهنگ") && second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگ") && second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (first.startsWith("علم") || cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (first.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        else if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("خانه") || first.startsWith("هومیانا")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("هوش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        else if (first.startsWith("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }

        return { ...mappedCat, minor: enuMinorCategory.Local }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        else if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("توییترگرام")
            || cat.startsWith("روزنما")
            || cat.startsWith("نگاه")
            || cat.startsWith("رقم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("بین")
            || cat.includes("خارجی")
            || cat.includes("انرژی هسته")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی")
            || cat.includes("مجلس")
            || cat.includes("رهبری")
            || cat.includes("دولت")
            || cat.includes("احزاب")
            || cat.includes("شورا")
            || cat.includes("مجمع")
            || cat.includes("داخلی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("اجتماعی")
            || cat.includes("جامعه")
            || cat.includes("محیط")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگ")
            || cat.includes("دفاع مقدس")
            || cat.includes("جغرافیا")
            || cat.includes("رادیو")
            || cat.includes("نمایش")
            || cat.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("دفاع")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("علمی")
            || cat.includes("فناوری")
            || cat.includes("مجازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        else if (cat.includes("بهداشت") || cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("شرکت")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("ساعت صفر")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (cat.includes("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.startsWith("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.startsWith("سرگرمی")
            || cat.startsWith("کمدی")
            || cat.startsWith("تلخند")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (cat.includes("بازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Game }
        else if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("ادیبستان")) return { ...mappedCat, minor: enuMinorCategory.Poem }
        else if (cat.includes("مستند")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentry }
        else if (cat.includes("مد")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (first.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("بین") || (second.includes("خارجی"))) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("اقتصاد بین")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("اقتصاد سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Political }
        else if (first.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزش جهان") || second.startsWith("فوتبال جهان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (second.startsWith("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (second.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        else if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (second.startsWith("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (second.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (second.startsWith("قضایی")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (second.startsWith("دین و اندیشه") || first.startsWith("حسینیه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (second.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (second.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (first.startsWith("دیگر رسانه‌")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Media }
        else if (first.startsWith("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("فرهنگی") && second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (first.startsWith("فرهنگی") && second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگی") && second.includes("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia, subminor: enuSubMinorCategory.Music }
        else if (first.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (first.startsWith("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (second.startsWith("بهداشت") || second.startsWith("کلینیک")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (first.startsWith("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (first.startsWith("وب") || cat.includes("اخبار داغ")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.startsWith("سیاسی") || cat.includes("مجلس") || cat.includes("اخبار")) return { ...mappedCat, minor: enuMinorCategory.Political }

        return { ...mappedCat, minor: enuMinorCategory.Local }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (second.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (second.startsWith("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("دین و اندیشه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.startsWith("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("بولتن2")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (second.startsWith("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (second.startsWith("هسته ای")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("IT")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (second.startsWith("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Political }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        else if (cat.includes("فیلم") || cat.includes("عکس") || cat.includes("صوت")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Advert }

        return { ...mappedCat, minor: enuMinorCategory.Economy }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        else if (cat.includes("ویدیو") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("فوتبال جهان")
            || cat.includes("جام ")
            || cat.includes("المپیک")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Media }
        else if (cat.includes("سینما") || cat.includes("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.includes("فرهنگ و هنر/تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (cat.includes("ارزهای دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.CryptoCurrency }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد")
            || cat.includes("بازار")
            || cat.includes("مدیریت")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("اپلیکیشن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
        else if (cat.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (cat.includes("علم و تکنولوژی/پزشکی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Health }
        else if (cat.includes("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Historical }
        else if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("جامعه/حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("تبلیغات")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        else if (cat.includes("سلامتی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Health }
        else if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("تناسب")
            || cat.includes("دکوراسیون")
            || cat.includes("آداب")
            || cat.includes("مد")
            || cat.includes("موفقیت")
            || cat.includes("رابطه")
            || cat.includes("زیبایی")
            || cat.includes("رشد")
            || cat.includes("گل")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("قانون")) return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (cat.includes("سفر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("طنز")
            || cat.includes("پیامک")
            || cat.includes("چهره")
            || cat.includes("کاریکاتور")
            || cat.includes("فال")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("بازی")) return { ...mappedCat, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.Game }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        else if (cat.includes("چندرسانه")
            || cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("طنزیکاتور")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصاد") || cat.includes("بانک")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("بسکتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Basketball }
        else if (cat.includes("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("ورزش") || cat.includes("بازیهای")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین") || cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (cat.includes("سلامت") || cat.includes("طب")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        else if (cat.includes("تبلیغ")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        else if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("خانواده")
            || cat.includes("عروسی")
            || cat.includes("دکوراسیون")
            || cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("حقوق") || cat.includes("قضایی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (cat.includes("شورا")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Local }
        else if (cat.includes("دفاعی") || cat.includes("نظامی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاست") || cat.includes("مجلس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("گوناگون")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("مصاحبه")) return { ...mappedCat, subminor: enuMinorCategory.Talk }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("پادکست")
            || cat.includes("صوت")
            || cat.includes("چندرسانه")
            || cat.includes("اینفوگرافیک")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("علمی") || cat.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاسی")
            || cat.includes("سیاست")
            || cat.includes("بشر")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("دیده") || cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("اخبار خارجی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("سبک") || cat.includes("مشاوره")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("عمومی")
            || cat.includes("مجازی")
            || cat.includes("نوشته")
            || cat.includes("گوناگون")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("شیعه")
            || cat.includes("دین")
            || cat.includes("حوزه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("حقوق")
            || cat.includes("لاریجانی")
            || cat.includes("رئیسی")
            || cat.includes("قضا")) return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (cat.includes("رپورتاژ")) return { ...mappedCat, minor: enuMinorCategory.Advert }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat


        if (cat.includes("گرافیک")
            || cat.includes("ویدئو")
            || cat.includes("فیلم")
            || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        else if (cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("بازار") || cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("حوزه") || cat.includes("سیره")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("فیلم")
            || first.startsWith("عکس")
            || first.startsWith("صوت")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (isIranProvinceString(first))
            return { ...mappedCat, minor: enuMinorCategory.Local }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return { ...mappedCat, minor: enuMinorCategory.Health }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("بین") || cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("جامعه") || cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

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
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
            if (second.startsWith("فوتبال") || second.startsWith("جام"))
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
            if (second.startsWith("وزنه"))
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Weightlifting }
            if (second.startsWith("کشتی"))
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
            if (second.startsWith("توپ"))
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
            if (second.startsWith("بانوان"))
                return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
            return { ...mappedCat, minor: enuMinorCategory.Sport }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("خانه")) return { major: enuMajorCategory.Literature, minor: enuMinorCategory.Generic }
        else if (first.startsWith("گفت‌و‌گو")) return { ...mappedCat, minor: enuMinorCategory.Talk }

        else if (first.startsWith("سرویس صوت")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("گزارش تصویری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("برنامه تلویزیونی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        else if (second.endsWith("هیئت")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (second.endsWith("هیات ها")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (second.endsWith("مذهبی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (second.startsWith("اخبار")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (second.startsWith("تیتر")) return { ...mappedCat, minor: enuMinorCategory.Culture }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat


        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("گرافیک")
            || cat.includes("اینفوگرافی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("دفاع اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Defence }
        else if (cat.includes("اقتصاد") || cat.includes("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("مصاحبه")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        else if (cat.includes("پدافند")
            || cat.includes("فنی")
            || cat.includes("راهبرد")
            || cat.includes("زیر")
            || cat.includes("اخبار")
            || cat.includes("ریاست")
            || cat.includes("مردم")
            || cat.includes("طرح")) return { ...mappedCat, minor: enuMinorCategory.Defence }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Defence }
        else if (cat.includes("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("استان") || cat.includes("شهری")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.includes("نخست")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Local }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (first.startsWith("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("ایرانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (second.startsWith("راهبرد")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("خبر")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Generic }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.startsWith("چهره") || second.startsWith("دیدنی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Economy }
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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat



        else if (cat.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("فرهنگی")
            || cat.includes("هجوم")
            || cat.includes("ایثار")
            || cat.includes("پویا نمایی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("چند رسانه") || cat.includes("مجازی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("مذهبی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("عمومی") || cat.includes("خبری")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (second.includes("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("شعر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        else if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگی") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("مجلس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("اقتصاد") || second.startsWith("استخدام")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.University }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (second.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (second.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat


        if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("مسکن")
            || cat.includes("صنعت")
            || cat.includes("اصناف")
            || cat.includes("گزارش")
            || cat.includes("یادداشت")
            || cat.includes("بیمه")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("فیلم") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("خواندنی") || cat.includes("ایران")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("شهروندی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("بهداشت")) return { ...mappedCat, subminor: enuMinorCategory.Health }
        else if (cat.includes("قوانین")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        else if (cat.includes("اجتماعی")
            || cat.includes("زیست")
            || cat.includes("محیط")
            || cat.includes("منابع")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("فن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد")
            || cat.includes("بانکی")
            || cat.includes("نظام")
            || cat.includes("شرکت")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("هوا")) return { ...mappedCat, minor: enuMinorCategory.Weather }

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
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News}
        if (!cat) return mappedCat

        if (cat.includes("سیاست خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("تلفن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        else if (cat.includes("اینترنت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("شبکه")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Political }
        else if (cat.includes("اقتصاد ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Sport }
        else if (cat.includes("اقتصاد")
            || cat.includes("مالی")
            || cat.includes("تجارت")
            || cat.includes("مدیریت")
            || cat.includes("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("سیاسی") || cat.includes("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("خواندنی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Economy }
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
                datetime: {
                    isGregorian: true
                }
            },
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.Economy}
        if (!cat) return mappedCat

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (second.startsWith("زنگ تفریح")) return { ...mappedCat, minor: enuMinorCategory.Fun }

        return mappedCat
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

export class bazarnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.bazarnews, "bazarnews.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
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


export class khordad extends clsIransamaneh {
    constructor() {
        super(enuDomains.khordad, "khordad.news", {
            selectors: {
                article: "div[style='direction: rtl;']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class arakhabar extends clsIransamaneh {
    constructor() {
        super(enuDomains.arakhabar, "arakhabar.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                aboveTitle: ".rutitr_photo",
                title: "h1 a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class nabznaft extends clsIransamaneh {
    constructor() {
        super(enuDomains.nabznaft, "nabznaft.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                content: {
                    main: ".showcase-content a"
                },
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class diibache extends clsIransamaneh {
    constructor() {
        super(enuDomains.diibache, "diibache.ir", {
            selectors: {
                article: ".khabar-matn",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1 a"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                content: {
                    main: ".image_set a"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class mana extends clsIransamaneh {
    constructor() {
        super(enuDomains.mana, "mana.ir", {
            selectors: {
                article: ".news-padd",
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".photo-subtitle, .subtitle"),
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h2 a"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news-publishdate, .photo-news-publishdate")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news-service a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class rahbordemoaser extends clsIransamaneh {
    constructor() {
        super(enuDomains.rahbordemoaser, "rahbordemoaser.ir", {
            selectors: {
                article: ".content, .multimedia-news-more",
                datetime: {
                    conatiner: ".news_pdate_c span:nth-child(2)"
                },
            }
        })
    }
}

export class mednews extends clsIransamaneh {
    constructor() {
        super(enuDomains.mednews, "mednews.ir", {
            selectors: {
                article: ".col-md-pull-10",
            }
        })
    }
}

export class tabnakjavan extends clsIransamaneh {
    constructor() {
        super(enuDomains.tabnakjavan, "tabnakjavan.com", {
            selectors: {
                article: ".tj-news-container",
                content: {
                    ignoreNodeClasses: ["tag_title"]
                }
            }
        })
    }
}

export class dsport extends clsIransamaneh {
    constructor() {
        super(enuDomains.dsport, "dsport.ir", {
            selectors: {
                article: ".newsPage",
                content: {
                    main: "img",
                    ignoreNodeClasses: ["img-responsive"]
                }
            }
        })
    }
}

export class farhangesadid extends clsIransamaneh {
    constructor() {
        super(enuDomains.farhangesadid, "farhangesadid.com", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class basna extends clsIransamaneh {
    constructor() {
        super(enuDomains.basna, "basna.ir", {
            selectors: {
                article: "section.news-col-2",
                title: "h2",
                datetime: {
                    conatiner: ".news-publishdate"
                },
            }
        })
    }
}


export class borna extends clsIransamaneh {
    constructor() {
        super(enuDomains.borna, "borna.news", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
            }
        })
    }
}

export class jadidpress extends clsIransamaneh {
    constructor() {
        super(enuDomains.jadidpress, "jadidpress.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            }
        })
    }
}

export class jamejamonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.jamejamonline, "jamejamonline.ir", {
            selectors: {
                article: ".bg-shadow-news .row",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("span.news-pdate")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("section.padd-breadcrumb div a"),
                },
            }
        })
    }
}

export class pansadonavadohasht extends clsIransamaneh {
    constructor() {
        super(enuDomains.pansadonavadohasht, "598.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1 a",
                subtitle: ".subtitle",
                content: {
                    main: ".body, .body div ul li a"
                },
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
        })
    }
}