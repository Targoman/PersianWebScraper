import { clsScrapper } from "../modules/clsScrapper";
import { IntfProxy, enuDomains, IntfComment, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory } from "../modules/interfaces";
import HP, { HTMLElement } from "node-html-parser"
import { axiosGet, axiosPost, getArvanCookie, IntfRequestParams } from "../modules/request";
import { log } from "../modules/logger";
import { normalizeText, dateOffsetToDate } from "../modules/common";

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
                validPathsItemsToNormalize: ["news", "media"],
                pathToCheckIndex: 1,
                extraValidDomains: ["farsnews.com"]
            },
        })
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        else if (cat.startsWith("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.startsWith("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.startsWith("یادداشت بینندگان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Discussion }
        else if (cat.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("ویدئو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.startsWith("فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.startsWith("اجتماعی") || cat.startsWith("جامعه") || cat.startsWith("خانواده") || cat.startsWith("محیط")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("دانشگاه") || cat.includes("دانشجو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("علم")
            || cat.includes("دانش")
            || cat.includes("پژوهش")
        ) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("انرژی هسته")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("اقتصاد")
            || cat.includes("تجارت") || cat.startsWith("انرژی") || cat.startsWith("عمران")
            || cat.startsWith("استخدام")
            || cat.includes("بازار") || cat.startsWith("ترین")
            || cat.startsWith("تمدن‌سازی")
            || cat.startsWith("مردمی‌سازی")
            || cat.startsWith("امید و آگاهی")
            || cat.startsWith("الگوی پیشرفت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.startsWith("آمریکا")
            || cat.includes("خارجی")
            || cat.startsWith("غرب")
            || cat.includes("ایران در جهان")
            || cat.includes("اقیانوسیه")
            || cat.startsWith("انرژی هسته")
            || cat.startsWith("بین الملل")
            || cat.includes("تحلیل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("ویدئو")
            || cat.startsWith("ویدیو")
            || cat.startsWith("صوت")
            || cat.startsWith("گزارش")
            || cat.startsWith("دیدنی")
            || cat.startsWith("موشن")
            || cat.startsWith("کاریکاتور")
            || cat.startsWith("اینفوگرافیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزش") || cat.includes("المپیک") || cat.includes("جام ") || cat.includes("بازی") || cat.includes("یورو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("تجسمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگ") || cat.includes("میراث") || cat.startsWith("رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("ارتباطات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.IT }
        else if (cat.startsWith("دین") || cat.includes("اسلامی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.startsWith("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.startsWith("سیاس")
            || cat.startsWith("مجلس")
            || cat.startsWith("دولت")
            || cat.startsWith("رسانه دیگر")
            || cat.includes("خبر")
            || cat.startsWith("محور مقاومت")
            || cat.startsWith("ایسنا+")
            || cat.startsWith("شبکه")
            || cat.startsWith("سند")
            || cat.startsWith("اندیشه")
        ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.startsWith("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.startsWith("چهره")
            || cat.startsWith("دیدگاه")
            || cat.startsWith("باشگاه")
            || cat.startsWith("کانون")
            || cat.startsWith("یادداشت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("آمریکا")
            || cat.includes("خارجی")
            || cat.startsWith("غرب")
            || cat.includes("جهان")
            || cat.includes("اقیانوسیه")
            || cat.startsWith("انرژی هسته"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }

        return { major: enuMajorCategory.News, subminor: enuMinorCategory.Local }
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.News }
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.News, minor: enuMinorCategory.ICT }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("موبایل"))
            mappedCat.subminor = enuSubMinorCategory.Mobile
        else if (second.startsWith("روباتیك"))
            mappedCat.subminor = enuSubMinorCategory.Robotic
        else if (second.startsWith("بازی"))
            mappedCat.subminor = enuSubMinorCategory.Game
        else if (second.startsWith("سخت‌افزار") || second.startsWith("كامپیوتر همراه"))
            mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (first.startsWith("ارتباطات") || first.includes("ICT"))
            mappedCat.subminor = enuMinorCategory.ICT
        else if (first.startsWith("نرم"))
            mappedCat.subminor = enuSubMinorCategory.Software
        else if (first.startsWith("امنیت"))
            mappedCat.subminor = enuSubMinorCategory.Security
        else
            mappedCat.subminor = enuMinorCategory.IT

        return mappedCat
    }
}

/************************************* */
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
                                            date: item.createdAt.substring(0,10)
                                        })
                                        item.commentChildren?.forEach((child: any) => {
                                            comments.push({
                                                text: normalizeText(child.content) || "",
                                                author: normalizeText(child.user.userName),
                                                date: child.createdAt.substring(0,10)
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
}

/************************************* */
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
                    datetime: (cm: HTMLElement) => dateOffsetToDate(cm.querySelector(".cm-data-t span:nth-child(2)"))||"INVALID_DATE",
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
    }
}

/************************************* */
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("اق") || second.startsWith("اتص")) return { ...mappedCat, minor: enuMinorCategory.Economy }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Historical }
        else if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("دانشگاه")) return { ...mappedCat, minor: enuMinorCategory.University }
        else if (cat.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        else if (cat.includes("سخت افزار")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
        else if (first.startsWith("فناوری") || cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("جامعه") || first.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("اقتصاد") || cat.includes("استخدام")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("سلامت") || cat.includes("بارداری")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.startsWith("آشپز")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("تناسب") || cat.includes("دنیای مد")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }

        else if (second.startsWith("خبر")) return { ...mappedCat, minor: enuMinorCategory.Generic }

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

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        if (!cat) return mappedCat

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
            || cat.includes("روانشناسی")
            || cat.includes("سالم")
            || cat.includes("تغذیه")
            || cat.includes("جنسی")
            || cat.includes("نوزادان")
            || cat.includes("سلامت")
            || cat.includes("رژیمی")
            || cat.includes("کالری")
            || cat.includes("تغذیه")
            || cat.includes("تغذیه")
            || cat.includes("تغذیه")
            || cat.includes("تغذیه")
            || cat.includes("تغذیه")
            || cat.includes("تغذیه")
        ) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("علمی و آموزشی")) return { ...mappedCat, minor: enuMinorCategory.Education }
        else if (cat.includes("هنر")
            || cat.includes("گرافیک")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("غذاها")
            || cat.includes("شیرینی")
            || cat.includes("ترشیجات")
            || cat.includes("آشپزی")
        ) return { ...mappedCat, subminor: enuSubMinorCategory.Cooking }
        else if (cat.startsWith("ابزار")
            || cat.includes("تکنولوژی")
            || cat.includes("اختراعات")
            || cat.includes("علمی")
            || cat.includes("گیاهان")
            || cat.includes("کشفیات")
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("احادیث")
            || cat.startsWith("احکام")
            || cat.endsWith(" دین")
            || cat.endsWith(" دینی")
            || cat.endsWith("داروخانه")
            || cat.endsWith("مستحبی")
        ) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("تحصیلی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("روزنامه")) return { major: enuMajorCategory.News }
        else if (cat.includes("اجتماعی") || cat.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("اقتصاد")
            || cat.includes("مشاغل")
            || cat.includes("بازار")
            || cat.includes("شارژ")
            || cat.includes("بازار")
            || cat.includes("گلیم")
        ) return { ...mappedCat, minor: enuMinorCategory.Economy }
        else if (cat.includes("الملل") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("فرهنگ") || cat.includes("گردشگری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("گوناگون") || cat.includes("انعکاس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("ستاره")) return { ...mappedCat, subminor: enuSubMinorCategory.Celebrities }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("ستاره")
            || cat.includes("بازیگران")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Celebrities }
        else if (cat.includes("سرگرمی")
            || cat.includes("جالب")
            || cat.includes("طنز")
            || cat.includes("معما")
            || cat.includes("فال ")
        ) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.endsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("تصاویر")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        else if (cat.includes("اینترنت") || cat.includes("کامپیوتر")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        else if (cat.includes("مسافرتی")
            || cat.endsWith("سفر")
            || cat.includes("گردشگری")
            || cat.startsWith("مكانهای")
            || cat.startsWith("مناسبتها")
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("داستانهای")
            || cat.endsWith("المثل")
            || cat.includes("شعر")
            || cat.includes("حکایت")
        ) return { ...mappedCat, minor: enuMinorCategory.Literature }
        else if (cat.startsWith("آیا")
            || cat.startsWith("چرا")
            || cat.startsWith("متفرقه")
        ) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        else if (cat.startsWith("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat = { major: enuMajorCategory.News, minor: enuMinorCategory.CryptoCurrency }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

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

    mapCategory(cat?: string): IntfMappedCatgory {
        const mappedCat : IntfMappedCatgory= { major: enuMajorCategory.News, minor: enuMinorCategory.CryptoCurrency }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("ویدیو") || cat.includes("تماشا")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("کار") || cat.includes("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("امنیت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Security }
        else if (cat.includes("موبایل")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
        else if (cat.includes("اپلیکیشن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
        else if (cat.includes("سخت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
        else if (cat.includes("بازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Game }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("گجت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Gadgets }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Education }
        else if (cat.includes("کریپتو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.CryptoCurrency }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Health }
        else if (cat.includes("هوش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        else if (cat.includes("آگهی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }


        return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
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
}

