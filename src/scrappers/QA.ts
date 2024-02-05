import { clsScrapper } from "../modules/clsScrapper"
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfComment, IntfMappedCategory, IntfPageContent } from "../modules/interfaces"
import { HTMLElement } from "node-html-parser"
import { IntfRequestParams } from "../modules/request"
import { normalizeText, persianMonthNumber } from "../modules/common"

export class daadyab extends clsScrapper {
    constructor() {
        super(enuDomains.daadyab, "daadyab.com", {
            selectors: {
                article: (_: HTMLElement, fullHTML: HTMLElement) =>
                    fullHTML.querySelector(".comments-container") ? fullHTML : fullHTML.querySelector(".headerOfPost")?.parentNode.parentNode,
                title: ".titleOfPost",
                acceptNoTitle: true,
                datetime: {
                    conatiner: ".headerOfPost .replace-digits",
                    acceptNoDate: true
                },
                content: {
                    main: ".contentPost",
                    qa: {
                        containers: ((article: HTMLElement) => article.querySelector(".comments-container") ? article.querySelectorAll(".col-md-12") : undefined),
                        q: {
                            container: ".comment-box",
                            text: ".comment-content",
                        },
                        a: {
                            container: ".comments-container+.comments-container li",
                            text: ".comment-content",
                            author: ".by-author a",
                            datetime: ".comment-head span"
                        },
                    },
                },
                category: {
                    selector: (_: HTMLElement, fullHTML: HTMLElement) => fullHTML.querySelectorAll("#breadcrumbs li a"),
                    startIndex: 2,
                    lastIndex: 3
                }
            },
            url: {
                removeWWW: false,
                extraInvalidStartPaths: ["/service", "/account"]
            }
        })
    }
    mapCategory(cat: string): IntfMappedCategory {
        if (!cat) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law }
        return { major: enuMajorCategory.QA, minor: enuMinorCategory.Law }
    }
}

export class porsan extends clsScrapper {
    constructor() {
        super(enuDomains.porsan, "porsan.ir", {
            api: async (url: URL, reParams: IntfRequestParams, data?: any) => {
                const pageContent: IntfPageContent = { url: url.toString(), links: [] }
                if (url.pathname === "" || url.pathname === "/")
                    for (let i = 1; i < 100; i++)
                        pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${i}?page=1&count=30`)
                else {
                    const removeHTML = (str: string) => {
                        return normalizeText(str.replace(/<\/?[^>]>/, ""))
                    }
                    pageContent.article = { qa: [] }

                    const qa: { q: IntfComment, a?: IntfComment[] } = {
                        q: { text: removeHTML(data?.data?.question?.questionRawText) }
                    }

                    const author = normalizeText(data?.data?.question?.user?.firstName + " " + data?.data?.question?.user?.lastName)
                    if (author?.length) qa.q.author = author
                    const date = (new Date(data?.data?.question?.createdAt)).toISOString()
                    if (date?.length) qa.q.date = date.split("T").at(0)

                    const answers = data?.data?.responses?.docs?.map((resp: any) => {
                        const a: IntfComment = { text: removeHTML(resp.responseRawText) }
                        const author = normalizeText(resp.user?.firstName + " " + resp.user?.lastName)
                        if (author?.length) a.author = author
                        const date = (new Date(resp.createdAt)).toISOString()
                        if (date?.length) a.date = date.split("T").at(0)
                        return a
                    })

                    if (answers.length)
                        qa.a = answers

                    pageContent.article.qa?.push(qa)

                    if (qa.q.date)
                        pageContent.article.date = qa.q.date ? qa.q.date : "NOT_SET"

                    pageContent.category = normalizeText(data?.data?.question?.topic?.title) || "undefined"
                    if (data?.data?.question?.tags?.length)
                        pageContent.article.tags = data?.data?.question?.tags?.map((tag: any) => normalizeText(tag.title))
                    if (data?.data?.responses?.totalPages > data?.data?.responses?.page)
                        pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${data?.data?.question?.questionIntId}?page=${data?.data?.responses?.page + 1}&count=30`)
                    else
                        for (let i = 1; i < 100; i++)
                            pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${i + data?.data?.question?.questionIntId}?page=1&count=30`)
                }
                return pageContent
            },
            url: { removeWWW: true }
        })
    }
    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.QA, minor: enuMinorCategory.Generic }
        if (!cat) return mappedCat

        if (cat === "اقتصاد") return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat === "عمومی") return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat === "تغذیه و سلامت"
            || cat.startsWith("کودک ")
            || cat.startsWith("زنان")
            || cat.startsWith("سلامت")
        ) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat === "روانشناسی") return { ...mappedCat, minor: enuMinorCategory.Psychology }
        if (cat === "امنیت سایبری") return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Security }
        if (cat === "مهندسی نرم افزار"
            || cat === "برنامه نویسی"
            || cat === "شبکه اجتماعی"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Software }
        if (cat.startsWith("شغل ")
            || cat.startsWith("کارآفرینی")
            || cat.startsWith("بازاریابی")
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat === "مذهبی") return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat === "علوم"
            || cat == "محیط زیست"
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat === "طراحی دیجیتال"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Art }
        if (cat === "تحصیلی") return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat === "زیبایی") return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "سفر") return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (cat === "استارتاپ") return { ...mappedCat, minor: enuMinorCategory.Startup }
        if (cat === "فیلم و سینما") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat === "پزشکی و دندانپزشکی") return { ...mappedCat, minor: enuMinorCategory.Medical }
        if (cat === "غذا و نوشیدنی") return { ...mappedCat, minor: enuMinorCategory.Food }
        if (cat === "سیاست") return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat === "تاریخ") return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat === "خودرو") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (cat === "هنر") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat === "حقوقی") return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat === "اینترنت اشیاء") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IOT }
        if (cat === "روابط") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "موسیقی") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat === "نویسندگی"
            || cat === "داستان"
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentary }
        if (cat === "عکاسی") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Photo }
        if (cat === "کتاب") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (cat === "خانواده") return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "پول رمزی") return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency }
        if (cat === "فرهنگ") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "داستان") return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.startsWith("بازی")) return { ...mappedCat, minor: enuMinorCategory.Game }
        if (cat === "هوش مصنوعی") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        if (cat === "مهاجرت") return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (cat === "موفقیت") return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "فین تک") return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat === "غلط ننویسیم") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "هوا فضا") return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat === "آشپزی") return { ...mappedCat, minor: enuMinorCategory.Cooking }
        if (cat === "بهره وری") return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "فریلنسری") return { ...mappedCat, minor: enuMinorCategory.Economics }

        return mappedCat
    }
}


export class bonyadvokala extends clsScrapper {
    constructor() {
        super(enuDomains.bonyadvokala, "bonyadvokala.com", {
            selectors: {
                article: (_: HTMLElement, fullHTML: HTMLElement, url: URL) =>
                    url.pathname.startsWith("/blog") ?
                        fullHTML.querySelector("article") :
                        fullHTML.querySelector(".faq-listing-body"),
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (article: HTMLElement, fullHtml: HTMLElement, url: URL) =>
                        url.pathname.startsWith("/blog") ?
                            fullHtml.querySelector("meta[property='og:updated_time'], .last-updated") :
                            article.querySelector(".question__item time"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.split("T").at(0) ||
                     el.innerText.replace("به‌روز شده: ", "").replace(/^(.*) (.*), (.*)$/, "$2 $1 $3").split(" ").map((s,i)=>i==1 ? persianMonthNumber(s) : s).join("-") 
                     || "NO_DATE",
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                    ignoreNodeClasses: ["ez-toc-title-container", "mini-posts-box", "eztoc-toggle-hide-by-default", "post-bottom-meta", "safine-full-schema-container"],
                    qa: {
                        containers: ".small-expanded",
                        q: {
                            container: ".question__item",
                            text: "p",
                            datetime: "time"
                        },
                        a: {
                            container: ".faq-answers__item",
                            author: '[itemprop="author"] [itemprop="name"]',
                            datetime: "time",
                            text: '[itemprop="text"]'
                        }
                    }
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb a, .breadcrumb a"),
                    startIndex: 1,
                    lastIndex: 2
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
                extraInvalidStartPaths: ["/products", "/lawyers", "/legal-phone-advice"]
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCategory {
        return { major: cat?.startsWith("مشاوره") ? enuMajorCategory.QA : enuMajorCategory.Weblog, minor: enuMinorCategory.Law }
    }
}