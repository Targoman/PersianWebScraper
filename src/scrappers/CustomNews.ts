import { clsScrapper } from "../modules/clsScrapper";
import { IntfProxy, enuDomains, IntfComment, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory } from "../modules/interfaces";
import HP, { HTMLElement } from "node-html-parser"
import { axiosPost, getArvanCookie, IntfRequestParams } from "../modules/request";
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
        else if (cat.startsWith("اقتصادی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.startsWith("یادداشت بینندگان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Discussion }
        else if (cat.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("ویدئو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
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

        else if (cat.startsWith("اجتماعی") || cat.startsWith("جامعه") || cat.startsWith("خانواده") || cat.startsWith("محیط")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("عکس")
            || cat.startsWith("فیلم")
            || cat.startsWith("ویدئو")
            || cat.startsWith("ویدیو")
            || cat.startsWith("صوت")
            || cat.startsWith("خبر")
            || cat.startsWith("گزارش")
            || cat.startsWith("دیدنی")
            || cat.startsWith("موشن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("ورزش") || cat.includes("المپیک") || cat.includes("جام ") || cat.includes("بازی") || cat.includes("یورو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Futbol }
        else if (cat.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("تجسمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگ") || cat.includes("میراث") || cat.startsWith("رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("ارتباطات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.IT }
        else if (cat.startsWith("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("آموزش") || cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("علم")
            || cat.includes("دانش")
            || cat.includes("پژوهش")
        ) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("سیاس")
            || cat.startsWith("مجلس")
            || cat.startsWith("حقوقی")
            || cat.startsWith("دولت")
            || cat.startsWith("رسانه دیگر")
            || cat.includes("خبر")
            || cat.startsWith("محور مقاومت")
            || cat.startsWith("ایسنا+")
            || cat.startsWith("شبکه")
            || cat.startsWith("سند")
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
            || cat.startsWith("انرژی هسته")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.startsWith("اقتصاد")
            || cat.includes("تجارت") || cat.startsWith("انرژی") || cat.startsWith("عمران")
            || cat.startsWith("استخدام")
            || cat.includes("بازار") || cat.startsWith("ترین")
            || cat.startsWith("تمدن‌سازی")
            || cat.startsWith("مردمی‌سازی")
            || cat.startsWith("امید و آگاهی")
            || cat.startsWith("الگوی پیشرفت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.startsWith("کاریکاتور")
            || cat.startsWith("اینفوگرافیک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }

        return { major: enuMajorCategory.News, subminor: enuMinorCategory.Local }
    }
}

export class tasnim extends clsScrapper {
    constructor() {
        super(enuDomains.tasnim, "tasnimnews.com", {
            selectors: {
                article: "article.single-news, article.media",
                aboveTitle: ".kicker",
                title: ".title",
                subtitle: ".lead",
                content: {
                    main: ".story>*, ._sticky+div, .row.images>*",
                    ignoreTexts: ["این خبر بروز رسانی می شود...", "بازگشت به صفحه رسانه‌‌ها", 'تهیه شده در اداره کل رسانه های نوین خبرگزاری تسنیم'],
                    ignoreNodeClasses: ["jwplayer", "hideTag"]
                },
                tags: ".tags li",
                datetime: {
                    conatiner: ".time, time",
                    splitter: "-",
                },
                category: {
                    selector: "li.service",
                }
            },
            url: {
                extraValidDomains: ["tasnimnews.org", "tasnimnews.com"],
            },
            preHTMLParse: (html: string) => html.replace(/<a +href="https:\/\/vpn.tasnimnews.org\/ContentManager\/\d+\/https:\/\/www.tasnimnews.com" +target="_blank">/, "")
        })
    }

    protected normalizePath(url: URL): string {
        try {
            let hostname = url.hostname
            if (!hostname.startsWith("www."))
                hostname = "www." + hostname
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if (pathParts.length > 6
                && pathParts[1] === "fa"
                && (pathParts[2] === "news"
                    || pathParts[2] === "media"))
                path = `/fa/${pathParts[2]}/${pathParts[3]}/${pathParts[4]}/${pathParts[5]}/${pathParts[6]}` //+ "--->" + url.pathname

            return url.protocol + "//" + hostname + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }
}

export class pana extends clsScrapper {
    constructor() {
        super(enuDomains.pana, "pana.ir", {
            selectors: {
                article: "article",
                aboveTitle: "#Content_rutitr",
                title: "#Content_title",
                subtitle: "#Content_UnderTitle",
                content: {
                    main: ".NewsText>*",
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
                pathToCheckIndex: 1,
            }
        })
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


        else if (cat.startsWith("ارتباطات") || cat.includes("ICT") || cat.includes("وب") || cat.startsWith("امنیت")
            || cat.startsWith("نرم") || cat.startsWith("فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
        else if (cat.startsWith("کسب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }


        return { major: enuMajorCategory.News }
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
                    main: ".eQTmR .BlockContainer__InnerArticleContainer-i5s1rc-1.hXzioD>*",
                },
                datetime: {
                    conatiner: ".oNOID > span:nth-child(3), .dgQNji > span:nth-child(3)",
                    splitter: "-",
                },
                category: {
                    selector: '.kDyGrB a',
                },
            },
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
                    datetime: (cm: HTMLElement) => dateOffsetToDate(cm.querySelector(".cm-data-t span:nth-child(2)")),
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
}

export class arzdigital extends clsScrapper {
    constructor() {
        super(enuDomains.arzdigital, "arzdigital.com", {
            selectors: {
                article: "#post-page, .arz-tw-w-full, section.arz-coin-page-body",
                title: "h1",
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
                    main: "section.arz-post__content, .arz-breaking-news-post__content, .ideas-update-content, #panzoom-element, arz-coin-details__explanation-text",
                },
                tags: "ul.arz-post-tags__list li a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.arz-path-list li a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .wpd-comment"),
                    author: ".wpd-comment-wrap .wpd-comment-right .wpd-comment-author",
                    text: " .wpd-comment-wrap .wpd-comment-right .wpd-comment-text"
                }
            },
        })
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
}