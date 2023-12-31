
import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfComment, IntfMappedCatgory } from "../modules/interfaces";
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
    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.Weblog }
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
        })
    }

    normalizePath(url: URL) {
        if (url.pathname.startsWith("/video/") || url.pathname.startsWith("/photo/"))
            return super.normalizePath(url, { pathToCheckIndex: 1, validPathsItemsToNormalize: ["video", "photo"] })
        else if (url.pathname.startsWith("/clinic/question/") || url.pathname.startsWith("/discussion/topic/")) {
            const pathParts = url.pathname.split("/")
            if (pathParts.length > 3)
                return url.protocol + "//" + url.hostname + `/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}/` + url.search
        }
        return url.toString()
    }
    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.Forum }
        const catParts = cat.split('/')
        const first = catParts[0]

        if (first.startsWith("آموزشی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (first.startsWith("ادبیات، فرهنگ و هنر")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if (first.startsWith("ازدواج و شروع زندگی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("اوقات فراغت")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("بارداری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("بانک داروها")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("بانوان")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Women }
        if (first.startsWith("پادکست")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("پدرانه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("پرسش")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Discussion }
        if (first.startsWith("پس از زایمان")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("پیش از بارداری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("پیشنهاد فرهنگی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if (first.startsWith("چه خبر؟")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if (first.startsWith("حیوانات")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        if (first.startsWith("خانواده")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("خردسال")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("دوران بارداری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("دیدنی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("سال ")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("سایر ")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if (first.startsWith("سبک زندگی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("سلامت")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("شیرخوار")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("طنز")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if (first.startsWith("علم و تکنولوژی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech }
        if (first.startsWith("فروشگاههای")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economy }
        if (first.startsWith("فلسفه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if (first.startsWith("فیلم")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("کارتون")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if (first.startsWith("کانون")) return { major: enuMajorCategory.Forum }
        if (first.startsWith("کودک")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("گردشگری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        if (first.startsWith("لباهنگ")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if (first.startsWith("متفرقه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if (first.startsWith("مد و دکوراسیون")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("مدیر سایت")) return { major: enuMajorCategory.Weblog }
        if (first.startsWith("مشاورین")) return { major: enuMajorCategory.Weblog }
        if (first.startsWith("موسیقی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (first.startsWith("نوپا")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (first.startsWith("هنری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (first.startsWith("والدین")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (first.startsWith("ورزشی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Sport }
        if (first.startsWith("ویدئو")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }

        return { major: enuMajorCategory.Forum }
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
    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.Weblog }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("آموزش")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (second.startsWith("اجتماعی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Social }
        if (second.startsWith("ارتباطات")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Social }
        if (second.startsWith("امروز")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if (second.startsWith("تغذیه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (second.startsWith("حوزه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Religious }
        if (second.startsWith("خانواده")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("دانش")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("زندگی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("زیبایی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("سلامت")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (second.startsWith("كتابخانه")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if (second.startsWith("کودک")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.includes("یادگیری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (second.includes("مشاوره")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if (second.includes("ورزشی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Sport }

        return { major: enuMajorCategory.Weblog }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.Weblog }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("آرایش")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("آشپزی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        if (second.startsWith("بهداشت")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if (second.startsWith("رمان")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Text }
        if (second.startsWith("سبک")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if (second.startsWith("سرگرمی")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if (second.startsWith("گالری")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if (second.startsWith("مد ")) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }

        return { major: enuMajorCategory.Weblog }
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.Weblog }
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

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.Weblog }
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
            }
        })
    }
    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.Weblog }
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


    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech }

        if (second.includes("آموزش")) mappedCat.subminor = enuMinorCategory.Education
        else if (second.includes("بازی")) mappedCat.subminor = enuMinorCategory.Game
        else if (second.includes("اپلیکیشن")) mappedCat.subminor = enuSubMinorCategory.Software
        else if (second.includes("تکنولوژی")) mappedCat.subminor = enuMinorCategory.Generic
        else if (second.includes("سخت")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("لپ تاپ")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("موبایل")) mappedCat.subminor = enuSubMinorCategory.Mobile
        else if (second.includes("اسپیکر")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("باکس")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("پاور")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if (second.includes("تبلت")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("ساعت")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if (second.includes("گوشی")) mappedCat.subminor = enuSubMinorCategory.Mobile
        else if (second.includes("مانیتور")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("هارد")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if (second.includes("هندزفری")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if (second.includes("ویدیویی")) mappedCat.minor = enuMinorCategory.Multimedia
        else if (second.includes("دوربین")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if (second.includes("گیمینگ")) mappedCat.subminor = enuMinorCategory.Game
        else if (second.includes("سبک زندگی")) mappedCat.minor = enuMinorCategory.LifeStyle
        else if (second.includes("سرگرمی")) mappedCat.minor = enuMinorCategory.Fun
        else if (second.includes("فرهنگ")) mappedCat.minor = enuMinorCategory.Culture
        else if (second.includes("سریال")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (second.includes("گیمزکام")) mappedCat.minor = enuMinorCategory.Game

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
    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.Weblog }
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.Weblog }
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

    mapCategory(_: string, tags?: string[]): IntfMappedCatgory {
        void tags
        return { major: enuMajorCategory.Weblog }
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
}

export class achareh extends clsScrapper {
    constructor() {
        super(enuDomains.achareh, "blog.achareh.ir", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class aparat extends clsScrapper {
    constructor() {
        super(enuDomains.aparat, "aparat.blog", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "section.content_post, img.mainpic",
                    ignoreNodeClasses: ["related-post", "profilebox", "profileimg", "comments-area"],
                },
                tags: ".tags a",
            }
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE",
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
        if(url.pathname.includes("/wp-content/uploads") && !url.pathname.includes("blog")) {
            return url.toString().slice(0, 20) + "/blog" + url.toString().slice(20)}
        else if (!url.toString().includes("/blog")) 
            return url.toString().slice(0, 20) + "/blog" + url.toString().slice(20)
        else 
            return url.toString()
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
            }
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE",
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
}

export class modireweb extends clsScrapper {
    constructor() {
        super(enuDomains.modireweb, "modireweb.com", {
            selectors: {
                article: "[data-id='4ef12ee'], [data-id='e2ec43c']",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class bonyadvokala extends clsScrapper {
    constructor() {
        super(enuDomains.bonyadvokala, "bonyadvokala.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["ez-toc-title-container", "mini-posts-box", "eztoc-toggle-hide-by-default", "tagcloud"],
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a"),
                    startIndex: 1
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
                extraInvalidStartPaths: ["/products", "/lawyers"]
            }
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class rawanshenas extends clsScrapper {
    constructor() {
        super(enuDomains.rawanshenas, "rawanshenas.ir", {
            selectors: {
                article: "article.main-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                                            date: item.createDate.substring(0,10)
                                        })
                                        item.replies?.forEach((child: any) => {
                                            comments.push({
                                                text: normalizeText(child.description),
                                                author: normalizeText(child.creator),
                                                date: child.createDate.substring(0,10)
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
                    main: "[data-id='287528c6'] div, .elementor-widget-theme-post-featured-image div"
                },
                category: {
                    selector: ".rank-math-breadcrumb p a",
                },
            },
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class chemibazar extends clsScrapper {
    constructor() {
        super(enuDomains.chemibazar, "blog.chemibazar.com", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                extraInvalidStartPaths: ["/flight", "/hotel", "/fa/Visa", "/fa/Tour"]
            }
        })
    }

    protected normalizePath(url: URL): string {
        if(url.pathname.includes("cdn.hamgardi.com")) {
            return url.toString().replace("www.hamgardi.com", "")}
        else 
            return url.toString()
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class parscoders extends clsScrapper {
    constructor() {
        super(enuDomains.parscoders, "parscoders.com", {
            basePath: "/blog",
            selectors: {
                article: "article.blog-single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".post-content",
                    ignoreNodeClasses: ["post-block", "kk-star-ratings", "post-meta"],
                    ignoreTexts: [/.*برچسب ها.*/]
                },
                tags: "a[rel='tag']",
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.comment-list li article"),
                    author: ".comment-author b",
                    datetime: "time",
                    text: ".comment-content"
                }
            },
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class malltina extends clsScrapper {
    constructor() {
        super(enuDomains.malltina, "blog.malltina.com", {
            selectors: {
                article: "article.main-article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "section.post-content",
                    ignoreTexts: [/.*<img.*/, /.*Banner.*/]
                },
            },
        })
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
}

export class exbito extends clsScrapper {
    constructor() {
        super(enuDomains.exbito, "exbito.com", {
            basePath: "/blog",
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class arongroups extends clsScrapper {
    constructor() {
        super(enuDomains.arongroups, "blog.arongroups.co", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    main:  (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(
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
}

export class mopon extends clsScrapper {
    constructor() {
        super(enuDomains.mopon, "blog.mopon.ir", {
            selectors: {
                article: "section.single-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class podium extends clsScrapper {
    constructor() {
        super(enuDomains.podium, "blog.podium.ir", {
            selectors: {
                article: ".page-content",
                title: "h2",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class doctoryab extends clsScrapper {
    constructor() {
        super(enuDomains.doctoryab, "blog.doctor-yab.ir", {
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".entry-content",
                    ignoreNodeClasses: ["ez-toc-v2_0_61", "kk-star-ratings", "post-shortlink", "mag-box"],
                    ignoreTexts: [/.*<img.*/]
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
            },
        })
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}

export class sheypoor extends clsScrapper {
    constructor() {
        super(enuDomains.sheypoor, "blog.sheypoor.com", {
            selectors: {
                article: "article.single-post-content",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
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
}