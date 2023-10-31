import { clsScrapper } from "../modules/clsScrapper";
import { IntfProxy, enuDomains, IntfComment } from "../modules/interfaces";
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
                    selector: ".subject-category",
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
                        return  super.extractDate(el.getAttribute("data-tarikh"), "-")||"DateNotfound"
                    },
                },
                comments: {
                    container: (_, fullHTML: HTMLElement) => fullHTML.querySelectorAll(".discuss"),
                    author: ".username",
                    text: ".discuss-content p",
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
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND"
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
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND"
                },
                category: {
                    selector: 'dd.category-name a',
                },
            },
        })
    }
}