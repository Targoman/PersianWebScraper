import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, enuTextType, IntfMappedCategory, IntfProcessorConfigs, IntfProxy } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { getArvanCookie } from "../modules/request";

class clsNastoohBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article, #photos",
                aboveTitle: ".rutitr, .kicker",
                title: ".title, span.headline, h1",
                subtitle: ".introtext",
                summary: ".item-summary, p.summary",
                content: {
                    main: '.item-body .item-text>*, .introtext+figure, .item-header+figure, section.photoGall li, .item-text .gallery figure, .item-summary figure, figure, section.box-content a img, section.photoGall div a',
                    alternative: '.item-body>*',
                    textNode: ".item-body .item-text"
                },
                comments: {
                    container: ".comments-list li",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: (article: HTMLElement) => article.querySelector('.tags')?.querySelectorAll('li'),
                datetime: {
                    conatiner: '.item-date>span, .item-date, .item-time, .gallery-desc',
                    splitter: "-"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb")?.querySelectorAll("li"),
                    startIndex: 0,
                }
            },
            url: {
                extraInvalidStartPaths: ["/old/upload", '/d/', '/page/archive.xhtml?d'],
                pathToCheckIndex: 1,
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

/***********************************************************/
export class hamshahrionline extends clsNastoohBased {
    constructor() {
        super(enuDomains.hamshahrionline, "hamshahrionline.ir", {
            selectors: {
                article: ".main-content"
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("چندرسانه")
            || first.startsWith("عکس")
            || first.startsWith("داستان")
            || first.includes("TV")
            || second.includes("گزارش")
            || second.includes("تصویری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("اقتصاد‌ جهان")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Intl }
        if (second.startsWith("فوتبال جهان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (first.includes("جهان") || second.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (second.startsWith("دفاع")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (second.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        if (cat.includes("سیاس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("اقتصاد") || first.startsWith("کسب")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("سلامت")
            || second.startsWith("پزشکی")
            || second.startsWith("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اجتماع")
            || first.startsWith("خانواده")
            || first.startsWith("پایداری")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (second.startsWith("دین")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        if (second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (second.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (second.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Historical }
        if (first.includes("فرهنگی")
            || first.startsWith("کودک")
            || first.startsWith("روز هفتم")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("آشپزی")) return { ...mappedCat, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Cooking }
        if (first.startsWith("زندگی") || first.startsWith("تندرستی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("شهر")
            || cat.includes("استان")
            || first.includes("محله")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("فناوری اطلاعات")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (cat.includes("دانش")
            || cat.includes("ارتباطات")
            || cat.includes("سایبر")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (second.startsWith("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.includes("ورزشی") || first.startsWith("تماشاگر")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return { ...mappedCat, minor: enuMinorCategory.Generic }
    }
}

/***********************************************************/
export class irna extends clsNastoohBased {
    constructor() {
        super(enuDomains.irna, "irna.ir", { selectors: { datetime: { splitter: "،" } } })
    }

    breadcrumbbreadcrumb

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("استان"))
            return { ...mappedCat, minor: enuMinorCategory.Local }

        if (false
            || first.startsWith("ملٹی میڈیا")
            || first.startsWith("عکس")
            || first.startsWith("چندرسانه‌ای")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
            return mappedCat
        }

        if (first.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("صفحات")) {
            if (second.startsWith("جام")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
            return { ...mappedCat, minor: enuMinorCategory.Political }
        }

        if (first.startsWith("علم")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.startsWith("دانشگاه") || second.includes("دانشجو") || second.includes("سنجش")) mappedCat.minor = enuMinorCategory.University
            if (second.startsWith("فرهنگیان") || second.includes("دانشجو")) mappedCat.minor = enuMinorCategory.University
            if (second.startsWith("شورای") || second.startsWith("وزارت") || second.startsWith("معاونت")) mappedCat.minor = enuMinorCategory.Political
            return mappedCat
        }

        if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.startsWith("کتاب")) mappedCat.subminor = enuSubMinorCategory.Book
            else if (second.endsWith("تلویزیون")) mappedCat.subminor = enuSubMinorCategory.TV
            else if (second.startsWith("سینما")) mappedCat.subminor = enuSubMinorCategory.Cinema
            else if (second.startsWith("قرآن") || second.startsWith("قران") || second.startsWith("ایثار") || second.startsWith("حج")) mappedCat.subminor = enuMinorCategory.Religious
            else if (second.startsWith("موسیقی")) mappedCat.subminor = enuSubMinorCategory.Music
            else if (second.startsWith("گردشگری") || second.includes("میراث") || second.includes("ایران")) mappedCat.subminor = enuMinorCategory.Tourism
            else if (second.startsWith("هنر")) mappedCat.subminor = enuSubMinorCategory.Art
            return mappedCat
        }

        if (first.startsWith("پژوهش")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.includes("جعلی") || second.includes("راستی")) mappedCat.minor = enuMinorCategory.Generic
            if (second.includes("ایران")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
            if (second.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
            if (second.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
            if (second.includes("بین‌الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
            if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
            if (second.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
            if (second.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Law }
            if (second.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
            if (second.includes("میزگرد")) return { ...mappedCat, minor: enuMinorCategory.Talk }
            return mappedCat
        }

        if (first.startsWith("ورزش")) {
            mappedCat.minor = enuMinorCategory.Sport
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.startsWith("توپ") || second.includes("راکتی")) mappedCat.subminor = enuSubMinorCategory.Ball
            if (second.startsWith("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
            if (second.includes("رزمی")) mappedCat.subminor = enuSubMinorCategory.Martial
            if (second.includes("زنان")) mappedCat.subminor = enuSubMinorCategory.Women
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
        }
        return mappedCat
    }
}

/***********************************************************/
export class mashreghnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.mashreghnews, "mashreghnews.ir", {
            selectors: {
                comments: {
                    container: (_: HTMLElement, fullHtml: HTMLElement) => {
                        return fullHtml.querySelectorAll(".comments li")
                    }
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.startsWith("سیاست")
            || cat.startsWith("جهاد")
            || cat.startsWith("دهه فجر")
            || cat.startsWith("ویژه‌نامه")
            || cat.startsWith("انتخابات")
            || cat.startsWith("گزارش")
            || cat.startsWith("دیدگاه")
            || cat.startsWith("جنگ نرم")
            || cat.startsWith("بهارستان نهم")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("دفاع")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("اقتصاد")
            || cat.startsWith("بازار")
            || cat.startsWith("بورس")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("عکس") || cat.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("جهان") || cat.startsWith("تحولات منطقه") || cat.startsWith("انتخابات امریکا")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("محور مقاومت")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("جام جهانی") || cat.startsWith("یورو")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.startsWith("دین") || cat.includes("حسینیه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.startsWith("وبلاگستان")) return { ...mappedCat, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Undefined }

        return mappedCat
    }
}

/***********************************************************/
export class khabaronline extends clsNastoohBased {
    constructor() {
        super(enuDomains.khabaronline, "khabaronline.ir", {
            selectors: { content: { ignoreTexts: ["بیشتر بخوانید:"] } },
            url: {
                validPathsItemsToNormalize: ["news", "live", "photo", "media"]
            }
        })
    }

    textNodeMustBeIgnored(tag: HTMLElement, index: number, allElements: HTMLElement[]) {
        return index > allElements.length - 5
            && (tag.innerText.match(/^[۱۲۳۴۵۶۷۸۹۰1234567890]+$/) ? true : false)
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.includes("اخبار اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("اخبار اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("اخبار جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اخبار دانش و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("اخبار سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("اخبار فرهنگی و هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("اخبار ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("چندرسانه‌ای")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("چهره‌‌ها")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Celebrities }
        if (first.includes("وبلاگ")) return { ...mappedCat, major: enuMajorCategory.Weblog }

        return mappedCat
    }
}

/***********************************************************/
export class mehrnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.mehrnews, "mehrnews.com", {
            selectors: {
                datetime: {
                    splitter: (el: HTMLElement, fullHtml?: HTMLElement) => {
                        const photoPage = fullHtml?.querySelector("#photo")
                        return super.extractDate((photoPage?.querySelector(".item-date>span") || el), photoPage ? "-" : "،") || "DATE NOT FOUND"
                    }
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (first.startsWith("هنر") && second.startsWith("سینما") || second.startsWith("جشنواره")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.startsWith("هنر") && second.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (first.startsWith("هنر") && second.includes("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        if (first.startsWith("هنر") && second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (first.startsWith("هنر") && second.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (first.startsWith("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("اینفو")
            || cat.includes("دکه")
            || cat.includes("مهرکارتون")
            || cat.includes("گرافیک")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (second.startsWith("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (first.startsWith("ورزش") || second.startsWith("جام جهانی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("جامعه/حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (first.startsWith("جامعه") && second.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        if (first.startsWith("جامعه") && second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (first.startsWith("جامعه") || cat.includes("زندگی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("گپ")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد") || cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (second.startsWith("سیاست خارجی") || cat.includes("بین") || cat.includes("دنیا")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (first.startsWith("دانش") || cat.includes("مجازی") || cat.includes("فجازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("فرهنگ") && second.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("سیاست") || cat.includes("انتخابات") || cat.includes("خبر")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("استان") || first.startsWith("ایران")) return { ...mappedCat, subminor: enuMinorCategory.Local }
        if (first.startsWith("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("دور")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("رادیومهر")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Radio }

        return mappedCat
    }
}

/***********************************************************/
export class imna extends clsNastoohBased {
    constructor() {
        super(enuDomains.imna, "imna.ir", {
            url: {
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.imna.ir", this.baseURL, proxy)
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("عکس") || first.startsWith("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
            return mappedCat
        }
        if (first.startsWith("سیاست")) {
            mappedCat.minor = enuMinorCategory.Political
            if (second.includes("الملل")) return { ...mappedCat, subminor: enuSubMinorCategory.Intl }
            return mappedCat
        }
        if (first.startsWith("شهر")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.includes("موسیقی")) return { ...mappedCat, subminor: enuSubMinorCategory.Music }
            if (second.includes("دین")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("کتاب")) return { ...mappedCat, subminor: enuSubMinorCategory.Book }
            if (second.includes("ادبیات")) return { ...mappedCat, subminor: enuMinorCategory.Literature }
            if (second.includes("سینما")) return { ...mappedCat, subminor: enuSubMinorCategory.Cinema }
            if (second.includes("گردشگری")) return { ...mappedCat, subminor: enuMinorCategory.Tourism }
            return mappedCat
        }

        if (first.startsWith("علم")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.includes("پزشکی")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
            return mappedCat
        }

        if (cat.includes("ورزش")) {
            mappedCat.minor = enuMinorCategory.Sport
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.startsWith("توپ") || second.includes("راکتی")) mappedCat.subminor = enuSubMinorCategory.Ball
            if (second.startsWith("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
            if (second.includes("رزمی")) mappedCat.subminor = enuSubMinorCategory.Martial
            if (second.includes("زنان")) mappedCat.subminor = enuSubMinorCategory.Women
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            return mappedCat
        }

        if (cat.includes("کرونا")) return { ...mappedCat, minor: enuMinorCategory.Health }

        return mappedCat
    }
}

/***********************************************************/
export class shana extends clsNastoohBased {
    constructor() {
        super(enuDomains.shana, "shana.ir", {
            selectors: {
                datetime: { conatiner: ".item-nav.row>div>span, .item-date" }
            },
            url: {
                extraInvalidStartPaths: ["/tender/"]
            }
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.shana.ir", this.baseURL, proxy)
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class chtn extends clsNastoohBased {
    constructor() {
        super(enuDomains.chtn, "chtn.ir", {
            selectors: {
                article: "#mainbody .main-content.col-lg-6, #photo"
            },
            url: {
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("گردشگری")) return { ...mappedCat, subminor: enuMinorCategory.Tourism }

        return mappedCat
    }
}

/***********************************************************/
export class shahr extends clsNastoohBased {
    constructor() {
        super(enuDomains.shahr, "shahr.ir", {
            selectors: {
                aboveTitle: ".subtitle",
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Local }
    }
}

/***********************************************************/
export class ibna extends clsNastoohBased {
    constructor() {
        super(enuDomains.ibna, "ibna.ir", {
            selectors: {
                article: "article",
                title: ".item-title",
                datetime: {
                    conatiner: ".item-date",
                    splitter: "-",
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.startsWith("کودک") || second.startsWith("مدیریت") || second.startsWith("ادبیات") || second.startsWith("تازه")) return { ...mappedCat, minor: enuMinorCategory.Literature }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Local }
        if (cat.includes("چندرسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.Literature, subminor: enuSubMinorCategory.Art }
        if (second.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }

        return mappedCat
    }
}

/***********************************************************/
export class hawzahnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.hawzahnews, "hawzahnews.com", {
            selectors: {
                article: "div[id='main']",
                datetime: {
                    conatiner: '.item-date>span, .gallery-desc',
                    splitter: "-"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector("ol.breadcrumb")?.querySelectorAll("li"),
                    startIndex: 0,
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("فیلم") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Religious, subminor: enuSubMinorCategory.Women }
        if (cat.includes("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return { ...mappedCat, minor: enuMinorCategory.Religious }
    }
}

export class khabarvarzeshi extends clsNastoohBased {
    constructor() {
        super(enuDomains.khabarvarzeshi, "khabarvarzeshi.com", {
            selectors: {
                title: "h1",
                datetime: {
                    conatiner: '.item-date',
                },
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
    }
}

export class sena extends clsNastoohBased {
    constructor() {
        super(enuDomains.sena, "sena.ir", {
            selectors: {
                datetime: {
                    conatiner: '.item-date, ul.list-inline li:nth-child(1)',
                },
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class mefda extends clsNastoohBased {
    constructor() {
        super(enuDomains.mefda, "mefda.ir", {
            selectors: {
                article: "article, #photos",
                title: "h1",
                summary: "p.summary",
                content: {
                    main: "[itemprop='articleBody'], section.box-content"
                },
                datetime: {
                    conatiner: '.item-date, span.item-time',
                },
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        void category, first, second
        if (category?.includes("قرآن")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (category?.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (category?.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return { ...mappedCat, subminor: enuMinorCategory.University }
    }
}

export class iscanews extends clsNastoohBased {
    constructor() {
        super(enuDomains.iscanews, "iscanews.ir")
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه نخست\//, "").trim()
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("فیلم") || cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Religious, subminor: enuSubMinorCategory.Women }
        if (cat.includes("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }

        return { ...mappedCat, minor: enuMinorCategory.Religious }
    }
}

export class behzisti extends clsNastoohBased {
    constructor() {
        super(enuDomains.behzisti, "behzisti.ir", {
            selectors: {
                datetime: {
                    conatiner: 'div.item-nav.row > div:nth-child(1) > span, .item-date',
                },
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith('استان')) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith('اشتغال')) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes('الملل')) return { ...mappedCat, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith('چندرسانه‌ای')) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        return mappedCat
    }

}

export class tahlilbazaar extends clsNastoohBased {
    constructor() {
        super(enuDomains.tahlilbazaar, "tahlilbazaar.com")
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class kanoonnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.kanoonnews, "kanoonnews.ir", {
            selectors: {
                summary: "p.summary",
                datetime: {
                    conatiner: '.gallery-desc > div:nth-child(2), .item-date',
                },
                content: {
                    main: "section.photoGall div a"
                }
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class imereport extends clsNastoohBased {
    constructor() {
        super(enuDomains.imereport, "imereport.ir", {
            selectors: {
                datetime: {
                    conatiner: 'ul.list-inline li:nth-child(1)',
                },
                content: {
                    main: "section.photoGall div a"
                }
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class oipf extends clsNastoohBased {
    constructor() {
        super(enuDomains.oipf, "oipf.ir", {
            selectors: {
                summary: "p.summary",
                datetime: {
                    conatiner: '.gallery-desc > div:nth-child(2), .item-date span',
                },
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Petroleum }
    }
}

export class salameno extends clsNastoohBased {
    constructor() {
        super(enuDomains.salameno, "salameno.com")
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه اصلی\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.includes("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("همدان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }
}

export class tehrannews extends clsNastoohBased {
    constructor() {
        super(enuDomains.tehrannews, "tehrannews.ir")
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second

        if (first.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }
}

export class tahririeh extends clsNastoohBased {
    constructor() {
        super(enuDomains.tahririeh, "tahririeh.com")
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه اصلی\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.includes("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("اقتصادی")
            || first.includes("بازار")
            || first.includes("کسب ")
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.includes("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("همدان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }

}

export class atiyeonline extends clsNastoohBased {
    constructor() {
        super(enuDomains.atiyeonline, "atiyeonline.ir")
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Insurance }
    }
}

export class salamatnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.salamatnews, "salamatnews.com", {
            selectors: {
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("section.tags div ul li a"),
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Health }
    }
}

export class eximnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.eximnews, "eximnews.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class payamekhanevadeh extends clsNastoohBased {
    constructor() {
        super(enuDomains.payamekhanevadeh, "payamekhanevadeh.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
    }
}

export class qudsonline extends clsNastoohBased {
    constructor() {
        super(enuDomains.qudsonline, "qudsonline.ir", {
            selectors: {
                datetime: {
                    conatiner: ".item-date"
                }
            }
        })
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second

        if (first.startsWith("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("بین‌الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.startsWith("چندرسانه‌ای")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("خراسان رضوی")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("دین و اندیشه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.startsWith("رواق")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.startsWith("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (second.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (second.startsWith("مردم")) return { ...mappedCat, minor: enuMinorCategory.Social }

        return mappedCat
    }
}

export class karafarinnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.karafarinnews, "karafarinnews.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class bidarbourse extends clsNastoohBased {
    constructor() {
        super(enuDomains.bidarbourse, "bidarbourse.com")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class shahryarnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.shahryarnews, "shahryarnews.net")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Local }
    }
}

export class sahebkhabar extends clsNastoohBased {
    constructor() {
        super(enuDomains.sahebkhabar, "sahebkhabar.ir", {
            selectors: {
                title: "h1",
                content: {
                    main: ".body, span.large-image",
                    ignoreNodeClasses: ["sahebkhabar-watermark"]
                },
                datetime: {
                    conatiner: "time"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news-tag section ul li a"),
                category: {
                    selector: "span.item-service a"
                }
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.includes("جامعه")
            || second.includes("اجتماعی")
        ) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.includes("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (second.includes("قرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (second.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.includes("استانی")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (second.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.includes("متفرقه")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (second.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.includes("فیلم")) return { ...mappedCat, subminor: enuMinorCategory.Multimedia }
        if (second.includes("عکس")) return { ...mappedCat, subminor: enuMinorCategory.Multimedia }

        return mappedCat
    }
}

export class saat24 extends clsNastoohBased {
    constructor() {
        super(enuDomains.saat24, "saat24.news", {
            selectors: {
                title: "h1",
                summary: "p.news-summary",
                content: {
                    main: ".rich-content, picture"
                },
                datetime: {
                    conatiner: "time"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a")
                }
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (second.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("متفرقه")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (second.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.startsWith("هنر")) return { ...mappedCat, subminor: enuMinorCategory.Culture }

        return mappedCat
    }
}


export class farhangemrooz extends clsNastoohBased {
    constructor() {
        super(enuDomains.farhangemrooz, "farhangemrooz.com", {
            selectors: {
                title: "h1",
                content: {
                    main: ".body, span.large-image",
                    ignoreNodeClasses: ["sahebkhabar-watermark"]
                },
                datetime: {
                    conatiner: "time"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news-tag section ul li a"),
                category: {
                    selector: "span.item-service a"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
    }
}

export class cinemapress extends clsNastoohBased {
    constructor() {
        super(enuDomains.cinemapress, "cinemapress.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    }
}

export class ifsm extends clsNastoohBased {
    constructor() {
        super(enuDomains.ifsm, "ifsm.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Local }
    }
}

export class sedayebourse extends clsNastoohBased {
    constructor() {
        super(enuDomains.sedayebourse, "sedayebourse.ir")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class donyayekhodro extends clsNastoohBased {
    constructor() {
        super(enuDomains.donyayekhodro, "donyayekhodro.com")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
    }
}

export class chamedanmag extends clsNastoohBased {
    constructor() {
        super(enuDomains.chamedanmag, "chamedanmag.com")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class irasin extends clsNastoohBased {
    constructor() {
        super(enuDomains.irasin, "irasin.ir", {
            selectors: {
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[itemprop='datePublished']"),
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("content")?.match(/\d{4}-\d{2}-\d{2}/);
                        if (date)
                            return date[0];
                        else
                            return "NO_DATE";
                    }
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class tebna extends clsNastoohBased {
    constructor() {
        super(enuDomains.tebna, "tebna.ir", {
            selectors: {
                content: {
                    main: ".item-body, figure"
                }
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second

        if (first.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("بین الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }
}

export class foodpress extends clsNastoohBased {
    constructor() {
        super(enuDomains.foodpress, "foodpress.ir", {
            selectors: {
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments-list ul li"),
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class fardayeeghtesad extends clsNastoohBased {
    constructor() {
        super(enuDomains.fardayeeghtesad, "fardayeeghtesad.com")
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class radareghtesad extends clsNastoohBased {
    constructor() {
        super(enuDomains.radareghtesad, "radareghtesad.ir")
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه اصلی\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class karajemrouz extends clsNastoohBased {
    constructor() {
        super(enuDomains.karajemrouz, "karajemrouz.ir", {
            selectors: {
                datetime: {
                    conatiner: 'ul.list-inline li:nth-child(1)',
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Local }
    }
}