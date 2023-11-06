import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsAsamBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: (parsedHTML: HTMLElement) => parsedHTML.querySelector("article") || parsedHTML.querySelector(".news_content, main"),
                aboveTitle: ".uptitle, .up-title",
                title: ".title, h1",
                subtitle: ".lead",
                content: {
                    main: '.article_body .echo_detail>*, .article_body #echo_detail>*, .article_body #echo_details>*, .album_content>*, .primary_files img',
                    ignoreTexts: [/.*tavoos_init_player.*/]
                },
                comments: {
                    container: ".comments-list li, .new_gallery_list>*",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.article_tags li',
                datetime: {
                    conatiner: '[itemprop="datePublished"], [itemprop="datepublished"]',
                    splitter: ' '
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb_list, .breadcrumb")?.querySelectorAll("li a"),
                    startIndex: 1,
                }
            },
        }

        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    protected normalizePath(url: URL): string {
        try {
            let hostname = url.hostname
            if (!hostname.startsWith("www."))
                hostname = "www." + hostname
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if (pathParts.length > 2
                && pathParts[1] !== "tags"
                && pathParts[1] !== "links"
                && pathParts[1] !== "fa"
                && pathParts[2] !== "")
                path = `/fa/tiny/news-${pathParts[2].split("-")[0]}` //+ "--->" + url.pathname

            return url.protocol + "//" + hostname + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }
}

/***********************************************************/
export class mojnews extends clsAsamBased {
    constructor() {
        super(enuDomains.mojnews, "mojnews.com", {
            selectors: {
                article: "body.news article,body.news  .news_content, .album_main",
                content: { ignoreTexts: ['بیشتر بخوانید:'] }
            }
        })
    }
}

/***********************************************************/
export class ilna extends clsAsamBased {
    constructor() {
        super(enuDomains.ilna, "ilna.ir")
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("استان"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        if (first.startsWith("فوتبال"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Futbol }
        if (first.startsWith("کشتی"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (first.startsWith("سیاست خارجی"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("سینما"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.startsWith("کتاب"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (first.startsWith("نرخ") || first.startsWith("واحد"))
            return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }

        if (false
            || first.startsWith("چندرسانه‌ای")
            || first.startsWith("عکس")
            || first.startsWith("کاریکاتور")
        ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }

        if (first.includes("اجتماعی") || first.startsWith("جامعه") || first.startsWith("محیط") || first.includes("شهروند"))
            mappedCat.minor = enuMinorCategory.Social
        else if (first.includes("اقتصادی") || first.includes("پولی") || first.includes("قیمت") || first.includes("تولید") || first.includes("بازار") || first.includes("کارگری"))
            mappedCat.minor = enuMinorCategory.Economics
        else if (first.includes("فرهنگ") || first.includes("رسانه"))
            mappedCat.minor = enuMinorCategory.Culture
        else if (first.includes("المپیک") || first.includes("ورزش"))
            mappedCat.minor = enuMinorCategory.Sport
        else if (first.includes("انتخابات") || first.includes("بین") || first.includes("جنبش عدم تعهد") || first.includes("سیاسی"))
            mappedCat.minor = enuMinorCategory.Political



        if (second.includes("انتخابات")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Political; else mappedCat.minor = enuMinorCategory.Political
        } else if (second.includes("آموزش")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Education; else mappedCat.minor = enuMinorCategory.Education
        } else if (second.includes("اقتصاد")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economics; else mappedCat.minor = enuMinorCategory.Economics
        } else if (second.includes("جامعه") || second.includes("شهری") || second.includes("محیط")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.includes("سلامت")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Health; else mappedCat.minor = enuMinorCategory.Health
        } else if (second.includes("حوادث")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Accident; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.includes("دفاع")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Defence; else mappedCat.minor = enuMinorCategory.Defence
        } else if (second.includes("کتاب")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Book; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("سینما")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Cinema; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("موسیقی")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Music; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("گردشگری")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Turism; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("رسانه")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.TV; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("فوتبال")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Futbol
        } else if (second.includes("کشتی")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Wrestling
        }
        return mappedCat
    }
}

/***********************************************************/
export class rokna extends clsAsamBased {
    constructor() {
        super(enuDomains.rokna, "rokna.net", {
            selectors: {
                title: 'h1',
                subtitle: '.lead, h1+p',
                datetime: {
                    conatiner: 'time'
                },
                content: {
                    main: ".primary-files, #CK_editor>*",
                    ignoreNodeClasses: ["noprint", 'video-js-container']
                },
                category: {
                    startIndex: 2
                }
            }
        })
    }
}

/***********************************************************/
export class iana extends clsAsamBased {
    constructor() {
        super(enuDomains.iana, "iana.ir", {
            selectors: {
                article: "main .right-hand, #modal-page",
                subtitle: (article: HTMLElement) => article.querySelector("div.lead p.lead") || article.querySelector(".lead"),
                content: {
                    main: ".echo-detail-inner>*, .primary-files"
                },
                datetime: {
                    conatiner: '.code-time time, [itemprop="datepublished"]'
                },
                category: {
                    selector: ".breadcrumb-inner li",
                    startIndex: 1,
                }
            }
        })
    }
}

/***********************************************************/
export class fardanews extends clsAsamBased {
    constructor() {
        super(enuDomains.fardanews, "fardanews.com", {
            selectors: {
                article: "article, #modal-page",
                datetime: {
                    conatiner: (article: HTMLElement) => article.querySelector(".news-time, .note-time, h1"),
                    splitter: (el: HTMLElement) => super.extractDate(el, " ") || "NoDate"
                },
                content: {
                    main: "#echo_detail, ul"
                },
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("عمومی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (second.startsWith("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (first.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (first.startsWith("اقتصاد") || first.startsWith("قیمت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (second.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("عکس")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
    }
}

/***********************************************************/
export class khabarfoori extends clsAsamBased {
    constructor() {
        super(enuDomains.khabarfoori, "khabarfoori.com", {
            selectors: {
                datetime: {
                    conatiner: 'time',
                },
                content: {
                    main: ".article_content"
                },
                tags: (article: HTMLElement) => article.querySelector(".news_tags")?.querySelectorAll("a"),
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb_cnt ul.bread_crump")?.querySelectorAll("li a"),
                    startIndex: 1,
                }
            }
        })
    }

    mapCategory(cat? :string) : IntfMappedCatgory{
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''
        if (second.startsWith("بین") || cat.includes("سیاست خارجی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاسی") && cat.includes("قضایی") ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("فرهنگی") && second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (first.startsWith("فرهنگی") && second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (first.startsWith("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (cat.includes("حقوق") || cat.includes("دادگاه"))  return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuMinorCategory.Law }
        else if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("اقتصاد") || cat.includes("تولید") || cat.includes("اشتغال") || cat.includes("بورس") 
          || cat.includes("بازنشسته") || first.startsWith("ارز") || first.startsWith("مالیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("ورزش") || cat.includes("جام جهانی") || cat.includes("باشگاهی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("جامعه") || cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.startsWith("چندرسانه") || cat.includes("روایت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("سبک زندگی") || cat.includes("تناسب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("سرگرمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (cat.includes("دانستنی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("کنکور")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("دانش") || cat.includes("فضای مجازی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
    }
}

/***********************************************************/
export class bartarinha extends clsAsamBased {
    constructor() {
        super(enuDomains.bartarinha, "bartarinha.ir", {
            selectors: {
                article: "article",
                datetime: {
                    conatiner: '.news_time',
                },
                tags: (article: HTMLElement) => article.querySelector(".article_tags")?.querySelectorAll("a")
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }

        if (cat.startsWith("سبک زندگی") || cat.startsWith("دکوراسیون") || cat.startsWith("گردشگری") || cat.startsWith("مد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.startsWith("تکنولوژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Futbol }
        else if (cat.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
        else if (cat.startsWith("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("سلامت") || cat.startsWith("ساختمان پزشکان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("فرهنگ و هنر") || cat.startsWith("تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("علم و فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("علم و دانش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.startsWith("اخبار")) return { major: enuMajorCategory.News }

        return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
    }
}

/***********************************************************/
export class faradeed extends clsAsamBased {
    constructor() {
        super(enuDomains.faradeed, "faradeed.ir", {
            selectors: {
                article: (parsedHTML: HTMLElement) => parsedHTML.querySelector("article"),
                tags: "a.tag_item"
            }
        })
    }
}