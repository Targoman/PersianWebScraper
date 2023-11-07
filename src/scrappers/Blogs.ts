
import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfComment, IntfMappedCatgory } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import { dateOffsetToDate, fa2En, getElementAtIndex, normalizeText } from "../modules/common";
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
                    splitter: dateOffsetToDate,
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
                    splitter: (el: HTMLElement) => el.innerText.includes('پیش') || el.innerText.includes('امروز') || el.innerText.includes('قبل') ? dateOffsetToDate(el) : (super.extractDate(el, " ") || "NO_DATE")
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

        if(first.startsWith("آموزشی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if(first.startsWith("ادبیات، فرهنگ و هنر")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if(first.startsWith("ازدواج و شروع زندگی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("اوقات فراغت")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("بارداری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("بانک داروها")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("بانوان")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Women }
        if(first.startsWith("پادکست")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if(first.startsWith("پدرانه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("پرسش")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Discussion }
        if(first.startsWith("پس از زایمان")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("پیش از بارداری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("پیشنهاد فرهنگی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if(first.startsWith("چه خبر؟")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if(first.startsWith("حیوانات")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Animals }
        if(first.startsWith("خانواده")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("خردسال")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("دوران بارداری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("دیدنی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if(first.startsWith("سال ")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("سایر ")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if(first.startsWith("سبک زندگی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("سلامت")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("شیرخوار")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("طنز")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if(first.startsWith("علم و تکنولوژی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.ScienceTech }
        if(first.startsWith("فروشگاههای")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Economy }
        if(first.startsWith("فلسفه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if(first.startsWith("فیلم")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if(first.startsWith("کارتون")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if(first.startsWith("کانون")) return  { major: enuMajorCategory.Forum }
        if(first.startsWith("کودک")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("گردشگری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        if(first.startsWith("لباهنگ")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if(first.startsWith("متفرقه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if(first.startsWith("مد و دکوراسیون")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("مدیر سایت")) return  { major: enuMajorCategory.Weblog }
        if(first.startsWith("مشاورین")) return  { major: enuMajorCategory.Weblog }
        if(first.startsWith("موسیقی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if(first.startsWith("نوپا")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(first.startsWith("هنری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if(first.startsWith("والدین")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(first.startsWith("ورزشی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Sport }
        if(first.startsWith("ویدئو")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }

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

        if(second.startsWith("آموزش")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if(second.startsWith("اجتماعی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Social }
        if(second.startsWith("ارتباطات")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Social }
        if(second.startsWith("امروز")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Generic }
        if(second.startsWith("تغذیه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(second.startsWith("حوزه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Religious }
        if(second.startsWith("خانواده")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("دانش")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("زندگی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("زیبایی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("سلامت")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(second.startsWith("كتابخانه")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Culture }
        if(second.startsWith("کودک")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.includes("یادگیری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if(second.includes("مشاوره")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Education }
        if(second.includes("ورزشی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Sport }

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
                    splitter: dateOffsetToDate
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
                    datetime: (cm: HTMLElement) => dateOffsetToDate(cm.querySelector("time")),
                    text: ".comment-content"
                }
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.Weblog }
        const catParts = cat.split('/')
        const second = catParts.length > 1 ? catParts[1] : ''

        if(second.startsWith("آرایش")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("آشپزی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        if(second.startsWith("بهداشت")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Health }
        if(second.startsWith("رمان")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Text }
        if(second.startsWith("سبک")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }
        if(second.startsWith("سرگرمی")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Fun }
        if(second.startsWith("گالری")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Multimedia }
        if(second.startsWith("مد ")) return  { major: enuMajorCategory.Weblog, minor: enuMinorCategory.LifeStyle }

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
                    main: '.content-wrapper p',
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

        if(second.includes("آموزش")) mappedCat.subminor = enuMinorCategory.Education
        else if(second.includes("بازی")) mappedCat.subminor = enuMinorCategory.Game
        else if(second.includes("اپلیکیشن")) mappedCat.subminor = enuSubMinorCategory.Software
        else if(second.includes("تکنولوژی")) mappedCat.subminor = enuMinorCategory.Generic
        else if(second.includes("سخت")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("لپ تاپ")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("موبایل")) mappedCat.subminor = enuSubMinorCategory.Mobile
        else if(second.includes("اسپیکر")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("باکس")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("پاور")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if(second.includes("تبلت")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("ساعت")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if(second.includes("گوشی")) mappedCat.subminor = enuSubMinorCategory.Mobile
        else if(second.includes("مانیتور")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("هارد")) mappedCat.subminor = enuSubMinorCategory.Hardware
        else if(second.includes("هندزفری")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if(second.includes("ویدیویی")) mappedCat.minor = enuMinorCategory.Multimedia
        else if(second.includes("دوربین")) mappedCat.subminor = enuSubMinorCategory.Gadgets
        else if(second.includes("گیمینگ")) mappedCat.subminor = enuMinorCategory.Game
        else if(second.includes("سبک زندگی")) mappedCat.minor = enuMinorCategory.LifeStyle
        else if(second.includes("سرگرمی")) mappedCat.minor = enuMinorCategory.Fun
        else if(second.includes("فرهنگ")) mappedCat.minor = enuMinorCategory.Culture
        else if(second.includes("سریال")) return {...mappedCat, minor: enuMinorCategory.Culture, subminor:enuSubMinorCategory.TV}
        else if(second.includes("گیمزکام")) mappedCat.minor = enuMinorCategory.Game

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
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
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