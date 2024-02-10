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

        if (cat === "اقتصاد"
            || cat.startsWith("شغل ")
            || cat.startsWith("کارآفرینی")
            || cat.startsWith("بازاریابی")
            || cat === "فین تک"
            || cat === "فریلنسری"
        ) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat === "عمومی"
            || cat === "سایر"
        ) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.startsWith("تغذیه ")
            || cat.startsWith("زنان")
            || cat.startsWith("سلامت")
            || cat.startsWith("احساسات")
            || cat.startsWith("استعمال")
            || cat.startsWith("تربیت جنسی")
            || cat.startsWith("ویروس کرونا")
        ) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat === "پزشکی و دندانپزشکی") return { ...mappedCat, minor: enuMinorCategory.Medical }
        if (cat === "روانشناسی"
            || cat === "اختلالات روانشناختی"
            || cat.startsWith("سلامت روان")
            || cat.startsWith("کودک ")
            || cat.startsWith("محتوای جنسی و عکس بدن")
            || cat === "مسائل مربوط به سنین کم"
            || cat === "مهارت های ذهنی"
            || cat === "نیازهای ویژه و مشکلات یادگیری"
            || cat === "والدین و گوشی تلفن"
        ) return { ...mappedCat, minor: enuMinorCategory.Psychology }
        if (cat === "امنیت سایبری"
            || cat === "حریم خصوصی و امنیت در اینترنت"
            || cat === "کلاه برداری و باج گیری اینترنتی"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Security }
        if (cat === "مهندسی نرم افزار"
            || cat === "برنامه نویسی"
            || cat === "تجربه کاربری"
            || cat === "مدت زمان استفاده از صفحه نمایش"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Software }
        if (cat === "شبکه اجتماعی"
            || cat === "اینستاگرام و شبکه های اجتماعی"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuMinorCategory.Social }
        if (cat === "مذهبی"
            || cat === "ماه رمضان"
            || cat === "تربیت معنوی")
            return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat === "علوم"
            || cat === "هوا فضا"
            || cat == "محیط زیست"
        ) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat === "طراحی دیجیتال"
        ) return { ...mappedCat, minor: enuMinorCategory.IT, subminor: enuSubMinorCategory.Art }
        if (cat.startsWith("تحصیلی")
            || cat === "برگشت به مدرسه"
            || cat === "یادگیری از طریق فناوری"
        ) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat === "زیبایی"
            || cat === "قوت شخصیتی و سبک زندگی"
        ) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "ورزشی") return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat === "سفر") return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (cat === "استارتاپ") return { ...mappedCat, minor: enuMinorCategory.Startup }
        if (cat === "فیلم و سینما") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat === "غذا و نوشیدنی") return { ...mappedCat, minor: enuMinorCategory.Food }
        if (cat === "سیاست") return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat === "تاریخ") return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat === "خودرو") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (cat === "هنر") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat === "فرهنگ") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "حقوقی") return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat === "اینترنت اشیاء") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IOT }
        if (cat.startsWith("روابط")
            || cat === "رابطه"
        ) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "موسیقی") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat === "نویسندگی"
            || cat === "خواندن"
            || cat === "داستان"
        ) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentary }
        if (cat === "عکاسی") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Photo }
        if (cat === "کتاب") return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (cat === "پادکست") return { ...mappedCat, minor: enuMinorCategory.Multimedia, subminor: enuSubMinorCategory.Podcast }
        if (cat.startsWith("تماشا")
            || cat === "فیلم و سینما"
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia, subminor: enuSubMinorCategory.Cinema }
        if (cat === "رسانه") return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat === "خانواده"
            || cat === "خشونت در رسانه"
            || cat === "خودشناسی"
            || cat === "بهره وری"
            || cat === "خودکشی"
        ) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "پول رمزی") return { ...mappedCat, minor: enuMinorCategory.CryptoCurrency }
        if (cat === "فرهنگ") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "داستان") return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.startsWith("بازی")) return { ...mappedCat, minor: enuMinorCategory.Game }
        if (cat === "هوش مصنوعی") return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.AI }
        if (cat === "مهاجرت") return { ...mappedCat, minor: enuMinorCategory.Tourism }
        if (cat === "موفقیت") return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat === "غلط ننویسیم") return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat === "آشپزی"
            || cat === "غذا و نوشیدنی"
        ) return { ...mappedCat, minor: enuMinorCategory.Cooking }

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
                        el.innerText.replace("به‌روز شده: ", "").replace(/^(.*) (.*), (.*)$/, "$2 $1 $3").split(" ").map((s, i) => i == 1 ? persianMonthNumber(s) : s).join("-")
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

export class mihanpezeshk extends clsScrapper {
    constructor() {
        super(enuDomains.mihanpezeshk, "mihanpezeshk.com", {
            selectors: {
                article: "body.show-question, .blog-single",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".details, img.img-post",
                    qa: {
                        containers: ".header-question div:nth-child(2)",
                        q: {
                            container: ".col-12",
                            text: ".show-question__body",
                        },
                        a: {
                            container: ".show-question__answers .show-question__answer",
                            text: "p.show-question__answer__description",
                            author: "h3.show-question__answer__uername a",
                        },
                    },
                },
                category: {
                    selector: ".header-question .col-md-12 div a"
                },
            },
        })
    }
}

export class isovisit extends clsScrapper {
    constructor() {
        super(enuDomains.isovisit, "isovisit.com", {
            selectors: {
                article: "section.section-show-question, article",
                title: "h1",
                datetime: {
                    conatiner: ".section-title div p",
                    acceptNoDate: true
                },
                content: {
                    main: ".section-description, .gy-3.lh-md, .box-img-medicines",
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("section.section-show-question"),
                        q: {
                            container: ".card",
                            text: ".card-body > p",
                            author: ".card-text .m-0.ms-2"
                        },
                        a: {
                            container: "div:nth-child(2) div",
                            text: ".card-body",
                            author: ".card-text .fs-16, .card-text .m-0",
                            datetime: ".card-text.fs-14 span"
                        },
                    },
                    ignoreNodeClasses: ["links-article-related"]
                },
                comments: {
                    container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#more_comment_container .mb-3 div .card"),
                    author: ".figure-caption > span.text-start",
                    text: ".card-text",
                    datetime: "figcaption > div > span:nth-child(2)"
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a")
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".tags a span")
            },
        })
    }
}

export class doctoryab extends clsScrapper {
    constructor() {
        super(enuDomains.doctoryab, "doctor-yab.ir", {
            selectors: {
                article: "article, [itemprop='mainEntity']",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: ".entry-content",
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[itemprop='mainEntity']"),
                        q: {
                            container: "div:nth-child(1)",
                            text: ".faq-text",
                        },
                        a: {
                            container: "ul.ans li",
                            text: "[itemprop='text']",
                            author: "b.name-dr",
                        },
                    },
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
            url: {
                extraValidDomains: ["blog.doctor-yab.ir"],
            }
        })
    }
}

export class adleiranian extends clsScrapper {
    constructor() {
        super(enuDomains.adleiranian, "adleiranian.co", {
            selectors: {
                article: "body.sabai-entity-bundle-name-questions, body.single-post",
                title: "h1",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE",
                    acceptNoDate: true
                },
                content: {
                    main: ".post_content",
                    qa: {
                        containers: ".sabai-main",
                        q: {
                            container: ".sabai-questions-main",
                            text: ".sabai-questions-body",
                            author: ".sabai-user"
                        },
                        a: {
                            container:".sabai-questions-answers",
                            text: ".sabai-questions-body",
                            author: ".sabai-user"
                        },
                    },
                    ignoreNodeClasses: ["lwptoc"]
                },
                category: {
                    selector: ".sabai-questions-taxonomy a, .rank-math-breadcrumb p a"
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class dadpardaz extends clsScrapper {
    constructor() {
        super(enuDomains.dadpardaz, "dadpardaz.com", {
            selectors: {
                article: ".btn-faq-reply",
                acceptNoTitle: true,
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".main-container div div .row"),
                        q: {
                            container: ".faqs-item-text",
                            text: ".faqs-item-text-title",
                        },
                        a: {
                            container: ".faqs-comments-list .col-md-12",
                            text: ".faqs-item-text-description",
                            author: ".faqs-item-avatar-name",
                            datetime: ".faqs-item-text-date"
                        },
                    },
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb div a span")
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

export class dadvarzyar extends clsScrapper {
    constructor() {
        super(enuDomains.dadvarzyar, "dadvarzyar.com", {
            selectors: {
                article: "body.single-dwqa-question, article.full-layout",
                title: ".dwqa-current, h2.entry-title",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='DC.date.issued'], time"),
                    splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE",
                },
                content: {
                    main: ".entry-content p, .entry-content h1, .entry-content h2, picture.post-img",
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".dwqa-single-question"),
                        q: {
                            container: ".dwqa-question-item",
                            text: ".dwqa-question-content",
                            author: ".dwqa-question-meta span a",
                        },
                        a: {
                            container: ".dwqa-answers",
                            text: ".dwqa-answer-content",
                            author: ".dwqa-answer-meta span a",
                            datetime: ".faqs-item-text-date"
                        },
                    },
                    ignoreTexts: [/.*ما را در شبکه های.*/, /.*دانلود اپلیکیشن.*/]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".dwqa-breadcrumbs a, [rel='category tag']")
                },
                tags: ".post-tags a"
            },
        })
    }
}

export class ksymg extends clsScrapper {
    constructor() {
        super(enuDomains.ksymg, "ksymg.com", {
            selectors: {
                article: "body.sabai-entity-bundle-name-questions, body.single-post",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    main: ".post .the_content_wrapper",
                    qa: {
                        containers: ".sabai-main",
                        q: {
                            container: ".sabai-questions-main",
                            text: ".sabai-questions-body",
                            author: ".sabai-user"
                        },
                        a: {
                            container:".sabai-questions-answers",
                            text: ".sabai-questions-body",
                            author: ".sabai-user"
                        },
                    },
                },
                category: {
                    selector: "ul.breadcrumbs li a",
                    startIndex: 0,
                    lastIndex: 2
                },
            },
        })
    }
}

export class hisalamat extends clsScrapper {
    constructor() {
        super(enuDomains.hisalamat, "hisalamat.com", {
            selectors: {
                article: ".quespadd, .main321",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1, .matun3.ta div.orange"),
                acceptNoTitle: true,
                subtitle: ".lidd",
                datetime: {
                    conatiner: ".date span:nth-child(1)",
                    acceptNoDate: true
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".matnasli, .col-sm-12.quespadd.ta .matun3 .quesP>*"),
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".col-sm-9.quespadd.ta .matun3"),
                        q: {
                            container: ".quesP",
                            text: ".red",
                        },
                        a: {
                            container: ".ansP",
                            text: ".quesP",
                            author: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".base .col-xs-9.ta"),
                        },
                    },
                    ignoreNodeClasses: ["rootitrr", "singleTitle", "date", "lidd"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".base div:nth-child(1), .rootitrr")

                },
            },
        })
    }
}

export class drhast extends clsScrapper {
    constructor() {
        super(enuDomains.drhast, "drhast.com", {
            selectors: {
                article: "[itemprop='mainEntity']",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    qa: {
                        containers: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("[itemprop='mainEntity']"),
                        q: {
                            container: ".main-question",
                            text: ".main-question__body",
                        },
                        a: {
                            container: "div:nth-child(2) .main-question__answer",
                            text: ".main-question__answer-body [itemprop='text']",
                            author: ".doctor-ui-name",
                        },
                    },
                },
            },
        })
    }
}

export class adlpors extends clsScrapper {
    constructor() {
        super(enuDomains.adlpors, "adlpors.ir", {
            selectors: {
                article: ".pt-5",
                title: "h1",
                datetime: {
                    acceptNoDate: true
                },
                content: {
                    qa: {
                        containers: ".col-lg-8",
                        q: {
                            container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("article"),
                            text: ".card-body .card-text",
                            author: ".post-meta a"
                        },
                        a: {
                            container: "article:nth-child(5)",
                            text: ".card-body .card-text",
                            author: ".col-md-10.col-md-10 small a",
                        },
                    },
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a")
                }
            },
        })
    }
}