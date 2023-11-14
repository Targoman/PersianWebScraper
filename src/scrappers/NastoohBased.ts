import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs, IntfProxy } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { getArvanCookie } from "../modules/request";

class clsNastoohBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article",
                aboveTitle: ".rutitr, .kicker",
                title: ".title",
                subtitle: ".introtext",
                summary: ".item-summary",
                content: {
                    main: '.item-body .item-text>*, .introtext+figure, .item-header+figure, section.photoGall li, .item-text .gallery figure, .item-summary figure',
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
                    conatiner: '.item-date>span',
                    splitter: "-"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb")?.querySelectorAll("li"),
                    startIndex: 0,
                }
            },
            url: {
                extraInvalidStartPaths: ["/old/upload", '/d/'],
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.startsWith("چندرسانه")
            || first.startsWith("عکس")
            || first.startsWith("داستان")
            || first.includes("TV")
            || second.includes("گزارش")
            || second.includes("تصویری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("اقتصاد‌ جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("فوتبال جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (first.includes("جهان") || second.includes("خارجی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (second.startsWith("دفاع")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (second.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        else if (cat.includes("سیاس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("اقتصاد") || first.startsWith("کسب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (first.startsWith("سلامت")
            || second.startsWith("پزشکی")
            || second.startsWith("بهداشت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اجتماع")
            || first.startsWith("خانواده")
            || first.startsWith("پایداری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (second.startsWith("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        else if (second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (second.startsWith("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Historical }
        else if (first.includes("فرهنگی")
            || first.startsWith("کودک")
            || first.startsWith("روز هفتم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("سرگرمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        if (cat.includes("آشپزی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (first.startsWith("زندگی") || first.startsWith("تندرستی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("شهر")
            || cat.includes("استان")
            || first.includes("محله")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("فناوری اطلاعات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (cat.includes("دانش")
            || cat.includes("ارتباطات")
            || cat.includes("سایبر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("رزمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (second.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (second.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (second.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (first.includes("ورزشی") || first.startsWith("تماشاگر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
    }
}

/***********************************************************/
export class irna extends clsNastoohBased {
    constructor() {
        super(enuDomains.irna, "irna.ir", { selectors: { datetime: { splitter: "،" } } })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.irna.ir", this.baseURL, proxy)
    }


    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("استان"))
            return { ...mappedCat, minor: enuMinorCategory.Local }

        if (false
            || first.startsWith("ملٹی میڈیا")
            || first.startsWith("عکس")
            || first.startsWith("چندرسانه‌ای")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
        } else if (first.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.startsWith("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("صفحات")) {
            if (second.startsWith("جام")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
            return { ...mappedCat, minor: enuMinorCategory.Political }
        } else if (first.startsWith("علم")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.startsWith("دانشگاه") || second.includes("دانشجو") || second.includes("سنجش")) mappedCat.minor = enuMinorCategory.University
            else if (second.startsWith("فرهنگیان") || second.includes("دانشجو")) mappedCat.minor = enuMinorCategory.University
            else if (second.startsWith("شورای") || second.startsWith("وزارت") || second.startsWith("معاونت")) mappedCat.minor = enuMinorCategory.Political
        } else if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.startsWith("کتاب")) mappedCat.subminor = enuSubMinorCategory.Book
            else if (second.endsWith("تلویزیون")) mappedCat.subminor = enuSubMinorCategory.TV
            else if (second.startsWith("سینما")) mappedCat.subminor = enuSubMinorCategory.Cinema
            else if (second.startsWith("قرآن") || second.startsWith("قران") || second.startsWith("ایثار") || second.startsWith("حج")) mappedCat.subminor = enuMinorCategory.Religious
            else if (second.startsWith("موسیقی")) mappedCat.subminor = enuSubMinorCategory.Music
            else if (second.startsWith("گردشگری") || second.includes("میراث") || second.includes("ایران")) mappedCat.subminor = enuSubMinorCategory.Turism
            else if (second.startsWith("هنر")) mappedCat.subminor = enuSubMinorCategory.Art
        } else if (first.startsWith("پژوهش")) {
            mappedCat.minor = enuMinorCategory.ScienceTech
            if (second.includes("جعلی") || second.includes("راستی")) mappedCat.minor = enuMinorCategory.Generic
            else if (second.includes("ایران")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
            else if (second.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
            else if (second.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
            else if (second.includes("بین‌الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
            else if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
            else if (second.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
            else if (second.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Law }
            else if (second.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
            else if (second.includes("میزگرد")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        } else if (first.startsWith("ورزش")) {
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.startsWith("سیاست")
            || cat.startsWith("جهاد")
            || cat.startsWith("دهه فجر")
            || cat.startsWith("ویژه‌نامه")
            || cat.startsWith("انتخابات")
            || cat.startsWith("گزارش")
            || cat.startsWith("دیدگاه")
            || cat.startsWith("جنگ نرم")
            || cat.startsWith("بهارستان نهم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("دفاع")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.startsWith("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("اقتصاد")
            || cat.startsWith("بازار")
            || cat.startsWith("بورس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.startsWith("عکس") || cat.startsWith("فیلم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("جهان") || cat.startsWith("تحولات منطقه") || cat.startsWith("انتخابات امریکا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("محور مقاومت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("جام جهانی") || cat.startsWith("یورو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (cat.startsWith("دین") || cat.includes("حسینیه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.startsWith("وبلاگستان")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Undefined }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (first.startsWith("هنر") && second.startsWith("سینما") || second.startsWith("جشنواره")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("هنر") && second.startsWith("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (first.startsWith("هنر") && second.includes("تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (first.startsWith("هنر") && second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (first.startsWith("هنر") && second.startsWith("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (first.startsWith("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("عکس")
            || cat.includes("فیلم")
            || cat.includes("اینفو")
            || cat.includes("دکه")
            || cat.includes("مهرکارتون")
            || cat.includes("گرافیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (second.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (first.startsWith("ورزش") || second.startsWith("جام جهانی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("جامعه/حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (first.startsWith("جامعه") && second.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (first.startsWith("جامعه") && second.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (first.startsWith("جامعه") || cat.includes("زندگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (second.startsWith("گپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk }
        else if (cat.includes("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (first.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد") || cat.includes("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (second.startsWith("سیاست خارجی") || cat.includes("بین") || cat.includes("دنیا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (first.startsWith("دانش") || cat.includes("مجازی") || cat.includes("فجازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (first.startsWith("فرهنگ") && second.startsWith("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("سیاست") || cat.includes("انتخابات") || cat.includes("خبر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("استان") || first.startsWith("ایران")) return { major: enuMajorCategory.News, subminor: enuMinorCategory.Local }
        else if (first.startsWith("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("دور")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("رادیومهر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Radio }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("عکس") || first.startsWith("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (first.startsWith("جامعه")) {
            mappedCat.minor = enuMinorCategory.Social
            if (second.includes("حوادث")) return { ...mappedCat, subminor: enuSubMinorCategory.Accident }
            if (second.includes("بهداشت")
                || second.includes("سالمندی")
                || second.includes("هلال")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            if (second.includes("حقوق")) return { ...mappedCat, subminor: enuMinorCategory.Law }
            if (second.includes("اوقاف")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            if (second.includes("زنان")) return { ...mappedCat, subminor: enuSubMinorCategory.Women }
        } else if (first.startsWith("سیاست")) {
            mappedCat.minor = enuMinorCategory.Political
            if (second.includes("الملل")) return { ...mappedCat, subminor: enuSubMinorCategory.Intl }
        } else if (first.startsWith("شهر")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (first.startsWith("فرهنگ")) {
            mappedCat.minor = enuMinorCategory.Culture
            if (second.includes("موسیقی")) return { ...mappedCat, subminor: enuSubMinorCategory.Music }
            else if (second.includes("دین")) return { ...mappedCat, subminor: enuMinorCategory.Religious }
            else if (second.includes("کتاب")) return { ...mappedCat, subminor: enuSubMinorCategory.Book }
            else if (second.includes("ادبیات")) return { ...mappedCat, subminor: enuMinorCategory.Literature }
            else if (second.includes("سینما")) return { ...mappedCat, subminor: enuSubMinorCategory.Cinema }
            else if (second.includes("گردشگری")) return { ...mappedCat, subminor: enuSubMinorCategory.Turism }
        } else if (first.startsWith("علم")) {
            if (second.includes("پزشکی")) return { ...mappedCat, subminor: enuMinorCategory.Health }
            else if (second.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        }
        else if (cat.includes("ورزش")) {
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
            if (second.startsWith("توپ") || second.includes("راکتی")) mappedCat.subminor = enuSubMinorCategory.Ball
            if (second.startsWith("کشتی")) mappedCat.subminor = enuSubMinorCategory.Wrestling
            if (second.includes("رزمی")) mappedCat.subminor = enuSubMinorCategory.Martial
            if (second.includes("زنان")) mappedCat.subminor = enuSubMinorCategory.Women
            if (second.startsWith("فوتبال")) mappedCat.subminor = enuSubMinorCategory.Football
        }
        else if (cat.includes("کرونا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }

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
}

/***********************************************************/
export class chtn extends clsNastoohBased {
    constructor() {
        super(enuDomains.chtn, "chtn.ir", {
            selectors: {
                article: ".main-content, #photo"
            },
            url: {
                extraInvalidStartPaths: ["/d/"]
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }

        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }

        if (second.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (second.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (second.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (second.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.startsWith("گردشگری")) return { ...mappedCat, subminor: enuSubMinorCategory.Turism }

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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (second.startsWith("کودک") || second.startsWith("مدیریت") || second.startsWith("ادبیات") || second.startsWith("تازه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Local }
        else if (cat.includes("چندرسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (second.includes("هنر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Literature, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("فیلم") || cat.includes("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("بانوان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious, subminor: enuSubMinorCategory.Women }
        else if (cat.includes("گفتگو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Talk }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
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
}

export class iscanews extends clsNastoohBased {
    constructor() {
        super(enuDomains.iscanews, "iscanews.ir")
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
}

export class tahlilbazaar extends clsNastoohBased {
    constructor() {
        super(enuDomains.tahlilbazaar, "tahlilbazaar.com")
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
}

export class salameno extends clsNastoohBased {
    constructor() {
        super(enuDomains.salameno, "salameno.com")
    }
}

export class tehrannews extends clsNastoohBased {
    constructor() {
        super(enuDomains.tehrannews, "tehrannews.ir")
    }
}

export class tahririeh extends clsNastoohBased {
    constructor() {
        super(enuDomains.tahririeh, "tahririeh.com")
    }
}

export class atiyeonline extends clsNastoohBased {
    constructor() {
        super(enuDomains.atiyeonline, "atiyeonline.ir")
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
}

export class eximnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.eximnews, "eximnews.ir")
    }
}

export class payamekhanevadeh extends clsNastoohBased {
    constructor() {
        super(enuDomains.payamekhanevadeh, "payamekhanevadeh.ir")
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
}

export class karafarinnews extends clsNastoohBased {
    constructor() {
        super(enuDomains.karafarinnews, "karafarinnews.ir")
    }
}

export class bidarbourse extends clsNastoohBased {
    constructor() {
        super(enuDomains.bidarbourse, "bidarbourse.com")
    }
}