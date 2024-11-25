
import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, enuTextType, IntfComment, IntfMappedCategory } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import { fa2En, getElementAtIndex, normalizeText } from "../modules/common";
import { axiosGet, axiosPost, IntfRequestParams } from "../modules/request";
import { log } from "../modules/logger";


export class virgool extends clsScrapper {
    constructor() {
        super(enuDomains.virgool, "virgool.io", {
            selectors: {
                article: (parsedHtml: HTMLElement) =>
                    parsedHtml.querySelector(".post-content") || (parsedHtml.querySelector('section.site-body') ? undefined : parsedHtml.querySelector("section>div>div>div")),
                title: "h1",
                content: {
                    main: (article: HTMLElement) => article.querySelectorAll(".post-body>*"),
                    alternative: (article: HTMLElement) => getElementAtIndex(article.childNodes, 2)?.querySelectorAll("*"),
                    ignoreNodeClasses: ["fw-900"]
                },
                tags: (article: HTMLElement) => article.querySelectorAll('a').filter(el => el.getAttribute("href")?.startsWith("/tag")),
                datetime: {
                    conatiner: (article: HTMLElement, fullHtml: HTMLElement) => {
                        const byClass = fullHtml.querySelector(".author.module .module-footer .data")
                        if (byClass)
                            return byClass
                        return getElementAtIndex(article.childNodes, 0)?.querySelector("div>div>div>span>div>span:last-child")
                    },
                },
                comments: {
                    container: ".comments-section article",
                    author: "div>div>div:first-child>div>span>a",
                    text: "div>div:nth-child(2)"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class ninisite extends clsScrapper {
    constructor() {
        super(enuDomains.ninisite, "ninisite.com", {
            selectors: {
                article: "article, .col-xl-9",
                title: "h1",
                content: {
                    main: '[itemprop="articleBody"], .description, [itemprop="description"]',
                    ignoreTexts: ["توضیحات :"]
                },
                tags: (_, fullHtml: HTMLElement) => {
                    const tags = fullHtml.querySelectorAll(".article__tag, .tag-title a[href]")
                    return tags
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb a"),
                    startIndex: 1
                },
                datetime: {
                    conatiner: '[itemprop="datePublished"], .section .number.side, [itemprop="dateCreated"], .created-post .date',
                },
                comments: {
                    container: (article: HTMLElement) => article.querySelectorAll(".comment, article.topic-post"),
                    author: ".username, .nickname",
                    datetime: ".user-time, .date",
                    text: ".comment__content, .post-message"
                }
            },
            url: {
                extraInvalidStartPaths: ["/user/", "/imen/", "/discussion/hashtag"]
            }
        })
    }

    normalizePath(url: URL) {
        if (url.pathname.startsWith("/video/") || url.pathname.startsWith("/photo/"))
            return super.normalizePath(url, { pathToCheckIndex: 1, validPathsItemsToNormalize: ["video", "photo"] })
        if (url.pathname.startsWith("/clinic/question/") || url.pathname.startsWith("/discussion/topic/")) {
            const pathParts = url.pathname.split("/")
            if (pathParts.length > 3)
                return url.protocol + "//" + url.hostname + `/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}/` + url.search
        }
        return url.toString()
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
        if (!cat) return { textType: enuTextType.Informal, major: enuMajorCategory.Forum }
        void cat, first, second

        if (first.startsWith("آموزشی")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (first.startsWith("ادبیات، فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("ازدواج و شروع زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("اوقات فراغت")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("بارداری")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("بانک داروها")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("بانوان")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Women }
        if (first.startsWith("پادکست")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("پدرانه")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("پرسش")) return { ...mappedCat, minor: enuMinorCategory.Discussion }
        if (first.startsWith("پس از زایمان")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("پیش از بارداری")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("پیشنهاد فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("چه خبر؟")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (first.startsWith("حیوانات")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        if (first.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("خردسال")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("دوران بارداری")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("دیدنی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("سال ")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("سایر ")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (first.startsWith("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("شیرخوار")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("طنز")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (first.startsWith("علم و تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("فروشگاههای")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (first.startsWith("فلسفه")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (first.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("کارتون")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("کانون")) return { textType: enuTextType.Informal, major: enuMajorCategory.Forum }
        if (first.startsWith("کودک")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (first.startsWith("لباهنگ")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (first.startsWith("متفرقه")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (first.startsWith("مد و دکوراسیون")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("مدیر سایت")) return { ...mappedCat }
        if (first.startsWith("مشاورین")) return { ...mappedCat }
        if (first.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (first.startsWith("نوپا")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (first.startsWith("والدین")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (first.startsWith("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        return { textType: enuTextType.Informal, major: enuMajorCategory.Forum }
    }
}

export class lastsecond extends clsScrapper {
    constructor() {
        super(enuDomains.lastsecond, "lastsecond.ir", {
            selectors: {
                article: ".post-show__content, .travelogue-show__content, .video-show",
                title: (article: HTMLElement, fullHtml: HTMLElement) => {
                    const titleContainer = article.querySelector(".title")
                    if (normalizeText(titleContainer?.innerText) !== '')
                        return titleContainer
                    return fullHtml.querySelectorAll(".breadcrumb-list__item").at(fullHtml.querySelectorAll(".breadcrumb-list__item").length - 1)
                },

                content: {
                    main: '.post-show__content__body>*, .travelogue-show__content__body>*, .video-show__content',
                    ignoreTexts: ["توضیحات :"],
                    ignoreNodeClasses: ["toc"]
                },
                datetime: {
                    conatiner: '.details__date',
                    splitter: " "
                },
                comments: async (url: URL, reqParams: IntfRequestParams): Promise<IntfComment[]> => {
                    const comments: IntfComment[] = []
                    const retrieveComments = async (page: number) => {
                        await axiosPost(log,
                            { "commentableType": "post", "commentableId": url.pathname.replace("/blog/", "").split("-")[0], page, "sort": 1 },
                            {
                                ...reqParams,
                                url: "https://api.lastsecond.ir/comments/comments/index",
                                headers: {
                                    "Content-Type": "application/json; charset=UTF-8"
                                },
                                onSuccess: async (res: any) => {
                                    //console.log(res)
                                    res?.items?.forEach((item: any) => {
                                        comments.push({
                                            text: normalizeText(item.content) || "",
                                            author: normalizeText(item.user.fullName),
                                        })
                                        item.children?.forEach((child: any) => {
                                            comments.push({
                                                text: normalizeText(child.content) || "",
                                                author: normalizeText(item.user.fullName),
                                            })
                                        })
                                    })
                                    if (res?.pagination?.hasMorePages)
                                        await retrieveComments(res?.pagination?.current + 1)
                                },
                                onFail: (e) => { log.error(e) }
                            }
                        )
                    }

                    await retrieveComments(1)

                    return comments
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
    }
}

export class tebyan extends clsScrapper {
    constructor() {
        super(enuDomains.tebyan, "tebyan.net", {
            selectors: {
                article: "article, .js_GalleryImages, section.PlayPage",
                aboveTitle: "h3",
                title: "h1, .DetailSubjectBox, .PlayTrackTitle",
                summary: ".ArticleSummary, .PlayTrackSummary",
                datetime: {
                    conatiner: "span.js_ArticleDate, .d-flex.dr"
                },
                content: {
                    main: '.TextArticleContent, .GImg, .sootitr, .DetailBox, .overflow-hidden.d-flex, .PlayRightPanel',
                },
                tags: ".KeywordsContentBox a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".ArticleNavDirectory a")
                },
            },
            url: {
                extraValidDomains: ["article.tebyan.net", "image.tebyan.net", "sound.tebyan.net"],
                extraInvalidStartPaths: ["/film"],
                removeWWW: true
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (second.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("ارتباطات")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (second.startsWith("امروز")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (second.startsWith("تغذیه")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("حوزه")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (second.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("دانش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("زیبایی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("كتابخانه")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("کودک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("یادگیری")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (second.includes("مشاوره")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (second.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }

        return mappedCat
    }
}

export class romanman extends clsScrapper {
    constructor() {
        super(enuDomains.romanman, "roman-man.ir", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: '.entry.clearfix>*',
                },
                tags: "span.tagcloud a",
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    text: ".comment-content"
                }
            }
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("آرایش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (second.startsWith("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("رمان")) return { ...mappedCat, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Text }
        if (second.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (second.startsWith("گالری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("مد ")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return mappedCat
    }
}

export class blogir extends clsScrapper {
    constructor() {
        super(enuDomains.blogir, "blog.ir", {
            selectors: {
                article: ".block-post, .post.post_detail, .post, .post-container",
                title: "h2, h3",
                datetime: {
                    conatiner:
                        (_, fullHTML: HTMLElement) =>
                            fullHTML.querySelector(".date_title, .cm-date, span.date, span.post-details-date, span.post-date1, "
                                + ".post-detail-right ul li:nth-child(2), .sender"),
                    splitter: (el: HTMLElement) => {
                        const date = super.extractDate(el, el.classList.contains("comment-date") ? " " : "،")
                        if (date && date.length < 9 && fa2En(date[0]) === "0") {
                            return "14" + date
                        } else if (date && date.length < 9 && fa2En(date[0]) !== "0") {
                            return "13" + date
                        }
                        return date || "DATE NOT FOUND"
                    }
                },
                content: {
                    main: '.post-content, .body .cnt, .post-matn',
                },
                tags: (_, fullHTML: HTMLElement) => fullHTML.querySelectorAll(".tagcloud span a h3, .post-details-tags h3 a, span.tagss a, .tagcloud h3 a"),
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".cm-main, .post-comment, .cm-body, .post_comments"),
                    author: ".cm-name, span.comment-name, span.cm-name, span.inline.txt, .dets_right li.txt",
                    text: ".body_cmt .cnt .cnt_l, .comment-matn, .comment-body-content, span.cnt_l"
                }
            },
            url: {
                removeWWW: true,
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class yektanet extends clsScrapper {
    constructor() {
        super(enuDomains.yektanet, "yektanet.com", {
            selectors: {
                article: "article",
                title: (_, fullHTML: HTMLElement) => fullHTML.querySelector("h1.page-title"),
                datetime: {
                    conatiner: "span.publish_date",
                    splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND"
                },
                content: {
                    main: '.entry-content',
                },
                tags: ".tags-links a",
                category: {
                    selector: "span.cat a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
            url: {
                extraInvalidStartPaths: ["/academy", "/webinar", "/newsletter", "/rahkar-webinars", "/ebook"],
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class blogsky extends clsScrapper {
    constructor() {
        super(enuDomains.blogsky, "blogsky.com", {
            selectors: {
                article: ".post-box",
                title: "h2.post-title a",
                datetime: {
                    conatiner: ".post-title-link",
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("href");
                        if (date) {
                            const newDate = date.split('/');
                            return newDate[1] + "-" + newDate[2] + "-" + newDate[3];
                        } else
                            return "DATE NOT FOUND"
                    }
                },
                content: {
                    main: '.content-wrapper',
                    ignoreNodeClasses: ['.post-title']
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#comments .comment"),
                    author: "a.author-name",
                    text: "p.comment-content"
                }
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/dailylink", '/tag']
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class technolife extends clsScrapper {
    constructor() {
        super(enuDomains.technolife, "technolife.ir", {
            selectors: {
                article: ".post-item-container",
                title: "h1.post-item-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("content")?.match(/\d{4}-\d{2}-\d{2}/);
                        if (date)
                            return date[0];
                        else
                            return "NO_DATE";
                    }
                },
                content: {
                    main: '.post-container',
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs ul li a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li"),
                    author: ".comment-author",
                    text: ".comment-text"
                }
            },
            url: {
                extraInvalidStartPaths: ["/product"]
            }
        })
    }


    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.includes("آموزش")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (second.includes("بازی")) return { ...mappedCat, subminor: enuMinorCategory.Game }
        if (second.includes("اپلیکیشن")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (second.includes("تکنولوژی")) return { ...mappedCat, subminor: enuMinorCategory.Generic }
        if (second.includes("سخت")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("لپ تاپ")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
        if (second.includes("اسپیکر")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("باکس")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("پاور")) return { ...mappedCat, subminor: enuSubMinorCategory.Gadgets }
        if (second.includes("تبلت")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("ساعت")) return { ...mappedCat, subminor: enuSubMinorCategory.Gadgets }
        if (second.includes("گوشی")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
        if (second.includes("مانیتور")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("هارد")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
        if (second.includes("هندزفری")) return { ...mappedCat, subminor: enuSubMinorCategory.Gadgets }
        if (second.includes("ویدیویی")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.includes("دوربین")) return { ...mappedCat, subminor: enuSubMinorCategory.Gadgets }
        if (second.includes("گیمینگ")) return { ...mappedCat, subminor: enuMinorCategory.Game }
        if (second.includes("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (second.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.includes("سریال")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        if (second.includes("گیمزکام")) return { ...mappedCat, minor: enuMinorCategory.Game }

        return mappedCat
    }
}

export class sid extends clsScrapper {
    constructor() {
        super(enuDomains.sid, "sid.ir", {
            selectors: {
                article: "#courseInfo",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("#wsdtitlecontainer h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".WA p"),
                    splitter: (el: HTMLElement) => {
                        const date = super.extractDate(el, "-")?.split("-");
                        if (date)
                            return date[2] + "-" + date[1] + "-" + date[0];
                        else
                            return "DATE NOT FOUND"
                    }
                },
                content: {
                    main: '#wscourseInfo',
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("p.wssm.wssmx a"),
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class naghdfarsi extends clsScrapper {
    constructor() {
        super(enuDomains.naghdfarsi, "naghdfarsi.ir", {
            selectors: {
                article: "article.status-publish",
                title: "h1.single-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], .date.published"),
                    splitter: (el: HTMLElement) => {
                        const date = el.textContent?.match(/\d{4}-\d{2}-\d{2}/);
                        if (date) {
                            return date[0];
                        }
                        else {
                            const newDate = el.getAttribute("content")?.match(/\d{4}-\d{2}-\d{2}/);
                            if (newDate)
                                return newDate[0];
                            else
                                return "NO_DATE";
                        }
                    }
                },
                content: {
                    main: '[itemprop="articleBody"]',
                },
                category: {
                    selector: "span.breadcrumb-inner span a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#comments ul li"),
                    author: ".comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class yekpezeshk extends clsScrapper {
    constructor() {
        super(enuDomains.yekpezeshk, "1pezeshk.com", {
            selectors: {
                article: "article.status-publish",
                title: "h1",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => {
                        const date = el.getAttribute("datetime")?.match(/\d{4}-\d{2}-\d{2}/);
                        if (date)
                            return date[0];
                        else
                            return "NO_DATE";
                    }
                },
                content: {
                    main: '.entry-content.clearfix.single-post-content>*, .single-featured img',
                    ignoreNodeClasses: ["bs-listing", "vc_custom_1685289155255", "alert"]
                },
                tags: ".post-tags a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("nav.top-menu-container ul li a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li .clearfix"),
                    author: ".comment-meta cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class digikala extends clsScrapper {
    constructor() {
        super(enuDomains.digikala, "digikala.com", {
            basePath: "/mag/",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: "time",
                },
                content: {
                    main: '.post-module__content>*',
                    ignoreNodeClasses: ["footer"]
                },
                tags: ".post-module__tags a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumbs__nav li a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.post-module__comments li"),
                    author: "span._item__user--name",
                    datetime: "time",
                    text: "._item__comment"
                }
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("آرایش")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (second.startsWith("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (second.startsWith("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Literature }
        if (second.startsWith("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (second.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (second.startsWith("گالری")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("مد و ")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return mappedCat
    }
}

export class snapp extends clsScrapper {
    constructor() {
        super(enuDomains.snapp, "snapp.ir", {
            selectors: {
                article: "article.post-large",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: '.entry-content',
                },
                category: {
                    selector: "span.meta-cats a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments li"),
                    author: "span.comment-by strong",
                    text: ".comment-block div:nth-child(3)"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class snappfood extends clsScrapper {
    constructor() {
        super(enuDomains.snappfood, "blog.snappfood.ir", {
            selectors: {
                article: "article.single-article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: '.editor-content',
                },
                category: {
                    selector: ".category-list a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment-list .comment"),
                    author: "span.comment-name",
                    text: ".comment-text"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (!category) return mappedCat
        void first, second

        if (first.startsWith("آموزش آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (first.startsWith("تهیه انواع ترشی و شور")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        return mappedCat
    }
}

export class snapptrip extends clsScrapper {
    constructor() {
        super(enuDomains.snapptrip, "snapptrip.com", {
            selectors: {
                article: ".container.fullwidth #content #main article",
                title: "h1",
                datetime: {
                    conatiner: "span.date",
                    splitter: "-"
                },
                content: {
                    main: '.post-entry>*, .post-img a img',
                    ignoreNodeClasses: ["widget_pintapin_categories", "cat", "menu-main-menu-container", "top-footer", "menu-body",
                        "sntrip-middle-footer", "sntrip-socket-bar", "post-comments", "sntrip-popup-content", "post-related", "independent-cats",
                        "related-post-link", "register-holder", "link", "share-dialog", "ez-toc-container-direction", "meta-share", "meta-comments",
                        "sntrip-footer-social-bar"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs span span a"),
                    startIndex: 1
                },
                tags: "span.cat a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-comments .comments li"),
                    author: "span.author",
                    datetime: "span.date",
                    text: ".comment-text p"
                }
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }

}

export class nobitex extends clsScrapper {
    constructor() {
        super(enuDomains.nobitex, "nobitex.ir", {
            basePath: "/mag",
            selectors: {
                article: "article.post-item-single",
                title: "h1",
                datetime: {
                    conatiner: "a.post-date",
                },
                content: {
                    main: ".post-single-content, .post-thumbnail",
                },
                category: {
                    selector: ".post-categories a"
                },
            }
        })
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.CryptoCurrency }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("آموزش")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (first.startsWith("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
        return mappedCat
    }
}

export class snappmarket extends clsScrapper {
    constructor() {
        super(enuDomains.snappmarket, "snapp.market", {
            basePath: "/blog",
            selectors: {
                article: "article.single-post-content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-post-content",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div"),
                    author: "cite.comment-author",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("مد و دکوراسیون")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        return mappedCat
    }
}

export class flightio extends clsScrapper {
    constructor() {
        super(enuDomains.flightio, "flightio.com", {
            basePath: "/blog",
            selectors: {
                article: "article.single-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["rating-option"],
                    ignoreTexts: [/.*DOCTYPE.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class namava extends clsScrapper {
    constructor() {
        super(enuDomains.namava, "namava.ir", {
            basePath: "/mag",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: '.post-content',
                    ignoreTexts: [/.*» در نماوا.*/]
                },
                tags: ".tags a",
                category: {
                    selector: ".categories a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list div .wpd-comment-wrap"),
                    author: ".wpd-comment-author",
                    text: ".wpd-comment-text"
                }
            },
            url: {
                extraInvalidStartPaths: ["/movie", "/series"]
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("اخبار") || first.startsWith("خبر")) return { ...mappedCat, major: enuMajorCategory.News }
        if (first.startsWith("چهره ها")) return { ...mappedCat, subminor: enuSubMinorCategory.Celebrities }
        if (first.startsWith("مد و دکوراسیون")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        return mappedCat
    }
}

export class achareh extends clsScrapper {
    constructor() {
        super(enuDomains.achareh, "blog.achareh.ir", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-container-direction", "achareh-post-service-price", "shortc-button", "kk-star-ratings", "wp-video-shortcode"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("خودرو")) return { ...mappedCat, subminor: enuSubMinorCategory.Car }
        if (second.startsWith("حیوانات")) return { ...mappedCat, subminor: enuSubMinorCategory.Pet }
        if (second.includes("زیبایی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("لوازم")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("نظافت")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return mappedCat
    }
}

export class aparat extends clsScrapper {
    constructor() {
        super(enuDomains.aparat, "aparat.blog", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .single-featured",
                    ignoreNodeClasses: ["bs-irp-thumbnail-1-full", "lwptoc_i"]
                },
                category: {
                    selector: "span.term-badge a"
                },
                tags: ".post-tags a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div"),
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
    }
}

export class taaghche extends clsScrapper {
    constructor() {
        super(enuDomains.taaghche, "taaghche.com", {
            basePath: "/blog",
            selectors: {
                article: "main.singlepage",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: "section.content_post, img.mainpic",
                    ignoreNodeClasses: ["related-post", "profilebox", "profileimg", "comments-area"],
                },
                tags: ".tags a",
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Literature }
    }
}

export class jabama extends clsScrapper {
    constructor() {
        super(enuDomains.jabama, "jabama.com", {
            basePath: "/mag",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .wp-block-image figure, figure.single-featured-image",
                    ignoreNodeClasses: ["ez-toc-title-container"],
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            }
        })
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class jobinja extends clsScrapper {
    constructor() {
        super(enuDomains.jobinja, "blog.jobinja.ir", {
            selectors: {
                article: ".maincontent",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".image-post, .header_img-single figure a",
                    ignoreNodeClasses: ["yarpp-related-website", "title_single"],
                    ignoreTexts: [/.*img.*/]
                },
                category: {
                    selector: "ul.post-categories li a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li .comment-body"),
                    author: ".comment-author cite.fn",
                    text: "p"
                }
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Job }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.includes("اخبار جابینجا")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (second.includes("تعادل کار و زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (second.includes("منهای کار")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }

        return mappedCat
    }
}

export class rayamarketing extends clsScrapper {
    constructor() {
        super(enuDomains.rayamarketing, "rayamarketing.com", {
            selectors: {
                article: "article.post-standard-details",
                title: "h1",
                subtitle: "p.post__subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[itemprop='datePublished']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: ".post__text, [itemprop='image']",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb li a"),
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comments__list li div"),
                    author: "cite.comments__author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("طراحی")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
        if (first.startsWith("موشن")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }

        return mappedCat
    }
}

export class miare extends clsScrapper {
    constructor() {
        super(enuDomains.miare, "miare.ir", {
            basePath: "/blog",
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["lwptoc_i", "kk-star-ratings"],
                    ignoreTexts: [/.*پیشنهاد خواندنی.*/]

                },
                category: {
                    selector: "#breadcrumb a"
                },
            }
        })
    }

    protected normalizePath(url: URL): string {
        if (url.pathname.includes("/wp-content/uploads") && !url.pathname.includes("blog")) {
            return url.toString().slice(0, 20) + "/blog" + url.toString().slice(20)
        }
        else if (!url.toString().includes("/blog"))
            return url.toString().slice(0, 20) + "/blog" + url.toString().slice(20)
        else
            return url.toString()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class abantether extends clsScrapper {
    constructor() {
        super(enuDomains.abantether, "blog.abantether.com", {
            selectors: {
                article: "article.ast-article-single",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-container-direction"],
                },
                category: {
                    selector: "ul.trail-items li a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.ast-comment-list li article"),
                    author: ".ast-comment-cite-wrap cite b",
                    datetime: "time",
                    text: ".ast-comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.CryptoCurrency }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("آموزشی")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (second.startsWith("اخبار")) return { ...mappedCat, major: enuMajorCategory.News, minor: enuMinorCategory.CryptoCurrency }

        return mappedCat
    }
}

export class okala extends clsScrapper {
    constructor() {
        super(enuDomains.okala, "blog.okala.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .single-featured",
                    ignoreNodeClasses: ["Leadmagnet-forms-sec", "saboxplugin-wrap", "aiosrs-rating-wrap"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (first.startsWith("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (first.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        return mappedCat
    }
}

export class faradars extends clsScrapper {
    constructor() {
        super(enuDomains.faradars, "blog.faradars.org", {
            selectors: {
                article: "article.status-publish",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], meta[property='article:modified_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".paragraphs, picture",
                    ignoreNodeClasses: ["lwptoc_i", "faradars-courses-single"]
                },
                category: {
                    selector: ".mb-2 a.font-extrabold"
                },
                tags: ".collapsible-tags-content-inner .tag a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment-list .comment div"),
                    author: ".comment-metadata .ml-2",
                    text: ".comment-body"
                }
            }
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("اخبار")) return { ...mappedCat, major: enuMajorCategory.News }
        if (first.startsWith("ارز دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency, subminor: enuMinorCategory.Education }
        if (first.startsWith("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Education }
        if (first.startsWith("اینترنت")) return { ...mappedCat, minor: enuMinorCategory.ICT, subminor: enuMinorCategory.Education }
        if (first.startsWith("بازاریابی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Education }
        if (first.startsWith("بازی")) return { ...mappedCat, minor: enuMinorCategory.Game, subminor: enuMinorCategory.Education }
        if (first.startsWith("برنامه نویسی")) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Software }
        if (first.startsWith("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Medical, subminor: enuMinorCategory.Education }
        if (first.startsWith("توسعه فردی")) return { ...mappedCat, minor: enuMinorCategory.Psychology, subminor: enuMinorCategory.Education }
        if (first.startsWith("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Psychology, subminor: enuMinorCategory.Education }
        if (first.startsWith("سئو")) return { ...mappedCat, minor: enuMinorCategory.SEO, subminor: enuMinorCategory.Education }
        if (first.startsWith("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Education }
        if (first.startsWith("هوش مصنوعی") || second.startsWith("هوش مصنوعی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        return mappedCat
    }
}

export class kalleh extends clsScrapper {
    constructor() {
        super(enuDomains.kalleh, "kalleh.com", {
            basePath: "/book",
            selectors: {
                article: "main.align-items-start article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:modified_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content .content, .entry-content, .post-thumbnail",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs span span a"),
                    startIndex: 1
                },
                tags: ".tags-links a"
            },
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (!category) return mappedCat
        void category, first, second
        if (first.startsWith("دستورپخت")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        return mappedCat
    }
}

export class chetor extends clsScrapper {
    constructor() {
        super(enuDomains.chetor, "chetor.com", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content, .single-featured",
                    ignoreNodeClasses: ["chetor-related-article", "ads-block", "am__the_content_bottom", "lwptoc_i", "term-badge"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                },
                tags: ".post-tags a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div"),
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }

        if (!cat) return mappedCat
        void cat, first, second
        if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("رشد و توسعه فردی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("اقتصاد") || cat.includes("کسب")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        if (cat.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("چند رسانه") || cat.startsWith("تصویر")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("بین") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (cat.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes("IT")) return { ...mappedCat, minor: enuMinorCategory.IT }
        if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصادی/علم")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.ScienceTech }
        if (cat.includes("ارز دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.CryptoCurrency }
        if (cat.includes("اقتصاد جهانی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (cat.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        if (cat.includes("المپیک") || cat.includes("جام جهانی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        if (cat.includes("رپرتاژ")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }

        return mappedCat
    }
}

export class madarsho extends clsScrapper {
    constructor() {
        super(enuDomains.madarsho, "madarsho.com", {
            selectors: {
                article: ".single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["related-posts", "LTRStyle", "in-article-nav", "si-share"],
                    ignoreTexts: ["مقاله مرتبط"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    startIndex: 1
                },
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class filimoshot extends clsScrapper {
    constructor() {
        super(enuDomains.filimoshot, "filimo.com", {
            basePath: "/shot",
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content, .single-featured",
                    ignoreNodeClasses: ["lwptoc_i", "btn-default"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".term-badges span a"),
                },
                tags: ".post-tags a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div"),
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
    }
}

export class avalpardakht extends clsScrapper {
    constructor() {
        super(enuDomains.avalpardakht, "avalpardakht.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".td-post-content, .td-post-featured-image",
                    ignoreNodeClasses: ["td-a-rec-id-content_inline", "kk-star-ratings", "lwptoc_i"]
                },
                category: {
                    selector: "ul.td-category li a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer cite",
                    text: ".comment-content"
                }
            },
        })
    }
}

export class maktabkhooneh extends clsScrapper {
    constructor() {
        super(enuDomains.maktabkhooneh, "maktabkhooneh.org", {
            basePath: "/mag/",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE",
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["box-inner-block"],
                },
                category: {
                    selector: "#breadcrumb a",
                    startIndex: 1
                },
                tags: "span.post-cat-wrap a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            }
        })
    }
    public mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        void category, first, second
        if (first.startsWith("هوش مصنوعی")) return { ...mappedCat, subminor: enuSubMinorCategory.AI }
        if (first.startsWith("هنر")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
        if (first.startsWith("C ، C++ و C#")
            || first.startsWith("برنامه نویسی")
            || first.startsWith("لینوکس")
        ) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        return mappedCat
    }
}

export class sevenlearn extends clsScrapper {
    constructor() {
        super(enuDomains.sevenlearn, "7learn.com", {
            selectors: {
                article: "div.card-question",
                title: ".text span.title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".description",
                },
                category: {
                    selector: "ol.breadcrumb li a",
                    startIndex: 2
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".card-reply"),
                    author: ".user span.title",
                    text: ".description"
                }
            },
            url: {
                extraInvalidStartPaths: ["/course"]
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
    }
}

export class modireweb extends clsScrapper {
    constructor() {
        super(enuDomains.modireweb, "modireweb.com", {
            selectors: {
                article: "[data-id='4ef12ee'], [data-id='e2ec43c']",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) =>
                        fullHtml.querySelectorAll(".elementor-widget-theme-post-content .elementor-widget-container>*, img.attachment-medium"),
                    ignoreNodeClasses: ["no_bullets", "message-box", "rmp-rating-widget", "rmp-results-widget", "crp_related"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[data-id='d2007bc'] div a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "cite",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                extraInvalidStartPaths: ["/product", "/gold-contents"]
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class doctoreto extends clsScrapper {
    constructor() {
        super(enuDomains.doctoreto, "doctoreto.com", {
            basePath: "/blog",
            selectors: {
                article: "article.single-content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".start-content",
                    ignoreNodeClasses: ["table-of-content"],
                    ignoreTexts: [/.*img.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".date-cat span a"),
                },
                tags: ".tags ul.category-button li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li .comment-body"),
                    author: ".comment-author cite.fn",
                    text: "p"
                }
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class bookland extends clsScrapper {
    constructor() {
        super(enuDomains.bookland, "bookland.ir", {
            basePath: "/blog",
            selectors: {
                article: ".post-row",
                title: "h1",
                datetime: {
                    conatiner: ".txt-con div:nth-child(2)",
                },
                content: {
                    main: ".post-body",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments-row div:nth-child(2) .comment-row"),
                    author: ".name",
                    datetime: ".date",
                    text: ".comment-col"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Literature }
    }
}

export class iranhotelonline extends clsScrapper {
    constructor() {
        super(enuDomains.iranhotelonline, "iranhotelonline.com", {
            basePath: "/blog",
            selectors: {
                article: "[data-id='74432a66']",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) =>
                        fullHtml.querySelectorAll(".elementor-widget-theme-post-content .elementor-widget-container>*, img.attachment-full"),
                    ignoreNodeClasses: ["kk-star-ratings"],
                    ignoreTexts: [/.*IRPP.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[data-id='60d59e19'] div p a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("h3.elementor-heading-title a"),
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class apademy extends clsScrapper {
    constructor() {
        super(enuDomains.apademy, "apademy.com", {
            basePath: "/article",
            selectors: {
                article: ".s-pod-post",
                title: "h2",
                datetime: {
                    conatiner: ".mini-person.margin1 span",
                },
                content: {
                    main: ".post-text",
                    ignoreNodeClasses: ["table-of-contents"],
                    ignoreTexts: [/.*مقاله پیشنهادی.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".container .s-cast-comment"),
                    author: ".command-user-name span:nth-child(1)",
                    datetime: ".time-replay",
                    text: "div p, .user-comment-replay p"
                }
            },
            url: {
                extraInvalidStartPaths: ["/course", "/podcast"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education, subminor: enuMinorCategory.IT }
    }
}

export class iranicard extends clsScrapper {
    constructor() {
        super(enuDomains.iranicard, "iranicard.ir", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: "span.persian-digit"
                },
                content: {
                    main: ".container-post, .post-single-image figure div",
                    ignoreNodeClasses: ["toc-box"],
                },
                category: {
                    selector: "a.post-item-term",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commnet-list li article"),
                    author: "footer .comment-author b",
                    text: ".comment-content"
                }
            },
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
        void category, first, second

        if (first.includes("ارز دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency }
        if (first.includes("کریپتو")) return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency }
        if (first.includes("دامنه و هاست")) return { ...mappedCat, minor: enuMinorCategory.IT }
        return mappedCat
    }
}

export class hamrah extends clsScrapper {
    constructor() {
        super(enuDomains.hamrah, "hamrah.academy", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreTexts: [/.*حتما بخوانید.*/]
                },
                category: {
                    selector: "span.post-cat-wrap a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
}

export class asiatech extends clsScrapper {
    constructor() {
        super(enuDomains.asiatech, "asiatech.cloud", {
            basePath: "/weblog",
            selectors: {
                article: ".blog_large_post_style",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post_content",
                    ignoreTexts: [/.*خانه ».*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("span.meta-category-small a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.single_post_tag_layout li a"),
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li article"),
                    author: "span.comment-author-name",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.ICT }
        void cat, first, second

        if (cat?.startsWith("آموزش") || cat?.startsWith("دانشنامه"))
            return { ...mappedCat, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Education }
        return { ...mappedCat, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.ICT }
    }
}

export class ponisha extends clsScrapper {
    constructor() {
        super(enuDomains.ponisha, "ponisha.ir", {
            basePath: "/blog",
            selectors: {
                article: "article.single-blog-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".single-blog-content",
                    ignoreTexts: [/.*امتیاز.*/]
                },
                category: {
                    selector: "li.meta-category a",
                },
                tags: ".post-tags a"
            },
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        void category, first, second

        if (first.includes("برنامه نویسی")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (first.includes("عکاسی و ویدیو")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
        if (first.includes("گرافیک و طراحی")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
        return mappedCat
    }
}

export class trip extends clsScrapper {
    constructor() {
        super(enuDomains.trip, "trip.ir", {
            basePath: "/blog",
            selectors: {
                article: ".post-content-img",
                title: "h1",
                datetime: {
                    conatiner: "span.date",
                },
                content: {
                    main: ".blog-text-conetent, .b-post-img",
                },
                category: {
                    selector: "ul.list-items li a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".b-cm-container .comment-box"),
                    author: "p.person strong",
                    datetime: "span.date",
                    text: "p.comment"
                }
            },
            url: {
                extraInvalidStartPaths: ['/Report/DownloadFile']
            }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class parshistory extends clsScrapper {
    constructor() {
        super(enuDomains.parshistory, "parshistory.com", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .single-featured a",
                    ignoreNodeClasses: ["ez-toc-container-direction"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                },
                tags: ".post-tags a",
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Historical }
    }
}

export class rawanshenas extends clsScrapper {
    constructor() {
        super(enuDomains.rawanshenas, "rawanshenas.ir", {
            selectors: {
                article: "article.main-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".text, .featured-image",
                    ignoreNodeClasses: ["kk-star-ratings"],
                },
                category: {
                    selector: ".single-categories a",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".bottom-tags a"),
            },
            url: { removeWWW: true }
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Consultation }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("دکتری") ||
            first.startsWith("رشته های ")
        ) return { ...mappedCat, subminor: enuMinorCategory.Education }
        else if (first.startsWith("عمومی")) return { ...mappedCat, subminor: enuMinorCategory.Generic }

        return mappedCat
    }
}

export class telescope extends clsScrapper {
    constructor() {
        super(enuDomains.telescope, "telescope.ir", {
            basePath: "/mag",
            selectors: {
                article: "[data-id='bb6c7d8']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) =>
                        fullHtml.querySelectorAll(".elementor-widget-theme-post-content .elementor-widget-container>*"),
                    ignoreNodeClasses: ["kk-star-ratings", "elementor-toc__list-item-text-wrapper"],
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: ".rank-math-breadcrumb p a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li article"),
                    author: "cite.comment-author",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Cosmos }
    }
}

export class mendellab extends clsScrapper {
    constructor() {
        super(enuDomains.mendellab, "mendel-lab.com", {
            selectors: {
                article: ".content-wrapper .blog-body",
                title: "h1",
                datetime: {
                    conatiner: "span.content-info-val"
                },
                content: {
                    main: ".content-body",
                },
                tags: ".content-tags a",
                comments: async (url: URL, reqParams: IntfRequestParams): Promise<IntfComment[]> => {
                    const comments: IntfComment[] = []
                    const match = url.pathname.match(/(\d+)$/);
                    const retrieveComments = async () => {
                        await axiosGet(log,
                            {
                                ...reqParams,
                                url: `https://mendel-lab.com/api/comments/getAll?sourceType=Blog&sourceId=${match?.[0]}`,
                                headers: {
                                    "Content-Type": "application/json; charset=UTF-8"
                                },
                                onSuccess: async (res: any) => {
                                    res.data.comments.forEach((item: any) => {
                                        comments.push({
                                            text: normalizeText(item.description),
                                            author: normalizeText(item.creator),
                                            date: item.createDate.substring(0, 10)
                                        })
                                        item.replies?.forEach((child: any) => {
                                            comments.push({
                                                text: normalizeText(child.description),
                                                author: normalizeText(child.creator),
                                                date: child.createDate.substring(0, 10)
                                            })
                                        })
                                    })
                                },
                                onFail: (e) => { log.error(e) }
                            }
                        )
                    }

                    await retrieveComments()

                    return comments
                },
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/services"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class faab extends clsScrapper {
    constructor() {
        super(enuDomains.faab, "faab.ir", {
            basePath: "/blog",
            selectors: {
                article: "[data-id='3a9d0a94']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "[data-id='287528c6'] div, .elementor-widget-theme-post-featured-image div",
                    ignoreTexts: [/.*IRPP.*/]
                },
                category: {
                    selector: ".rank-math-breadcrumb p a",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
    }
}

export class wikiravan extends clsScrapper {
    constructor() {
        super(enuDomains.wikiravan, "wikiravan.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["toc_transparent", "box", "sss-slider"],
                    ignoreTexts: [/.*<img.*/, /.*html.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
}

export class arzfi extends clsScrapper {
    constructor() {
        super(enuDomains.arzfi, "wiki.arzfi.net", {
            selectors: {
                article: ".BlogId_post_container__co0xh",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: "[style='line-height:2rem'], .BlogId_picture__IkztZ",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.CryptoCurrency }
    }
}

export class gishniz extends clsScrapper {
    constructor() {
        super(enuDomains.gishniz, "blog.gishniz.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".tags-links.mb-3 a",
                },
                tags: ".tagcloud a",
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class chemibazar extends clsScrapper {
    constructor() {
        super(enuDomains.chemibazar, "blog.chemibazar.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["ez-toc-v2_0_17", "ez-toc-section"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-cat-wrap a"),
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Chemical }
    }
}

export class mehrdadcivil extends clsScrapper {
    constructor() {
        super(enuDomains.mehrdadcivil, "mehrdadcivil.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["wp-embedded-content", "tagcloud"],
                    ignoreTexts: [/.*مقالات مرتبط.*/, /.*برچسب ها.*/, /.*مقالات مشابه.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class sakkook extends clsScrapper {
    constructor() {
        super(enuDomains.sakkook, "blog.sakkook.ir", {
            selectors: {
                article: "article",
                title: "h1",
                subtitle: "h2.entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["post-bottom-meta"]
                },
                category: {
                    selector: "#breadcrumb a",
                    startIndex: 1
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
    }
}

export class bestfarsi extends clsScrapper {
    constructor() {
        super(enuDomains.bestfarsi, "bestfarsi.ir", {
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                subtitle: "h2.entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-meta"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }

    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!cat) return mappedCat
        void cat, first, second

        if (cat.includes('سبک زندگی') || cat.includes("زیبایی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes('تکنولوژی')) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.includes('سلامت')) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes('فرهنگ')) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.includes('عجیب') || cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes('آشپزی')) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat.includes('گردشگری')) return { ...mappedCat, minor: enuMinorCategory.Tourism }

        return mappedCat
    }

}

export class hamgardi extends clsScrapper {
    constructor() {
        super(enuDomains.hamgardi, "hamgardi.com", {
            selectors: {
                article: ".mainContent-about-int",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: "span.blog-side-date",
                    acceptNoDate: true,
                },
                content: {
                    main: ".hm-html-editor-body",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    startIndex: 1
                },
                tags: "ul.generalTags li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".secondSecComment div div, #appendLoadComment li"),
                    author: ".author-name a",
                    datetime: "li.comntDate",
                    text: "p.commentContent"
                }
            },
            url: {
                extraInvalidStartPaths: ["/flight", "/hotel", "/fa/Visa", "/fa/Tour", "/fa/Tickets", "/fa/Gallery", "/fa/Place"]
            }
        })
    }

    protected normalizePath(url: URL): string {
        if (url.pathname.includes("cdn.hamgardi.com")) {
            return url.toString().replace("www.hamgardi.com", "")
        } else
            return url.toString()
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class novin extends clsScrapper {
    constructor() {
        super(enuDomains.novin, "novin.com", {
            basePath: "/blog",
            selectors: {
                article: ".blog-single",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content, .blog-single-image-holder",
                },
                category: {
                    selector: ".blog-single-categories a",
                },
            },
            url: {
                extraInvalidStartPaths: ["/academy", "/experts"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class zibamoon extends clsScrapper {
    constructor() {
        super(enuDomains.zibamoon, "zibamoon.com", {
            selectors: {
                article: ".DetailArea",
                title: "h1",
                subtitle: "p.DetailShortText",
                datetime: {
                    conatiner: ".Date span"
                },
                content: {
                    main: ".DetailText, .DetailImageArea picture",
                    ignoreNodeClasses: ["TableOfContent"],
                    ignoreTexts: [/.*حتما بخوانید.*/]
                },
                category: {
                    selector: ".BreadCrumbArea ul li a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".CM .CMArea"),
                    author: ".CMUserName",
                    text: ".CMText"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
    }
}

export class iranacademy extends clsScrapper {
    constructor() {
        super(enuDomains.iranacademy, "iran-academy.org", {
            selectors: {
                article: "article",
                title: "h1",
                subtitle: "p.DetailShortText",
                datetime: {
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: "h2, p, ol",
                    ignoreNodeClasses: ["kt-comments"]
                },
                category: {
                    selector: ".BreadCrumbArea ul li a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".kt-comments .kt-comments__item"),
                    author: ".o-media__body div a",
                    datetime: "time",
                    text: ".kt-comment-message"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
    }
}

export class digistyle extends clsScrapper {
    constructor() {
        super(enuDomains.digistyle, "digistyle.com", {
            basePath: "/mag",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content, .post-format",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs ol li a"),
                },
                tags: ".tags_box a",
            },
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
    }
}

export class parscoders extends clsScrapper {
    constructor() {
        super(enuDomains.parscoders, "parscoders.com", {
            basePath: "/blog",
            selectors: {
                article: "article.blog-single-post, .container-xxl .col-lg-8",
                title: "h1, h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], .container-xxl .col-lg-8 .pt-2 .col-md-4"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || el.querySelector(".align-self-end")?.innerText || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                    alternative: ">*",
                    ignoreNodeClasses: ["post-block", "kk-star-ratings", "post-meta", 'font-iranSans-bold', "text-secondary", 'd-flex'],
                    ignoreTexts: [/.*برچسب ها.*/],

                },
                tags: "a[rel='tag'], a[type='button']",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                extraInvalidStartPaths: ["/resume/", "/my-project"]
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class liangroup extends clsScrapper {
    constructor() {
        super(enuDomains.liangroup, "liangroup.net", {
            basePath: "/blog",
            selectors: {
                article: "article.rd-single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-text-editor div, .rd-single-thumbnail",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.rd-breadcrumbs li a"),
                    startIndex: 1
                },
                tags: "ul.rd-tags li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div"),
                    author: ".author-link cite a",
                    text: ".comment-content"
                }
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Security }
    }
}

export class honareseda extends clsScrapper {
    constructor() {
        super(enuDomains.honareseda, "honareseda.com", {
            basePath: "/bloghonar",
            selectors: {
                article: "[role='article']",
                title: "h1",
                datetime: {
                    conatiner: ".date"
                },
                content: {
                    main: ".entry-content, .wp-block-image figure",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs span a"),
                    startIndex: 1
                },
                tags: ".post-tags a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.commentlist li article"),
                    author: ".comment-author b",
                    text: ".comment-content"
                }
            },
            url: {
                extraInvalidStartPaths: ["/product"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
    }
}

export class malltina extends clsScrapper {
    constructor() {
        super(enuDomains.malltina, "blog.malltina.com", {
            selectors: {
                article: "article.main-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: "section.post-content",
                    ignoreTexts: [/.*<img.*/, /.*Banner.*/]
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class webpouya extends clsScrapper {
    constructor() {
        super(enuDomains.webpouya, "webpouya.com", {
            basePath: "/blog",
            selectors: {
                article: ".itemView",
                title: "h1",
                datetime: {
                    conatiner: "span.itemDateModified"
                },
                content: {
                    main: ".itemBody",
                    ignoreNodeClasses: ["itemDateModified"]
                },
                category: {
                    selector: ".itemCategory a",
                },
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("آموزش"))
            return { ...mappedCat, subminor: enuMinorCategory.Education }

        return mappedCat
    }
}

export class watereng extends clsScrapper {
    constructor() {
        super(enuDomains.watereng, "watereng.ir", {
            basePath: "/blog",
            selectors: {
                article: ".post-single-wrapper-container",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#post-the-conetnt-toc",
                    ignoreNodeClasses: ["kk-star-ratings"]
                },
                category: {
                    selector: "a.single-post-category-item, .post-acl-image-container",
                },
                tags: "a.single-post-tag-item",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li .comment-body"),
                    author: ".comment-author cite",
                    text: "p"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("آموزش")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (first.startsWith("مالتی مدیا")) return { ...mappedCat, subminor: enuMinorCategory.Multimedia }

        return mappedCat
    }
}

export class iraneurope extends clsScrapper {
    constructor() {
        super(enuDomains.iraneurope, "iran-europe.net", {
            basePath: "/blog",
            selectors: {
                article: "article.single-big",
                title: "h1",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: ".entry-content, img.wp-post-image",
                    ignoreNodeClasses: ["kk-star-ratings"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[itemprop='itemListElement'] a"),
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li article"),
                    author: "cite.comment_author_name",
                    text: ".comment_text"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education, subminor: enuSubMinorCategory.Language }
    }
}

export class emalls extends clsScrapper {
    constructor() {
        super(enuDomains.emalls, "emalls.ir", {
            basePath: "/News/16",
            selectors: {
                article: ".blog-show",
                title: "h1",
                summary: ".summary",
                datetime: {
                    conatiner: "time",
                    splitter: "-"
                },
                content: {
                    main: "#ContentPlaceHolder1_lblContent, #ContentPlaceHolder1_imgImage",
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class shereno extends clsScrapper {
    constructor() {
        super(enuDomains.shereno, "shereno.com", {
            basePath: "/blog",
            selectors: {
                article: "[onbeforecopy='return false;']",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".hbs span:nth-child(3)"),
                },
                content: {
                    main: "p, picture",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    startIndex: 1
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^مطالب ادبی\//, "").trim()
    }
    mapCategoryImpl(category?: string): IntfMappedCategory {
        if (category?.includes("مذهبی")
            || category?.includes("مذهبی")
            || category?.includes("امام زمان")
        )
            return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Religious }
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
    }
}

export class scorize extends clsScrapper {
    constructor() {
        super(enuDomains.scorize, "scorize.com", {
            basePath: "/blog",
            selectors: {
                article: ".blog__box",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: ".blog__box div:nth-child(1) div:nth-child(1) span",
                    splitter: (el: HTMLElement) => {
                        const date = super.extractDate(el, el.classList.contains("comment-date") ? " " : "،")
                        if (date && date.length < 9 && fa2En(date[0]) === "0") {
                            return "14" + date
                        } else if (date && date.length < 9 && fa2En(date[0]) !== "0") {
                            return "13" + date
                        }
                        return date || "DATE NOT FOUND"
                    }
                },
                content: {
                    main: "p, h2, picture",
                    ignoreNodeClasses: ["custom-row"],
                    ignoreTexts: ["تاریخ ثبت:", "نویسنده:"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a.testimonial__tag__item"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments_wrapper .comments__item"),
                    author: "p.title",
                    datetime: "p.date",
                    text: ".content"
                }
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class exbito extends clsScrapper {
    constructor() {
        super(enuDomains.exbito, "exbito.com", {
            basePath: "/blog",
            selectors: {
                article: "main.pt-3\\.5 article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content, figure.post-image div",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a.px-1"),
                },
                tags: " div.my-4.flex.items-center.gap-1 a.bg-tag",
                comments: {
                    container: ".mt-16 div div div",
                    text: "div.text-design-black.mt-4"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.CryptoCurrency }
    }
}

export class tarjomic extends clsScrapper {
    constructor() {
        super(enuDomains.tarjomic, "tarjomic.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, img.wp-post-image",
                    ignoreNodeClasses: ["has-background", "ez-toc-v2_0_55"],
                    ignoreTexts: ["مطالب مرتبط"]
                },
                category: {
                    selector: "span.cat-links a",
                },
                tags: "span.tags-links a",
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class sesotweb extends clsScrapper {
    constructor() {
        super(enuDomains.sesotweb, "3sotweb.com", {
            basePath: "/مقالات",
            selectors: {
                article: ".share-simple",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".wpb_text_column",
                    ignoreNodeClasses: ["kk-star-ratings"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumbs li a"),
                    startIndex: 1
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class amuzeshtak extends clsScrapper {
    constructor() {
        super(enuDomains.amuzeshtak, "amuzeshtak.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["post-bottom-tags"],
                    ignoreTexts: [/.*آموزش پیشنهادی.*/]
                },
                category: {
                    selector: "#breadcrumb a",
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Art }
    }
}

export class tehranserver extends clsScrapper {
    constructor() {
        super(enuDomains.tehranserver, "tehranserver.ir", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["post-bottom-tags"],
                    ignoreTexts: [/.*آموزش پیشنهادی.*/]
                },
                category: {
                    selector: "#breadcrumb a",
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class iranestekhdam extends clsScrapper {
    constructor() {
        super(enuDomains.iranestekhdam, "iranestekhdam.ir", {
            basePath: "/blog/",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-v2_0_52"],
                    ignoreTexts: [/.*مطلب مرتبط:.*/, /.*جهت مشاهده.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("span.post-cat-wrap a"),
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }

    normalizePath(url: URL) {
        if (!url.toString().includes("/blog"))
            return url.toString().slice(0, 29) + "blog/" + url.toString().slice(29)
        return url.toString()
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class sinapub extends clsScrapper {
    constructor() {
        super(enuDomains.sinapub, "sina-pub.ir", {
            basePath: "/.category/blog",
            selectors: {
                article: ".position-sticky section",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: "div:nth-child(3), #page-post-cover-container div div",
                    ignoreNodeClasses: ["border-bottom", "toc-section", "toc-box-content", "r-row-warning", "related-link-block", "r-animation"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".position-sticky nav div a"),
                },
                tags: ".border-bottom a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".col-12.col-md-12 .dfv02v9a-comment-layer"),
                    author: ".dfv02v9a-comment-profile-name",
                    text: ".dfv02v9a-comment-text"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class mihanwebhost extends clsScrapper {
    constructor() {
        super(enuDomains.mihanwebhost, "mihanwebhost.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h2.entry-title",
                datetime: {
                    conatiner: "span.entry-date"
                },
                content: {
                    main: ".entry-content, .entry-thumb img",
                },
                category: {
                    selector: ".entry-cate a",
                },
                tags: ".tag-cloud ul li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#show-comments .comment"),
                    author: ".comment-author",
                    datetime: "span.comment-date",
                    text: ".comment-text"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class fitamin extends clsScrapper {
    constructor() {
        super(enuDomains.fitamin, "fitamin.ir", {
            basePath: "/mag",
            selectors: {
                article: ".col-lg-8.mb-3",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".article-text, figure.wp-block-image",
                    ignoreNodeClasses: ["toc-header", "single-related-link"]
                },
                category: {
                    selector: "#breadcrumbs nav p a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments .comment div .comment-content"),
                    author: "[itemprop='name']",
                    text: "[itemprop='commentText']"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class ivahid extends clsScrapper {
    constructor() {
        super(enuDomains.ivahid, "ivahid.com", {
            basePath: "/blog",
            selectors: {
                article: "article.container",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".sitePost__content, figure.wp-block-image",
                },
                tags: "a.uiTag",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li "),
                    author: ".author",
                    text: ".comment-body"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class cafeamoozeshgah extends clsScrapper {
    constructor() {
        super(enuDomains.cafeamoozeshgah, "cafeamoozeshgah.com", {
            basePath: "/blog",
            selectors: {
                article: ".blog-loop-inner.post-single > article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: ".category a"
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Education }
    }
}

export class khanoumi extends clsScrapper {
    constructor() {
        super(enuDomains.khanoumi, "khanoumi.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.wp-block-image",
                    ignoreNodeClasses: ["ez-toc-v2_0_58", "rmp-widgets-container"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
                },
                tags: ".post-cat-wrap a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
    }
}

export class portal extends clsScrapper {
    constructor() {
        super(enuDomains.portal, "portal.ir", {
            basePath: "/blog",
            selectors: {
                article: ".col-xl-11",
                title: "h1",
                datetime: {
                    conatiner: "time",
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".blog-single-content, .mb-md-5",
                    ignoreNodeClasses: ["blog-single-table-of-content"]
                },
                category: {
                    selector: ".blog-single-categories a",
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-comments-holder .article-comment"),
                    author: "h4[itemprop='author']",
                    datetime: "[itemprop='dateCreated']",
                    text: ".article-comment-text"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Forum, minor: enuMinorCategory.DigitalMarketing }
    }
}

export class arongroups extends clsScrapper {
    constructor() {
        super(enuDomains.arongroups, "blog.arongroups.co", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-text-editor .elementor-widget-container>*, .elementor-widget-image div img, .parallax-thumb div",
                    ignoreTexts: [/.*بیشتر بخوانید.*/]

                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[property='itemListElement'] a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class taraz extends clsScrapper {
    constructor() {
        super(enuDomains.taraz, "blog.taraz.org", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.wp-block-image",
                    ignoreNodeClasses: ["ez-toc-v2_0_58", "rmp-widgets-container"],
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
                },
                tags: ".post-cat-wrap a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
    }
}

export class zhaket extends clsScrapper {
    constructor() {
        super(enuDomains.zhaket, "zhaket.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content__body",
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb span span a"),
                    startIndex: 1
                },
                tags: ".content__terms div a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comment__list li article"),
                    author: "header.comment__header h6",
                    text: ".comment__body"
                }
            },
        })
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        void category, first, second
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
        if (first.startsWith("اخبار")) return { ...mappedCat, major: enuMajorCategory.News }
        if (first.startsWith("کسب")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        return mappedCat
    }
}

export class azaronline extends clsScrapper {
    constructor() {
        super(enuDomains.azaronline, "azaronline.com", {
            basePath: "/blog",
            selectors: {
                article: "article.ps-xl-0",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content, .d-sm-block.img-wrapper",
                    ignoreNodeClasses: ["tableOfContent", "member"]
                },
            },
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class arazcloud extends clsScrapper {
    constructor() {
        super(enuDomains.arazcloud, "arazcloud.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                },
                category: {
                    selector: "#breadcrumb a",
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("آموزشی")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (second.startsWith("ارز دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency }
        if (second.startsWith("همه")) return { ...mappedCat, minor: enuMinorCategory.Generic }

        return mappedCat
    }
}

export class poonehmedia extends clsScrapper {
    constructor() {
        super(enuDomains.poonehmedia, "poonehmedia.com", {
            basePath: "/blog",
            selectors: {
                article: ".com-content-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".com-content-article__body",
                    ignoreNodeClasses: ["headings-list"]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".jreview-listing .reviewBlock"),
                    author: "span.re-author-name",
                    text: ".re-control-value"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class kidzy extends clsScrapper {
    constructor() {
        super(enuDomains.kidzy, "kidzy.land", {
            basePath: "/blog",
            selectors: {
                article: "[data-elementor-type='single-post']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container>*, .elementor-widget-theme-post-featured-image",
                    ignoreNodeClasses: ["m-a-box-profile", "elementor-posts--thumbnail-top"]
                },
                tags: ".elementor-post-info__terms-list a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "cite",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
    }
}

export class khanomsin extends clsScrapper {
    constructor() {
        super(enuDomains.khanomsin, "khanomsin.ir", {
            basePath: "/blog",
            selectors: {
                article: ".post-single article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .post-thumbnail img.size-full",
                    ignoreTexts: [/.*اگر کسب و کار آنلاین دارید.*/]
                },
                category: {
                    selector: ".post-meta.category a",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class techranco extends clsScrapper {
    constructor() {
        super(enuDomains.techranco, "techranco.ir", {
            basePath: "/بلاگ",
            selectors: {
                article: ".text-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".single-content",
                    ignoreNodeClasses: ["lwptoc"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs span span a"),
                    startIndex: 1
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class tlyn extends clsScrapper {
    constructor() {
        super(enuDomains.tlyn, "tlyn.ir", {
            basePath: "/blog",
            selectors: {
                article: "article.ast-article-single",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .entry-header .post-thumb-img-content",
                    ignoreNodeClasses: ["ez-toc-v2_0_61"]
                },
                category: {
                    selector: ".ast-terms-link a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.ast-comment-list li article"),
                    author: ".ast-comment-cite-wrap cite b",
                    datetime: "time",
                    text: ".ast-comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.GoldSilver }
    }
}

export class parspack extends clsScrapper {
    constructor() {
        super(enuDomains.parspack, "parspack.com", {
            basePath: "/blog",
            selectors: {
                article: ".post-content",
                title: "h1",
                datetime: {
                    conatiner: "span.button__text"
                },
                content: {
                    main: ".content, .content__img figure",
                    ignoreNodeClasses: ["button-container", "button__text", "cta-button", "enlighter-default"]
                },
                category: {
                    selector: "nav.page-breadcrumb a",
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list article"),
                    author: "footer .comment-author .detail .name",
                    datetime: "span.button__text",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (!cat) return { ...mappedCat, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ICT }
        void cat, first, second

        if (first.startsWith("آموزش برنامه نویسی")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (first.startsWith("آموزش سیستم عامل")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
        if (first.startsWith("آموزش شبکه")) return { ...mappedCat, subminor: enuSubMinorCategory.Network }
        if (first.startsWith("اخبار فناوری")) return { ...mappedCat, major: enuMajorCategory.News, minor: enuMinorCategory.ICT }
        if (first.startsWith("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
        if (first.startsWith("سرویس های میزبانی")) return { ...mappedCat, subminor: enuMinorCategory.IT }
        if (first.startsWith("کسب و کار اینترنتی")) return { ...mappedCat, subminor: enuMinorCategory.IT }
        if (first.startsWith("کنترل پنل")) return { ...mappedCat, subminor: enuMinorCategory.IT }
        if (first.startsWith("مدیریت محتوا")) return { ...mappedCat, subminor: enuMinorCategory.IT }
        if (first.startsWith("معرفی قوانین انتقال، خرید و ثبت انواع دامنه")) return { ...mappedCat, subminor: enuMinorCategory.IT }

        return mappedCat
    }
}

export class pdf extends clsScrapper {
    constructor() {
        super(enuDomains.pdf, "pdf.co.ir", {
            basePath: "/blog",
            selectors: {
                article: ".blog-post",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".blog-post-text, .entry-image",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.DigitalMarketing }
    }
}

export class ipresta extends clsScrapper {
    constructor() {
        super(enuDomains.ipresta, "ipresta.ir", {
            basePath: "/blog",
            selectors: {
                article: "#dmtb_cont_cont",
                title: "h1",
                datetime: {
                    conatiner: "span.dir_ltr"
                },
                content: {
                    main: ".description",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
                    startIndex: 1
                },
            },
            url: {
                extraInvalidStartPaths: ["/discover/"]
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class irancell extends clsScrapper {
    constructor() {
        super(enuDomains.irancell, "blog.irancell.ir", {
            selectors: {
                article: "section.p-0",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("p.date")
                },
                content: {
                    main: ".col-md-11",
                    ignoreNodeClasses: ["button-container", "button__text", "cta-button", "enlighter-default"]
                },
                category: {
                    selector: "nav.page-breadcrumb a",
                    startIndex: 1
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class farazsms extends clsScrapper {
    constructor() {
        super(enuDomains.farazsms, "farazsms.com", {
            basePath: "/blog",
            selectors: {
                article: ".col-md-8.col-lg-9, article.status-publish",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".cdesc.cforms",
                    ignoreNodeClasses: ["kk-star-ratings"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#blog-breadcrumbs span span a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.acomment-list li"),
                    author: "span.author_comment",
                    text: ".cdesc"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ICT }
    }
}

export class raygansms extends clsScrapper {
    constructor() {
        super(enuDomains.raygansms, "raygansms.com", {
            basePath: "/blog",
            selectors: {
                article: ".col-lg-8",
                title: "h1",
                datetime: {
                    conatiner: "#ContentPlaceHolder1_lbl_date"
                },
                content: {
                    main: ".line-height-30, img.img-thumbnail",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.acomment-list li"),
                    author: "span.author_comment",
                    text: ".cdesc"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
    }
}

export class melipayamak extends clsScrapper {
    constructor() {
        super(enuDomains.melipayamak, "melipayamak.com", {
            basePath: "/blog",
            selectors: {
                article: ".blog-single-top-holder",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(
                        ".blog-single-content .blog-single-content-inner .post-content"),
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: ".blog-single-categories a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li"),
                    author: "h4.comment-author",
                    text: ".comment-text-holder"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
    }
}

export class mopon extends clsScrapper {
    constructor() {
        super(enuDomains.mopon, "blog.mopon.ir", {
            selectors: {
                article: "section.single-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                },
                category: {
                    selector: "ul.post-categories li a",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.commentlist li .comment-body"),
                    author: ".comment-author cite.fn",
                    text: "p"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
    }
}

export class clickaval extends clsScrapper {
    constructor() {
        super(enuDomains.clickaval, "clickaval.com", {
            basePath: "/blog",
            selectors: {
                article: "article.single-article",
                title: "h1",
                subtitle: ".description-text",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".single-article-textarea",
                    ignoreNodeClasses: ["related-post-inline"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb-ul li a"),
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^صفحه اصلی\//, "").trim()
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class alomohtava extends clsScrapper {
    constructor() {
        super(enuDomains.alomohtava, "alomohtava.com", {
            basePath: "/blog",
            selectors: {
                article: "article.blog-single",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: ".meta-holder ul li:nth-child(3)"
                },
                content: {
                    main: ".main-des",
                    ignoreTexts: [/.*WordPress.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comment-area .comment-item .meta-c"),
                    author: "h5",
                    text: "p"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
    }
}

export class behtarinideh extends clsScrapper {
    constructor() {
        super(enuDomains.behtarinideh, "behtarinideh.com", {
            basePath: "/blog",
            selectors: {
                article: ".post-single article",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["safine-full-schema-container"],
                    ignoreTexts: [/.*<img.*/, /.*اینستاگرام ما را بخوانید.*/, /.*حتما بخوانید:.*/]
                },
                tags: ".post-tags a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs span a"),
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^بهترین ایده\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.DigitalMarketing }
    }
}

export class podium extends clsScrapper {
    constructor() {
        super(enuDomains.podium, "blog.podium.ir", {
            selectors: {
                article: ".page-content",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".single-post__content",
                    ignoreNodeClasses: ["single-post__content__post-info", "single-post__content__tags", "wp-block-buttons"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".single-post__thumbnail__caption__meta__cats a"),
                },
                tags: ".single-post__content__tags a",
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
        if (!cat) return mappedCat
        void cat, first, second

        if (first.startsWith("اخبار")) mappedCat.major = enuMajorCategory.News
        if (first.startsWith("گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Tourism, subminor: enuMinorCategory.Economics }
        if (second.startsWith("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.Economics }

        return mappedCat
    }
}

export class infogramacademy extends clsScrapper {
    constructor() {
        super(enuDomains.infogramacademy, "infogramacademy.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: "span.date"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["kk-star-ratings", "rtoc-mokuji-content", "wp-block-buttons", "post-shortlink"]
                },
                category: {
                    selector: "#breadcrumb a",
                },
                tags: "span.post-cat-wrap a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Journalism }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.includes("بازاریابی")) mappedCat.minor = enuMinorCategory.Economics

        return mappedCat
    }
}

export class idpay extends clsScrapper {
    constructor() {
        super(enuDomains.idpay, "blog.idpay.ir", {
            selectors: {
                article: "article.view-mode-full",
                title: "h2",
                summary: ".field-name-field-summary",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".field-name-field-p-body, .image",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb a"),
                },
                tags: "ul.links li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#comments .comment"),
                    author: "b.comment-author",
                    text: ".field-name-comment-body"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^وبلاگ\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
    }
}

export class payamgostar extends clsScrapper {
    constructor() {
        super(enuDomains.payamgostar, "payamgostar.com", {
            basePath: "/blog",
            selectors: {
                article: "article.single-post-detail",
                title: "h1",
                datetime: {
                    conatiner: ".meta-date"
                },
                content: {
                    main: ".entry-content, .post-thumbnail",
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: "span.meta-category a",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
    }
}

export class nabzemarketing extends clsScrapper {
    constructor() {
        super(enuDomains.nabzemarketing, "nabzemarketing.com", {
            basePath: "/blog",
            selectors: {
                article: "[data-elementor-type='single-post']",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container>*, img.attachment-large",
                    ignoreNodeClasses: ["kk-star-ratings", "elementor-widget__width-initial", "elementor-button-align-stretch", "elementor-field"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[data-id='60d59e19'] div p a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("h3.elementor-heading-title a"),
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT, subminor: enuMinorCategory.SEO }
    }
}

export class transis extends clsScrapper {
    constructor() {
        super(enuDomains.transis, "transis.me", {
            basePath: "/blog",
            selectors: {
                article: ".article",
                title: "h1",
                datetime: {
                    conatiner: "li.time"
                },
                content: {
                    main: ".col-lg-10 .section, .article_image",
                    ignoreTexts: [/.*IRPP.*/]
                },
                category: {
                    selector: ".t-12.t-category",
                },
                tags: ".t-14.t-category"
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class bitpin extends clsScrapper {
    constructor() {
        super(enuDomains.bitpin, "bitpin.ir", {
            basePath: "/academy",
            selectors: {
                article: ".mx-auto > .mt-2 > .w-full",
                title: "h1",
                datetime: {
                    conatiner: "span.mr-2"
                },
                content: {
                    main: "#post-content",
                    ignoreNodeClasses: ["multi-internal-link-card", "bpa-download-cp7-wrapper", "ez-toc-v2_0_51_1"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("nav.rank-math-breadcrumb p a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li div .w-full"),
                    author: ".text-sm span.font-bold",
                    datetime: ".text-sm span.text-black-2",
                    text: "p"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.CryptoCurrency }
    }
}

export class fardaname extends clsScrapper {
    constructor() {
        super(enuDomains.fardaname, "fardaname.com", {
            basePath: "/blog",
            selectors: {
                article: ".content.w-full",
                title: "h1",
                datetime: {
                    conatiner: ".item span.value"
                },
                content: {
                    main: "article",
                    ignoreNodeClasses: ["iconed_info_list"],
                },
                category: {
                    selector: "a.rounded-xl",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economics }
    }
}

export class roshadent extends clsScrapper {
    constructor() {
        super(enuDomains.roshadent, "blog.roshadent.com", {
            selectors: {
                article: "article.boxed",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .meta",
                    ignoreNodeClasses: ["meta__info", "meta__comments"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Medical }
    }
}

export class activeidea extends clsScrapper {
    constructor() {
        super(enuDomains.activeidea, "activeidea.net", {
            selectors: {
                article: ".Comments-body",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("span.date-news"),
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("article"),
                    ignoreNodeClasses: ["breadcrumb"],
                    ignoreTexts: [/.*حتما بخوانید.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[itemprop='headline name'] a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".cm-hld .cm-item-row"),
                    author: ".name-user",
                    datetime: ".date-cm",
                    text: ".txt-cm"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        void cat, first, second
        if (cat === 'جالب و خواندنی') return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.DigitalMarketing }
    }
}

export class paziresh24 extends clsScrapper {
    constructor() {
        super(enuDomains.paziresh24, "paziresh24.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: "span.last-updated"
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["ez-toc-v2_0_61", "aiosrs-rating-wrap", "post-shortlink", "shortc-button", "mag-box"],
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^مجله سلامتی پذیرش۲۴\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Medical }
    }
}

export class webkima extends clsScrapper {
    constructor() {
        super(enuDomains.webkima, "webkima.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .entry-image a",
                    ignoreNodeClasses: ["kk-star-ratings", "w-related", "ez-toc-v2_0_57_1"],
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "cite.strong",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class sellfree extends clsScrapper {
    constructor() {
        super(enuDomains.sellfree, "sellfree.ir", {
            basePath: "/category/articles/",
            selectors: {
                article: ".darkoobagahi-in",
                title: "h1 a",
                datetime: {
                    conatiner: ".darkoobdate"
                },
                content: {
                    main: "p.MsoNormal, .darkoobimagev a",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class dargi extends clsScrapper {
    constructor() {
        super(enuDomains.dargi, "dargi.ir", {
            basePath: "/blog/list",
            selectors: {
                article: ".blog-item.radius-0",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: "article .text, .image.full",
                    ignoreNodeClasses: ["date", "category"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs div nav a")
                },
                tags: "nav.tags a",
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Psychology }
    }
}

export class quera extends clsScrapper {
    constructor() {
        super(enuDomains.quera, "quera.org", {
            basePath: "/blog",
            selectors: {
                article: ".single-main-content",
                title: "h1",
                datetime: {
                    conatiner: "span.entry-meta"
                },
                content: {
                    main: ".meta-content, .meta-image img",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs span span a"),
                    startIndex: 1
                },
                tags: "ul.quera-tags-list li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class karlancer extends clsScrapper {
    constructor() {
        super(enuDomains.karlancer, "karlancer.com", {
            basePath: "/blog",
            selectors: {
                article: ".article-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".content-art.mb-5, .thumb-art",
                    ignoreNodeClasses: ["ez-toc-v2_0_53"],
                    ignoreTexts: [/.*مطلب پیشنهادی.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs a"),
                },
                tags: "ul.quera-tags-list li a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".main-comments ul li"),
                    author: ".titauthor strong",
                    text: ".content-cmnt"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        if (!category) return mappedCat
        void category, first, second
        if (category.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (category.includes("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (category.includes("شبکه")) return { ...mappedCat, minor: enuMinorCategory.IT }
        return mappedCat
    }
}

export class hitalki extends clsScrapper {
    constructor() {
        super(enuDomains.hitalki, "hitalki.org", {
            basePath: "/blog",
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, img.aligncenter, figure.single-featured-image",
                    ignoreNodeClasses: ["rmp-widgets-container", "side-aside", "theme-header", "main-nav-wrapper", "fullwidth-entry-title-wrapper",
                        "header-nav", "go-to-top-button", "site-footer", "sidebar", "share-buttons", "post-components"],
                    ignoreTexts: [/.*بیشتر بدانید.*/]
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class azki extends clsScrapper {
    constructor() {
        super(enuDomains.azki, "azki.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-v2_0_51_1"],
                },
                category: {
                    selector: "#breadcrumb a"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        void cat, first, second
        if (cat?.includes("خبر")) return { textType: enuTextType.Formal, major: enuMajorCategory.News, minor: enuMinorCategory.Insurance }
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Insurance }
    }
}

export class mosbatesabz extends clsScrapper {
    constructor() {
        super(enuDomains.mosbatesabz, "mosbatesabz.com", {
            basePath: "/mag",
            selectors: {
                article: "[data-elementor-type='single-post']",
                title: "h1",
                datetime: {
                    conatiner: "ul.elementor-post-info li:nth-child(3)"
                },
                content: {
                    main: ".elementor-widget-theme-post-content .elementor-widget-container>*, img.attachment-large",
                    ignoreNodeClasses: ["kk-star-ratings", "yn-article-text-card", "ez-toc-v2_0_58", "c-ads-5"],
                },
                category: {
                    selector: "nav.rank-math-breadcrumb p a",
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^مقالات\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class karokasb extends clsScrapper {
    constructor() {
        super(enuDomains.karokasb, "karokasb.org", {
            basePath: "/recent-posts",
            selectors: {
                article: "body.single-post article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: "span.tagcloud a",
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class mizbanfa extends clsScrapper {
    constructor() {
        super(enuDomains.mizbanfa, "mizbanfa.net", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        if (cat?.startsWith("خانه/"))
            return cat?.replace(/^خانه\//, "").trim()

        if (cat?.startsWith("مگ/"))
            return cat?.replace(/^مگ\//, "").trim()

        return cat
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.SEO }
        void category, first, second

        if (category?.includes("آموزش")) return { ...mappedCat, subminor: enuMinorCategory.Education }
        if (category?.includes("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
        if (category?.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (category?.includes("کسب و کار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        return mappedCat
    }
}

export class jadvalyab extends clsScrapper {
    constructor() {
        super(enuDomains.jadvalyab, "jadvalyab.ir", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["wpd-not-rated"]
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .wpd-comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
        })
    }

    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        void category, first, second

        if (category?.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (category?.includes("تاریخی")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (category?.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (category?.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (category?.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (category?.includes("فرهنگ و هنر")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (category?.includes("مذهبی")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (category?.includes("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Discussion }
        if (category?.includes("معما")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (category?.includes("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        return mappedCat
    }
}

export class basalam extends clsScrapper {
    constructor() {
        super(enuDomains.basalam, "basalam.com", {
            basePath: "/blog",
            selectors: {
                article: "body.single-post main",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, figure.wp-block-post-featured-image",
                    ignoreNodeClasses: ["ez-toc-v2_0_61", "wp-block-buttons"]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.wp-block-comment-template li div"),
                    author: ".wp-block-comment-author-name",
                    datetime: "time",
                    text: ".wp-block-comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class ghafaridiet extends clsScrapper {
    constructor() {
        super(enuDomains.ghafaridiet, "ghafaridiet.com", {
            basePath: "/article.html",
            selectors: {
                article: ".singlePage ",
                title: "h1",
                datetime: {
                    conatiner: ".singlePage__item li:nth-child(1)"
                },
                content: {
                    main: ".post",
                },
                category: {
                    selector: "ul.breadcrumb li a",
                    startIndex: 1
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^مقالات\//, "").trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        void category, first, second
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (category?.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (category?.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Medical }
        if (category?.includes("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Psychology }
        if (category?.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        return mappedCat
    }
    protected mapsCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class myket extends clsScrapper {
    constructor() {
        super(enuDomains.myket, "myket.ir", {
            basePath: "/mag",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["appnew", "post-bottom-meta"]
                },
                category: {
                    selector: "#breadcrumb a"
                },
                tags: "span.tagcloud a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^مجله مایکت\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ICT, subminor: enuSubMinorCategory.Mobile }
    }
}

export class samanehha extends clsScrapper {
    constructor() {
        super(enuDomains.samanehha, "samanehha.com", {
            selectors: {
                article: ".main-article",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: "article.main-post p, article.main-post h, p[dir='RTL'] img",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a")
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".user-comment .comment-list .comment-container"),
                    author: "span.blue-grad",
                    datetime: "span.cm-date",
                    text: "span.comment"
                }
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^سامانه‌ها\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ICT, subminor: enuSubMinorCategory.Mobile }
    }
}

export class meghdadit extends clsScrapper {
    constructor() {
        super(enuDomains.meghdadit, "meghdadit.com", {
            basePath: "/mag",
            selectors: {
                article: ".post-content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#content-single",
                    ignoreNodeClasses: ["toc_list", "toc_title"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("nav.rank-math-breadcrumb p a")
                },
                tags: ".c-single-article__tags a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.ICT }
    }
}

export class sheypoor extends clsScrapper {
    constructor() {
        super(enuDomains.sheypoor, "blog.sheypoor.com", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, a.post-thumbnail",
                    ignoreNodeClasses: ["ez-toc-v2_0_58", "kk-star-ratings"],
                    ignoreTexts: [/.*بیشتر بخوانید.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                    startIndex: 1
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li .clearfix"),
                    author: ".comment-meta cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }

    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
        void category, first, second

        if (category?.includes("خودرو")) return { ...mappedCat, subminor: enuSubMinorCategory.Car }
        if (category?.includes("دنیای دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (category?.includes("سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (category?.includes("قیمت ها")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        return mappedCat
    }
}

export class drsaina extends clsScrapper {
    constructor() {
        super(enuDomains.drsaina, "drsaina.com", {
            basePath: "/mag",
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], time"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                content: {
                    main: ".entry-content, .single-featured",
                    ignoreNodeClasses: ["post-related", "sidebar-column", "bs-pinning-wrapper", "resource-box", "mega-links",
                        "comments-template", "main-menu-container", "site-footer", "menu-item", "post-share"],
                    ignoreTexts: [/.*<img.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                },
                tags: ".post-header-title .term-badges span a",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li"),
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
            url: {
                extraInvalidStartPaths: [
                    "/doctorConsulation", "/doctors_", "/doctorp", "/RegisterLogin", "/doctor-location", "/ProfileVideo",
                    "/ProfilePaper",
                ]
            }
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
    }
}

export class blogfa extends clsScrapper {
    constructor() {
        super(enuDomains.blogfa, "blogfa.com", {
            selectors: {
                article: "#content, #page, #main, .page, .Sid, .Content, #posts table:nth-child(1)",
                title: "h2, #ptitle a, .title a, .posttitle a, .Post-title a",
                datetime: {
                    conatiner: "#postdesc",
                    acceptNoDate: true
                },
                content: {
                    main: "div:nth-child(1) .postcontent, #post div:nth-child(2) p, div:nth-child(1) .content, .Content div:nth-child(3), "
                        + ".post div:nth-child(2).C-post .CenterPost, .PostBody",
                },
                tags: ".tag a",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.bf-breadcrumb-items li a"),
                },
            },
            url: {
                forceHTTP: true,
                removeWWW: true,
            }
        })
    }

    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class motamem extends clsScrapper {
    constructor() {
        super(enuDomains.motamem, "motamem.org", {
            selectors: {
                article: "#main #content1 .post",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".entry, img",
                    ignoreNodeClasses: ["su-clearfix", "wp_rp_wrap", "su-note-inner", "sue-panel-content", "seriesbox", "widget_recent_comments",
                        "widget_black_studio_tinymce", "nd_tabs", "nd_form", "su-box"]
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog }
    }
}

export class rozblog extends clsScrapper {
    constructor() {
        super(enuDomains.rozblog, "rozblog.com", {
            selectors: {
                article: ".bodys_content .tags, #titlee .fa-comment, .messagerb, .comment_rb",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".pistbit span:nth-child(3), .date"),
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post_content, .CenterPost, .rb_content"),
                    ignoreNodeClasses: ["rb-com-center", "wicon", "rb_com", "caption"],
                    ignoreTexts: [/.*بازدید :.*/]
                },
            },
            url: {
                forceHTTP: true,
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class avablog extends clsScrapper {
    constructor() {
        super(enuDomains.avablog, "avablog.ir", {
            selectors: {
                article: ".sendcomment, .comment",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".date .day"),
                    acceptNoDate: true
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".prod > p > a"),
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".context"),
                    ignoreTexts: [/.*بازدید :.*/, /.*].*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#bodyposts .commentlist"),
                    author: "tr:nth-child(1) td:nth-child(1) span",
                    text: "[colspan='2']"

                }
            },
            url: {
                forceHTTP: true,
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class parsiblog extends clsScrapper {
    constructor() {
        super(enuDomains.parsiblog, "parsiblog.com", {
            selectors: {
                article: "article .post-nav .prev, .w3-button, [rel='prev'], [rel='next'], .Content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h2.entry-title, .title, h3.blog-title, .PostTitle"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time, .postdesc"),
                    splitter: (el: HTMLElement) => {
                        const date = el.innerText;
                        if (date) {
                            const newDate = date.match(/(\d{2,3})\/(\d{1,2})\/(\d{1,2})/);
                            if (!newDate) return "DATE NOT FOUND"
                            return +newDate[1] + 1300 + "/" + newDate[2] + "/" + newDate[3];
                        } else
                            return "DATE NOT FOUND"
                    },
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".entry-content, .w3-col > article > div,"
                        + "article.blogu, .postbody"),
                },
            },
            url: {
                forceHTTP: true,
                removeWWW: true,
                ignoreContentOnPath: ["/Archive"]
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class deyblog extends clsScrapper {
    constructor() {
        super(enuDomains.deyblog, "deyblog.ir", {
            selectors: {
                article: ".post",
                title: ".posttitle",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".postcontent",
                },
            },
            url: {
                forceHTTP: true,
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class blogsazan extends clsScrapper {
    constructor() {
        super(enuDomains.blogsazan, "blogsazan.com", {
            selectors: {
                article: ".blog_center_bar",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                tags: ".tagsbox a",
                content: {
                    main: "div:nth-child(3).main_content",
                    ignoreNodeClasses: ["post_footer", "tagsbox", "bloglinkbox", "post_date", "mid_post_box"]
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class isblog extends clsScrapper {
    constructor() {
        super(enuDomains.isblog, "isblog.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["safine-full-schema-container", "fsrs-star-rating"],
                    ignoreTexts: [/.*حتما بخوانید.*/]

                },
                category: {
                    selector: "#breadcrumb a"
                },
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class monoblog extends clsScrapper {
    constructor() {
        super(enuDomains.monoblog, "monoblog.ir", {
            selectors: {
                article: ".comment-box",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".post-title"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-cnt"),
                },
            },
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class niloblog extends clsScrapper {
    constructor() {
        super(enuDomains.niloblog, "niloblog.com", {
            selectors: {
                article: ".middle .center :nth-child(2) i.fa-copy",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("div > div > p > span:nth-child(5)"),
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll('.center .text'),
                    ignoreNodeClasses: ["info"]
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class rahatblog extends clsScrapper {
    constructor() {
        super(enuDomains.rahatblog, "rahatblog.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-v2_0_62", "author_bio_section"],

                },
                tags: ".tags-links a",
                category: {
                    selector: "ul.post-categories li a"
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.split("/").at(0)?.trim()
    }
    protected mapCategoryImpl(category: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat = { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
        void category, first, second
        if (category?.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (category?.includes(" سبک زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (category?.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (category?.includes("بازیگران")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Celebrities }
        if (category?.includes("اقتصادی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (category?.includes("سلامتی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (category?.includes("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Psychology }
        if (category?.includes("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (category?.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (category?.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        return mappedCat
    }
}

export class toonblog extends clsScrapper {
    constructor() {
        super(enuDomains.toonblog, "toonblog.ir", {
            selectors: {
                article: ".mod_center div:nth-child(2).post, #content > div:nth-child(1)",
                title: ".posttitle",
                datetime: {
                    conatiner: ".postinfo",
                    acceptNoDate: true
                },
                content: {
                    main: ".cnt, .postcontent",
                },
                tags: "blogposttagsblock a",
            },
            url: {
                forceHTTP: true,
            }
        })
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class niniweblog extends clsScrapper {
    constructor() {
        super(enuDomains.niniweblog, "niniweblog.com", {
            selectors: {
                article: "article.post, article.boxask",
                title: "h1",
                datetime: {
                    conatiner: ".postdesc, #date",
                },
                content: {
                    main: ".post3",
                    qa: {
                        containers: ".box-body",
                        q: {
                            container: ".pad10",
                            text: ".askz1",
                            datetime: "#date",
                            author: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".userimg a"),
                        },
                        a: {
                            container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".box-comments .box-comment"),
                            text: ".comment-text",
                            author: ".pskuser a",
                            datetime: ".pskd"
                        },
                    },
                    ignoreNodeClasses: ["catpost", "pskuser"]
                },
                tags: ".catpost a, .psk-hashtag a",
            },
            url: {
                removeWWW: true
            }
        })
    }

    normalizePath(url: URL): string {
        if ((url.toString().includes(".niniweblog") || url.toString().includes("m/niniweblog")))
            return url.toString().replace("https://niniweblog.com/", "https://")
        return url.toString();
    }
    protected mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class b88 extends clsScrapper {
    constructor() {
        super(enuDomains.b88, "b88.ir", {
            selectors: {
                article: ".comment-block",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".post-title"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post-cnt"),
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class blogiran extends clsScrapper {
    constructor() {
        super(enuDomains.blogiran, "blogiran.net", {
            selectors: {
                article: "vb\\:comment_block",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".titlee"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".pistbit div:nth-child(3)")
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post_content"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags a")
            },
            url: {
                removeWWW: true,
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class nasrblog extends clsScrapper {
    constructor() {
        super(enuDomains.nasrblog, "nasrblog.ir", {
            selectors: {
                article: ".bodyposts div:nth-child(1)",
                title: "h2.hl",
                datetime: {
                    conatiner: ".info span:nth-child(2)",
                },
                content: {
                    main: ".cnt",
                    ignoreNodeClasses: ["rating"],
                    ignoreTexts: [/.*برچسب:.*/, /.*بازدید:.*/, /.*رتبه از پنج:.*/, /.*امتیاز دهید:.*/]
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class asblog extends clsScrapper {
    constructor() {
        super(enuDomains.asblog, "asblog.ir", {
            selectors: {
                article: "#content > div:nth-child(1)",
                title: "h2.posttitle",
                datetime: {
                    conatiner: ".postinfo",
                },
                content: {
                    main: ".postcontent",
                    ignoreNodeClasses: ["rating"],
                },
                tags: ".posttags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Hybrid, major: enuMajorCategory.Weblog }
    }
}

export class roocket extends clsScrapper {
    constructor() {
        super(enuDomains.roocket, "roocket.ir", {
            basePath: "/articles",
            selectors: {
                article: ".p-8.mb-8, .mt-9.mb-20",
                title: ".mt-5 h1, .mb-6 h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], .sm\\:mt-0.mt-3 div div span"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("data-time-realtime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article.content-area",
                    qa: {
                        containers: ".container > div",
                        q: {
                            container: ".mb-6.pt-10.px-5",
                            text: ".mb-6 .content-area",
                            author: ".hover\\:underline",
                            datetime: ".sm\\:mt-0.mt-3 div div span"
                        },
                        a: {
                            container: "#replies-list > div",
                            text: ".content-area",
                            author: ".mr-4 a.mb-2",
                            datetime: ".sm\\:mt-0.mt-1 span:nth-child(2)"
                        },
                    },
                },
                tags: "span.hashtag",
                category: {
                    selector: ".px-5.py-2"
                },
            },
            url: {
                removeWWW: true,
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class hamyarwp extends clsScrapper {
    constructor() {
        super(enuDomains.hamyarwp, "hamyarwp.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".time"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("article.category-articles .entry-content"),
                    ignoreTexts: [/.*IRPP.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("a[rel='category tag']")
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class moshaveranetahsili extends clsScrapper {
    constructor() {
        super(enuDomains.moshaveranetahsili, "moshaveranetahsili.ir", {
            selectors: {
                article: "#single-blog",
                title: ".news-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".news",
                    ignoreNodeClasses: ["ez-toc-v2_0_62", "wp-block-buttons"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumbs li a")
                },
                tags: "[rel='tag']"
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
    }
}


export class hamrahmoshaver extends clsScrapper {
    constructor() {
        super(enuDomains.hamrahmoshaver, "hamrahmoshaver.com", {
            selectors: {
                article: ".content-box",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".alink",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[itemprop='itemListElement']"),
                    startIndex: 0,
                    lastIndex: 2
                },
            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law }
    }
}

export class panamag extends clsScrapper {
    constructor() {
        super(enuDomains.panamag, "panamag.ir", {
            selectors: {
                article: "article.entry",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[itemprop='datePublished']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                },

            },
        })
    }
    protected normalizeCategoryImpl(cat?: string | undefined): string | undefined {
        return cat?.replace(/^خانه\//, "").trim()
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Cooking }
    }
}

export class bloging extends clsScrapper {
    constructor() {
        super(enuDomains.bloging, "bloging.ir", {
            selectors: {
                article: ".classic-blog",
                title: "h2.post-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                    ignoreNodeClasses: ["kk-star-ratings", "meta", "post-title"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("span.category a"),
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.IT }
    }
}

export class kojaro extends clsScrapper {
    constructor() {
        super(enuDomains.kojaro, "kojaro.com", {
            selectors: {
                article: "[role='main']",
                title: "h1",
                datetime: {
                    conatiner: ".authorDetails div span:nth-child(2)"
                },
                content: {
                    main: "#printArea",
                },
                category: {
                    selector: "ol.breadcrumb li a",
                    startIndex: 1,
                    lastIndex: 3
                },
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Tourism }
    }
}

export class tarikhema extends clsScrapper {
    constructor() {
        super(enuDomains.tarikhema, "tarikhema.org", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: ".time"
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".post-header-title .term-badge a"
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Weblog, minor: enuMinorCategory.Historical }
    }
}

export class rooziato extends clsScrapper {
    constructor() {
        super(enuDomains.rooziato, "rooziato.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "#main_content > div > div:nth-child(4)",
                    ignoreNodeClasses: ["post_tags"]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#comment-list .comment"),
                    author: "header .name",
                    text: "div"
                },
                category: {
                    selector: ".post-categories ul li a",
                    startIndex: 1
                },
                tags: ".post_tags a"
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class hidoctor extends clsScrapper {
    constructor() {
        super(enuDomains.hidoctor, "hidoctor.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".post-content",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list .comment .comment-body"),
                    author: "span.author span",
                    text: "section.cmtext"
                },
                category: {
                    selector: ".cats a",
                },
                tags: ".post-tags a"
            },
        })
    }
}

export class shabakehmag extends clsScrapper {
    constructor() {
        super(enuDomains.shabakehmag, "shabakeh-mag.com", {
            selectors: {
                article: "article",
                aboveTitle: "div.field-name-field-kicker",
                title: "h1",
                summary: ".field-name-field-summary",
                datetime: {
                    conatiner: "span.date-display-single"
                },
                content: {
                    main: ".field-name-body",
                },
                category: {
                    selector: ".field-name-field-topic a",
                },
                tags: ".field-name-field-tag div div a"
            },
        })
    }
}

export class iliadmag extends clsScrapper {
    constructor() {
        super(enuDomains.iliadmag, "iliadmag.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".content_article_en_date"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: "div",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#content_nav a"),
                    startIndex: 1
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".content_tags a")
            },
        })
    }
}

export class par30games extends clsScrapper {
    constructor() {
        super(enuDomains.par30games, "par30games.net", {
            basePath: "/mag",
            selectors: {
                article: ".single",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content > .post-content",
                    ignoreNodeClasses: ["modality-outer"],
                    ignoreTexts: [/.*<img.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".comments .comment"),
                    author: ".title h3",
                    text: ".comment-text p"
                },
                tags: ".news-tags a"
            },
        })
    }
}

export class asemooni extends clsScrapper {
    constructor() {
        super(enuDomains.asemooni, "asemooni.com", {
            basePath: "/mag",
            selectors: {
                article: ".single-blog-post",
                title: "h1 a",
                summary: ".hdl-ecxerpt",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li.comment .comment-body"),
                    author: ".comment-author a",
                    text: ".comment-content"
                },
                category: {
                    selector: "ul.breadcumbs li a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: ".hdl-post-footer-tags a"
            },
        })
    }
}

export class fardmag extends clsScrapper {
    constructor() {
        super(enuDomains.fardmag, "fardmag.ir", {
            basePath: "/mag",
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content",
                },
                category: {
                    selector: ".post-cat-wrap a",
                },
            },
        })
    }
}

export class ucan extends clsScrapper {
    constructor() {
        super(enuDomains.ucan, "ucan.ir", {
            selectors: {
                article: "article.single-layout",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: "meta[itemprop='datePublished']",
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content_body",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#CommentBox .clearfix .commentBox"),
                    author: ".otherInfo div strong",
                    text: ".otherInfo p"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[typeof='BreadcrumbList'] li a span"),
                    startIndex: 1
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tag-links h3 a")
            },
            url: {
                extraInvalidStartPaths: ["/checkpoint"]
            }
        })
    }
}

export class tarikhirani extends clsScrapper {
    constructor() {
        super(enuDomains.tarikhirani, "tarikhirani.ir", {
            selectors: {
                article: ".article-view",
                title: "h1",
                summary: ".summary",
                datetime: {
                    conatiner: "span.date-info",
                },
                content: {
                    main: ".content",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb li a"),
                    startIndex: 1
                },
                tags: "p.tags a"
            },
            url: {
                removeWWW: true,
                forceHTTP: true
            }
        })
    }
}

export class iichs extends clsScrapper {
    constructor() {
        super(enuDomains.iichs, "iichs.ir", {
            selectors: {
                article: "#docDataRow",
                title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                summary: "#docDivLead1",
                content: {
                    main: ".docContentdiv article",
                    ignoreTexts: [/.*iichs.ir.*/]
                },
                tags: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll('.tags a'),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.created']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                category: {
                    selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".doc-section-info a"),
                    startIndex: 1
                },
            },
        })
    }
}

export class plaza extends clsScrapper {
    constructor() {
        super(enuDomains.plaza, "plaza.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#post-content",
                    ignoreNodeClasses: ["rPref", "tPac"],
                    ignoreTexts: ["فهرست مطالب"]
                },               
                category: {
                    selector: "#breadcrumbs span span a",
                    startIndex: 1
                },
                comments: {
                    container: ".comments .comments__item",
                    author: ".comments__user-title",
                    datetime: ".comments__user-date",
                    text: ".comments__content"
                },
                tags: "ul.single__post-badge li a"           
            },
        })
    }
}

export class irancook extends clsScrapper {
    constructor() {
        super(enuDomains.irancook, "irancook.com", {
            selectors: {
                article: ".post-content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".recipe-box-properties__infos, .recipe-ingredients, .post-content"),
                },               
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".rank-math-breadcrumb p a"),
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comments-list li.comment .comment-body"),
                    author: ".comment-author cite",
                    text: "p"
                },
            },
        })
    }
}


export class cookpad extends clsScrapper {
    constructor() {
        super(enuDomains.cookpad, "cookpad.com", {
            basePath: "/ir",
            selectors: {
                article: "html[lang='fa'] body[data-source-tracking-screen-value='recipe'], html[lang='fa'] body[data-source-tracking-screen-value='tip_page']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#ingredients, #steps, .divide-y.space-y-md.p-sm",
                },               
                tags: ".break-words div:nth-child(1) p:nth-child(1) a"           
            },
            url: {
                extraInvalidStartPaths: ["/ir/regions", "/uy", "/mx", "/sa", "/id", "/vn", "/cl", "/th", "/in", "/my",
                 "/gr", "/ng", "/hu", "/ua", "/pt", "/ir/japanese_site"]
            }
        })
    }
}

export class bazimag extends clsScrapper {
    constructor() {
        super(enuDomains.bazimag, "bazimag.com", {
            selectors: {
                article: ".itemView",
                title: "h1",
                datetime: {
                    conatiner: ".itemDateCreated"
                },
                content: {
                    main: ".itemFullText",
                    ignoreNodeClasses: ["some-more-info"],
                },               
                category: {
                    selector: ".itemFullText > div > span:nth-child(2)",
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".kmt-list li"),
                    author: ".kmt-author span",
                    datetime: "time",
                    text: ".commentText"
                },    
                tags: "ul.itemTags li a"           
            },
        })
    }
}

export class anthropologyandculture extends clsScrapper {
    constructor() {
        super(enuDomains.anthropologyandculture, "anthropologyandculture.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["bs-irp", "social-list"],

                },
                category: {
                    selector: "ul.bf-breadcrumb-items li a",
                    startIndex: 1
                },
            },
        })
    }
}

export class varune extends clsScrapper {
    constructor() {
        super(enuDomains.varune, "varune.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content .post-item-single-container",
                    ignoreNodeClasses: ["caption-align-center", "post-tags"],
                    ignoreTexts: [/.*در ادامه بخوانید.*/]
                },
                category: {
                    selector: ".blog-slider-content .post-categories a"
                },
                tags: ".post-tags a"
            },
        })
    }
}

export class cafebazaar extends clsScrapper {
    constructor() {
        super(enuDomains.cafebazaar, "mag.cafebazaar.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".main-content",
                    ignoreNodeClasses: ["maxbutton-3-container", "tags_post", "owl-carousel", "wp-block-kadence-advancedbtn"],
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".wpd-thread-list .comment"),
                    author: ".wpd-comment-author ",
                    text: ".wpd-comment-text"
                },
                category: {
                    selector: ".category-post a"
                },
                tags: ".tags_post a"
            },
        })
    }
}

export class ipemdad extends clsScrapper {
    constructor() {
        super(enuDomains.ipemdad, "ipemdad.com", {
            selectors: {
                article: "main.card-single",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".content-single",
                    ignoreNodeClasses: ["accordion", "link_section_box"],
                },
                category: {
                    selector: ".sub-cat a",
                    lastIndex: 1
                },
            },
        })
    }
}

export class adyannet extends clsScrapper {
    constructor() {
        super(enuDomains.adyannet, "adyannet.com", {
            selectors: {
                article: "body.page-node-",
                title: "h1.page-title",
                summary: ".chek",
                datetime: {
                    conatiner: "[property='dc:date dc:created']",
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".field-name-body [property='content:encoded']",
                },
                comments: {
                    container: "#comments .comment",
                    author: ".username",
                    datetime: "[property='dc:date dc:created']",
                    text: "[property='content:encoded']"
                },
                tags: "[rel='dc:subject']",
            },
        })
    }
}

export class delgarm extends clsScrapper {
    constructor() {
        super(enuDomains.delgarm, "delgarm.com", {
            selectors: {
                article: "article, .questions",
                title: ".titr, h1",
                subtitle: ".col-c",
                datetime: {
                    conatiner: "time.news-time, .date-jh",
                    acceptNoDate: true
                },
                content: {
                    main: ".mainentry",
                    qa: {
                        containers: ".item-page",
                        q: {
                            container: ".i-quesn",
                            author: ".ques_ff",
                            datetime: ".date-jh",
                            text: ".mh1"
                        },
                        a: {
                            container: ".i-answer",
                            author: ".ques_dd",
                            text: '.mh1'
                        }
                    }
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb ol li a, .bm_s ol li a"),
                    startIndex: 1
                },
                tags: ".c-stg ul li a"
            },
        })
    }
}

export class mejalehhafteh extends clsScrapper {
    constructor() {
        super(enuDomains.mejalehhafteh, "mejalehhafteh.com", {
            selectors: {
                article: "body.single-post",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["sharedaddy"]
                },
                comments: {
                    container: "ol.wp-block-comment-template li",
                    author: ".wp-block-comment-author-name",
                    datetime: "time",
                    text: ".wp-block-comment-content"
                }
            },
        })
    }
}

export class nojavanha extends clsScrapper {
    constructor() {
        super(enuDomains.nojavanha, "nojavanha.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["no_bullets", "TeuxBhlt", "centered-text-area", "kk-star-ratings", "entry-title", "yn-borderbox"],
                    ignoreTexts: [/.*IRPP.*/, /.*پیشنهاد مطالعه.*/]
                },
                category: {
                    selector: ".entry-category a[rel='category tag']",
                },
            },
        })
    }
}


export class mouood extends clsScrapper {
    constructor() {
        super(enuDomains.mouood, "fa.mouood.com", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#crumbs a"),
                    startIndex: 1,
                    lastIndex: 3
                },
            },
            url: {
                forceHTTP: true
            }
        })
    }
}

export class myindustry extends clsScrapper {
    constructor() {
        super(enuDomains.myindustry, "myindustry.ir", {
            selectors: {
                article: "#the-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreTexts: [/.*<img.*/]

                },
                category: {
                    selector: "#breadcrumb a",
                    startIndex: 1
                },
            }
        })
    }
}


export class hadana extends clsScrapper {
    constructor() {
        super(enuDomains.hadana, "hadana.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                subtitle: ".entry-sub-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article .entry-content ",
                    ignoreNodeClasses: ["entry-title", "post-related", "bs-irp"],
                    ignoreTexts: [/.*لینك كوتاه مطلب.*/, /.*جدید ترین مطالب را دریافت كنید.*/]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li"),
                    author: "cite.comment-author",
                    datetime: "time",
                    text: ".comment-content"
                },
                category: {
                    selector: "ul.bf-breadcrumb-items li a",
                    startIndex: 1,
                    lastIndex: 3
                },
                tags: ".post-tags a"
            }
        })
    }
}

export class razebaghaa extends clsScrapper {
    constructor() {
        super(enuDomains.razebaghaa, "razebaghaa.ir", {
            selectors: {
                article: ".news_body",
                title: "h1",
                subtitle: ".subtitle",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".main_news_body",

                },
                category: {
                    selector: ".news_path div a",
                },
                tags: "a.tags_item"
            }
        })
    }
}

export class mihansignal extends clsScrapper {
    constructor() {
        super(enuDomains.mihansignal, "mihansignal.com", {
            selectors: {
                article: "body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "article.post-entry",
                    ignoreNodeClasses: ["after-thumbnail-box", "post-meta", "ez-toc-counter", "cprice-two-cols-container", "tags_and_source_box"],
                },
                category: {
                    selector: ".breadcrumb a",
                },
            }
        })
    }
}

export class daneshjoin extends clsScrapper {
    constructor() {
        super(enuDomains.daneshjoin, "daneshjoin.ir", {
            selectors: {
                article: "body.single-post",
                title: "h1.jeg_post_title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content-inner",
                    ignoreNodeClasses: ["jeg_post_tags", "jnews_inline_related_post_wrapper"]
                },
                category: {
                    selector: "#breadcrumbs span a",
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class engare extends clsScrapper {
    constructor() {
        super(enuDomains.engare, "engare.net", {
            selectors: {
                article: "body.single-post",
                title: "h1.jeg_post_title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".content-inner",
                    ignoreNodeClasses: ["jnews_inline_related_post_wrapper"]
                },
                category: {
                    selector: "#breadcrumbs span a",
                    startIndex: 1
                }
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class eshomer extends clsScrapper {
    constructor() {
        super(enuDomains.eshomer, "mag.eshomer.com", {
            selectors: {
                article: ".single__page",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: '.post-module__content',
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumbs__nav li a"),
                    startIndex: 1
                },
                tags: ".post-module__tags a",
            }
        })
    }
}