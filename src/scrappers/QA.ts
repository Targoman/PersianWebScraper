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
                    for (let i = 1; i < 10; i++)
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
                    else 
                        for (let i = 1; i < 10; i++)
                            pageContent.links.push(`https://porsan.ir/api/v1/client_ui/question/${i + data?.data?.question?.questionIntId}?page=1&count=30`)
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
                extraInvalidStartPaths: ["/products", "/lawyers", "/legal-phone-advice"]
            }
        })
    }
}

export class pasokhgoo extends clsScrapper {
    constructor() {
      super(enuDomains.pasokhgoo, "pasokhgoo.ir", {
        selectors: {
          article: "body.node-type-article, body.node-type-gallery",
          title: "h1",
          subtitle: ".field-name-field-subtitle div div",
          datetime: {
            conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("span[property='dc:date dc:created']"),
            splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
          },
          content: {
            main: ".field-name-field-image div div a, .flexslider ul li",
            qa: {
                containers: ".node-article",
                q: {
                    container: ".field-type-text-with-summary div div",
                    text: "p",
                },
                a: {
                    container: ".field-name-field-pasokh div div",
                    text: 'p'
                }
            }
          },
          category: {
            selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".field-name-field-subject div div span a")
          },
          tags: ".field-name-field-tags div div a"
        },
      })
    }

    mapCategory(): IntfMappedCategory {
        return { major: enuMajorCategory.QA, minor: enuMinorCategory.Religious }
    }
}

export class islamquest extends clsScrapper {
    constructor() {
      super(enuDomains.islamquest, "islamquest.net", {
        basePath: "/fa",
        selectors: {
          article: ".question-details, #quran-big-page",
          title: ".main-question, .sure-title",
          datetime: {
            conatiner: ".last-up span.item",
            acceptNoDate: true
          },
          content: {
            main: ".quran-text, .translate-text, .tafsir-text",
            qa: {
                containers: ".question-main",
                q: {
                    container: ".full-question, .short-question",
                    text: "#A2_1, #A1_1",
                },
                a: {
                    container: ".short-answer",
                    text: '#A3_1'
                }
            }
          },
          category: {
            selector: ".category a"
          },
          tags: ".tags a",
        },
        url: {
          extraInvalidStartPaths: ["/ur", "/en", "/ar", "/id", "/ms", "/tr", "/ru", "/th", "/fr", "/az", "/es", "/de", "/it", "/sw", "/ha", "/hi"]
        }
      })
    }

    mapCategory(): IntfMappedCategory {
        return { major: enuMajorCategory.QA, minor: enuMinorCategory.Religious }
    }
}

export class vindad extends clsScrapper {
    constructor() {
        super(enuDomains.vindad, "vindad.com", {
            selectors: {
                article: ".qaFormArea, body.single-post",
                title: "h1 a, h1",
                datetime: {
                    conatiner: ".elementor-post-info__item--type-custom",
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#articleContent"),
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("div.col-lg-8"),
                        q: {
                            container: "section > div .qaFormArea ",
                            author: ".faq__header .faq__name h2",
                            text: ".pt-2",
                        },
                        a: {
                            container: "div .mx-3.mx-lg-5",
                            text: ".pt-2",
                            author: ".faq__header .faq__name h2",
                        },
                    },
                    ignoreNodeClasses: ["lwptoc"]
                },
                category: {
                    selector: (_: HTMLElement, fullHTML: HTMLElement) => fullHTML.querySelectorAll("li.breadcrumb-item a span, .elementor-post-info__terms-list a"),
                }
            },
        })
    }
}

export class dadrah extends clsScrapper {
    constructor() {
        super(enuDomains.dadrah, "dadrah.ir", {
            selectors: {
                article: ".media.mediaBlock, body.single-post, #blog.container-fluid.mt-1",
                title: "h1",
                datetime: {
                    conatiner: "div:nth-child(3) .media-body p.text-left span:nth-child(2), .practice-box-wrap .meta ul li:nth-child(4), #date-blog small",
                    acceptNoDate: true
                },
                content: {
                    main: ".content, #description-blog, .col-xs-12.col-md-8 img",
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".media.mediaBlock"),
                        q: {
                            container: ".mediaQuestion",
                            text: "p",
                        },
                        a: {
                            container: ".media.response .media-body",
                            text: "p.text-justify",
                            author: "h4.media-heading a",
                            datetime: "p.text-left span:nth-child(2)"
                        },
                    },
                },
                tags: "a.tags, .meta-tags ul li a",
                category: {
                    selector: "a.category_link"
                }
            },
            url: {
                extraInvalidStartPaths: ["/lawyer-information.php", "/lawyer-tag.php", "/lawyer-city.php"]
            }
        })
    }
}

export class vakiltik extends clsScrapper {
    constructor() {
        super(enuDomains.vakiltik, "vakiltik.com", {
            selectors: {
                article: ".col-lg-9, body.single-post",
                title: "h1",
                acceptNoTitle: true,
                datetime: {
                    conatiner: "small.text-muted, time",
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content, .entry-thumb img",
                    qa: {
                        containers: ".card",
                        q: {
                            container: ".card-body",
                            text: ".text-muted.mt-4",
                        },
                        a: {
                            container: "ul.media-list li.mt-4",
                            text: ".mt-3",
                            author: "h6 a",
                            datetime: "small.text-muted"
                        },
                    },
                },
                tags: "a.post-tag",
                category: {
                    selector: "a.post__cat",
                    startIndex: 0,
                    lastIndex: 2
                }
            },
            url: {
                extraValidDomains: ["blog.vakiltik.com"],
                removeWWW: true
            }
        })
    }
}

export class getzoop extends clsScrapper {
    constructor() {
        super(enuDomains.getzoop, "getzoop.com", {
            selectors: {
                article: ".col-xs-12.col-xs-padding_none, .article_page_content",
                title: "#question-title-span2, h1",
                datetime: {
                    conatiner: "time",
                    acceptNoDate: true
                },
                content: {
                    main: ".all_text_art, .default_pic_article",
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".col-xs-12.col-xs-padding_none"),
                        q: {
                            container: ".question-body-right",
                            text: ".question-text",
                        },
                        a: {
                            container: ".answers-of-question div .col-lg-10 .DivAllJavabeDr, .answers-of-question .col-lg-10 div .name-and-content",
                            text: "p.responder-answer-content, span.asker-answer-content",
                            author: "span.responder-name",
                        },
                    },
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb li a")
                },
            },
        })
    }
}