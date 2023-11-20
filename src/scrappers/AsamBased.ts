import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { isIranProvinceString } from "../modules/common";

class clsAsamBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: (parsedHTML: HTMLElement) => parsedHTML.querySelector("article") || parsedHTML.querySelector(".news_content, main"),
                aboveTitle: ".uptitle, .up-title, h2.up_title",
                title: ".title, h1",
                subtitle: ".lead",
                content: {
                    main: '.article_body .echo_detail>*, .article_body #echo_detail>*, .article_body #echo_details>*, #main_ck_editor>*, .res, .album_content>*, #echo_detail>*, .image_top_primary, .primary_files img',
                    ignoreTexts: [/.*tavoos_init_player.*/]
                },
                comments: {
                    container: ".comments-list li, .new_gallery_list>*",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.article_tags li, .article_tag a, .news_tags a, .tags ul li a',
                datetime: {
                    conatiner: '[itemprop="datePublished"], [itemprop="datepublished"], time',
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
        if(url.toString().includes(".jpg") || url.toString().includes("media"))
            return url.toString();
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

    protected baseNormalizePath(url: URL): string {
        return super.normalizePath(url)
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        let first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (first.startsWith("اخبار"))
            first = first.substring(6).trim()

        if (first.startsWith("استان") || isIranProvinceString(first))
            return { ...mappedCat, minor: enuMinorCategory.Local }
        if (first.startsWith("فوتبال"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.startsWith("رالی"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Car }
        if (first.startsWith("کشتی"))
            return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        if (first.startsWith("سیاست خارجی") || first.includes("الملل"))
            return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (first.startsWith("سینما"))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (first.startsWith("کتاب"))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        if (first.startsWith("سفر "))
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        if (first.startsWith("نرخ") || first.startsWith("واحد"))
            return { ...mappedCat, minor: enuMinorCategory.Economy }

        if (false
            || first.startsWith("چندرسانه‌ای")
            || first.startsWith("عکس")
            || first.startsWith("تصویر")
            || first.startsWith("کاریکاتور")
        ) return { ...mappedCat, minor: enuMinorCategory.Multimedia }

        if (first.includes("اجتماعی") || first.startsWith("جامعه") || first.startsWith("محیط") || first.includes("شهروند"))
            mappedCat.minor = enuMinorCategory.Social
        else if (first.includes("اقتصادی")
            || first.includes("پولی")
            || first.includes("قیمت")
            || first.includes("تولید")
            || first.includes("بازار")
            || first.includes("مالیات")
            || first.includes("اشتغال")
            || first.includes("بورس")
            || first.includes("بیمه")
            || first.includes("نفت")
            || first.includes("خودرو")
            || first.includes("ارز ")
            || first.includes(" سکه ")
            || first.includes("سکه ")
            || first.includes(" سکه")
            || first.includes("بازرگانی")
            || first.includes("حمل ")
            || first.includes("کارگری")
        )
            mappedCat.minor = enuMinorCategory.Economy
        else if (first.includes("فرهنگ") || first.includes("رسانه") || first.includes("هنری"))
            mappedCat.minor = enuMinorCategory.Culture
        else if (first.includes("المپیک") || first.includes("ورزش") || first.includes("جام جهانی") || first.includes("باشگاهی"))
            mappedCat.minor = enuMinorCategory.Sport
        else if (first.includes("زندگی") || first.includes("آشپزی") || first.includes("زیبایی"))
            mappedCat.minor = enuMinorCategory.LifeStyle
        else if (first.includes("کنکور"))
            mappedCat.minor = enuMinorCategory.Education
        else if (first.includes("دانشگاه"))
            mappedCat.minor = enuMinorCategory.University
        else if (first.includes("سلامت"))
            mappedCat.minor = enuMinorCategory.Health
        else if (first.includes("حوادث") || first.includes("زورگیری"))
            return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (first.includes("سفر"))
            return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Turism }
        else if (first.includes("قضایی"))
            return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (first.includes("سلبریتی") || first.includes("آرامش"))
            mappedCat.minor = enuMinorCategory.LifeStyle
        else if (first.includes("سرگرمی") || first.includes("فال "))
            mappedCat.minor = enuMinorCategory.Fun
        else if (first.includes("پاسخ"))
            mappedCat.minor = enuMinorCategory.Talk
        else if (first.includes("حقوق"))
            mappedCat.minor = enuMinorCategory.Law
        else if (first.includes("انتخابات") || first.includes("جنبش عدم تعهد") || first.includes("سیاسی"))
            mappedCat.minor = enuMinorCategory.Political
        else if (first.includes("الملل")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (first.includes("تکنولوژی") || first.includes("فناوری") || first.includes("علم") || first.includes("دانش")) mappedCat.minor = enuMinorCategory.ScienceTech

        if (second.includes("انتخابات")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Political; else mappedCat.minor = enuMinorCategory.Political
        } else if (second.includes("آموزش")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Education; else mappedCat.minor = enuMinorCategory.Education
        } else if (second.includes("قرآن") || second.includes("قران")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Religious; else mappedCat.minor = enuMinorCategory.Religious
        } else if (second.includes("زندگی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.LifeStyle; else mappedCat.minor = enuMinorCategory.LifeStyle
        } else if (second.includes("اقتصاد")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economy; else mappedCat.minor = enuMinorCategory.Economy
        } else if (second.includes("قضایی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Law; else mappedCat.minor = enuMinorCategory.Law
        } else if (second.includes("جامعه") || second.includes("شهری") || second.includes("محیط")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.includes("سلامت")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Health; else mappedCat.minor = enuMinorCategory.Health
        } else if (second.includes("آشپزی")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Cooking; else mappedCat.minor = enuMinorCategory.LifeStyle
        } else if (second.includes("حوادث")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Accident; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.includes("دفاع") || second.includes("نظامی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Defence; else mappedCat.minor = enuMinorCategory.Defence
        } else if (second.includes("کتاب")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Book; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("تلویزیون")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.TV; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("سینما")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Cinema; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("انرژی") || second.includes("نفت")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Energy; else mappedCat.minor = enuMinorCategory.ScienceTech
        } else if (second.includes("کشاورزی")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Agriculture; else mappedCat.minor = enuMinorCategory.ScienceTech
        } else if (second.includes("دانشگاه")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.University; else mappedCat.minor = enuMinorCategory.University
        } else if (second.includes("تکنولوژی") || second.includes("فناوری") || second.includes("علم") || second.includes("دانش")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.ScienceTech; else mappedCat.minor = enuMinorCategory.ScienceTech
        } else if (second.includes("هنر")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Art; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("موسیقی")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Music; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("مذهبی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Religious; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("تاریخی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Historical; else mappedCat.minor = enuMinorCategory.Historical
        } else if (second.includes("گردشگری") || second.includes("سفر")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Turism; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("المپیک") || second.includes("ورزش") || second.includes("جام جهانی") || second.includes("باشگاهی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Sport; else mappedCat.minor = enuMinorCategory.Sport
        } else if (second.includes("گالری")) {
            if (mappedCat.minor) mappedCat.subminor = enuSubMinorCategory.Art; else mappedCat.minor = enuMinorCategory.Culture
        } else if (second.includes("رالی")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Car
        } else if (second.includes("فوتبال")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Football
        } else if (second.includes("رزمی")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Martial
        } else if (second.includes("کشتی")) {
            mappedCat.minor = enuMinorCategory.Sport
            mappedCat.subminor = enuSubMinorCategory.Wrestling
        }
        return mappedCat
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        if (cat.includes("دین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        else if (cat.includes("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("چند رسانه") || cat.startsWith("تصویر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("بین") || cat.includes("خارجی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("دفاعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("IT")) return { major: enuMajorCategory.News, minor: enuMinorCategory.IT }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصادی/علم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.ScienceTech }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("ارز دیجیتال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.CryptoCurrency }
        else if (cat.includes("اقتصاد جهانی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("اقتصاد") || cat.includes("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("بانوان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        else if (cat.includes("المپیک") || cat.includes("جام جهانی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("سبک")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("رپرتاژ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }
        else if (cat.includes("سرگرمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }

        return { major: enuMajorCategory.News }
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

        if (cat.includes("حوادث")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("فیلم") 
            || cat.includes("عکس") 
            || cat.includes("چندرسانه")
            || cat.includes("کاریکاتور")
            || cat.includes("ویدئو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصادی/گردشگری") ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("دفاعی") ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuMinorCategory.Defence }
        else if (cat.includes("خودرو") ) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد") 
            || cat.includes("کارگری") 
            || cat.includes("بازار") 
            || cat.includes("ارز")
            || cat.includes("نرخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("کتاب")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("فرهنگ و هنر/رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Media }
        else if (cat.includes("فرهنگ") || cat.includes("ایثار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("دانشگاه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.University }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("ورزش جهان") || cat.includes("جام جهانی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (first.startsWith("بین") 
            || cat.includes("خارجی") 
            || first.includes("جنبش عدم تعهد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (first.startsWith("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (second.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor:enuMinorCategory.Law }
        else if (cat.includes("سیاسی") 
            || cat.includes("مجلس") 
            || cat.includes("انتخابات") 
            || cat.includes("یادداشت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }

        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class tasnim extends clsAsamBased {
    constructor() {
        super(enuDomains.tasnim, "tasnimnews.com", {
            selectors: {
                article: "article.single-news, article.media",
                aboveTitle: ".kicker",
                title: ".title",
                subtitle: ".lead",
                content: {
                    main: ".story>*, ._sticky+div, .row.images>*",
                    ignoreTexts: ["این خبر بروز رسانی می شود...", "بازگشت به صفحه رسانه‌‌ها", 'تهیه شده در اداره کل رسانه های نوین خبرگزاری تسنیم'],
                    ignoreNodeClasses: ["jwplayer", "hideTag"]
                },
                tags: ".tags li",
                datetime: {
                    conatiner: ".time, time",
                    splitter: "-",
                },
                category: {
                    selector: "li.service",
                }
            },
            url: {
                extraValidDomains: ["tasnimnews.org", "tasnimnews.com"],
            },
            preHTMLParse: (html: string) => html.replace(/<a +href="https:\/\/vpn.tasnimnews.org\/ContentManager\/\d+\/https:\/\/www.tasnimnews.com" +target="_blank">/, "")
        })
    }

    protected normalizePath(url: URL): string {
        try {
            let hostname = url.hostname
            if (!hostname.startsWith("www."))
                hostname = "www." + hostname
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if (pathParts.length > 6
                && pathParts[1] === "fa"
                && (pathParts[2] === "news"
                    || pathParts[2] === "media"))
                path = `/fa/${pathParts[2]}/${pathParts[3]}/${pathParts[4]}/${pathParts[5]}/${pathParts[6]}` //+ "--->" + url.pathname

            return url.protocol + "//" + hostname + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }


}

/***********************************************************/
export class pana extends clsAsamBased {
    constructor() {
        super(enuDomains.pana, "pana.ir", {
            selectors: {
                article: "article",
                aboveTitle: "#Content_rutitr",
                title: "#Content_title",
                subtitle: "#Content_UnderTitle",
                content: {
                    main: ".NewsText>*",
                    ignoreNodeClasses: ["video-js", "btn"]
                },
                tags: "#keyWordContainer strong",
                datetime: {
                    conatiner: "#Content_publishdate",
                    splitter: "-",
                },
                category: {
                    selector: '#breadCrumbsContainer [itemprop="title"]',
                }
            },
            url: {
                pathToCheckIndex: 1,
            }
        })
    }

    protected normalizePath(url: URL): string {
        return this.baseNormalizePath(url)
    }

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (first.includes("آموزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Education }
        else if (cat.includes("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("عکس") || cat.startsWith("ویدئو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("بهداشت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("پزشکی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد") || second.startsWith("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("ورزشی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }

        return { major: enuMajorCategory.News }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }

        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (cat.includes("گالری") 
            || cat.includes("ویدیو")
            || cat.includes("عکس")
            || cat.includes("نماهنگ")
            || cat.includes("فیلم")
            || cat.includes("زیست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("پاسخ/حقوقی") || cat.includes("پاسخ/قضایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Discussion, subminor: enuMinorCategory.Law }
        else if (cat.includes("بین") || cat.includes("سیاسی/جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("انتخابات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("گردشگری") || cat.includes("سفر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Turism }
        else if (cat.includes("سلامت") || cat.includes("بهداشت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد") || cat.includes("بازرگانی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.includes("داستان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.includes("تلویزیون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("هنری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("فرهنگی") 
            || cat.includes("سلبریتی") 
            || cat.includes("انیمیشن")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("رزمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("ورزش جهان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.includes("قضایی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
        else if (cat.includes("تکنولوژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("گوناگون")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث") || cat.includes("حادثه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("آشپزی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Cooking }
        else if (cat.includes("رک پلاس") 
            || cat.includes("زندگی") 
            || cat.includes("عاطفه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("استان")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Local }
        else if (cat.includes("مستند")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentry }
        else if (cat.includes("فال") || cat.includes("سرگرمی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Fun }
        else if (cat.includes("رپرتاژ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Advert }

        return { major: enuMajorCategory.News }
    }}

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
        else if (first.startsWith("اقتصاد") || first.startsWith("قیمت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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
    //from parent mapCategory(cat?: string): IntfMappedCatgory 
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
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }

        if (cat.startsWith("سبک زندگی") || cat.startsWith("دکوراسیون") || cat.startsWith("گردشگری") || cat.startsWith("مد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.LifeStyle }
        else if (cat.startsWith("تکنولوژی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("خودرو")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("سیاسی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (cat.includes("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.startsWith("کشتی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (cat.includes("اقتصاد")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
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

    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }

        const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.News }

        if (cat.startsWith("آب و هوا")) return { ...mappedCat, minor: enuMinorCategory.Weather }
        if (cat.startsWith("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.startsWith("آموزشی")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        if (cat.startsWith("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("انسان")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("ایران‌گردی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Turism }
        if (cat.startsWith("ایران")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("پاپ")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat.startsWith("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (cat.startsWith("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.startsWith("تصاویر")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("تفکر")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        if (cat.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("تناسب")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.endsWith("دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
        if (cat.startsWith("جهان")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Intl }
        if (cat.startsWith("چهره‌ها")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuSubMinorCategory.Celebrities }
        if (cat.startsWith("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Law }
        if (cat.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        if (cat.startsWith("حیات وحش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("خارجی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("خانواده")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("داستان")) return { ...mappedCat, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Text }
        if (cat.startsWith("خودشناسی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (cat.startsWith("رابطه")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.startsWith("زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("زیبایی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("سنتی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("سیاس")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("طبیعت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("علم")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        if (cat.startsWith("فال ")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.startsWith("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("فروشنده")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        if (cat.startsWith("فضا")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("فن بیان")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("فیزیک")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("کسب")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        if (cat.startsWith("گفتگو")) return { ...mappedCat, minor: enuMinorCategory.Talk }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.includes("داستان")) return { ...mappedCat, minor: enuMinorCategory.Literature, subminor: enuMinorCategory.Text }
        if (cat.includes("زندگی")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.includes("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.includes("ماشین")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (cat.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (cat.startsWith("مدیریت")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.startsWith("معما")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        if (cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economy }
        if (cat.startsWith("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("ویدیو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("یادگیری")) return { ...mappedCat, minor: enuMinorCategory.Education }

        return mappedCat
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

export class donyaeeqtesad extends clsAsamBased {
    constructor() {
        super(enuDomains.donyaeeqtesad, "donya-e-eqtesad.com", {
            selectors: {
                content: {
                    main: ".article-body",
                    ignoreNodeClasses: ["noprint"]
                },
                tags: ".article-tag a"
            },
        })
    }
}

export class eghtesadonline extends clsAsamBased {
    constructor() {
        super(enuDomains.eghtesadonline, "eghtesadonline.com", {
            selectors: {
                article: "article",
                aboveTitle: "h4",
                summary: "p.summary",
                datetime: {
                    conatiner: ".item-date"
                },
                category: {
                    selector: "ol.breadcrumb li a"
                },
                content: {
                    main: ".item-text, figure.item-img",
                },
                tags: "section .box.tags ul li a"
            },
        })
    }
}

export class titrekootah extends clsAsamBased {
    constructor() {
        super(enuDomains.titrekootah, "titrekootah.ir", {
            selectors: {
                article: "article",
                datetime: {
                    conatiner: ".time_date"
                },
                category: {
                    selector: ".right_breadcrumb a",
                    startIndex: 0
                },
                content: {
                    main: "#echo_detail p, img",
                    ignoreTexts: ["بیشتر بخوانید"]
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article_tags a span")
            },
        })
    }
}

export class didgahemrooz extends clsAsamBased {
    constructor() {
        super(enuDomains.didgahemrooz, "didgahemrooz.ir", {
            selectors: {
                article: "article",
                aboveTitle: "h2.up_title",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: "#echo_detail p, .primary_files, .image-top-primary",
                },
                category: {
                    selector: ".news-short-info ul li a"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a span")
            },
        })
    }
}

export class wikigardi extends clsAsamBased {
    constructor() {
        super(enuDomains.wikigardi, "wikigardi.ir", {
            selectors: {
                article: "article",
                content: {
                    main: "#ck_editor",
                    ignoreNodeClasses: ["spacial-blockquote"]
                },
                tags: ".tags ul li a"
            },
        })
    }
}

export class jahanemana extends clsAsamBased {
    constructor() {
        super(enuDomains.jahanemana, "jahanemana.ir", {
            selectors: {
                article: "article",
                category: {
                    selector: "ul.breadcrumb_right li a"
                }
            },
        })
    }
}

export class shomavaeghtesad extends clsAsamBased {
    constructor() {
        super(enuDomains.shomavaeghtesad, "shomavaeghtesad.com", {
            selectors: {
                article: "article",
                content: {
                    main: "#main_ck_editor, .res"
                },
                category: {
                    selector: "ul.bread_crump li a",
                }
            }
        })
    }
}

export class ecoiran extends clsAsamBased {
    constructor() {
        super(enuDomains.ecoiran, "ecoiran.com", {
            selectors: {
                article: ".contentBox",
                subtitle: ".contentDescription",
                content: {
                    main: ".contentBody, .contentImage"
                },
                category: {
                    selector: ".tagHolder a",
                    startIndex: 0
                },
                tags: ".contentRelatedTags_Item a"
            }
        })
    }
}

export class sharghdaily extends clsAsamBased {
    constructor() {
        super(enuDomains.sharghdaily, "sharghdaily.com", {
            selectors: {
                article: "article, ul.more_album",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                summary: (_, fullHtml: HTMLElement) => fullHtml.querySelector("p.lead"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time")
                },
                content: {
                    main: "#echo_detail, li.item_view .album_img"
                },
                category: {
                    selector: "ul.breadcrumb_list li a",
                    startIndex: 0
                },
            }
        })
    }
}


export class nasim extends clsAsamBased {
    constructor() {
        super(enuDomains.nasim, "nasim.news", {
            selectors: {
                article: "article.news_page_article",
            }
        })
    }
}

export class eghtesadnews extends clsAsamBased {
    constructor() {
        super(enuDomains.eghtesadnews, "eghtesadnews.com", {
            selectors: {
                article: "article.news_page_article",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("[itemprop='datepublished']"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#main_ck_editor p, .image",
                    ignoreNodeClasses: ["spacial-blockquote"]
                }
            }
        })
    }
}

export class afkarnews extends clsAsamBased {
    constructor() {
        super(enuDomains.afkarnews, "afkarnews.com", {
            selectors: {
                article: "#news-article",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#content-text p, img"
                },
                tags: ".keyword div a",
                category: {
                    selector: ".bread-crumbs a"
                }
            }
        })
    }
}

export class etemadonline extends clsAsamBased {
    constructor() {
        super(enuDomains.etemadonline, "etemadonline.com", {
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: ".echo-detail, img",
                    ignoreNodeClasses: ["news-short-info"]
                },
                tags: ".article-tag a",
                category: {
                    selector: "ul.breadcrumb-list li a",
                    startIndex: 0
                }
            }
        })
    }
}

export class gostaresh extends clsAsamBased {
    constructor() {
        super(enuDomains.gostaresh, "gostaresh.news", {
            selectors: {
                article: "#news-page-article",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#echo-detail div p, #echo-detail div [style='text-align:justify'] img, .image_top_primary",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a"),
            }
        })
    }
}

export class moniban extends clsAsamBased {
    constructor() {
        super(enuDomains.moniban, "moniban.ir", {
            selectors: {
                article: "article.news_page_article, .album_main",
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: "#main_ck_editor p, .contain_img, .gallery_containar figure",
                },
                category: {
                    selector: "ul.bread_crump li a",
                }            
            }
        })
    }
}