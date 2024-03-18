import { clsScrapper } from "../modules/clsScrapper"
import { IntfMappedCategory, enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory } from "../modules/interfaces"
import { HTMLElement } from "node-html-parser"

void enuMinorCategory, enuSubMinorCategory

export class sistani extends clsScrapper {
    constructor() {
        super(enuDomains.sistani, "sistani.org", {
            basePath: "/persian",
            selectors: {
                article: "#content-rtl, .book-text",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".book-text, .one-qa, #content-rtl"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("h3 a, h1.abi-sq-rtl a, h1 a")
                }
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/arabic", "/urdu", "/english", "/turkish", "/azari", "/french", "/persian/send-question/"]
            }
        })
    }
}

export class agorgani extends clsScrapper {
    constructor() {
        super(enuDomains.agorgani, "site.agorgani.ir", {
            selectors: {
                article: "body.single-post, #the-post",
                title: "h1",
                datetime: {
                    conatiner: "span.date",
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content, figure.single-featured-image",
                },
                category: {
                    selector: "a.post-cat"
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
                    author: "footer .comment-author b",
                    text: ".comment-content"
                }
            },
            url: {
                extraInvalidStartPaths: ["/ar"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { major: enuMajorCategory.Formal, minor: enuMinorCategory.Religious }
    }
}

export class saafi extends clsScrapper {
    constructor() {
        super(enuDomains.saafi, "saafi.com", {
            selectors: {
                article: ".matn",
                title: ".field-name-title-field .field-item",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.date']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".bodyasli, .gallerygallery .sb-gallery-gallery",
                },
            },
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { major: enuMajorCategory.Formal, minor: enuMinorCategory.Religious }
    }
}

export class bahjat extends clsScrapper {
    constructor() {
        super(enuDomains.bahjat, "bahjat.ir", {
            basePath: "/fa",
            selectors: {
                article: ".nodeWrapper, .barge, body.node-type-ahkam",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1, title"),
                subtitle: ".subTitle",
                datetime: {
                    conatiner: "time",
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".cBody, section.ahkam-teaser .wrapper, span.imgTeaser a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".nodeWrapper .entry-tags span a"),
            },
            url: {
                extraInvalidStartPaths: ["/ur", "/en"]
            }
        })
    }
    mapCategoryImpl(): IntfMappedCategory {
        return { major: enuMajorCategory.Formal, minor: enuMinorCategory.Religious }
    }
}

export class zanjani extends clsScrapper {
    constructor() {
        super(enuDomains.zanjani, "zanjani.ir", {
            selectors: {
                article: ".singe-content, [data-xhr='qa-content'], .wrapper-single-post-gallery",
                title: ".single-content-title, .article span:nth-child(1), h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".single-content-content, .article_box, #lightgallery",
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-art-breadcrumb span a")
                },
            },
            url: {
                extraInvalidStartPaths: ["/?ar"]
            }
        })
    }
}
