import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, enuTextType, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { isIranProvinceString } from "../modules/common";

export class clsIransamaneh extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article",
                aboveTitle: ".rutitr, .news-rutitr",
                title: ".title, .news-title, .title-news",
                subtitle: ".subtitle, .news-subtitle, .subtitle-news",
                summary: ".sub_ax, .subtitle_photo",
                content: {
                    main: '.body>*, .lead_image, .album_listi>*, .image_set a',
                    alternative: '.album_content>*',
                    textNode: ".body",

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
                extraInvalidStartPaths: ["/fa/ajax"],
                validPathsItemsToNormalize: ["news", "photos"],
                ignoreContentOnPath: ["/fa/tag"]
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

/***********************************************************/
export class farazdaily extends clsIransamaneh {
    constructor() {
        super(enuDomains.farazdaily, "farazdaily.com", {
            selectors: {
                article: ".news-cnt",
                content: {
                    main: ".body"
                },
                category: {
                    selector: ".news_path a"
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Discussion }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("چندرسانه‌ایی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.endsWith("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("اقتصاد/بین")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاست/بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("جامعه/حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return mappedCat
    }
}

/***********************************************************/
export class iqna extends clsIransamaneh {
    constructor() {
        super(enuDomains.iqna, "iqna.ir", {
            selectors: { article: ".box_news" },
            url: { removeWWW: true }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class ana extends clsIransamaneh {
    constructor() {
        super(enuDomains.ana, "ana.press", { selectors: { article: ".news_content, .container-newsMedia" } })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.startsWith("اقتصاد") || first.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("فرهنگ") && second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (first.startsWith("فرهنگ") && second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (first.startsWith("علم") || cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("خانه") || first.startsWith("هومیانا")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("هوش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        if (first.startsWith("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }

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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("توییترگرام")
            || cat.startsWith("روزنما")
            || cat.startsWith("نگاه")
            || cat.startsWith("رقم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (cat.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("بین")
            || cat.includes("خارجی")
            || cat.includes("انرژی هسته")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاسی")
            || cat.includes("مجلس")
            || cat.includes("رهبری")
            || cat.includes("دولت")
            || cat.includes("احزاب")
            || cat.includes("شورا")
            || cat.includes("مجمع")
            || cat.includes("داخلی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("اجتماعی")
            || cat.includes("جامعه")
            || cat.includes("محیط")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("فرهنگ")
            || cat.includes("دفاع مقدس")
            || cat.includes("جغرافیا")
            || cat.includes("رادیو")
            || cat.includes("نمایش")
            || cat.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("دفاع")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.includes("علمی")
            || cat.includes("فناوری")
            || cat.includes("مجازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        if (cat.includes("بهداشت") || cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("شرکت")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("ساعت صفر")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.includes("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.startsWith("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.startsWith("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.startsWith("سرگرمی")
            || cat.startsWith("کمدی")
            || cat.startsWith("تلخند")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (cat.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.includes("بازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Game }
        if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("ادیبستان")) return { ...mappedCat, minor: enuMinorCategory.Poem }
        if (cat.includes("مستند")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentary }
        if (cat.includes("مد")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (first.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("بین") || (second.includes("خارجی"))) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (second.startsWith("اقتصاد بین")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Intl }
        if (second.startsWith("اقتصاد سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Political }
        if (first.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.startsWith("ورزش جهان") || second.startsWith("فوتبال جهان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (second.startsWith("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        if (second.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (second.startsWith("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (second.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (second.startsWith("قضایی")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("دین و اندیشه") || first.startsWith("حسینیه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (second.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (second.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (first.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (second.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (first.startsWith("دیگر رسانه‌")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Media }
        if (first.startsWith("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }
}

function mapNewsCategory(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
    if (!cat) return mappedCat
    void cat, first, second

    if (first.startsWith("اخبار"))
        first = first.substring(6).trim()

    if (first.startsWith("استان") || isIranProvinceString(first)) return { ...mappedCat, minor: enuMinorCategory.Local }
    if (first.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
    if (first.startsWith("رالی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Car }
    if (first.startsWith("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
    if (first.startsWith("سیاست خارجی")
        || first.includes("الملل")
    ) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
    if (first.startsWith("سیاست") || first.startsWith("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
    if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
    if (first.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    if (first.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
    if (first.startsWith("سفر ")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
    if (first.startsWith("نرخ") || first.startsWith("واحد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
    if (first.includes("فضای مجازی")) return { ...mappedCat, minor: enuMinorCategory.IT }

    if (false
        || first.startsWith("چندرسانه‌ای")
        || first.startsWith("عکس")
        || first.startsWith("ویدیو")
        || first.startsWith("ویدئو")
        || first.startsWith("تصویر")
        || first.startsWith("کاریکاتور")
    ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

    if (first.includes("اجتماعی") || first.startsWith("جامعه") || first.startsWith("محیط") || first.includes("شهروند"))
        mappedCat.minor = enuMinorCategory.Social
    else if (first.includes("اقتصادی")
        || first.includes("پولی")
        || first.includes("قیمت")
        || first.includes("تولید")
        || first.includes("بازار")
        || first.includes("مالیات")
        || first.includes("اشتغال")
        || first.includes("بورس")
        || first.includes("بیمه")
        || first.includes("نفت")
        || first.includes("خودرو")
        || first.includes("ارز ")
        || first.includes(" سکه ")
        || first.includes("سکه ")
        || first.includes(" سکه")
        || first.includes("بازرگانی")
        || first.includes("حمل ")
        || first.includes("کارگری")
    )
        mappedCat.minor = enuMinorCategory.Economics
    else if (first.includes("فرهنگ") || first.includes("رسانه") || first.includes("هنری"))
        mappedCat.minor = enuMinorCategory.Culture
    else if (first.includes("المپیک") || first.includes("ورزش") || first.includes("جام جهانی") || first.includes("باشگاهی"))
        mappedCat.minor = enuMinorCategory.Sport
    else if (first.includes("زندگی") || first.includes("آشپزی") || first.includes("زیبایی"))
        mappedCat.minor = enuMinorCategory.LifeStyle
    else if (first.includes("کنکور"))
        mappedCat.minor = enuMinorCategory.Education
    else if (first.includes("دانشگاه"))
        mappedCat.minor = enuMinorCategory.University
    else if (first.includes("سلامت"))
        mappedCat.minor = enuMinorCategory.Health
    else if (first.includes("حوادث") || first.includes("زورگیری"))
        return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
    else if (first.includes("سفر"))
        return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
    else if (first.includes("قضایی"))
        return { ...mappedCat, minor: enuMinorCategory.Law }
    else if (first.includes("سلبریتی") || first.includes("آرامش"))
        mappedCat.minor = enuMinorCategory.LifeStyle
    else if (first.includes("سرگرمی") || first.includes("فال "))
        mappedCat.minor = enuMinorCategory.Fun
    else if (first.includes("پاسخ"))
        mappedCat.minor = enuMinorCategory.Talk
    else if (first.includes("حقوق"))
        mappedCat.minor = enuMinorCategory.Law
    else if (first.includes("انتخابات") || first.includes("جنبش عدم تعهد") || first.includes("سیاسی"))
        mappedCat.minor = enuMinorCategory.Political
    else if (first.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
    else if (first.includes("تکنولوژی") || first.includes("فناوری") || first.includes("علم") || first.includes("دانش")) mappedCat.minor = enuMinorCategory.ScienceTech

    if (second.includes("انتخابات")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Political; else mappedCat.minor = enuMinorCategory.Political
    } else if (second.includes("آموزش")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Education; else mappedCat.minor = enuMinorCategory.Education
    } else if (second.includes("قرآن") || second.includes("قران")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Religious; else mappedCat.minor = enuMinorCategory.Religious
    } else if (second.includes("زندگی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.LifeStyle; else mappedCat.minor = enuMinorCategory.LifeStyle
    } else if (second.includes("اقتصاد")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economics; else mappedCat.minor = enuMinorCategory.Economics
    } else if (second.includes("قضایی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Law; else mappedCat.minor = enuMinorCategory.Law
    } else if (second.includes("جامعه") || second.includes("شهری") || second.includes("محیط")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
    } else if (second.includes("سلامت")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Health; else mappedCat.minor = enuMinorCategory.Health
    } else if (second.includes("آشپزی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Cooking; else mappedCat.minor = enuMinorCategory.Cooking
    } else if (second.includes("حوادث")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Accident; else mappedCat.minor = enuMinorCategory.Social
    } else if (second.includes("دفاع") || second.includes("نظامی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Defence; else mappedCat.minor = enuMinorCategory.Defence
    } else if (second.includes("کتاب")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Book; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("تلویزیون")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.TV; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("سینما")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Cinema; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("انرژی") || second.includes("نفت")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Energy; else mappedCat.minor = enuMinorCategory.ScienceTech
    } else if (second.includes("کشاورزی")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Agriculture; else mappedCat.minor = enuMinorCategory.ScienceTech
    } else if (second.includes("دانشگاه")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.University; else mappedCat.minor = enuMinorCategory.University
    } else if (second.includes("تکنولوژی") || second.includes("فناوری") || second.includes("علم") || second.includes("دانش")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.ScienceTech; else mappedCat.minor = enuMinorCategory.ScienceTech
    } else if (second.includes("هنر")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Art; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("موسیقی")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Music; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("مذهبی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Religious; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("تاریخی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Historical; else mappedCat.minor = enuMinorCategory.Historical
    } else if (second.includes("گردشگری") || second.includes("سفر")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Tourism; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("المپیک") || second.includes("ورزش") || second.includes("جام جهانی") || second.includes("باشگاهی")) {
        if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Sport; else mappedCat.minor = enuMinorCategory.Sport
    } else if (second.includes("گالری")) {
        if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Art; else mappedCat.minor = enuMinorCategory.Culture
    } else if (second.includes("رالی")) {
        mappedCat.minor = enuMinorCategory.Sport
        mappedCat.subminor = enuSubMinorCategory.Car
    } else if (second.includes("فوتبال")) {
        mappedCat.minor = enuMinorCategory.Sport
        mappedCat.subminor = enuSubMinorCategory.Football
    } else if (second.includes("رزمی")) {
        mappedCat.minor = enuMinorCategory.Sport
        mappedCat.subminor = enuSubMinorCategory.Martial
    } else if (second.includes("کشتی")) {
        mappedCat.minor = enuMinorCategory.Sport
        mappedCat.subminor = enuSubMinorCategory.Wrestling
    }
    return mappedCat
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

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        if (cat?.startsWith("صفحه"))
            return cat?.replace(/^صفحه نخست\//, "").trim()
        if (cat?.startsWith("عصر"))
            return cat?.replace(/^عصر ایران دو\//, "").trim()
        return cat
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("دین و اندیشه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (second.startsWith("بولتن2")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (second.startsWith("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("هسته ای")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("IT")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (second.startsWith("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Political }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فیلم") || cat.includes("عکس") || cat.includes("صوت")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Advert }

        return { ...mappedCat, minor: enuMinorCategory.Economics }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("ویدیو") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("فوتبال جهان")
            || cat.includes("جام ")
            || cat.includes("المپیک")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Media }
        if (cat.includes("سینما") || cat.includes("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.includes("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat.includes("فرهنگ و هنر/تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("ارزهای دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.CryptoCurrency }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        if (cat.includes("اقتصاد")
            || cat.includes("بازار")
            || cat.includes("مدیریت")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("اپلیکیشن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
        if (cat.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (cat.includes("علم و تکنولوژی/پزشکی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Health }
        if (cat.includes("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Historical }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("جامعه/حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("تبلیغات")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.includes("سلامتی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Health }
        if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes("تناسب")
            || cat.includes("دکوراسیون")
            || cat.includes("آداب")
            || cat.includes("مد")
            || cat.includes("موفقیت")
            || cat.includes("رابطه")
            || cat.includes("زیبایی")
            || cat.includes("رشد")
            || cat.includes("گل")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.TV }
        if (cat.includes("قانون")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.includes("سفر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (cat.includes("طنز")
            || cat.includes("پیامک")
            || cat.includes("چهره")
            || cat.includes("کاریکاتور")
            || cat.includes("فال")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("بازی")) return { ...mappedCat, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.Game }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("چندرسانه")
            || cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("طنزیکاتور")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("اقتصاد") || cat.includes("بانک")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (cat.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (cat.includes("بسکتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Basketball }
        if (cat.includes("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        if (cat.includes("ورزش") || cat.includes("بازیهای")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("بین") || cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.includes("سلامت") || cat.includes("طب")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.includes("تبلیغ")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
        if (cat.includes("خانواده")
            || cat.includes("عروسی")
            || cat.includes("دکوراسیون")
            || cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("حقوق") || cat.includes("قضایی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.includes("شورا")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Local }
        if (cat.includes("دفاعی") || cat.includes("نظامی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.includes("سیاست") || cat.includes("مجلس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("گوناگون")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("مصاحبه")) return { ...mappedCat, subminor: enuMinorCategory.Talk }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("پادکست")
            || cat.includes("صوت")
            || cat.includes("چندرسانه")
            || cat.includes("اینفوگرافیک")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("علمی") || cat.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.includes("سیاسی")
            || cat.includes("سیاست")
            || cat.includes("بشر")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("دیده") || cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (cat.includes("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (cat.includes("اخبار خارجی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("سبک") || cat.includes("مشاوره")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("عمومی")
            || cat.includes("مجازی")
            || cat.includes("نوشته")
            || cat.includes("گوناگون")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("شیعه")
            || cat.includes("دین")
            || cat.includes("حوزه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("حقوق")
            || cat.includes("لاریجانی")
            || cat.includes("رئیسی")
            || cat.includes("قضا")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.includes("رپورتاژ")) return { ...mappedCat, minor: enuMinorCategory.Advert }

        return mappedCat
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
            },
            url: {
                extraInvalidStartPaths: ["/fa/ajax"]
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class mizanonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.mizanonline, "mizanonline.ir", {
            selectors: {
                article: ".main_news_body, .row_news_body",
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (false
            || first.startsWith("فیلم و نماهنگ")
            || first.startsWith("عکس")
            || first.startsWith("کاریکاتور")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("باشگاه") || isIranProvinceString(first)) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("اجتماعی")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.startsWith("انتظامی")) return { ...mappedCat, subminor: enuSubMinorCategory.Police }
            if (second.startsWith("بهداشت")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.startsWith("زن")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
            if (second.startsWith("عفاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.startsWith("قضایی")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            return mappedCat
        }
        if (first.startsWith("اساتید")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.startsWith("اقتصاد") || first.endsWith("تعاون"))
            return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("روابط بین"))
            return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("اقشار") || first.startsWith("بسیج") || first.startsWith("محور") || first.startsWith("رزمایش"))
            return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("رسانه") || first.includes("فرهنگی"))
            return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("علمی"))
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

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second

        if (first.includes("افغانستان")) return { ...mappedCat, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("چندرسانه‌ای")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("دین ")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.includes("شهربانو")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
        if (first.includes("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("فرهنگ‌وهنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("مشهد")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (second.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("گرافیک")
            || cat.includes("ویدئو")
            || cat.includes("فیلم")
            || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("بازار") || cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("حوزه") || cat.includes("سیره")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("فیلم")
            || first.startsWith("عکس")
            || first.startsWith("صوت")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (isIranProvinceString(first))
            return { ...mappedCat, minor: enuMinorCategory.Local }

        if (second.startsWith("گفتگو") || second.startsWith("میزگرد") || second.startsWith("مصاحبه")) {
            mappedCat.minor = enuMinorCategory.Talk
            if (first.startsWith("سیاسی")) return { ...mappedCat, subminor: enuMinorCategory.Political }
            if (first.startsWith("اقتصاد")) return { ...mappedCat, subminor: enuMinorCategory.Economics }
            if (first.startsWith("اجتماعی")) return { ...mappedCat, subminor: enuMinorCategory.Social }
            if (first.startsWith("ورزشی")) return { ...mappedCat, subminor: enuMinorCategory.Sport }
            if (first.startsWith("الملل")) return { ...mappedCat, subminor: enuMinorCategory.Political }
            if (first.startsWith("سبک")) return { ...mappedCat, subminor: enuMinorCategory.LifeStyle }
            return mappedCat
        }
        if (second.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (first.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.startsWith("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }

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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

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

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("بین") || cat.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("جامعه") || cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        if (cat.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

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
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economics; else mappedCat.minor = enuMinorCategory.Economics
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("خانه")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Generic }
        if (first.startsWith("گفت‌و‌گو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (first.startsWith("سرویس صوت")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("گزارش تصویری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("برنامه تلویزیونی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.endsWith("هیئت")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.endsWith("هیات ها")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.endsWith("مذهبی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.startsWith("اخبار")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("تیتر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("نقد شعر")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Talk }
        if (second.startsWith("شعر جوان")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Poem }
        if (second.startsWith("مداحی")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Poem }
        if (second.startsWith("شب های دلتنگی")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Text }
        if (second.startsWith("حرف دل")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Text }
        if (first.startsWith("شعر آیینی")) return { ...mappedCat, major: enuMajorCategory.Literature, minor: enuMinorCategory.Talk }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("گرافیک")
            || cat.includes("اینفوگرافی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("دفاع اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Defence }
        if (cat.includes("اقتصاد") || cat.includes("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("مصاحبه")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("پدافند")
            || cat.includes("فنی")
            || cat.includes("راهبرد")
            || cat.includes("زیر")
            || cat.includes("اخبار")
            || cat.includes("ریاست")
            || cat.includes("مردم")
            || cat.includes("طرح")) return { ...mappedCat, minor: enuMinorCategory.Defence }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Defence }
        if (cat.includes("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("استان") || cat.includes("شهری")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("نخست")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.startsWith("دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("ایرانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("راهبرد")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("خبر")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("چهره") || second.startsWith("دیدنی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Economics }
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

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("فرهنگی")
            || cat.includes("هجوم")
            || cat.includes("ایثار")
            || cat.includes("پویا نمایی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("چند رسانه") || cat.includes("مجازی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("مذهبی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("عمومی") || cat.includes("خبری")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (second.includes("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (second.startsWith("شعر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگی") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاسی") || cat.includes("مجلس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("اقتصاد") || second.startsWith("استخدام")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.University }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (second.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
    }
}

export class tejaratonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.tejaratonline, "tejaratonline.ir", {
            selectors: {
                article: ".news_content",
            },
            url: {
                extraInvalidStartPaths: ["/000"]
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("اقتصاد")
            || cat.includes("بورس")
            || cat.includes("مسکن")
            || cat.includes("صنعت")
            || cat.includes("اصناف")
            || cat.includes("گزارش")
            || cat.includes("یادداشت")
            || cat.includes("بیمه")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("فیلم") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("خواندنی") || cat.includes("ایران")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاسی") || cat.includes("شهروندی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("بهداشت")) return { ...mappedCat, subminor: enuMinorCategory.Health }
        if (cat.includes("قوانین")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        if (cat.includes("اجتماعی")
            || cat.includes("زیست")
            || cat.includes("محیط")
            || cat.includes("منابع")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("فن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد")
            || cat.includes("بانکی")
            || cat.includes("نظام")
            || cat.includes("شرکت")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("هوا")) return { ...mappedCat, minor: enuMinorCategory.Weather }

        return mappedCat
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

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("سیاست خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("تلفن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        if (cat.includes("اینترنت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("شبکه")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        if (cat.includes("اقتصاد سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Political }
        if (cat.includes("اقتصاد ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Sport }
        if (cat.includes("اقتصاد")
            || cat.includes("مالی")
            || cat.includes("تجارت")
            || cat.includes("مدیریت")
            || cat.includes("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("سیاسی") || cat.includes("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("خواندنی")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return { ...mappedCat, minor: enuMinorCategory.Economics }
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

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
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

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        void category, first, second
        if (first.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (first.includes("چهره‌ها")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Celebrities }
        if (first.includes("چیدمان و هنر")
            || first.includes("خانواده")
            || first.includes("کودکانه")
            || first.includes("مد و زیبایی")
        ) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (first.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Photo }
        if (first.includes("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        return mappedCat
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (second.startsWith("زنگ تفریح")) return { ...mappedCat, minor: enuMinorCategory.Fun }

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
    public mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
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

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("داخلی")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("انرژی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("بانکداری و پرداخت الکترونیک")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("بهداشتی و زیبایی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("بیمه")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("خرده فروشی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("خواندنی ها")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (first.startsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (first.startsWith("ساختمان و دکوراسیون")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("صنعت غذا")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.startsWith("لوازم خانگی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (first.startsWith("معدن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("مناطق آزاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return mappedCat
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
            },
        })
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second

        if (first.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("کشکول")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return mappedCat
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
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.includes("خودرو")) return { ...mappedCat, subminor: enuSubMinorCategory.Car }
        return mappedCat
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("تلویزیون") || cat.includes("تلوبیون")) return { ...mappedCat, subminor: enuSubMinorCategory.TV }
        if (cat.includes("سینما")) return { ...mappedCat, subminor: enuSubMinorCategory.Cinema }
        if (cat.includes("موسیقی")) return { ...mappedCat, subminor: enuSubMinorCategory.Music }
        if (cat.includes("فرهنگ")) return { ...mappedCat, subminor: enuMinorCategory.Social }
        if (cat.includes("جامعه")) return { ...mappedCat, subminor: enuMinorCategory.Social }
        if (cat.includes("گردشگری")) return { ...mappedCat, subminor: enuMinorCategory.Tourism }
        if (cat.includes("ادبیات")) return { ...mappedCat, subminor: enuMinorCategory.Literature }
        if (cat.startsWith("تصویری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("ورزش")) {
            mappedCat.minor = enuMinorCategory.Sport
            if (second.includes("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
        }

        return mappedCat
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.includes("چند رسانه ای")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (second.includes("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("سلامت و تندرستی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.includes("فرزندپروری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("همسرداری")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.includes("بسته خبری")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (second.includes("بیمه")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.includes("جوانان")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (second.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.includes("فرهنگی و هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.includes("ایثار و شهادت")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (second.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.includes("گردشگری و حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (second.includes("نوقلم‌ها")) return { ...mappedCat, minor: enuMinorCategory.Literature }

        return mappedCat
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
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("عکس")
            || first.includes("صوت")
            || first.includes("ویدیو")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("دین و اندیشه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.includes("تربیت")
            || second.includes("فراغت")
        ) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.includes("خانواده")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("نهادها")
            || second.includes("اجتماعی")
            || second.includes("شهر سازی")
        ) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.includes("تجارت")
            || second.includes("اقتصادی")
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.includes("اعتقادی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.includes("سیاسی")) return {
            ...mappedCat, minor: enuMinorCategory.Political
        }

        return mappedCat
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
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (first.includes("استانی")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.includes("دانشجو")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (first.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (first.includes("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("ورزشی")) {
            mappedCat.minor = enuMinorCategory.Sport
            if (second.includes("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.includes("دوچرخه‌سواری")) mappedCat.subminor = enuSubMinorCategory.Bicycle
            if (second.includes("شطرنج")) mappedCat.subminor = enuSubMinorCategory.Chess
            if (second.includes("شنا")) mappedCat.subminor = enuSubMinorCategory.Nautics
            if (second.includes("کاراته")) mappedCat.subminor = enuSubMinorCategory.Karate
            if (second.includes("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
        }
        if (first.includes("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.includes("دین و اندیشه") || second.includes("دفاع مقدس")) mappedCat.subminor = enuMinorCategory.Religious
            if (second.includes("سینما و تئاتر")) mappedCat.subminor = enuSubMinorCategory.Cinema
        }
        return mappedCat
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class cinemaema extends clsIransamaneh {
    constructor() {
        super(enuDomains.cinemaema, "cinemaema.com", {
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
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    }
}

export class bamdad24 extends clsIransamaneh {
    constructor() {
        super(enuDomains.bamdad24, "bamdad24.ir", {
            selectors: {
                article: ".dakheli",
            },
            url: {
                forceHTTP: true
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return mappedCat
    }
}

export class shiraze extends clsIransamaneh {
    constructor() {
        super(enuDomains.shiraze, "shiraze.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "div.title h1:nth-child(2)",
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
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        if (first === "قطعه شهدا")
            first = "دین "
        return mapNewsCategory(category, first, second)
    }
}

export class fhnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.fhnews, "fhnews.ir", {
            selectors: {
                article: ".col1_dakheli_index",
            },
            url: {
                forceHTTP: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
    }
}

export class tik extends clsIransamaneh {
    constructor() {
        super(enuDomains.tik, "tik.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                }
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class hashtsobh extends clsIransamaneh {
    constructor() {
        super(enuDomains.hashtsobh, "8sobh.ir", {
            selectors: {
                article: "section.single",
                subtitle: ".lead",
                title: "h2.single-post-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#nt-body-ck"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[rel='tag']"),
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[rel='category tag']")
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class tadbir24 extends clsIransamaneh {
    constructor() {
        super(enuDomains.tadbir24, "tadbir24.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1 a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                content: {
                    main: ".body, .lead_image, .body div div"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[class='tags_item']"),
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                }
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class ecoview extends clsIransamaneh {
    constructor() {
        super(enuDomains.ecoview, "ecoview.ir", {
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
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class kanoonhend extends clsIransamaneh {
    constructor() {
        super(enuDomains.kanoonhend, "kanoonhend.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1 a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                content: {
                    main: ".body, .lead_image, .body div div"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[class='tags_item']"),
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                }
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class shafaonline extends clsIransamaneh {
    constructor() {
        super(enuDomains.shafaonline, "shafaonline.ir", {
            selectors: {
                article: ".inner_b.col-xs-36",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate"),
                    acceptNoDate: true
                },
            },
            url: {
                forceHTTP: true,
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class nateghan extends clsIransamaneh {
    constructor() {
        super(enuDomains.nateghan, "nateghan.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true,
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class hedayatgar extends clsIransamaneh {
    constructor() {
        super(enuDomains.hedayatgar, "hedayatgar.ir", {
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
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class asrpress extends clsIransamaneh {
    constructor() {
        super(enuDomains.asrpress, "asrpress.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true,
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class ofoghetazenews extends clsIransamaneh {
    constructor() {
        super(enuDomains.ofoghetazenews, "ofoghetazenews.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true,
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class moaser extends clsIransamaneh {
    constructor() {
        super(enuDomains.moaser, "moaser.ir", {
            selectors: {
                article: "section.news-content",
                title: "h1.title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true,
            }
        })
    }
}

export class sadohejdahsafar extends clsIransamaneh {
    constructor() {
        super(enuDomains.sadohejdahsafar, "118safar.com", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class hakimemehr extends clsIransamaneh {
    constructor() {
        super(enuDomains.hakimemehr, "hakimemehr.ir", {
            selectors: {
                article: "div[style='direction: rtl; ']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Medical }
    }
}

export class gitionline extends clsIransamaneh {
    constructor() {
        super(enuDomains.gitionline, "gitionline.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: " ul.news-detile li:nth-child(2) span",
                },
                content: {
                    main: ".entry, .heding .thumbnail a img"
                },
                category: {
                    selector: ".crumbs a",
                    lastIndex: 2
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class hourgan extends clsIransamaneh {
    constructor() {
        super(enuDomains.hourgan, "hourgan.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class avayerodkof extends clsIransamaneh {
    constructor() {
        super(enuDomains.avayerodkof, "avayerodkof.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    ignoreNodeClasses: ["share_button", "tags_title", "newsletter_link_news", "row-comment"],
                    ignoreTexts: [/.*Telegram.*/, /.*بازدید از.*/, /.*Share.*/, /.*.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
                tags: ".tags_title a"
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        return mapNewsCategory(category, first, second)
    }
}

export class roozplus extends clsIransamaneh {
    constructor() {
        super(enuDomains.roozplus, "roozplus.com", {
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
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        void category, first, second
        if (first.includes("دیپلماسی و مقاومت")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.includes("فناوری و کالای دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("فوتبال و ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("گردشگری و کیش")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("مثبت زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.includes("هنر روز")) return { ...mappedCat, minor: enuMinorCategory.Culture }

        return mappedCat
    }
}

export class ayatemandegar extends clsIransamaneh {
    constructor() {
        super(enuDomains.ayatemandegar, "ayatemandegar.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class khodrokaar extends clsIransamaneh {
    constructor() {
        super(enuDomains.khodrokaar, "khodrokaar.ir", {
            selectors: {
                article: "#news",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
    }
}

export class irdc extends clsIransamaneh {
    constructor() {
        super(enuDomains.irdc, "irdc.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/fa/publications"]
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Historical }
    }
}

export class khabarkhodro extends clsIransamaneh {
    constructor() {
        super(enuDomains.khabarkhodro, "khabarkhodro.com", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
    }
}

export class gardeshban extends clsIransamaneh {
    constructor() {
        super(enuDomains.gardeshban, "gardeshban.ir", {
            selectors: {
                article: "#news",
                title: "h2.title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".pathe_news a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
            url: {
                forceHTTP: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class tehranbehesht extends clsIransamaneh {
    constructor() {
        super(enuDomains.tehranbehesht, "tehranbehesht.news", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_container div a")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class mokhatab24 extends clsIransamaneh {
    constructor() {
        super(enuDomains.mokhatab24, "mokhatab24.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1.title a",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class zisaan extends clsIransamaneh {
    constructor() {
        super(enuDomains.zisaan, "zisaan.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_container div a")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class felezatkhavarmianeh extends clsIransamaneh {
    constructor() {
        super(enuDomains.felezatkhavarmianeh, "felezatkhavarmianeh.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_container div a")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ghalamnews extends clsIransamaneh {
    constructor() {
        super(enuDomains.ghalamnews, "ghalamnews.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_container div a")
            },
            url: {
                removeWWW: true
            }
        })
    }
}