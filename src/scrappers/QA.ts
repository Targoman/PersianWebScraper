import { clsScrapper } from "../modules/clsScrapper"
import { enuDomains, enuMajorCategory, enuMinorCategory, IntfMappedCategory, IntfPageContent } from "../modules/interfaces"
import { HTMLElement } from "node-html-parser"
import { IntfRequestParams } from "../modules/request"
import { normalizeText } from "../modules/common"

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
    mapCategory(): IntfMappedCategory {
        return { major: enuMajorCategory.QA, minor: enuMinorCategory.Law }
    }
}

export class porsan extends clsScrapper {
    constructor() {
        super(enuDomains.porsan, "porsan.ir", {
            api: async (url: URL, reParams: IntfRequestParams, data?: any) => {
                const pageContent: IntfPageContent = { url: url.toString(), links: [] }
                if (url.pathname === "" || url.pathname === "/")
                    for (let i = 1; i < 1000000; i++)
                        pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${i}?page=1&count=30`)
                else {
                    const removeHTML = (str: string) => {
                        return normalizeText(str.replace(/<\/?[^>]>/, ""))
                    }
                    pageContent.article = { qa: [] }
                    pageContent.article.qa?.push({
                        q: {
                            text: removeHTML(data?.data?.question?.questionRawText),
                            author: normalizeText(data?.data?.question?.user?.firstName + " " + data?.data?.question?.user?.lastName),
                            date: (new Date(data?.data?.question?.createdAt)).toISOString()
                        },
                        a: data?.data?.responses?.docs?.map((resp: any) => ({
                            text: removeHTML(resp.responseRawText),
                            author: normalizeText(resp.user.firstName + resp.user.lastName),
                            date: (new Date(resp.createdAt)).toISOString()
                        }))
                    })
                    pageContent.article.date = (new Date(data?.data?.question?.createdAt)).toISOString().split("T").at(0)
                    pageContent.category = normalizeText(data?.data?.question?.topic?.title)
                    pageContent.article.tags = data?.data?.question?.tags?.map((tag: any) => normalizeText(tag.title))
                    if (data?.data?.responses?.totalPages > data?.data?.responses?.page)
                        pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${data?.data?.question?.questionIntId}?page=${data?.data?.responses?.page + 1}&count=30`)

                }
                return pageContent
            },
            url: { removeWWW: true }
        })
    }
    // mapCategory(): IntfMappedCategory {
    //     return { major: enuMajorCategory.QA, minor: enuMinorCategory.Law }
    // }
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
                            fullHtml.querySelector("meta[property='og:updated_time']") :
                            article.querySelector(".question__item time"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.split("T").at(0) || "NO_DATE",
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
                            datetime:  "time",
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
                extraInvalidStartPaths: ["/products", "/lawyers"]
            }
        })
    }
}