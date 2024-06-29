import { clsScrapper } from "../modules/clsScrapper";
import { IntfProxy, enuDomains, IntfComment, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCategory, enuTextType } from "../modules/interfaces";
import HP, { HTMLElement } from "node-html-parser"
import { axiosGet, axiosPost, getArvanCookie, IntfRequestParams } from "../modules/request";
import { log } from "../modules/logger";
import { normalizeText, dateOffsetToDate, isIranProvinceString } from "../modules/common";

export class farsnews extends clsScrapper {
    constructor() {
        super(enuDomains.farsnews, "farsnews.ir", {
            selectors: {
                article: ".news-box, .gallery, .top-video .text",
                title: ".title",
                summary: ".lead",
                content: {
                    main: ".nt-body>*, .top figure",
                    alternative: ".row.photos img",
                    textNode: '.nt-body'
                },
                comments: async (url: URL, reqParams: IntfRequestParams): Promise<IntfComment[]> => {
                    return await axiosPost(log,
                        { "storyCode": url.pathname.split("/")[2] },
                        {
                            ...reqParams,
                            url: "https://www.farsnews.ir/api/getcomments",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                            },
                            onSuccess: (res: any) => {
                                const comments: IntfComment[] = []
                                res?.forEach((item: any) => {
                                    comments.push({
                                        text: item.text,
                                        author: item.name,
                                        date: this.extractDate(item.persianCreateDate, "-")
                                    })
                                    item.children?.forEach((child: any) => {
                                        comments.push({
                                            text: normalizeText(child.text) || "",
                                            author: normalizeText(child.name) || "",
                                            date: this.extractDate(child.persianCreateDate, "-")
                                        })
                                    })
                                })
                                return comments
                            },
                            onFail: (e) => { log.error(e) }
                        }
                    )
                },
                tags: ".tags .radius",
                datetime: {
                    conatiner: ".publish-time, .data-box span:nth-child(3)",
                },
                category: {
                    selector: (article: HTMLElement) => {
                        const categories = article.querySelectorAll(".category-name a");
                        return categories.length ? categories : article.querySelectorAll(".subject-category")
                    },
                }
            },
            url: {
                extraInvalidStartPaths: ["/newstext", "/printable", "/af", "/api"],
                validPathsItemsToNormalize: ["news", "media"],
                pathToCheckIndex: 1,
                extraValidDomains: ["farsnews.com"]
            },
        })
    }

    protected normalizePath(url: URL): string {
        const u = this.safeCreateURL(super.normalizePath(url))
        u.hostname = "www.farsnews.ir"
        u.protocol = "https:"
        return u.toString()
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("اخبار"))
            first = first.substring(6).trim()

        if (first.startsWith("استان") || isIranProvinceString(first))
            return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("فوتبال"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.startsWith("رالی"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Car }
        if (first.startsWith("کشتی"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (first.startsWith("سیاست خارجی") || first.includes("الملل"))
            return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("سیاست"))
            return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("اقتصاد"))
            return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("سینما"))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.startsWith("کتاب"))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (first.startsWith("سفر "))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (first.startsWith("نرخ") || first.startsWith("واحد"))
            return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("فضای مجازی"))
            return { ...mappedCat, minor: enuMinorCategory.IT }

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
}

export class alef extends clsScrapper {
    constructor() {
        super(enuDomains.alef, "alef.ir", {
            selectors: {
                article: "article",
                title: ".post-title",
                subtitle: ".post-lead",
                content: {
                    main: ".post-content>*, header img",
                    textNode: '.post-content',
                    ignoreTexts: [/.*tavoos_init_player.*/]
                },
                comments: {
                    container: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment"),
                    datetime: ".comment-date",
                    author: ".comment-author",
                    text: ".comment-text"
                },
                tags: ".post-tag",
                datetime: {
                    conatiner: ".post-sous time",
                    splitter: (el: HTMLElement) => super.extractDate(el, el.classList.contains("comment-date") ? " " : "،") || "DATE NOT FOUND",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => {
                        const category = fullHtml.querySelector(".navbar-nav .nav-item.active")?.innerText.replace("(current)", "")
                        if (!category) return []
                        return HP.parse(`<div>${category}</div>`).querySelectorAll("*")
                    }
                }
            },
        })
    }

    async initialCookie(proxy?: IntfProxy, url?: string) {
        return await getArvanCookie(url || "https://www.alef.ir", this.baseURL, proxy)
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.startsWith("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("یادداشت بینندگان")) return { ...mappedCat, minor: enuMinorCategory.Discussion }
        if (cat.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }

        return mappedCat
    }
}

export class isna extends clsScrapper {
    constructor() {
        super(enuDomains.isna, "isna.ir", {
            selectors: {
                article: "article",
                aboveTitle: ".kicker",
                title: ".first-title",
                summary: ".summary",
                content: {
                    main: ".item-body .item-text>*, .photoGall li",
                    alternative: (article: HTMLElement) => {
                        if (article.querySelector("section.gallery")) {
                            const element = article.querySelector("time")?.nextElementSibling
                            if (element) return [element]
                        }
                        return []
                    },
                    textNode: '.item-text',
                    ignoreTexts: ["بیشتر:"]
                },
                comments: {
                    container: ".comments .comment",
                    datetime: ".date-comment",
                    author: ".comment-name",
                    text: "p"
                },
                tags: ".tags li",
                datetime: {
                    conatiner: ".meta-news li:nth-child(1) .text-meta, time",
                    splitter: (el?: HTMLElement) => {
                        return super.extractDate(el, (el?.classList.contains("text-meta") || el?.tagName === "TIME" ? "/" : " ")) || "DATE NOT FOUND"
                    },
                },
                category: {
                    selector: ".meta-news li:nth-child(2) .text-meta",
                }
            },
            url: {
                pathToCheckIndex: 1,
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.startsWith("اجتماعی") || cat.startsWith("جامعه") || cat.startsWith("خانواده") || cat.startsWith("محیط")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("دانشگاه") || cat.includes("دانشجو")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("علم")
            || cat.includes("دانش")
            || cat.includes("پژوهش")
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("انرژی هسته")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("اقتصاد")
            || cat.includes("تجارت") || cat.startsWith("انرژی") || cat.startsWith("عمران")
            || cat.startsWith("استخدام")
            || cat.includes("بازار") || cat.startsWith("ترین")
            || cat.startsWith("تمدن‌سازی")
            || cat.startsWith("مردمی‌سازی")
            || cat.startsWith("امید و آگاهی")
            || cat.startsWith("الگوی پیشرفت")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("آمریکا")
            || cat.includes("خارجی")
            || cat.startsWith("غرب")
            || cat.includes("ایران در جهان")
            || cat.includes("اقیانوسیه")
            || cat.startsWith("انرژی هسته")
            || cat.startsWith("بین الملل")
            || cat.includes("تحلیل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("ویدئو")
            || cat.startsWith("ویدیو")
            || cat.startsWith("صوت")
            || cat.startsWith("گزارش")
            || cat.startsWith("دیدنی")
            || cat.startsWith("موشن")
            || cat.startsWith("کاریکاتور")
            || cat.startsWith("اینفوگرافیک")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("ورزش") || cat.includes("المپیک") || cat.includes("جام ") || cat.includes("بازی") || cat.includes("یورو")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (cat.startsWith("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (cat.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (cat.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("تجسمی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Multimedia, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگ") || cat.includes("میراث") || cat.startsWith("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.IT }
        if (cat.startsWith("دین") || cat.includes("اسلامی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.startsWith("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.startsWith("سیاس")
            || cat.startsWith("مجلس")
            || cat.startsWith("دولت")
            || cat.startsWith("رسانه دیگر")
            || cat.includes("خبر")
            || cat.startsWith("محور مقاومت")
            || cat.startsWith("ایسنا+")
            || cat.startsWith("شبکه")
            || cat.startsWith("سند")
            || cat.startsWith("اندیشه")
        ) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.startsWith("چهره")
            || cat.startsWith("دیدگاه")
            || cat.startsWith("باشگاه")
            || cat.startsWith("کانون")
            || cat.startsWith("یادداشت")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.startsWith("آمریکا")
            || cat.includes("خارجی")
            || cat.startsWith("غرب")
            || cat.includes("جهان")
            || cat.includes("اقیانوسیه")
            || cat.startsWith("انرژی هسته"))
            return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }

        return { ...mappedCat, subminor: enuMinorCategory.Local }
    }
}

export class khamenei extends clsScrapper {
    constructor() {
        super(enuDomains.khamenei, "farsi.khamenei.ir", {
            selectors: {
                article: ".others-content-wrapper, #newsContentInnerSide, ._photo-post-container, .bookContent .content, .keyDtlBox",
                aboveTitle: "#Content_rutitr, .rootitr",
                title: (article: HTMLElement) => {
                    let title = article.querySelector("#Content_title")
                    if (title?.innerText) return title
                    title = article.querySelector("h3")
                    if (title?.innerText) return title
                    title = article.querySelector(".title")
                    if (title?.innerText) return title
                    return title
                },
                subtitle: "#Content_UnderTitle, .photos-lead, .lead",
                content: {
                    main: (article: HTMLElement, fullHtml: HTMLElement) =>
                        fullHtml.querySelector('._photo-post-container')
                            ? []
                            : article.querySelectorAll(".NewsText>*, .Content, .contentInbox, .keyDtlBox1, th, td, .others-content>*"),
                    alternative: "th, td",
                    ignoreNodeClasses: ["lead", "rutitr", "title", "_links", "khamenei_ir-ajs", "khamenei_ir-vjs", "inboxItems", "audioBlueBox", "yearScroller", "showTooltip"],
                },
                tags: (article: HTMLElement) =>
                    article.querySelectorAll("a").filter(a => a.getAttribute("href")?.startsWith("/tag"))
                ,
                datetime: {
                    conatiner: (article: HTMLElement) => article.classList.contains('keyDtlBox') ? article : article.querySelector("#Content_publishdate, .oliveDate, .date"),
                    splitter: (el: HTMLElement, fullHtml?: HTMLElement) => fullHtml?.querySelector('.keyDtlBox') ? "NODate" : super.extractDate(el, "-") || "NoDate",
                },
                category: {
                    selector: '#breadCrumbsContainer [itemprop="title"]',
                }
            },
            url: {
                pathToCheckIndex: 1,
                extraValidDomains: ["khamenei.ir"],
                removeWWW: true,
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class citna extends clsScrapper {
    constructor() {
        super(enuDomains.citna, "citna.ir", {
            selectors: {
                article: "#content",
                title: "h1",
                summary: ".field-name-field-summary",
                content: {
                    main: ".field-name-field-image-main, .field-name-body .field-item>*",
                    ignoreNodeClasses: ["video-js", "btn"]
                },
                tags: (article: HTMLElement) => article.querySelectorAll('a').filter(el => el.getAttribute("href")?.startsWith("/tag")),
                datetime: {
                    conatiner: ".field-name-post-date",
                    splitter: "-",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".v-breadcrumbs a")
                }
            },
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.ICT }
    }
}

export class itna extends clsScrapper {
    constructor() {
        super(enuDomains.itna, "itna.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                summary: "#docDivLead1",
                content: {
                    main: ".docContentdiv>div>div>*",
                    ignoreNodeClasses: ["video-js", "btn"]
                },
                tags: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll('.doc_tags1 a'),
                datetime: {
                    conatiner: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector(".doc_date"),
                    splitter: " ",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
                comments: {
                    container: (_article, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".user-comment-area"),
                    author: ".user-comment-name",
                    datetime: ".user-comment-date",
                    text: ".user-comment-content",
                }
            },
            url: {
                pathToCheckIndex: 1,
                validPathsItemsToNormalize: ["news", "multimedia"],
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
        if (second.startsWith("روباتیك")) return { ...mappedCat, subminor: enuSubMinorCategory.Robotic }
        if (second.startsWith("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
        if (second.startsWith("سخت‌افزار") || second.startsWith("كامپیوتر همراه")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (first.startsWith("ارتباطات") || first.includes("ICT")) return { ...mappedCat, subminor: enuMinorCategory.ICT }
        if (first.startsWith("نرم")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (first.startsWith("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }

        return mappedCat
    }
}

export class zoomit extends clsScrapper {
    constructor() {
        super(enuDomains.zoomit, "zoomit.ir", {
            selectors: {
                article: "main",
                aboveTitle: "#Content_rutitr",
                title: "h1",
                summary: ".cJZnLd .BlockContainer__InnerArticleContainer-i5s1rc-1.hXzioD",
                content: {
                    main: ".eQTmR .BlockContainer__InnerArticleContainer-i5s1rc-1.hXzioD>*, img",
                },
                datetime: {
                    conatiner: ".oNOID > span:nth-child(3), .dgQNji > span:nth-child(3), .header-detail > span.eMeOeL",
                    splitter: "-",
                },
                category: {
                    selector: '.kDyGrB a',
                },
                comments: async (url: URL, reqParams: IntfRequestParams): Promise<IntfComment[]> => {
                    const comments: IntfComment[] = []
                    const match = url.pathname.match(/\/(\d+)-/);
                    let page = 1;
                    const retrieveComments = async (currentPage: number) => {
                        await axiosGet(log,
                            {
                                ...reqParams,
                                url: `https://api2.zoomit.ir/discussion/api/feedbacks?topicId=${match?.[1]}&topicType=Article&sortBy=MostLike&offset=${currentPage}&size=${20}&commentDepthLevel=5`,
                                headers: {
                                    "Content-Type": "application/json; charset=UTF-8"
                                },
                                onSuccess: async (res: any) => {
                                    res.allFeedback.forEach((item: any) => {
                                        comments.push({
                                            text: normalizeText(item.content) || "",
                                            author: normalizeText(item.user.userName),
                                            date: item.createdAt.substring(0, 10)
                                        })
                                        item.commentChildren?.forEach((child: any) => {
                                            comments.push({
                                                text: normalizeText(child.content) || "",
                                                author: normalizeText(child.user.userName),
                                                date: child.createdAt.substring(0, 10)
                                            })
                                        })
                                    })
                                    if (res.hasNext) {
                                        page++;
                                        await retrieveComments(page)
                                    }
                                },
                                onFail: (e) => { log.error(e) }
                            }
                        )
                    }

                    await retrieveComments(page)

                    return comments
                },
            },
            url: {
                extraInvalidStartPaths: ["/product"]
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
        if (second.startsWith("روباتیك")) return { ...mappedCat, subminor: enuSubMinorCategory.Robotic }
        if (second.startsWith("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
        if (second.startsWith("سخت‌افزار") || second.startsWith("كامپیوتر همراه")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (first.startsWith("ارتباطات") || first.includes("ICT")) return { ...mappedCat, subminor: enuMinorCategory.ICT }
        if (first.startsWith("نجوم") || first.includes("ICT")) return { ...mappedCat, subminor: enuSubMinorCategory.Cosmos }
        if (first.startsWith("نرم")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (first.startsWith("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }

        return mappedCat
    }
}

export class varzesh3 extends clsScrapper {
    constructor() {
        super(enuDomains.varzesh3, "varzesh3.com", {
            selectors: {
                article: ".news-content-holder article",
                aboveTitle: ".subhead",
                title: ".headline",
                subtitle: ".lead",
                content: {
                    main: ".news-detail-image, .news-text",
                    ignoreNodeClasses: ["video-js", ".news-inline-biz"]
                },
                tags: ".tagbox .tag",
                datetime: {
                    conatiner: ".news-info span:nth-child(2)",
                    splitter: "ساعت",
                },
                comments: {
                    container: ".vrz-user-comment",
                    author: ".cm-by-user",
                    datetime: (cm: HTMLElement) => dateOffsetToDate(cm.querySelector(".cm-data-t span:nth-child(2)")) || "INVALID_DATE",
                    text: ".cm-message",

                }
            },
        })
    }
    normalizePath(url: URL) {
        return super.normalizePath(url, {
            pathToCheckIndex: 1,
            validPathsItemsToNormalize: ["news"],
            extraInvalidStartPaths: ["/video"]
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
    }
}

export class tarafdari extends clsScrapper {
    constructor() {
        super(enuDomains.tarafdari, "tarafdari.com", {
            selectors: {
                article: "article.node-content",
                aboveTitle: ".field-name-field-surtitle",
                title: "h1",
                subtitle: ".field-name-field-teaser",
                content: {
                    main: ".field-name-body .field-item.even",
                    ignoreNodeClasses: ["video-js", ".news-inline-biz"]
                },
                tags: ".field-name-field-tags a",
                datetime: {
                    conatiner: '.timeago[data-tarikh]',
                    splitter: (el: HTMLElement) => {
                        console.log(el.outerHTML);
                        return super.extractDate(el.getAttribute("data-tarikh"), "-") || "DateNotfound"
                    },
                },
                comments: {
                    container: (_, fullHTML: HTMLElement) => fullHTML.querySelectorAll(".discuss"),
                    author: ".username",
                    text: ".discuss-content p",
                }
            },
            url: {
                extraInvalidStartPaths: ['/user/', '/static/'],
                ignoreContentOnPath: ["/static/page/taxonomy/"]
            }
        })
    }
    normalizePath(url: URL) {
        return super.normalizePath(url, {
            pathToCheckIndex: 1,
            validPathsItemsToNormalize: ["news"],
            extraInvalidStartPaths: ["/video"]
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
    }
}

export class pana extends clsScrapper {
    constructor() {
        super(enuDomains.pana, "pana.ir", {
            selectors: {
                article: "article[itemscope], #PhotoGalleryContainer",
                aboveTitle: "#Content_rutitr",
                title: "#Content_title",
                subtitle: "#Content_UnderTitle, #Content_lid",
                content: {
                    main: ".NewsText>*, .photoThumbnail",
                    ignoreNodeClasses: ["video-js", "btn"]
                },
                tags: "#keyWordContainer strong",
                datetime: {
                    conatiner: "#Content_publishdate",
                    splitter: "-",
                },
                category: {
                    selector: '#breadCrumbsContainer [itemprop="title"]',
                }
            },
            url: {
                extraInvalidStartPaths: ["/newspdf"],
                pathToCheckIndex: 1,
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("عکس") || cat.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد") || second.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }

        return mappedCat
    }
}

export class niknews extends clsScrapper {
    constructor() {
        super(enuDomains.niknews, "niknews.ir", {
            selectors: {
                article: "article",
                datetime: {
                    conatiner: "div[class='col-12 col-sm-6 justify-content-end p-0 d-flex'], div[class='col-12 col-sm-6 p-0 d-flex']"
                },
                content: {
                    main: ".item-body"
                },
                title: ".line-height-2",
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb")?.querySelectorAll("li a"),
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("اق") || second.startsWith("اتص")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (second.startsWith("سی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.endsWith("عی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.endsWith("ور")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        return mappedCat
    }
}

export class namnak extends clsScrapper {
    constructor() {
        super(enuDomains.namnak, "namnak.com", {
            selectors: {
                article: "#cta",
                title: "h1",
                summary: ".E9",
                content: {
                    main: "#pc",
                },
                datetime: {
                    conatiner: ".a.s.f",
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND",
                    acceptNoDate: true
                },
                category: {
                    selector: '#cpath a',
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".C8.b.i"),
                    author: "b[itemprop='name']",
                    datetime: "span[itemprop='commentTime']",
                    text: ".Ca .Cm .cmtx"
                }
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/ag_1_1.do"]
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Historical }
        if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (second.startsWith("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        if (cat.includes("سخت افزار")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
        if (first.startsWith("فناوری") || cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("جامعه") || first.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("اقتصاد") || cat.includes("استخدام")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("سلامت") || cat.includes("بارداری")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.startsWith("آشپز")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes("تناسب") || cat.includes("دنیای مد")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (second.startsWith("خبر")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
    }
}

export class beytoote extends clsScrapper {
    constructor() {
        super(enuDomains.beytoote, "beytoote.com", {
            selectors: {
                article: "article",
                title: "h1",
                content: {
                    main: "p, h2, .imgarticle",
                },
                datetime: {
                    conatiner: "dd.published",
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND",
                    acceptNoDate: true
                },
                category: {
                    selector: 'dd.category-name a',
                },
            },
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Psychology }
        if (cat.includes("پزشکی")
            || cat.includes("ایدز")
            || cat.includes("دارویی")
            || cat.includes("داروهای")
            || cat.includes("بارداری")
            || cat.includes("سالم")
            || cat.includes("بهداشت")
            || cat.includes("بیماری")
            || cat.includes("درمان")
            || cat.includes("بیماری")
            || cat.includes("سالم")
            || cat.includes("تغذیه")
            || cat.includes("جنسی")
            || cat.includes("نوزادان")
            || cat.includes("سلامت")
            || cat.includes("رژیمی")
            || cat.includes("کالری")
            || cat.includes("تغذیه")
        ) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("علمی و آموزشی")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.includes("هنر")
            || cat.includes("گرافیک")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.includes("غذاها")
            || cat.includes("شیرینی")
            || cat.includes("ترشیجات")
            || cat.includes("آشپزی")
        ) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.startsWith("ابزار")
            || cat.includes("تکنولوژی")
            || cat.includes("اختراعات")
            || cat.includes("علمی")
            || cat.includes("گیاهان")
            || cat.includes("کشفیات")
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("احادیث")
            || cat.startsWith("احکام")
            || cat.endsWith(" دین")
            || cat.endsWith(" دینی")
            || cat.endsWith("داروخانه")
            || cat.endsWith("مستحبی")
        ) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("تحصیلی")) return { ...mappedCat, minor: enuMinorCategory.University }
        if (cat.includes("روزنامه")) return { ...mappedCat, major: enuMajorCategory.News }
        if (cat.includes("اجتماعی") || cat.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("اقتصاد")
            || cat.includes("مشاغل")
            || cat.includes("بازار")
            || cat.includes("شارژ")
            || cat.includes("بازار")
            || cat.includes("گلیم")
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("الملل") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاسی") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes("گوناگون") || cat.includes("انعکاس")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("ستاره")) return { ...mappedCat, subminor: enuSubMinorCategory.Celebrities }
        if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("ستاره")
            || cat.includes("بازیگران")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Celebrities }
        if (cat.includes("سرگرمی")
            || cat.includes("جالب")
            || cat.includes("طنز")
            || cat.includes("معما")
            || cat.includes("فال ")
        ) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.endsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuSubMinorCategory.Car }
        if (cat.includes("تصاویر")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.includes("اینترنت") || cat.includes("کامپیوتر")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (cat.includes("مسافرتی")
            || cat.endsWith("سفر")
            || cat.includes("گردشگری")
            || cat.startsWith("مكانهای")
            || cat.startsWith("مناسبتها")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (cat.includes("داستانهای")
            || cat.endsWith("المثل")
            || cat.includes("شعر")
            || cat.includes("حکایت")
        ) return { ...mappedCat, minor: enuMinorCategory.Literature }
        if (cat.startsWith("آیا")
            || cat.startsWith("چرا")
            || cat.startsWith("متفرقه")
        ) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        if (cat.startsWith("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        return mappedCat
    }
}

export class arzdigital extends clsScrapper {
    constructor() {
        super(enuDomains.arzdigital, "arzdigital.com", {
            selectors: {
                article: (doc: HTMLElement, _: HTMLElement, url: URL) =>
                    url.pathname.startsWith("/ideas")
                        ? doc.querySelector("section.arz-container")
                        : doc.querySelector("#post-page .arz-post, section.arz-post__content, #academy-pages, article, .arz-coin-details__explanation")
                ,
                title: "h1, h2",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("datetime")?.match(/\d{4}-\d{2}-\d{2}/);
                        if (!el.textContent.includes("آخرین") && date) {
                            return date[0];
                        }
                        else
                            return super.extractDate(el, "-") || "DATE NOT FOUND"
                    },
                    acceptNoDate: true
                },
                content: {
                    main: "section.arz-post__content, .arz-breaking-news-post__content, .ideas-update-content, #panzoom-element, arz-coin-details__explanation-text, #academy-page-content, .arz-breaking-news-post__source",
                    alternative: ".arz-coin-details__explanation-text"
                },
                tags: "ul.arz-post-tags__list li a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.arz-path-list li a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .wpd-comment"),
                    author: ".wpd-comment-wrap .wpd-comment-right .wpd-comment-author",
                    text: " .wpd-comment-wrap .wpd-comment-right .wpd-comment-text"
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.CryptoCurrency }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("بیاموزید") || second.startsWith("دانشنامه")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (second.startsWith("مصاحبه")) return { ...mappedCat, subminor: enuMinorCategory.Talk }
        return mappedCat
    }
}

export class ramzarz extends clsScrapper {
    constructor() {
        super(enuDomains.ramzarz, "ramzarz.news", {
            selectors: {
                article: "article.single-post-content, article.single-page-content, article.question-share-2",
                title: "h1",
                content: {
                    main: ".entry-content p, img, #myTable",
                },
                datetime: {
                    conatiner: "time b",
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND",
                    acceptNoDate: true
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a, p.breadcrumb-st a, span.breadcrumb-item span a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .wpd-comment"),
                    author: ".wpd-comment-wrap .wpd-comment-right .wpd-comment-author",
                    datetime: ".wpd-comment-wrap .wpd-comment-right .wpd-comment-date",
                    text: " .wpd-comment-wrap .wpd-comment-right .wpd-comment-text"
                }
            },
            url: {
                removeWWW: true,
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.CryptoCurrency }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia, subminor: enuMinorCategory.CryptoCurrency }
        if (second.startsWith("رپورتاژ")) return { ...mappedCat, subminor: enuSubMinorCategory.Reportage }
        return mappedCat
    }
}

export class digiato extends clsScrapper {
    constructor() {
        super(enuDomains.digiato, "digiato.com", {
            selectors: {
                article: "#articleNewsPosts, .sitePage__content",
                title: (_, fullHTML: HTMLElement) => fullHTML.querySelector(".dailyNewsPageHead__description--title, h1.singleVideoPageTitle"),
                summary: (_, fullHTML: HTMLElement) => fullHTML.querySelector(".dailyNewsPageHead__description p"),
                datetime: {
                    conatiner: (_, fullHTML: HTMLElement) => fullHTML.querySelector(".dailyNewsPageHead__description--tools"),
                    splitter: (el: HTMLElement) => super.extractDate(el, el.classList.contains("comment-date") ? " " : "|") || "DATE NOT FOUND",
                },
                content: {
                    main: '.articlePost, .singleVideoPost',
                },
                tags: ".postTools__keywords a",
                category: {
                    selector: (_, fullHTML: HTMLElement) => fullHTML.querySelectorAll(".breadcrumb ul li:nth-child(2) a, .breadcrumb ul li:nth-child(3) a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.js-comments-list li"),
                    author: ".comment__info span",
                    text: ".comment__text"
                }
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/author", "/topic", "/?s="]
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("ویدیو") || cat.includes("تماشا")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("کار") || cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("امنیت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Security }
        if (cat.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        if (cat.includes("اپلیکیشن")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
        if (cat.includes("سخت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
        if (cat.includes("بازی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Game }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (cat.includes("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.TV }
        if (cat.includes("گجت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Gadgets }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Education }
        if (cat.includes("کریپتو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.CryptoCurrency }
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Health }
        if (cat.includes("هوش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        if (cat.includes("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Advert }


        return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
    }
}

export class khatebazar extends clsScrapper {
    constructor() {
        super(enuDomains.khatebazar, "khatebazar.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle p"
                },
                category: {
                    selector: ".the_category a"
                }
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class jomhouriat extends clsScrapper {
    constructor() {
        super(enuDomains.jomhouriat, "jomhouriat.ir", {
            selectors: {
                article: ".content",
                title: "h1 a",
                subtitle: ".lead",
                datetime: {
                    conatiner: "ul.news-detile li:nth-child(2) span"
                },
                content: {
                    main: ".entry p, .thumbnail a",
                    ignoreTexts: ["بیشتر بخوانید"]
                },
                category: {
                    selector: ".crumbs a"
                },
                tags: ".post-tag a"
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        void category, first, second
        if (first.includes("اقتصاد")
            || first.includes("بانک")
            || first.includes("بیمه")
            || first.includes("بورس")
            || first.includes("تجارت")
            || first.includes("تولید")
            || first.includes("بانک")
            || first.includes("صنعت")
            || first.includes("مسکن و راه")
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("شرعی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.includes("انتخابات")
            || first.includes("دولت")
            || first.includes("سیاست")
        ) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("بیوگرافی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Celebrities }
        if (first.includes("پتروشیمی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Petroleum }
        if (first.includes("پوشاک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.includes("تعبیر خواب")
            || first.includes("فال ")
        ) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (first.includes("توپ و تور")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("جامعه")
            || first.includes("زناشویی")
        ) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (first.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (first.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (first.includes("رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.includes("سینما")
            || first.includes("فیلم")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.includes("صنایع دستی")
            || first.includes("فرهنگ")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Photo }
        if (first.includes("فن آوری")
            || first.includes("فناوری")
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (first.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("شرعی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (first.includes("شرعی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        return mappedCat
    }
}

export class ofoghnews extends clsScrapper {
    constructor() {
        super(enuDomains.ofoghnews, "ofoghnews.ir", {
            selectors: {
                article: ".content, .gallery-content",
                title: "h1 a",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry, .gallery a",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a")
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class iwna extends clsScrapper {
    constructor() {
        super(enuDomains.iwna, "iwna.ir", {
            selectors: {
                article: "section.single, .gallery-p",
                title: "h1, .title h2 a",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: ".post-content .con, .lightgallery",
                },
                tags: "[rel='tag']"
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class vido extends clsScrapper {
    constructor() {
        super(enuDomains.vido, "vido.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: "span.date"
                },
                content: {
                    main: ".entry-content",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                },
                category: {
                    selector: "a.post-cat"
                }
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/www.", "/instagram", "/uupload", "/beeptunes", "/upera", "/vakil", "/elitland",
                    "/amoozeshgahan", "/saziha"]
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    }
}

export class filmmagazine extends clsScrapper {
    constructor() {
        super(enuDomains.filmmagazine, "film-magazine.com", {
            selectors: {
                article: ".content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h4 span")
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".content"),
                    ignoreTexts: ["[ماهنامه فیلم]"]
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    }
}

export class asrkhabar extends clsScrapper {
    constructor() {
        super(enuDomains.asrkhabar, "asrkhabar.com", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: "span.date"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta", "post-shortlink"]
                },
                category: {
                    selector: "#breadcrumb a",
                    startIndex: 0,
                    lastIndex: 2
                },
                tags: "[rel='tag']"
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (category?.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (category?.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (category?.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (category?.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (category?.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (category?.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (category?.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (category?.includes("عکس و فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (category?.includes("علم، فنآوری و IT")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (category?.includes("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (category?.includes("فیلم و سینما و تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (category?.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        return mappedCat
    }
}

export class zoomg extends clsScrapper {
    constructor() {
        super(enuDomains.zoomg, "zoomg.ir", {
            selectors: {
                article: ".article-content",
                title: "h1 span span",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#bodyContainer, img.cover",
                },
                category: {
                    selector: ".topicCategories a",
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.Game }
    }
}

export class pedal extends clsScrapper {
    constructor() {
        super(enuDomains.pedal, "pedal.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li .single-comment"),
                    author: ".comment_header p cite",
                    text: ".comment-content .comment"
                },
                category: {
                    selector: "span.post-cat-wrap a",
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
    }
}

export class car extends clsScrapper {
    constructor() {
        super(enuDomains.car, "car.ir", {
            selectors: {
                article: ".box__details",
                title: "h1",
                datetime: {
                    conatiner: "span.dates"
                },
                content: {
                    main: ".text__ordered",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment-items ul li"),
                    author: ".avatar span:nth-child(2)",
                    text: "p.text__ordered"
                },
                category: {
                    selector: ".pull-right .category a",
                },
            },
            url: {
                extraInvalidStartPaths: ["/prices"]
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
    }
}

export class sofiamag extends clsScrapper {
    constructor() {
        super(enuDomains.sofiamag, "sofiamag.ir", {
            selectors: {
                article: ".rounded.py-3 > section",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#rt-post-body-content",
                    ignoreNodeClasses: ["r-row"]
                },
                tags: ".border-bottom a"
            }
        })
    }
}

export class gamefa extends clsScrapper {
    constructor() {
        super(enuDomains.gamefa, "gamefa.com", {
            selectors: {
                article: ".single-article ",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content, .thumbnail img",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.pr-0 li.comment .comment-body"),
                    author: ".comment-author cite a",
                    text: "p"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".aioseo-breadcrumbs span a"),
                    startIndex: 1
                },
                tags: "[rel='tag']"
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun, subminor: enuSubMinorCategory.Game }
    }
}

export class ictnn extends clsScrapper {
    constructor() {
        super(enuDomains.ictnn, "ictnn.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1.jeg_post_title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content-inner",
                    ignoreTexts: [/.*مجله خبری.*/]
                },
                category: {
                    selector: "span.breadcrumb_last_link a",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.ICT }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes("نرم افزار")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (cat.includes("Gaming")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
        if (cat.includes("Security")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
        if (cat.includes("اقتصاد")) return { ...mappedCat, subminor: enuMinorCategory.Economics }
        if (cat.includes("Smartphone")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
        if (cat.includes("Computers")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (cat.includes("Photography")) return { ...mappedCat, subminor: enuSubMinorCategory.Photo }

        return mappedCat
    }
}

export class aryanews extends clsScrapper {
    constructor() {
        super(enuDomains.aryanews, "aryanews.com", {
            selectors: {
                article: ".col-md-8 #content-news",
                title: "h1.title-news",
                datetime: {
                    conatiner: "span.date-created"
                },
                content: {
                    main: ".main-news",
                },
                category: {
                    selector: ".section-name a",
                },
            },
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.includes("اقتصاد") || second.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (first.startsWith("عکس") || cat.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (first.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }

        return mappedCat
    }
}

export class sinapress extends clsScrapper {
    constructor() {
        super(enuDomains.sinapress, "sinapress.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: "span.date"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["st-post-tags"]
                },
                tags: ".st-post-tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class shomalnews extends clsScrapper {
    constructor() {
        super(enuDomains.shomalnews, "shomalnews.com", {
            selectors: {
                article: ".content.news",
                aboveTitle: ".rutitr",
                title: ".title",
                summary: ".summary",
                datetime: {
                    conatiner: ".date .left"
                },
                content: {
                    main: ".news_body",
                },
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News }
    }
}

export class artanpress extends clsScrapper {
    constructor() {
        super(enuDomains.artanpress, "artanpress.ir", {
            selectors: {
                article: ".ap_newssingle .ap-single",
                aboveTitle: ".catpo",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#entry .entry",
                    ignoreNodeClasses: ["tag"]
                },
                category: {
                    selector: "[rel='category tag']",
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        if (!cat) return cat
        const parts = cat.split("/")
        return parts.at(0) + (parts.length > 1 ? ("/" + parts.at(1)) : "")
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

export class manbaekhabar extends clsScrapper {
    constructor() {
        super(enuDomains.manbaekhabar, "manbaekhabar.ir", {
            selectors: {
                article: "article.is-single",
                aboveTitle: ".lid_news ",
                title: "h1",
                summary: ".desc_news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".news_content",
                    ignoreNodeClasses: ["post_source"]
                },
                category: {
                    selector: ".breadcrumb a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: ".tag_wrap a"
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.includes("اقتصاد") || second.startsWith("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (first.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (first.startsWith("عکس") || cat.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.includes("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (first.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.includes("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }

        return mappedCat
    }
}

export class vigiato extends clsScrapper {
    constructor() {
        super(enuDomains.vigiato, "vigiato.net", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content",
                    ignoreTexts: [/.*<img.*/]
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author",
                    text: ".wpd-comment-text"
                },
                category: {
                    selector: "#breadcrumb > span > span > a",
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class techrato extends clsScrapper {
    constructor() {
        super(enuDomains.techrato, "techrato.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "[itemprop='articleBody'] p, [itemprop='articleBody'] h2, [itemprop='articleBody'] table",
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("section.comments-list article"),
                    author: ".comment-meta div",
                    text: ".comment-content"
                },
                category: {
                    selector: ".post-categories li a",
                },
                tags: ".tags-nav a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class gadgetnews extends clsScrapper {
    constructor() {
        super(enuDomains.gadgetnews, "gadgetnews.net", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry",
                    ignoreNodeClasses: ["box-inner-block"]
                },               
                tags: ".post-tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class akhbarelmi extends clsScrapper {
    constructor() {
        super(enuDomains.akhbarelmi, "akhbarelmi.ir", {
            selectors: {
                article: ".single",
                title: "h1",
                datetime: {
                    conatiner: ".meta div:nth-child(2) a.link "
                },
                content: {
                    main: "aside.fa_news",
                },
                category: {
                    selector: ".meta div:nth-child(1) a.link ",
                },               
                tags: ".post-tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ettelaat extends clsScrapper {
    constructor() {
        super(enuDomains.ettelaat, "ettelaat.com", {
            selectors: {
                article: "#news",
                title: "h1",
                subtitle: ".leadRow",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".newsBody",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#comments .commentBox .cmItem"),
                    author: ".cmName",
                    text: ".cmMsg"
                },
                category: {
                    selector: "a.newsBreadCrumb ",
                },               
            },
        })
    }
}

export class technoc extends clsScrapper {
    constructor() {
        super(enuDomains.technoc, "technoc.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["yarpp"],
                    ignoreTexts: [/.*<img.*/]
                },               
                tags: ".post-tag a",
                category: {
                    selector: "h6.entry-category a",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class zoomtech extends clsScrapper {
    constructor() {
        super(enuDomains.zoomtech, "zoomtech.org", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], time"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ctaText"],
                    ignoreTexts: [/.*padding.*/]
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                },
                tags: ".article_tags a",
                category: {
                    selector: ".article_category a",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class shahrsakhtafzar extends clsScrapper {
    constructor() {
        super(enuDomains.shahrsakhtafzar, "shahrsakhtafzar.com", {
            selectors: {
                article: "body.view-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "[itemprop='articleBody']",
                    ignoreNodeClasses: ["typo6"]
                },    
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".kmt-list li"),
                    author: ".kmt-author span",
                    datetime: "time",
                    text: ".commentText"
                },           
                category: {
                    selector: ".sazitem_imgcat a",
                },               
            },
        })
    }
}

export class click extends clsScrapper {
    constructor() {
        super(enuDomains.click, "click.ir", {
            selectors: {
                article: "body.news",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".show_desk time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".echo_detail",
                },      
                tags: ".article_tag a",
                category: {
                    selector: ".show_desk [itemprop='name']",
                },               
            },
        })
    }
}

export class gooyait extends clsScrapper {
    constructor() {
        super(enuDomains.gooyait, "gooyait.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], time"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-main-content",
                    ignoreNodeClasses: ["lwptoc"],
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                },
                tags: ".article_tags a",
                category: {
                    selector: "#breadcrumbs span span a",
                    lastIndex: 2
                },               
            },

        })
    }
}

export class digiro extends clsScrapper {
    constructor() {
        super(enuDomains.digiro, "digiro.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content ",
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author",
                    text: ".wpd-comment-text"
                },
                tags: "[rel='tag']",
                category: {
                    selector: ".post-meta-wrap .term-badges  span a",
                },               
            },
        })
    }
}

export class alodoctor extends clsScrapper {
    constructor() {
        super(enuDomains.alodoctor, "alodoctor.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                summary: ".single-post-excerpt",
                content: {
                    main: ".single-post-content-root",
                    ignoreNodeClasses: ["single-post-tags-root"],
                },               
                comments: {
                    container: ".comments-list .comment-item",
                    author: "p.comment-author",
                    text: ".pt-2.pl-0"
                },
                tags: ".single-post-tags-root div a",
                category: {
                    selector: "ol.breadcrumb li a",
                    lastIndex: 2
                },               
            },
        })
    }
}

export class charkhan extends clsScrapper {
    constructor() {
        super(enuDomains.charkhan, "charkhan.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                summary: ".single-post-excerpt",
                content: {
                    main: "article > .entry-content",
                    ignoreNodeClasses: ["drupysib"],
                },               
                comments: {
                    container: "ol.comment-list li",
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                },
                category: {
                    selector: ".post-header-title .term-badges span a",
                },               
            },
        })
    }
}

export class ensafnews extends clsScrapper {
    constructor() {
        super(enuDomains.ensafnews, "ensafnews.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article > .entry-content",
                    ignoreNodeClasses: ["tagcloud"],
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                },
                tags: ".tagcloud a"           
            },
        })
    }
}

export class akharinkhabar extends clsScrapper {
    constructor() {
        super(enuDomains.akharinkhabar, "akharinkhabar.ir", {
            selectors: {
                article: "#view-module",
                title: "h1",
                subtitle: ".entry-sub-title",
                datetime: {
                    conatiner: ".asset-metabar-time.asset-metabar-item",
                },
                content: {
                    main: ".asset-double-wide",
                    ignoreNodeClasses: ["main-share-box", "copy-link", "font-size--main-box"],
                    ignoreTexts: [/.*«آخرین خبر».*/, /.*instagram.*/]
                },               
                category: {
                    selector: ".asset-metabar-cat"
                },
                tags: ".tags-box a strong"           
            },
        })
    }
}

export class pgnews extends clsScrapper {
    constructor() {
        super(enuDomains.pgnews, "pgnews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-tags", "pcsl-title", "heateor_sss_sharing_container", "penci-post-countview-number-check"],
                    ignoreTexts: ["در این زمینه"]
                },               
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments .comment"),
                    author: ".author span",
                    datetime: ".date",
                    text: ".comment-content p"
                },
                tags: ".post-tags a"           
            },
        })
    }
}

export class euronews extends clsScrapper {
    constructor() {
        super(enuDomains.euronews, "parsi.euronews.com", {
            selectors: {
                article: "article.o-article-newsy",
                title: "h1",
                summary: "p.c-article-summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".c-article-content",
                    ignoreNodeClasses: ["widget--type-related", "c-ad", "c-article-you-might-also-like"],
                    ignoreTexts: [/.*به کانال تلگرام یورونیوز.*/]
                },               
                category: {
                    selector: "#adb-article-breadcrumb a",
                },
                tags: "#adb-article-tags div a"           
            },
        })
    }

    protected normalizePath(url: URL): string {
        if (url.pathname.includes("parsi.euronews.com")) {
            return url.toString().replace("/parsi.euronews.com", "")
        } else
            return url.toString()
    }
}

export class peivast extends clsScrapper {
    constructor() {
        super(enuDomains.peivast, "peivast.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                summary: ".grayboxe",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-blog-content",
                    ignoreNodeClasses: ["grayboxe"],
                },               
                category: {
                    selector: "#breadcrumbs span span a",
                    startIndex: 1
                },
                tags: ".post-tags a"           
            },
        })
    }
}

export class trt extends clsScrapper {
    constructor() {
        super(enuDomains.trt, "trt.net.tr", {
            basePath: "/persian",
            selectors: {
                article: "body.lang-fa-IR article",
                title: "h1",
                summary: "h2",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => el.textContent?.substring(0,10).split(".").reverse().join("/") || "NO_DATE"
                },
                content: {
                    main: ".formatted",
                    ignoreNodeClasses: ["tags"],
                },               
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    lastIndex: 2
                },
                tags: ".tags a"           
            },
            url: {
                extraInvalidStartPaths: ["/afghaniuzbek", "/armenian", "/azerbaycan", "/turki", "/bulgarian", "/chinese",
                  "/dari", "/georgian", "/greek", "/magyar", "/italiano", "/kazakh", "/kyrgyz", "/pashto", "/portuguese",
                  "/romana", "/espanol", "/tatarca", "/tatarca", "/turkmen", "/turkmence", "/urdu", "/uyghur", "/uzbek"]
            }
        })
    }
}

export class aa extends clsScrapper {
    constructor() {
        super(enuDomains.aa, "aa.com.tr", {
            basePath: "/fa",
            selectors: {
                article: ".print",
                title: "h1",
                subtitle: "h4",
                datetime: {
                    conatiner: ".tarih",
                    splitter: (el: HTMLElement) => el.textContent?.substring(0,10).split(".").reverse().join("/") || "NO_DATE"
                },
                content: {
                    main: ".detay-icerik >  div:nth-child(2)",
                    ignoreNodeClasses: ["detay-foto-editor", "sticky-top", "detay-paylas"],
                },               
                category: {
                    selector: ".detay-news-category a",
                },
                tags: ".detay-paylas > div:nth-child(2) > a"           
            },
            url: {
                extraInvalidStartPaths: ["/ba", "/kk", "/ks", "/sq", "/mk", "id"]
            }
        })
    }
}

export class armradio extends clsScrapper {
    constructor() {
        super(enuDomains.armradio, "fa.armradio.am", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "a.post-cat"
                }
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class arannews extends clsScrapper {
    constructor() {
        super(enuDomains.arannews, "fa.arannews.com", {
            selectors: {
                article: ".moduletable.MP.PrintContentPage",
                title: "#ctl01_lblhead",
                summary: "#ctl01_divIntroText",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("#ctl01_lblCreatedDate"),
                },
                content: {
                    main: ".opinion-div-fulltext-news",
                },
                tags: ".tag-Keywords li a"
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class ariananews extends clsScrapper {
    constructor() {
        super(enuDomains.ariananews, "ariananews.af", {
            basePath: "/fa",
            selectors: {
                article: "[lang='fa-IR'] body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#mvp-content-main",
                    ignoreNodeClasses: ["sharethis-inline-share-buttons"],
                    ignoreTexts: [/.*Updated.*/]
                },               
                category: {
                    selector: "#mvp-post-head span.mvp-post-cat",
                },
                tags: ".mvp-post-tags span a"           
            },
        })
    }
}

export class saatesalamat extends clsScrapper {
    constructor() {
        super(enuDomains.saatesalamat, "saatesalamat.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: "span.elementor-post-info__item--type-date"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                    ignoreTexts: [/.*(کلیک کنید).*/]
                },
                tags: ".elementor-post-info__terms-list a",
            },
        })
    }
}

export class inn extends clsScrapper {
    constructor() {
        super(enuDomains.inn, "inn.ir", {
            selectors: {
                article: "article.article",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: ".content",
                },               
                category: {
                    selector: "h4.service a",
                },
                tags: "nav.keywords ul li h3 a"           
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class nabzefanavari extends clsScrapper {
    constructor() {
        super(enuDomains.nabzefanavari, "nabzefanavari.ir", {
            selectors: {
                article: "#news",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".body",
                },
                category: {
                    selector: ".news_path a",
                },  
                tags: ".tags_title a"             
            },
        })
    }
}

export class intitr extends clsScrapper {
    constructor() {
        super(enuDomains.intitr, "intitr.net", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content.single-post-content",
                    ignoreNodeClasses: ["better-social-counter-2"],
                },               
                category: {
                    selector: ".bf-breadcrumb-items li a span",                    
                },
                tags: ".post-tags a"           
            },
        })
    }
}

export class ictpress extends clsScrapper {
    constructor() {
        super(enuDomains.ictpress, "ictpress.ir", {
            selectors: {
                article: ".single-post",
                title: "h2.post-title",
                datetime: {
                    conatiner: ".post-date"
                },
                content: {
                    main: ".entry-content",
                },               
                tags: ".post-tags a"           
            },
        })
    }
}

export class techfars extends clsScrapper {
    constructor() {
        super(enuDomains.techfars, "techfars.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content",
                },      
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("div.comment ul li.comment"),
                    author: ".comment-author cite",
                    text: ".comment-body p"
                },         
                category: {
                    selector: ".aioseo-breadcrumbs span a",   
                    startIndex: 1                 
                },
                tags: ".meta.py-2 span.pl-3.d-sm-inline-block a"           
            },
        })
    }
}

export class andishemoaser extends clsScrapper {
    constructor() {
        super(enuDomains.andishemoaser, "andishemoaser.ir", {
            selectors: {
                article: ".article",
                title: "h1",
                summary: ".f15",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".content-entry"),
                    ignoreTexts: [/.*در ایتا.*/]
                },             
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[aria-label='breadcrumb'] a"),   
                },
                tags: ".tags a"           
            },
        })
    }
}

export class filmcinemanews extends clsScrapper {
    constructor() {
        super(enuDomains.filmcinemanews, "filmcinemanews.ir", {
            selectors: {
                article: ".single_post_area",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("a.post_date")
                },
                content: {
                    main: ".single_post_content",
                },
                tags: ".taglinks a"           
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class dailytelegraph extends clsScrapper {
    constructor() {
        super(enuDomains.dailytelegraph, "dailytelegraph.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: "span.date"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "#breadcrumb a"
                }
            },
        })
    }
}

export class baghestannews extends clsScrapper {
    constructor() {
        super(enuDomains.baghestannews, "baghestannews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta"],
                    ignoreTexts: [/.*لینک کوتاه این.*/, /.*برای کپی کردن.*/]
                 },               
                 category: {
                    selector: "#breadcrumb a"
                },
                tags: ".tagcloud a"           
            },
        })
    }
}

export class banifilmonline extends clsScrapper {
    constructor() {
        super(enuDomains.banifilmonline, "banifilmonline.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".cz_post_content",
                    ignoreNodeClasses: ["custom-date"],
                 },               
                 category: {
                    selector: ".breadcrumbs b a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: ".tagcloud a"           
            },
        })
    }
}

export class jomhornews extends clsScrapper {
    constructor() {
        super(enuDomains.jomhornews, "jomhornews.com", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead-left"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#feedback-body .user-comment-area"),
                    text: ".user-comment-content"
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}


export class bakhtarnews extends clsScrapper {
    constructor() {
        super(enuDomains.bakhtarnews, "bakhtarnews.af", {
            basePath: "/dr",
            selectors: {
                article: "[lang='fa-IR'] body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-shortlink", "post-bottom-meta"],
                 },               
                 category: {
                    selector: "#breadcrumb a",
                    startIndex: 1
                },
                tags: ".post-bottom-meta .tagcloud a"           
            },
            url: {
                extraInvalidStartPaths: ["/ur", "/uz"]
            }
        })
    }
}

export class farhikhtegandaily extends clsScrapper {
    constructor() {
        super(enuDomains.farhikhtegandaily, "farhikhtegandaily.com", {
            selectors: {
                article: ".news-box",
                title: "h1",
                subtitle: ".news-lead h2",
                datetime: {
                    conatiner: "li.list-inline-item.bef",
                    acceptNoDate: true
                },
                content: {
                    main: "#content",
                 },               
                 category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a.breadcrumb-item"),
                    startIndex: 1
                },
                tags: ".tags a"           
            },
        })
    }
}

export class dbazi extends clsScrapper {
    constructor() {
        super(enuDomains.dbazi, "dbazi.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".the-content",
                    ignoreNodeClasses: ["wp-block-rank-math-toc-block", "h2", "has-black-background-color"],
                    ignoreTexts: [/.*در دنیای بازی بخوانید:.*/, /.*<img.*/]
                },               
                category: {
                    selector: "nav.rank-math-breadcrumb a"
                },
                comments: {
                    container: "ol.comment-list li.comment",
                    author: ".comment-author cite",
                    text: ".comment-body p"
                },
                tags: "ul.tags li a"           
            },
        })
    }
}

export class gamene extends clsScrapper {
    constructor() {
        super(enuDomains.gamene, "gamene.ws", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["bs-irp", "social-list"],
                },               
                category: {
                    selector: "ul.bf-breadcrumb-items li a"
                },
                comments: {
                    container: "ol.comment-list li.comment",
                    author: "cite.comment-author a",
                    datetime: "time",
                    text: ".comment-content"
                },
                tags: ".post-tags a"           
            },
        })
    }
}

export class rouydad24 extends clsScrapper {
    constructor() {
        super(enuDomains.rouydad24, "rouydad24.ir", {
            selectors: {
                article: "#news",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".body",
                },
                category: {
                    selector: ".news_path a",
                },  
                comments: {
                    container: ".comments_container .comments_item",
                    author: ".comm_info_name",
                    text: ".comments"
                },
                tags: ".tags_title a"             
            },
        })
    }
}

export class nohsobh extends clsScrapper {
    constructor() {
        super(enuDomains.nohsobh, "9sobh.ir", {
            selectors: {
                article: "body.news",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#echo_detail",
                },      
                tags: ".article_tags a span",
                category: {
                    selector: "ul.breadcrumb_list li a",
                },               
            },
        })
    }
}

export class cinemaeinews extends clsScrapper {
    constructor() {
        super(enuDomains.cinemaeinews, "cinemaeinews.ir", {
            selectors: {
                article: ".content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry",
                },             
                category: {
                    selector: "[rel='category tag']",
                    lastIndex: 2
                },    
                tags: ".post-tag a"           
            },
        })
    }
}

export class pspro extends clsScrapper {
    constructor() {
        super(enuDomains.pspro, "pspro.ir", {
            basePath: "/mag",
            selectors: {
                article: "body.blog-blog",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".description",
                },                
                tags: ".col-12 a.link-info"           
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class gametor extends clsScrapper {
    constructor() {
        super(enuDomains.gametor, "gametor.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                    ignoreTexts: [/.*padding.*/]
                },
                category:{
                    selector: ".elementor-post-info__terms-list a"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class hayat extends clsScrapper {
    constructor() {
        super(enuDomains.hayat, "hayat.ir", {
            selectors: {
                article: "body.pt-news.nt-news",
                title: "h1",
                summary: "p.summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".item-text",
                },               
                category: {
                    selector: ".page-header nav ol.breadcrumb li a",
                    startIndex: 1
                },
                tags: ".tags div ul li a"           
            },
        })
    }
}

export class controlmgt extends clsScrapper {
    constructor() {
        super(enuDomains.controlmgt, "controlmgt.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-text-editor > .elementor-widget-container",
                    ignoreNodeClasses: ["rd-title"],
                    ignoreTexts: [/.*اینستاگرام.*/, /.*لینک کوتاه.*/]
                },
                comments: {
                    container: "ol.commentlist li.comment",
                    author: ".comment-author cite",
                    text: ".comment-body p"
                },
                category:{
                    selector: "#digibe-breadcrumb li a",
                    startIndex: 1
                },
                tags: ".tagbox a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class sanapress extends clsScrapper {
    constructor() {
        super(enuDomains.sanapress, "sanapress.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post_content",
                },
                category:{
                    selector: "div.vc_column-inner > div:nth-child(10) > div > a.w-btn > span",
                    startIndex: 1
                },
                tags: "div.vc_column-inner > div:nth-child(11) > div a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class jahansanatnews extends clsScrapper {
    constructor() {
        super(enuDomains.jahansanatnews, "jahansanatnews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], time"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["foots", "post-bottom-meta", "post-cat-wrap"],
                },
                tags: ".post-bottom-meta .tagcloud a",
                category: {
                    selector: "#breadcrumb a",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class asianews extends clsScrapper {
    constructor() {
        super(enuDomains.asianews, "asianews.ir", {
            selectors: {
                article: "article > .col-xs-12",
                aboveTitle: "h5",
                title: "h1",
                subtitle: ".naNewsLeadWrapper span",
                datetime: {
                    conatiner: ".naNewsDetail2DataTimeWrapper span"
                },
                content: {
                    main: ".naNewsDetail2BodyWrapper",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".remarkWrapper .remark"),
                    author: ".user span.name",
                    datetime: "span.date",
                    text: ".comment"
                },
                tags: "ul.ulTagList li a",            
            },
        })
    }
}

export class kurdpress extends clsScrapper {
    constructor() {
        super(enuDomains.kurdpress, "kurdpress.com", {
            selectors: {
                article: "article",
                title: "h1",
                summary: "p.summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".item-text",
                },
                tags: ".tags div ul li a",
                category: {
                    selector: "ol.breadcrumb li a",
                },               
            },
        })
    }
}

export class mdeast extends clsScrapper {
    constructor() {
        super(enuDomains.mdeast, "mdeast.news", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta", "wp-embedded-content", "post-shortlink"],
                    ignoreTexts: ["همچنین بخوانید"]

                },
                category: {
                    selector: "a.post-cat",
                    lastIndex: 2
                },
                tags: ".post-bottom-tags span a"
            },
        })
    }
}

export class boursepress extends clsScrapper {
    constructor() {
        super(enuDomains.boursepress, "boursepress.ir", {
            selectors: {
                article: "#divNewsPage",
                aboveTitle: ".short-title",
                title: "h1",
                summary: ".news-lead",
                datetime: {
                    conatiner: ".news-map > div:nth-child(3)"
                },
                content: {
                    main: ".news-text",
                },
                category: {
                    selector: ".news-map div a",
                },
                tags: ".tags-content a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class etehadnews extends clsScrapper {
    constructor() {
        super(enuDomains.etehadnews, "etehadnews.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                },
            },
        })
    }
}


export class migna extends clsScrapper {
    constructor() {
        super(enuDomains.migna, "migna.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead-left"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#feedback-body .user-comment-area"),
                    text: ".user-comment-content"
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
                tags: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc_tags1 a")
            },
        })
    }
}

export class sobhtazeh extends clsScrapper {
    constructor() {
        super(enuDomains.sobhtazeh, "sobhtazeh.news", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".elementor-reverse-mobile > div > div.elementor-column > div > div > div > span"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                },
                category: {
                    selector: "[rel='tag']",
                    lastIndex: 2
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class banker extends clsScrapper {
    constructor() {
        super(enuDomains.banker, "banker.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["jnews_inline_related_post_wrapper", "jeg_post_tags"],
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li"),
                    author: ".comment-author cite",
                    text: ".comment-content"
                },
                tags: ".jeg_post_tags a",           
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class rouzeeghtesad extends clsScrapper {
    constructor() {
        super(enuDomains.rouzeeghtesad, "rouzeeghtesad.com", {
            selectors: {
                article: "#vo--postbody",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "time",
                },
                content: {
                    main: ".postxt",
                },
                category: {
                    selector: "ul.post-categories a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class namehnews extends clsScrapper {
    constructor() {
        super(enuDomains.namehnews, "namehnews.com", {
            selectors: {
                article: "#news-page-article",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#echo_detail > div:nth-child(1)",
                    ignoreNodeClasses: ["others-known"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb-list li a")
                },
                tags: ".article-tag a",           
            },
        })
    }
}

export class ecc extends clsScrapper {
    constructor() {
        super(enuDomains.ecc, "ecc.news", {
            selectors: {
                article: "article.m_al",
                title: "h1",
                subtitle: ".introtext",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".item-body",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.b_mb li a")
                },
                tags: ".c-stg ul li a",           
            },
        })
    }
}

export class akharinkhodro extends clsScrapper {
    constructor() {
        super(enuDomains.akharinkhodro, "akharinkhodro.ir", {
            selectors: {
                article: ".singleBody",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#singlePost",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li .comment-body "),
                    author: ".comment-author cite",
                    text: "p"
                },
                category: {
                    selector: "#singlePostCats a"
                },
                tags: "#singularTags a",           
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khodronevis extends clsScrapper {
    constructor() {
        super(enuDomains.khodronevis, "khodronevis.com", {
            selectors: {
                article: "body.single-news",
                title: "h1",
                subtitle: ".kn-single-lead",
                datetime: {
                    conatiner: ".post-time"
                },
                content: {
                    main: ".kn-content",
                    ignoreNodeClasses: ["kn-relation-posts", "kn-star-rating"]
                },
                category: {
                    selector: ".kn-s-categorys a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khodropluss extends clsScrapper {
    constructor() {
        super(enuDomains.khodropluss, "khodropluss.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta", "post-shortlink"],
                },
                tags: ".post-bottom-meta .tagcloud a",
                category: {
                    selector: "#breadcrumb a",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class tazenews extends clsScrapper {
    constructor() {
        super(enuDomains.tazenews, "tazenews.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".single-post-excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                tags: ".post-tags span a",
                category: {
                    selector: ".term-badges span a",
                },               
            },
        })
    }
}

export class eghtesadazad extends clsScrapper {
    constructor() {
        super(enuDomains.eghtesadazad, "eghtesadazad.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single--middle",
                    ignoreNodeClasses: ["related-news"],
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: "nav.breadcrumbs a",
                    startIndex: 1
                },               
            },
        })
    }
}

export class purson extends clsScrapper {
    constructor() {
        super(enuDomains.purson, "purson.ir", {
            selectors: {
                article: ".col-xl-7.col-md-8.bgColor-white",
                title: "h1",
                subtitle: ".content-lid",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content-body",
                    ignoreNodeClasses: ["moreRelatedContents-container"],
                },
                category: {
                    selector: ".border-bottom > li >a",
                },   
                tags: "ul.keyword li a"            
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class iranirooz extends clsScrapper {
    constructor() {
        super(enuDomains.iranirooz, "iranirooz.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".single-post-excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                tags: ".post-tags span a",
                category: {
                    selector: ".post-cat-wrap a",
                },               
            },
        })
    }
}

export class aftabno extends clsScrapper {
    constructor() {
        super(enuDomains.aftabno, "aftabno.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".excerpt-news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".the_content_body",
                    ignoreTexts: [/.*آخرین اخبار ورزشی.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li .comments"),
                    author: ".name_author span",
                    text: ".comment_text"
                },
                category: {
                    selector: ".cat_name a"
                }
            },
        })
    }
}

export class armanekerman extends clsScrapper {
    constructor() {
        super(enuDomains.armanekerman, "armanekerman.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("#docDivLead1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea article",
                    ignoreTexts: [/.*armanekerman.ir.*/]
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class ivnanews extends clsScrapper {
    constructor() {
        super(enuDomains.ivnanews, "ivnanews.ir", {
            selectors: {
                article: ".news-box",
                title: "h1",
                subtitle: ".news-lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".news-desc",
                },
                category: {
                    selector: ".bread-crumb ul li a",
                    lastIndex: 2
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class eslahatnews extends clsScrapper {
    constructor() {
        super(enuDomains.eslahatnews, "eslahatnews.com", {
            selectors: {
                article: ".post-content",
                title: "h1",
                summary: ".post-summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-text",
                },
                tags: "ul.tag-list li a",
                category: {
                    selector: "span.category-label",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class jeebnews extends clsScrapper {
    constructor() {
        super(enuDomains.jeebnews, "jeebnews.com", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta"],

                },
                tags: ".post-bottom-tags span a"
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class armanshargh extends clsScrapper {
    constructor() {
        super(enuDomains.armanshargh, "armanshargh.ir", {
            selectors: {
                article: ".single",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: ".the_time"
                },
                content: {
                    main: ".contentsingle",

                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class eghtesaad24 extends clsScrapper {
    constructor() {
        super(enuDomains.eghtesaad24, "eghtesaad24.ir", {
            selectors: {
                article: "#news",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".body",
                },
                category: {
                    selector: ".news_path a",
                },  
                comments: {
                    container: ".comments_container .comments_item",
                    author: ".comm_info_name",
                    text: ".comments"
                },
                tags: ".tags_title a"             
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class econews extends clsScrapper {
    constructor() {
        super(enuDomains.econews, "econews.ir", {
            selectors: {
                article: ".content-original article",
                title: "h1",
                summary: "p.content-summary",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".full-body",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ecofars extends clsScrapper {
    constructor() {
        super(enuDomains.ecofars, "ecofars.com", {
            selectors: {
                article: ".article-details",
                title: "h1",
                subtitle: ".single-tagline",
                datetime: {
                    conatiner: "header div div span",
                },
                content: {
                    main: ".content",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.ul-breadcrumb li span"),
                },  
                tags: "ul.tags li a"             
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class energypress extends clsScrapper {
    constructor() {
        super(enuDomains.energypress, "energypress.ir", {
            selectors: {
                article: ".single",
                title: "h1",
                subtitle: ".excerpt",
                summary: ".summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".item-text",
                    ignoreTexts: [/.*بیشتر بخوانید:.*/]
                },
                category: {
                    selector: ".the_category a",
                    lastIndex: 2
                },
                tags: ".tag h3 a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class atlaspress extends clsScrapper {
    constructor() {
        super(enuDomains.atlaspress, "atlaspress.news", {
            selectors: {
                article: "#singleArticle",
                title: "h1",
                subtitle: ".excerpt-news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#thecontent",
                },
                category: {
                    selector: "#singleMeta > ul > li:nth-child(2)"
                }
            },
        })
    }
}

export class khabarmachine extends clsScrapper {
    constructor() {
        super(enuDomains.khabarmachine, "khabarmachine.ir", {
            selectors: {
                article: ".maincontnt",
                title: "h1",
                subtitle: "h3.lead",
                datetime: {
                    conatiner: ".head-w >span:nth-child(2)"
                },
                content: {
                    main: ".ntextlink",
                },
                category: {
                    selector: ".head-w > span:nth-child(3)"
                },
                tags: "a.tags-detail"
            },
        })
    }
}

export class bazkhabar extends clsScrapper {
    constructor() {
        super(enuDomains.bazkhabar, "bazkhabar.ir", {
            selectors: {
                article: "#single",
                title: "h1",
                summary: ".news-summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["clearfix"]
                },
                tags: ".tags a",          
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class bloghnews extends clsScrapper {
    constructor() {
        super(enuDomains.bloghnews, "bloghnews.com", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead-left"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class behdasht extends clsScrapper {
    constructor() {
        super(enuDomains.behdasht, "behdasht.news", {
            selectors: {
                article: ".section-page-content",
                title: "h1",
                subtitle: ".text-short",
                datetime: {
                    conatiner: ".post-date"
                },
                content: {
                    main: ".desc-news",
                },
                category: {
                    selector: "#breadcrumbs a",
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class asbebokhar extends clsScrapper {
    constructor() {
        super(enuDomains.asbebokhar, "asbe-bokhar.com", {
            selectors: {
                article: ".single-post",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "p",
                    ignoreTexts: [/.*بیشتر بخوانید:.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li.comment"),
                    author: ".comment-author cite",
                    text: ".comment-body p"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".single-post-meta span:nth-child(3)"),
                },   
                tags: '.single-post-tag a'            
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kamapress extends clsScrapper {
    constructor() {
        super(enuDomains.kamapress, "kamapress.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["addtoany_share_save_container", "row-small", "single-page-company-label"],
                    ignoreTexts: [/.*بیشتر بخوانید:.*/]
                },
                comments: {
                    container: "ol.comment-list li article",
                    author: "cite.strong",
                    datetime: "time",
                    text: ".comment-content"
                },
                tags: "footer.entry-meta a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class parsfootball extends clsScrapper {
    constructor() {
        super(enuDomains.parsfootball, "parsfootball.com", {
            selectors: {
                article: "#single",
                title: "h1",
                subtitle: ".h11",
                summary: ".chekide",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb span span a"),
                    startIndex: 1
                },
                tags: ".tag a",          
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class pooyeonline extends clsScrapper {
    constructor() {
        super(enuDomains.pooyeonline, "pooyeonline.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle"
                },
                tags: ".tag h3 a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class payamefori extends clsScrapper {
    constructor() {
        super(enuDomains.payamefori, "payamefori.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".entry-sub-title",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "#breadcrumb a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class barghab extends clsScrapper {
    constructor() {
        super(enuDomains.barghab, "barghab.ir", {
            selectors: {
                article: ".post-content",
                title: "h1",
                aboveTitle: ".roti",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                tags: ".im-tag-items a",
                category: {
                    selector: ".nhi a",
                    startIndex: 1
                },               
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class aftokhabar extends clsScrapper {
    constructor() {
        super(enuDomains.aftokhabar, "aftokhabar.ir", {
            selectors: {
                article: ".content",
                title: "h1",
                aboveTitle: ".dtitle span",
                subtitle: ".h2",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: "#Descript",
                },
                comments: {
                    container: ".commentres ul li",
                    author: ".sender",
                    datetime: ".date",
                    text: "p"
                },  
                tags: ".tags ul li a",
                category: {
                    selector: ".headernews span.cat",
                },             
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kordtoday extends clsScrapper {
    constructor() {
        super(enuDomains.kordtoday, "kordtoday.com", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "header > ul > li:nth-child(2) > span"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".crumbs a",
                    startIndex: 1,
                    lastIndex: 3
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class jar extends clsScrapper {
    constructor() {
        super(enuDomains.jar, "jar.news", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["mini-posts-box", "tagcloud"],
                    ignoreTexts: ["برچسب ها"]
                },
                category: {
                    selector: ".entry-header span.post-cat-wrap a",
                },
                tags: ".tagcloud a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kurdistantv extends clsScrapper {
    constructor() {
        super(enuDomains.kurdistantv, "kurdistantv.net", {
            basePath: "/fa",
            selectors: {
                article: "[lang='fa'] .py-5 .my-5",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".fs-4"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a.btn-outline-secondary"),
                },
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/ku", "/kt"]
            }
        })
    }
}

export class asrehamoon extends clsScrapper {
    constructor() {
        super(enuDomains.asrehamoon, "asrehamoon.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead-left"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                    ignoreTexts: [/.*asrehamoon.ir.*/]
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class sobhesahel extends clsScrapper {
    constructor() {
        super(enuDomains.sobhesahel, "sobhesahel.com", {
            selectors: {
                article: ".news-content",
                aboveTitle: "h5",
                title: "h3",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".news-text",
                },
                category: {
                    selector: "a.cat-archive"
                },
            },
        })
    }
}

export class haje extends clsScrapper {
    constructor() {
        super(enuDomains.haje, "haje.ir", {
            selectors: {
                article: ".col-lg-12.col-md-12",
                title: "h1",
                datetime: {
                    conatiner: "#ctl00_lblDate"
                },
                content: {
                    main: ".full_story",
                },        
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class magiran extends clsScrapper {
    constructor() {
        super(enuDomains.magiran, "magiran.com", {
            selectors: {
                article: ".mi-article",
                title: "h2.mi-title",
                subtitle: ".mi-subtitle",
                datetime: {
                    conatiner: ".px-0.py-2 > span:nth-child(2)"
                },
                content: {
                    main: ".mi-body",
                },
                category: {
                    selector: "[itemprop='printColumn']",
                },
            },
        })
    }
}

export class hashtam extends clsScrapper {
    constructor() {
        super(enuDomains.hashtam, "8am.media", {
            basePath: "/fa",
            selectors: {
                article: "[lang='fa-AF'] body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content-inner",
                    ignoreNodeClasses: ["jeg_post_title"],
                    ignoreTexts: [/.*بیشتر بخوانید:.*/]
                },
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/uz", "/ps", "/eng"]
            }
        })
    }
}

export class hadese24 extends clsScrapper {
    constructor() {
        super(enuDomains.hadese24, "hadese24.ir", {
            selectors: {
                article: ".single-entry",
                title: ".single-entry-title h1",
                subtitle: "div:nth-child(1) > div.left > div.single-entry-text",
                datetime: {
                    conatiner: ".single-entry-detail > div:nth-child(1)"
                },
                content: {
                    main: ".single-entry-text",
                    ignoreTexts: [/.*حادثه 24 بخوانید.*/, /.*اینجا دنبال کنید.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment-list ul.comment li"),
                    author: ".comment-author",
                    datetime: ".comment-date",
                    text: ".comment-left"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#ContentPlaceHolder1_BreadCrumb div a"),
                    startIndex: 1
                },
                tags: ".news-single-category-items a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class lkiran extends clsScrapper {
    constructor() {
        super(enuDomains.lkiran, "lkiran.com", {
            selectors: {
                article: ".site-main",
                title: "h1",
                summary: "p.rowCard__description",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".articlePost",
                    ignoreNodeClasses: ["lk-star-rating"],
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: "a.dailyNewsPageHead__description--category"
                },
                tags: ".postTools__keywords a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}


export class football360 extends clsScrapper {
    constructor() {
        super(enuDomains.football360, "football360.ir", {
            selectors: {
                article: "main#container > div > article",
                title: "h1",
                subtitle: ".style_subTitle__mhoyP",
                datetime: {
                    conatiner: ".style_date__mK7oL"
                },
                content: {
                    main: ".style_content__eIj8G",
                },
                tags: "a[rel='tag']",         
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/matches", "/player", "/team", "/league", "/predictions", "/videos"]
            }
        })
    }
}

export class passgoal extends clsScrapper {
    constructor() {
        super(enuDomains.passgoal, "passgoal.news", {
            selectors: {
                article: "body.news",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".newsId_time time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#echo_detail",
                    ignoreNodeClasses: ["short_link_share", "article_tag"]
                },      
                tags: ".article_tag a",       
            },
        })
    }
}

export class pezeshket extends clsScrapper {
    constructor() {
        super(enuDomains.pezeshket, "pezeshket.com", {
            basePath: "/?s",
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                    ignoreNodeClasses: ["elementor-toc--minimized-on-tablet"],
                    ignoreTexts: [/.*مطالعه بیشتر:.*/, /.*در پزشکت.*/, /.*توسط پزشک آنلاین.*/, /.*<img.*/]
                },
                category: {
                    selector: "#breadcrumbs span span a",
                    startIndex: 1
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class daryanews extends clsScrapper {
    constructor() {
        super(enuDomains.daryanews, "daryanews.ir", {
            selectors: {
                article: ".ap-single",
                aboveTitle: ".catpo",
                title: "h1",
                subtitle: ".excerpt .tttl",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".breadpo a"
                },
                tags: "footer.entry-meta a",         
            },
        })
    }
}


export class hormozgantoday extends clsScrapper {
    constructor() {
        super(enuDomains.hormozgantoday, "hormozgantoday.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "header > ul > li:nth-child(2) > span"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".crumbs a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a")
            },
        })
    }
}

export class khoorna extends clsScrapper {
    constructor() {
        super(enuDomains.khoorna, "khoorna.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                summary: ".entry-summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".cat-links a"
                },
                tags: ".tag-links a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class psarena extends clsScrapper {
    constructor() {
        super(enuDomains.psarena, "psarena.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".jeg_post_subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["jeg_post_tags", "row-small", "jeg_share_bottom_container"],
                    ignoreTexts: [/.*IRPP.*/, /.*مطلب مرتبط:.*/]
                },
                comments: {
                    container: "ol.commentlist li.comment .comment-body",
                    author: ".comment-author cite",
                    text: ".comment-content"
                },
                category: {
                    selector: ".jeg_meta_category span a",
                    lastIndex: 1
                },
                tags: ".jeg_post_tags a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kheiriran extends clsScrapper {
    constructor() {
        super(enuDomains.kheiriran, "kheiriran.ir", {
            selectors: {
                article: "main.article",
                title: ".article-title",
                summary: ".article-description",
                datetime: {
                    conatiner: ".p-2.mb-4 > span.dark-gray.font-normal"
                },
                content: {
                    main: ".article-content",
                },
                category: {
                    selector: ".article-categories a"
                },
                tags: ".post-tags a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class theater extends clsScrapper {
    constructor() {
        super(enuDomains.theater, "theater.ir", {
            selectors: {
                article: "#content",
                aboveTitle: "h6",
                title: "h1",
                summary: "p.summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("footer > div > time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article > div:nth-child(3), article > div:nth-child(4)",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb li a")
                },
                tags: ".tags a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ketabnews extends clsScrapper {
    constructor() {
        super(enuDomains.ketabnews, "ketabnews.com", {
            selectors: {
                article: ".sliderInformations",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".sliderTitle"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='DC.Date.Created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("/").reverse().join("/") || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".sliderInformations"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".customNewsList > div.inner > div > a"),         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class faramedia extends clsScrapper {
    constructor() {
        super(enuDomains.faramedia, "faramedia.co", {
            selectors: {
                article: "body.single-post",
                title: "h1, .entry-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article.rd-post-content",
                    ignoreNodeClasses: ["su-tabs"]
                },
                comments: {
                    container: "ol.comment-list li .comment",
                    author: ".author-link cite",
                    text: ".comment-content"
                },
                category: {
                    selector: "ul.rd-breadcrumbs li a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: "ul.rd-tags li a",         
            },
        })
    }
}

export class honarguilan extends clsScrapper {
    constructor() {
        super(enuDomains.honarguilan, "honarguilan.ir", {
            selectors: {
                article: "article.full-story",
                title: "h1",
                datetime: {
                    conatiner: ".full-date"
                },
                content: {
                    main: ".news-text",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#speed-bar a")
                },
                tags: ".fulltags span a",         
            },
        })
    }
}

export class honarnews extends clsScrapper {
    constructor() {
        super(enuDomains.honarnews, "honarnews.com", {
            selectors: {
                article: "#doc_content",
                title: "#docDiv3TitrMain",
                subtitle: "#docDivLeadTitle",
                datetime: {
                    conatiner: "#docDiv3Date"
                },
                content: {
                    main: "#doc_div33",
                },
                category: {
                    selector: "#docDiv1Menu1 span a"
                },
            },
        })
    }
}

export class voiceart extends clsScrapper {
    constructor() {
        super(enuDomains.voiceart, "voiceart.ir", {
            selectors: {
                article: ".conte",
                title: "h2.title",
                datetime: {
                    conatiner: "span:nth-child(5)",
                },
                content: {
                    main: ".con",
                },
                category: {
                    selector: "a[rel='category tag']"
                },         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class vaghteshomal extends clsScrapper {
    constructor() {
        super(enuDomains.vaghteshomal, "vaghteshomal.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle"
                },
                category: {
                    selector: ".the_category a"
                },
                tags: ".tag h3 a"
            },
        })
    }
}

export class harfonline extends clsScrapper {
    constructor() {
        super(enuDomains.harfonline, "harfonline.ir", {
            selectors: {
                article: ".ap-single",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: "a[rel='category tag']"
                },
                tags: "footer.entry-meta a",         
            },
        })
    }
}

export class mojerasa extends clsScrapper {
    constructor() {
        super(enuDomains.mojerasa, "mojerasa.ir", {
            selectors: {
                article: "article.article-content",
                aboveTitle: ".entry-titr__header",
                title: "h1",
                subtitle: ".lidenews",
                datetime: {
                    conatiner: ".entry__meta_date_special"
                },
                content: {
                    main: "#content_news p",
                    ignoreTexts: [/.*doctype.*/]
                },
                category: {
                    selector: "a.post-cat"
                },
            },
        })
    }
}

export class ofoghjonoub extends clsScrapper {
    constructor() {
        super(enuDomains.ofoghjonoub, "ofoghjonoub.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[rel='tag']"),         
            },
        })
    }
}

export class avadiplomatic extends clsScrapper {
    constructor() {
        super(enuDomains.avadiplomatic, "avadiplomatic.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".rd-date",
                },
                content: {
                    main: ".rd-post-content",
                },
                category: {
                    selector: "ul.rd-breadcrumbs li a",
                    startIndex: 1,
                    lastIndex: 3
                },
            },
        })
    }
}

export class irdiplomacy extends clsScrapper {
    constructor() {
        super(enuDomains.irdiplomacy, "irdiplomacy.ir", {
            selectors: {
                article: ".article-view",
                aboveTitle: "h3",
                title: "h1",
                summary: ".summary",
                datetime: {
                    conatiner: ".date-info",
                },
                content: {
                    main: ".content",
                },
                category: {
                    selector: ".meta-info span.label a",
                },
                tags: ".tags a"
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class rcs extends clsScrapper {
    constructor() {
        super(enuDomains.rcs, "rcs.ir", {
            selectors: {
                article: ".news-view",
                aboveTitle: "h6",
                title: "h4",
                subtitle: ".lead-t",
                datetime: {
                    conatiner: ".NewsDate",
                },
                content: {
                    main: ".bc-news > .col-md-12",
                },
                tags: "ul.tag-container li a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khuzpress extends clsScrapper {
    constructor() {
        super(enuDomains.khuzpress, "khuzpress.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".leadBox",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".Post-Content",
                },
                category: {
                    selector: "ul.post-categories li a",
                    lastIndex: 2
                },
                tags: ".post-tags a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class alnajm extends clsScrapper {
    constructor() {
        super(enuDomains.alnajm, "alnajm.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "a.post-cat",
                    lastIndex: 2
                },
            },
        })
    }
}

export class karotech extends clsScrapper {
    constructor() {
        super(enuDomains.karotech, "karo.tech", {
            selectors: {
                article: "#single-page",
                title: "h1",
                datetime: {
                    conatiner: "#single-post-meta > div > span:nth-child(2)"
                },
                content: {
                    main: "#single-post-content",
                },
                category: {
                    selector: "#single-post-meta > div > a",
                },
                tags: ".single-tags a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class sokannews extends clsScrapper {
    constructor() {
        super(enuDomains.sokannews, "sokannews.ir", {
            selectors: {
                article: "section.single",
                title: "h2.single-post-title",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content .con",
                },
                category: {
                    selector: ".meta-cat a",
                },
                tags: ".tag a"
            },
        })
    }
}

export class evjaj extends clsScrapper {
    constructor() {
        super(enuDomains.evjaj, "evjaj.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                    ignoreNodeClasses: ["lwptoc", "crp_related"]
                },
                category: {
                    selector: "a.category",
                },
            },
        })
    }
}

export class sarpoosh extends clsScrapper {
    constructor() {
        super(enuDomains.sarpoosh, "sarpoosh.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[itemprop='datePublished']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[itemprop='articleBody'] > div:nth-child(1)",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".brdcrm a"),
                },
            },
        })
    }
}

export class ariamoons extends clsScrapper {
    constructor() {
        super(enuDomains.ariamoons, "ariamoons.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post_content",
                },
                category: {
                    selector: ".single_meta_category a",
                },
            },
        })
    }
}

export class haftgard extends clsScrapper {
    constructor() {
        super(enuDomains.haftgard, "haftgard.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                summary: "p.summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".item-text",
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: ".tagcloud a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class chekad extends clsScrapper {
    constructor() {
        super(enuDomains.chekad, "chekad.tv", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: "h4",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content p",
                    ignoreTexts: [/.*بیشتر بخوانید:.*/]
                },
                category: {
                    selector: "ul.bf-breadcrumb-items li a span"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class naftonline extends clsScrapper {
    constructor() {
        super(enuDomains.naftonline, "naftonline.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead-left"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class tccim extends clsScrapper {
    constructor() {
        super(enuDomains.tccim, "news.tccim.ir", {
            selectors: {
                article: ".col-md-8.mb-5",
                title: "h7",
                subtitle: "h3",
                summary: ".pb-2.pt-4",
                datetime: {
                    conatiner: ".share-link-box ol.breadcrumb li:nth-child(1)"
                },
                content: {
                    main: ".col-md-12.wow.fadeInUp.text-justify",
                }, 
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class golvani extends clsScrapper {
    constructor() {
        super(enuDomains.golvani, "golvani.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author",
                    text: ".wpd-comment-text"
                },
                category: {
                    selector: "ul.bf-breadcrumb-items li a span"
                },
                tags: ".post-tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class filcin extends clsScrapper {
    constructor() {
        super(enuDomains.filcin, "filcin.com", {
            selectors: {
                article: ".col-md-8  .news-main-contt-tpl-nyn05",
                title: "h1",
                subtitle: "h2",
                datetime: {
                    conatiner: ".details-nyn05 ul li span"
                },
                content: {
                    main: ".contex-nyn05",
                    ignoreNodeClasses: ["tags-tpl-nyn05"]
                },
                tags: ".tags-tpl-nyn05 a"
            },
        })
    }
}

export class ilamrouydad extends clsScrapper {
    constructor() {
        super(enuDomains.ilamrouydad, "ilamrouydad.ir", {
            selectors: {
                article: ".txtMain",
                aboveTitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".h30"),
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h2"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".rel.pull-left.ltr"),
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".txtMain"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a.tags")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ilamebidar extends clsScrapper {
    constructor() {
        super(enuDomains.ilamebidar, "ilamebidar.ir", {
            selectors: {
                article: ".post-body",
                aboveTitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h6"),
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".w-full.p-3.mt-3"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".p-3 .mr-3"),
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-body"),
                },
                category: { 
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".ml-3.date") 
                }
            },
        })
    }
}

export class ilamrasaneh extends clsScrapper {
    constructor() {
        super(enuDomains.ilamrasaneh, "ilamrasaneh.ir", {
            selectors: {
                article: ".conte",
                aboveTitle: ".rotitle",
                title: "h2.title",
                subtitle: ".lead",
                datetime: {
                    conatiner: "span:nth-child(5)",
                },
                content: {
                    main: ".con",
                },
                category: {
                    selector: "a[rel='category tag']"
                },         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class hadeseilam extends clsScrapper {
    constructor() {
        super(enuDomains.hadeseilam, "hadeseilam.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "header > ul > li:nth-child(2) > span"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".crumbs a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a")
            },
        })
    }
}

export class ofoghilam extends clsScrapper {
    constructor() {
        super(enuDomains.ofoghilam, "ofoghilam.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle"
                },
                tags: ".tag h3 a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class yaftenews extends clsScrapper {
    constructor() {
        super(enuDomains.yaftenews, "yaftenews.ir", {
            selectors: {
                article: ".item-page",
                aboveTitle: "[itemprop='rotitr']",
                title: "h2",
                subtitle: "[itemprop='zirtitr']",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || el.textContent?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[itemprop='articleBody']",
                },
                comments: {
                    container: ".comments-list div",
                    author: ".comment-author",
                    datetime: ".comment-date",
                    text: ".comment-body"
                },
                category: {
                    selector: "[itemprop='genre']",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class varknews extends clsScrapper {
    constructor() {
        super(enuDomains.varknews, "varknews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                summary: ".short-content",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: ".full-content",
                },
                category: {
                    selector: ".the-cat a",
                    lastIndex: 2
                },
                tags: ".post-tags .footer ul li a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class safirelorestan extends clsScrapper {
    constructor() {
        super(enuDomains.safirelorestan, "safirelorestan.ir", {
            selectors: {
                article: ".item-page",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[itemprop='articleBody']",
                },
                category: {
                    selector: "[itemprop='genre']",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khoramabadfarda extends clsScrapper {
    constructor() {
        super(enuDomains.khoramabadfarda, "khoramabadfarda.ir", {
            selectors: {
                article: ".item-page",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10)|| "NO_DATE"
                },
                content: {
                    main: "[itemprop='articleBody'] .entry",
                },
                category: {
                    selector: "[itemprop='genre']",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class abadannews extends clsScrapper {
    constructor() {
        super(enuDomains.abadannews, "abadannews.com", {
            selectors: {
                article: "#PrintArea",
                title: "h1",
                summary: ".item-summary",
                datetime: {
                    conatiner: ".item-date > ul > li > span"
                },
                content: {
                    main: "[align='center'] > div > #printarea2 > .item-body > .item-text",
                    ignoreNodeClasses: ["news-text"],
                    ignoreTexts: [/.*گفتمانی آبادان نیوز.*/]

                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb font"),
                    startIndex: 1
                },
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class avaalborznews extends clsScrapper {
    constructor() {
        super(enuDomains.avaalborznews, "avaalborznews.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle h5, .contentsingle p",
                    ignoreTexts: [/.*بخوانید....*/]
                },
                tags: "a[rel='tag']"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class alborzvarzeshi extends clsScrapper {
    constructor() {
        super(enuDomains.alborzvarzeshi, "alborzvarzeshi.com", {
            selectors: {
                article: ".single-post",
                aboveTitle: ".post-title-area > a",
                title: "h2.post-title",
                subtitle: ".pull-left",
                datetime: {
                    conatiner: ".post-meta ul li:nth-child(2) span",
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["pull-left"]
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class boyernews extends clsScrapper {
    constructor() {
        super(enuDomains.boyernews, "boyernews.com", {
            selectors: {
                article: ".panel-default",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content",
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class kebnanews extends clsScrapper {
    constructor() {
        super(enuDomains.kebnanews, "kebnanews.ir", {
            selectors: {
                article: "#docDataRow",
                aboveTitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("#docDiv3TitrRou"),
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("#docDivp3"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#doctextarea",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
                tags: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tag_p a")
            },
        })
    }
}

export class raaknews extends clsScrapper {
    constructor() {
        super(enuDomains.raaknews, "raaknews.com", {
            selectors: {
                article: ".text_title",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".text_short"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".text_date")
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".hbox4_cont"),
                    ignoreNodeClasses: ["text_short"],
                    ignoreTexts: [/.*اخبار مرتبط:.*/, /.*اشتراک گزاری.*/]
                },
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class diyareaftab extends clsScrapper {
    constructor() {
        super(enuDomains.diyareaftab, "diyareaftab.ir", {
            selectors: {
                article: ".content.into",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: ".date-into"
                },
                content: {
                    main: ".news-text",
                },
                category: {
                    selector: ".breadcrumb li a",
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class faslejonoob extends clsScrapper {
    constructor() {
        super(enuDomains.faslejonoob, "faslejonoob.ir", {
            basePath: "/?s",
            selectors: {
                article: "body.single-post",
                aboveTitle: ".hed_title",
                title: "h1",
                subtitle: ".short_desck_body",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".news_article_body",
                },
                tags: ".footer-single a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class msrt extends clsScrapper {
    constructor() {
        super(enuDomains.msrt, "msrt.ir", {
            selectors: {
                article: ".article-view",
                title: "h1",
                summary: ".summary",
                datetime: {
                    conatiner: ".date-info",
                },
                content: {
                    main: ".content",
                },
                tags: ".tags a"
            },
            url: {
                extraInvalidStartPaths: ["/en"]
            }
        })
    }
}

export class hamedanonline extends clsScrapper {
    constructor() {
        super(enuDomains.hamedanonline, "hamedanonline.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".post-cat-wrap a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class fardayekerman extends clsScrapper {
    constructor() {
        super(enuDomains.fardayekerman, "fardayekerman.ir", {
            selectors: {
                article: "article.article",
                aboveTitle: ".kicker",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".article-body",
                },
                category: {
                    selector: ".article-category-link",
                    lastIndex: 1
                },
                tags: ".tag-items .tag a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kermaneno extends clsScrapper {
    constructor() {
        super(enuDomains.kermaneno, "kermaneno.ir", {
            selectors: {
                article: "body.single-post",
                aboveTitle: "h2",
                title: "h1",
                summary: ".single-post-excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["bs-irp"]
                },
                category: {
                    selector: "ul.bf-breadcrumb-items li a span"
                },
                tags: ".post-tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class esfahanzibaonline extends clsScrapper {
    constructor() {
        super(enuDomains.esfahanzibaonline, "esfahanzibaonline.ir", {
            selectors: {
                article: "body.single-post",
                aboveTitle: "h5",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".col-6.col-md-8 span span a"
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class asreesfahannews extends clsScrapper {
    constructor() {
        super(enuDomains.asreesfahannews, "asreesfahannews.ir", {
            selectors: {
                article: "body.single-post",
                aboveTitle: "h2",
                title: "h1",
                subtitle: ".lead_news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content_news_entry",
                    ignoreNodeClasses: ["tags", "content_news_info"]
                },
                category: {
                    selector: ".single_news_cat a"
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class sahebnews extends clsScrapper {
    constructor() {
        super(enuDomains.sahebnews, "sahebnews.ir", {
            selectors: {
                article: ".single",
                aboveTitle: "h5",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "div.box-title.text-right > h4 > span > span > a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class esfahanshargh extends clsScrapper {
    constructor() {
        super(enuDomains.esfahanshargh, "esfahanshargh.ir", {
            selectors: {
                article: ".single-news",
                aboveTitle: ".rutitr",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-content",
                },
                category: {
                    selector: ".breadcrumb_last"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class nedayeesfahan extends clsScrapper {
    constructor() {
        super(enuDomains.nedayeesfahan, "nedayeesfahan.ir", {
            selectors: {
                article: ".content_news",
                aboveTitle: ".n-title1",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".single-excerpt"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".content_news"),
                    ignoreNodeClasses: ["tags", "relatedulbox"],
                    ignoreTexts: ["مطالب مرتبط"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[typeof='v:Breadcrumb'] a")
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class esfahanemrooz extends clsScrapper {
    constructor() {
        super(enuDomains.esfahanemrooz, "esfahanemrooz.ir", {
            selectors: {
                article: "body.news",
                aboveTitle: "h2",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "time.news_time",
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".echo_detail",
                },
                category: {
                    selector: ".li_item a"
                },
                tags: ".article_tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class yazdfarda extends clsScrapper {
    constructor() {
        super(enuDomains.yazdfarda, "yazdfarda.ir", {
            selectors: {
                article: "section.single",
                aboveTitle: ".subtitle",
                title: "h2.single-post-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                    ignoreNodeClasses: ["page-bottom"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[rel='category tag']"),
                },
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class gozareshekhabar extends clsScrapper {
    constructor() {
        super(enuDomains.gozareshekhabar, "gozareshekhabar.ir", {
            selectors: {
                article: ".content-page-container.container-xl.pt-4",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content-body",
                    ignoreNodeClasses: ["moreRelatedContents-container"]
                },
                category: {
                    selector: ".mb-md-0 > div:nth-child(1) > div > a"
                },
                tags: ".keyword li a"
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class nournews extends clsScrapper {
    constructor() {
        super(enuDomains.nournews, "nournews.ir", {
            selectors: {
                article: "#Body_Body_lblNewsBody",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("._Desc"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[itemprop='datePublished']"),
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("content")?.split(/\/| /)
                        if (!date) return "NO_DATE";
                        return date[2] + "/" + date[0] + "/" + date[1] || "NO_DATE";
                    }
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#Body_Body_lblNewsBody"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#Body_Body_news_Tags_lblTag a")
            },
            url: {
                extraInvalidStartPaths: ["/ar", "/en", "/he", "/ru", "/zh"],
            }
        })
    }

    protected normalizePath(url: URL): string {
        if (url.pathname.includes("/news") && !url.pathname.includes("/fa")) {
            return url.protocol + "//" + url.hostname + "/fa" + url.pathname 
        } else
            return url.toString()
    }
}

export class roozgarpress extends clsScrapper {
    constructor() {
        super(enuDomains.roozgarpress, "roozgarpress.ir", {
            selectors: {
                article: "article.post-box-single",
                aboveTitle: "h2",
                title: "h1",
                subtitle: "h3",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                },
                category: {
                    selector: ".post-info ul li a",
                    lastIndex: 2
                },
                tags: "ul.post-tags li a"
            },
        })
    }
}

export class perspolisnews extends clsScrapper {
    constructor() {
        super(enuDomains.perspolisnews, "perspolisnews.com", {
            selectors: {
                article: "section.single",
                title: "h2.single-post-title",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content .con",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .wpd-comment"),
                    author: ".wpd-comment-wrap .wpd-comment-right .wpd-comment-author",
                    text: " .wpd-comment-wrap .wpd-comment-right .wpd-comment-text"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb ul li a"),
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class sobheqazvin extends clsScrapper {
    constructor() {
        super(enuDomains.sobheqazvin, "sobheqazvin.ir", {
            selectors: {
                article: ".newsdetails",
                aboveTitle: "h3",
                title: "h1",
                subtitle: ".ndlead",
                datetime: {
                    conatiner: "h6",
                    splitter: (el: HTMLElement) => {
                        const date = el.innerText;
                        console.log(el.innerText)
                        if (date) {
                            const newDate = date.match(/[۰-۹]{4}\/[۰-۹]{1,2}\/[۰-۹]{1,2}/);
                            console.log(newDate)
                            if (!newDate) return "DATE NOT FOUND"
                            return newDate[0];
                        } else
                            return "DATE NOT FOUND"
                    },
                },
                content: {
                    main: ".ndcontent",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class mardomenoonline extends clsScrapper {
    constructor() {
        super(enuDomains.mardomenoonline, "mardomenoonline.ir", {
            selectors: {
                article: ".cont-s",
                title: "h2",
                subtitle: ".le p",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".cone",
                },
                category: {
                    selector: "[rel='category tag']",
                },
                tags: ".tag a"
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class shirintanz extends clsScrapper {
    constructor() {
        super(enuDomains.shirintanz, "shirintanz.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                tags: ".tags p a"
            },
        })
    }
}

export class vaghtesobh extends clsScrapper {
    constructor() {
        super(enuDomains.vaghtesobh, "vaghtesobh.ir", {
            selectors: {
                article: "body.news",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: ".article_header time",
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#echo_details",
                },
                category: {
                    selector: "ul.breadcrumb_list li a"
                },
                tags: ".article_tag ul li a"
            },
        })
    }
}

export class afghanwomennews extends clsScrapper {
    constructor() {
        super(enuDomains.afghanwomennews, "afghanwomennews.com", {
            selectors: {
                article: "section.single",
                aboveTitle: ".text-sin",
                title: "h1",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".con",
                    ignoreNodeClasses: ["page-bottom"]
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
        })
    }
}

export class navajonob extends clsScrapper {
    constructor() {
        super(enuDomains.navajonob, "navajonob.ir", {
            selectors: {
                article: ".p_item",
                title: ".title",
                subtitle:  ".subtitle",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: ".stext",
                },
                category: {
                    selector: ".cat a",
                    lastIndex: 2
                },
            },
        })
    }
}

export class oshida extends clsScrapper {
    constructor() {
        super(enuDomains.oshida, "oshida.ir", {
            selectors: {
                article: "#doc_content",
                aboveTitle: "#docDiv3TitrRou",
                title: "#docDiv3TitrMain",
                subtitle: "#docDiv4LeadTitle",
                datetime: {
                    conatiner: "#docDiv3Date span"
                },
                content: {
                    main: "#doc_div33",
                },
                category: {
                    selector: "#docDiv1Menu span",
                    startIndex: 1
                },
            },
        })
    }
}

export class mirmalas extends clsScrapper {
    constructor() {
        super(enuDomains.mirmalas, "mirmalas.com", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "header > ul > li:nth-child(2) > span"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".crumbs a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a")
            },
        })
    }
}

export class saednews extends clsScrapper {
    constructor() {
        super(enuDomains.saednews, "saednews.com", {
            selectors: {
                article: ".mx-md--3",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: ".p-3.mb-3.text-warning",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content-wrapper",
                    ignoreNodeClasses: ["r-col-v"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb-item"),
                    lastIndex: 2
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".px-1.px-md-3 a")
            },
        })
    }
}

export class itnanews extends clsScrapper {
    constructor() {
        super(enuDomains.itnanews, "itnanews.com", {
            selectors: {
                article: ".right-news-single",
                title: "h1",
                datetime: {
                    conatiner: ".post-detail > div:nth-child(2) > div.post-detail-txt",
                },
                content: {
                    main: ".single-txt",
                    ignoreTexts: [/.*<img.*/]
                },
                tags: "[rel='tag']"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class turkmensesi extends clsScrapper {
    constructor() {
        super(enuDomains.turkmensesi, "turkmensesi.net", {
            selectors: {
                article: ".item-page",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[itemprop='articleBody']",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb li a"),
                },
            },
        })
    }
}

export class turkmensnews extends clsScrapper {
    constructor() {
        super(enuDomains.turkmensnews, "turkmensnews.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-txt",
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: ".post-category a",
                },
                tags: ".tags-link a"
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/تورکمنچه", "/turkce", "/turkmeni", "/latin"]
            }
        })
    }
}

export class sobheqtesad extends clsScrapper {
    constructor() {
        super(enuDomains.sobheqtesad, "sobh-eqtesad.ir", {
            selectors: {
                article: "section.single",
                aboveTitle: ".text-sin",
                title: "h2.single-post-title",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".con",
                    ignoreNodeClasses: ["page-bottom"]
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class eghtesadbazar extends clsScrapper {
    constructor() {
        super(enuDomains.eghtesadbazar, "eghtesadbazar.ir", {
            selectors: {
                article: ".item-page",
                aboveTitle: ".item-supertitle",
                title: "h1",
                subtitle: ".articleIntro",
                datetime: {
                    conatiner: ".item-info-date .item-info-value"
                },
                content: {
                    main: "[itemprop='articleBody']",
                },
            },
        })
    }
}

export class faryadenahavand extends clsScrapper {
    constructor() {
        super(enuDomains.faryadenahavand, "faryadenahavand.ir", {
            selectors: {
                article: ".item-page",
                title: "h2",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: "[itemprop='articleBody']",
                },
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class avayseyedjamal extends clsScrapper {
    constructor() {
        super(enuDomains.avayseyedjamal, "avayseyedjamal.ir", {
            selectors: {
                article: ".custom_content_container",
                aboveTitle: ".field-name-field-rutitr",
                title: ".nodeHeader a",
                subtitle: ".node-subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("[property='dc:date dc:created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".field-name-body .field-item.even",
                },
                tags: ".field-name-field-tags .field-items .field-item",
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class neshateshahr extends clsScrapper {
    constructor() {
        super(enuDomains.neshateshahr, "neshateshahr.ir", {
            selectors: {
                article: "section.news-col-2",
                aboveTitle: ".rutitr",
                title: "h2",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: ".news-publishdate"
                },
                content: {
                    main: ".body"
                },
                tags: "a.tags_item"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class avayefamenin extends clsScrapper {
    constructor() {
        super(enuDomains.avayefamenin, "avayefamenin.ir", {
            selectors: {
                article: ".custom_content_container",
                aboveTitle: ".field-name-field-rutitr",
                title: ".nodeHeader a",
                subtitle: ".node-subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("[property='dc:date dc:created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".field-name-body .field-item.even",
                },
                tags: ".field-name-field-tags .field-items .field-item",
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class abtaab extends clsScrapper {
    constructor() {
        super(enuDomains.abtaab, "abtaab.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[data-widget_type='theme-post-content.default']",
                },

            },
        })
    }
}

export class naghsheeghtesadonline extends clsScrapper {
    constructor() {
        super(enuDomains.naghsheeghtesadonline, "naghsheeghtesadonline.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".td-post-date time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".td-post-content",
                },
                category: {
                    selector: "a.entry-crumb",
                },
                tags: "ul.td-tags li a"
            },
        })
    }
}

export class shaer extends clsScrapper {
    constructor() {
        super(enuDomains.shaer, "shaer.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container",
                },
                category: {
                    selector: "#breadcrumbs span span a",
                    startIndex: 1
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khateshomal extends clsScrapper {
    constructor() {
        super(enuDomains.khateshomal, "khateshomal.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: "[rel='category tag']",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class yaghoutnews extends clsScrapper {
    constructor() {
        super(enuDomains.yaghoutnews, "yaghoutnews.ir", {
            selectors: {
                article: "body.single-post",
                aboveTitle: "h2",
                title: "h1",
                subtitle: ".lead_news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content_news_entry",
                    ignoreNodeClasses: ["tags", "content_news_info"]
                },
                category: {
                    selector: ".single_news_cat a"
                },
                tags: ".tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class lisna extends clsScrapper {
    constructor() {
        super(enuDomains.lisna, "lisna.ir", {
            selectors: {
                article: "div[style='direction: right;']",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".news_pdate_c")
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".body"),
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path p")
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.tags li a")
            },
        })
    }
}

export class khabaresabzevaran extends clsScrapper {
    constructor() {
        super(enuDomains.khabaresabzevaran, "khabaresabzevaran.ir", {
            selectors: {
                article: "#single-main",
                aboveTitle: "small",
                title: "h2",
                subtitle:  ".brief",
                datetime: {
                    conatiner: ".date",
                },
                content: {
                    main: ".body",
                },
                category: {
                    selector: ".bread-crumb span",
                },
                tags: ".news-tags a"
            },
        })
    }
}

export class goldashtkerman extends clsScrapper {
    constructor() {
        super(enuDomains.goldashtkerman, "goldashtkerman.ir", {
            selectors: {
                article: ".ap-single",
                aboveTitle: ".catpo",
                title: "h1",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                    ignoreNodeClasses: ["tag"]
                },
                category: {
                    selector: "a[rel='category tag']"
                },
                tags: ".tag a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class bazideraz1404 extends clsScrapper {
    constructor() {
        super(enuDomains.bazideraz1404, "bazideraz1404.ir", {
            selectors: {
                article: ".mt-3.mt-md-0 .bg-white.p-3",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: ".col span:nth-child(3)"
                },
                content: {
                    main: ".post-body",
                },
                category: {
                    selector: ".date.ml-3"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class avayeseymare extends clsScrapper {
    constructor() {
        super(enuDomains.avayeseymare, "avayeseymare.ir", {
            selectors: {
                article: ".conte",
                aboveTitle: ".rotitle",
                title: "h2.title",
                subtitle: ".leaad",
                datetime: {
                    conatiner: "span:nth-child(5)",
                },
                content: {
                    main: ".con",
                },
                category: {
                    selector: "a[rel='category tag']"
                },         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class diyareayyar extends clsScrapper {
    constructor() {
        super(enuDomains.diyareayyar, "diyareayyar.ir", {
            selectors: {
                article: ".col-md-10 section.single",
                aboveTitle: ".text-sin",
                title: "h1.single-post-title",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".con",
                    ignoreNodeClasses: ["yarpp"]
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
        })
    }
}

export class poyeshgarangil extends clsScrapper {
    constructor() {
        super(enuDomains.poyeshgarangil, "poyeshgarangil.ir", {
            selectors: {
                article: ".single",
                aboveTitle: ".rootitr",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle"
                },
                category: {
                    selector: ".the_category a"
                },
                tags: ".tag h3 a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class basirat extends clsScrapper {
    constructor() {
        super(enuDomains.basirat, "basirat.ir", {
            selectors: {
                article: "div[style='direction: rtl;']",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".body"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".news_path a")
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags_title a")
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/en", "/ar"]
            }
        })
    }
}

export class sharghnegar extends clsScrapper {
    constructor() {
        super(enuDomains.sharghnegar, "sharghnegar.ir", {
            selectors: {
                article: ".content",
                aboveTitle: ".rotitr",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: "a[rel='category tag']"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-tag a"),         
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class yazeco extends clsScrapper {
    constructor() {
        super(enuDomains.yazeco, "yazeco.ir", {
            selectors: {
                article: ".content",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: "a[rel='category tag']"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class shahr20 extends clsScrapper {
    constructor() {
        super(enuDomains.shahr20, "shahr20.ir", {
            selectors: {
                article: "section.single",
                title: "h2.single-post-title",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".con",
                    ignoreNodeClasses: ["page-bottom"]
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class roshanayrah extends clsScrapper {
    constructor() {
        super(enuDomains.roshanayrah, "roshanayrah.ir", {
            selectors: {
                article: ".single-news",
                aboveTitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".single-news > i"),
                title: "h2",
                subtitle:  ".lid",
                datetime: {
                    conatiner: ".meta > span:nth-child(2)"
                },
                content: {
                    main: ".content",
                },
            },
        })
    }
}

export class quskonline extends clsScrapper {
    constructor() {
        super(enuDomains.quskonline, "quskonline.ir", {
            selectors: {
                article: ".single",
                aboveTitle: ".rootitr",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle"
                },
                category: {
                    selector: ".the_category a"
                },
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class bamemeybod extends clsScrapper {
    constructor() {
        super(enuDomains.bamemeybod, "bamemeybod.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1.jeg_post_title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content-inner",
                    ignoreNodeClasses: ["jeg_post_tags"]
                },
                category: {
                    selector: "#breadcrumbs span a",
                    startIndex: 1
                },
                tags: ".jeg_post_tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class qartalnews extends clsScrapper {
    constructor() {
        super(enuDomains.qartalnews, "qartalnews.ir", {
            selectors: {
                article: ".post-content",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: ".breadcrumb > li:nth-child(6)"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: ".breadcrumb > a",
                    startIndex: 1
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class qalampress extends clsScrapper {
    constructor() {
        super(enuDomains.qalampress, "qalampress.ir", {
            selectors: {
                article: "section.single",
                aboveTitle: ".text-sin",
                title: "h1",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".con",
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class iran361 extends clsScrapper {
    constructor() {
        super(enuDomains.iran361, "361iran.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".desc_news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".news_content",
                },
                category: {
                    selector: "ol.breadcrumb a"
                },
                tags: ".tag_wrap a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class khabareshahr extends clsScrapper {
    constructor() {
        super(enuDomains.khabareshahr, "khabareshahr.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".excerpt-news",
                datetime: {
                    conatiner: ".news_date_c"
                },
                content: {
                    main: ".the_content_body",
                },
                category: {
                    selector: ".cat_name a"
                },
                tags: ".news-tag-single"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class nedaymardom2ostan extends clsScrapper {
    constructor() {
        super(enuDomains.nedaymardom2ostan, "nedaymardom2ostan.ir", {
            selectors: {
                article: ".single",
                title: "h1 a",
                subtitle: ".excerpt",
                datetime: {
                    conatiner: "span.the_time"
                },
                content: {
                    main: ".contentsingle",
                    ignoreNodeClasses: ["inner-web-content"]
                },
                category: {
                    selector: ".the_category a",
                    lastIndex: 2
                },
                tags: ".tag h3 a"
            },
            url: {
                removeWWW: true,
            }
        })
    }
}

export class kishvandnews extends clsScrapper {
    constructor() {
        super(enuDomains.kishvandnews, "kishvandnews.ir", {
            selectors: {
                article: ".content",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: "header > ul > li:nth-child(2) > span"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: "a[rel='category tag']"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class asrtabriz extends clsScrapper {
    constructor() {
        super(enuDomains.asrtabriz, "asrtabriz.ir", {
            selectors: {
                article: "section.single",
                aboveTitle: ".text-sin",
                title: "h1",
                subtitle:  ".lead",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".con",
                },
                category: {
                    selector: ".meta-cat a",
                    lastIndex: 2
                },
                tags: ".tag a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class ashkannews extends clsScrapper {
    constructor() {
        super(enuDomains.ashkannews, "ashkannews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: "h2.entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["mag-box"],
                    ignoreTexts: [/.*<img.*/]
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kohnaninews extends clsScrapper {
    constructor() {
        super(enuDomains.kohnaninews, "kohnaninews.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".excerpt-news",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".the_content_body",
                    ignoreNodeClasses: ["padSection"]
                },
                category: {
                    selector: ".cat_name a"
                },
                tags: ".news-tag-single a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class kashkan extends clsScrapper {
    constructor() {
        super(enuDomains.kashkan, "kashkan.ir", {
            selectors: {
                article: ".ap-single",
                title: "h1",
                subtitle: ".lead",
                datetime: {
                    conatiner: ".breadcrumb > li:nth-child(6)",
                },
                content: {
                    main: ".entry",
                    ignoreNodeClasses: ["tag"]
                },
                category: {
                    selector: "a[rel='category tag']",
                    lastIndex: 2
                },
                tags: ".im-tag-items a",         
            },
            url: {
                removeWWW: true
            }
        })
    }
}