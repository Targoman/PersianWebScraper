
import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfComment, IntfMappedCatgory } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import { fa2En, getElementAtIndex, normalizeText } from "../modules/common";
import { axiosPost, IntfRequestParams } from "../modules/request";
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
                    conatiner: "#single-post-meta > span.date.meta-item.tie-icon",
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
                    conatiner: "time",
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
                    datetime: "span.date",
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
                    conatiner: ".entry-date",
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
                    conatiner: ".datetime",
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
            selectors: {
                article: "article",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='og:updated_time']"),
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
                    conatiner: "span.published",
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
                    conatiner: "time",
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