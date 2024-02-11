import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";
import { isIranProvinceString } from "../modules/common";

class clsAsamBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: (parsedHTML: HTMLElement) => parsedHTML.querySelector("article") || parsedHTML.querySelector(".news_content, main"),
                aboveTitle: ".uptitle, .up-title, h2.up_title, h2.news-uptitle",
                title: ".title, h1",
                subtitle: ".lead, p.news-lead, p.news_lead",
                content: {
                    main: '.article_body .echo_detail>*, .article_body #echo_detail>*, .article_body #echo_details>*, #main_ck_editor>*, .gallery_containar figure, .contain_img, .res, .album_content>*, #echo_detail>*, .image_top_primary, .primary_files img, .primary-files, .primary_image',
                    ignoreTexts: [/.*tavoos_init_player.*/],
                    ignoreNodeClasses: ["article_tag", "sec_info", "share_news", "short_link_cnt", "tinyurl_form"],
                },
                comments: {
                    container: ".comments-list li, .new_gallery_list>*",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.article_tags li, .article_tag a, .news_tags a, .tags ul li a, .article-tag a, .all-tags div a, .tag_items a',
                datetime: {
                    conatiner: (article: HTMLElement, fullHtml: HTMLElement) => article.querySelector("time, .news_nav_title")
                        || fullHtml.querySelector(".news_time")
                        || fullHtml.querySelector(".news-time")
                        || fullHtml.querySelector("time"),
                    splitter: (el: HTMLElement) => el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".breadcrumb_list, .breadcrumb")?.querySelectorAll("li a"),
                    startIndex: 1,
                }
            },
            url: {
                extraInvalidStartPaths: ["/fa/admin", "/admin"],
                ignoreContentOnPath: ["/tag", "/fa/tag"]
            }
        }

        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    protected normalizePath(url: URL): string {
        if (url.toString().match(/(\.jpg|\.jpeg|\.png|media)/))
            return url.toString();
        try {
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if ((url.hostname.startsWith('www') || url.hostname.split('.').length === 2)
                && pathParts.length > 2
                && pathParts[1] !== "tags"
                && pathParts[1] !== "links"
            ) {
                if (pathParts[1] !== "fa"
                    && pathParts[2] !== "")
                    path = `/fa/tiny/news-${pathParts[2].split("-")[0]}`
                else if (pathParts[1] === "fa" && pathParts[2] === "news" && pathParts.at(3) !== "")
                    path = `/fa/tiny/news-${pathParts[3].split("-")[0]}`
            }

            return url.protocol + "//" + url.hostname + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }

    protected baseNormalizePath(url: URL): string {
        return super.normalizePath(url)
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        let first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

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
            return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
        if (first.startsWith("نرخ") || first.startsWith("واحد"))
            return { ...mappedCat, minor: enuMinorCategory.Economics }

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
            mappedCat.minor = enuMinorCategory.Economics
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
            return { ...mappedCat, minor: enuMinorCategory.LifeStyle, subminor: enuMinorCategory.Tourism }
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
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Economics; else mappedCat.minor = enuMinorCategory.Economics
        } else if (second.includes("قضایی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Law; else mappedCat.minor = enuMinorCategory.Law
        } else if (second.includes("جامعه") || second.includes("شهری") || second.includes("محیط")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Social; else mappedCat.minor = enuMinorCategory.Social
        } else if (second.includes("سلامت")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Health; else mappedCat.minor = enuMinorCategory.Health
        } else if (second.includes("آشپزی")) {
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Cooking; else mappedCat.minor = enuMinorCategory.Cooking
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
            if (mappedCat.minor) mappedCat.subminor = enuMinorCategory.Tourism; else mappedCat.minor = enuMinorCategory.Culture
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
        } else
            return { major: enuMajorCategory.NA, original: cat }
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

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }

        if (!cat) return mappedCat

        if (cat.includes("دین")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Religious }
        else if (cat.includes("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.startsWith("چند رسانه") || cat.startsWith("تصویر")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("بین") || cat.includes("خارجی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Defence }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Health }
        else if (cat.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("حقوقی")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if (cat.includes("اجتماعی") || cat.includes("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("IT")) return { ...mappedCat, minor: enuMinorCategory.IT }
        else if (cat.includes("پزشکی")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصادی/علم")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.ScienceTech }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("ارز دیجیتال")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.CryptoCurrency }
        else if (cat.includes("اقتصاد جهانی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("اقتصاد") || cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("بانوان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Women }
        else if (cat.includes("المپیک") || cat.includes("جام جهانی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("رپرتاژ")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        else if (cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }

        return mappedCat
    }
}

/***********************************************************/
export class ilna extends clsAsamBased {
    constructor() {
        super(enuDomains.ilna, "ilna.ir")
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (cat.includes("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("فیلم")
            || cat.includes("عکس")
            || cat.includes("چندرسانه")
            || cat.includes("کاریکاتور")
            || cat.includes("ویدئو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("اقتصادی/گردشگری")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuMinorCategory.Defence }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد")
            || cat.includes("کارگری")
            || cat.includes("بازار")
            || cat.includes("ارز")
            || cat.includes("نرخ")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (cat.includes("کتاب")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Book }
        else if (cat.includes("فرهنگ و هنر/رسانه")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Media }
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
        else if (cat.includes("حقوقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuMinorCategory.Law }
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
                extraInvalidStartPaths: ["/Tasnim/Uploaded/Video", "/ContentManager"]
            },
            preHTMLParse: (html: string) => html.replace(/<a +href="https:\/\/vpn.tasnimnews.org\/ContentManager\/\d+\/https:\/\/www.tasnimnews.com" +target="_blank">/, "")
        })
    }

    protected normalizePath(url: URL): string {
        try {
            const pathParts = url.pathname.split("/")
            let path = url.pathname

            if (pathParts.length > 6
                && pathParts[1] === "fa"
                && (pathParts[2] === "news"
                || pathParts[2] === "media"))
                path = `/${pathParts[6]}` //+ "--->" + url.pathname

            return "https://tasnimnews.com" + path
        } catch (e) {
            console.error(e)
            return ""
        }
    }


}

/***********************************************************/
export class rokna extends clsAsamBased {
    constructor() {
        super(enuDomains.rokna, "rokna.net", {
            selectors: {
                title: 'h1',
                subtitle: '.lead, h1+p',
                content: {
                    main: ".primary-files, #CK_editor>*",
                    ignoreNodeClasses: ["noprint", 'video-js-container']
                },
                category: {
                    startIndex: 2
                }
            },
            url: {
                extraInvalidStartPaths: ["/fa/admin/newsstudios/edit"]
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        else if (cat.includes("گالری")
            || cat.includes("ویدیو")
            || cat.includes("عکس")
            || cat.includes("نماهنگ")
            || cat.includes("فیلم")
            || cat.includes("زیست")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("پاسخ/حقوقی") || cat.includes("پاسخ/قضایی")) return { ...mappedCat, minor: enuMinorCategory.Discussion, subminor: enuMinorCategory.Law }
        else if (cat.includes("بین") || cat.includes("سیاسی/جهان")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاسی") || cat.includes("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("گردشگری") || cat.includes("سفر")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Tourism }
        else if (cat.includes("سلامت") || cat.includes("بهداشت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("خودرو")) return { ...mappedCat, minor: enuMinorCategory.Economics, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("اقتصاد") || cat.includes("بازرگانی")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (cat.includes("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.includes("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (cat.includes("داستان")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (cat.includes("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.TV }
        else if (cat.includes("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        else if (cat.includes("فرهنگی")
            || cat.includes("سلبریتی")
            || cat.includes("انیمیشن")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.includes("رزمی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Martial }
        else if (cat.includes("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("ورزش جهان")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.includes("قضایی")) return { ...mappedCat, minor: enuMinorCategory.Law }
        else if (cat.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.includes("گوناگون")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (cat.includes("حوادث") || cat.includes("حادثه")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.includes("آشپزی")) return { ...mappedCat, minor: enuMinorCategory.Cooking }
        else if (cat.includes("رک پلاس")
            || cat.includes("زندگی")
            || cat.includes("عاطفه")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.includes("استان")) return { ...mappedCat, minor: enuMinorCategory.Local }
        else if (cat.includes("مستند")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Documentary }
        else if (cat.includes("فال") || cat.includes("سرگرمی")) return { ...mappedCat, minor: enuMinorCategory.Fun }
        else if (cat.includes("رپرتاژ")) return { ...mappedCat, minor: enuMinorCategory.Advert }

        return mappedCat
    }
}

/***********************************************************/
export class fardanews extends clsAsamBased {
    constructor() {
        super(enuDomains.fardanews, "fardanews.com", {
            selectors: {
                article: "article, #modal-page",
                content: {
                    main: "#echo_detail, ul"
                },
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
        else if (second.startsWith("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (first.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("جامعه")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (first.startsWith("اقتصاد") || first.startsWith("قیمت")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (second.startsWith("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (second.includes("ورزشی")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (first.startsWith("عکس")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (first.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }

        return { ...mappedCat, minor: enuMinorCategory.Generic }
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
                tags: (article: HTMLElement) => article.querySelector(".article_tags")?.querySelectorAll("a")
            }
        })
    }

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat

        if (cat.startsWith("سبک زندگی") || cat.startsWith("دکوراسیون") || cat.startsWith("گردشگری") || cat.startsWith("مد")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        else if (cat.startsWith("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("خودرو")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Car }
        else if (cat.includes("سیاسی")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (cat.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (cat.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (cat.startsWith("کشتی")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Wrestling }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (cat.includes("فرهنگی")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (cat.startsWith("حوادث")) return { ...mappedCat, minor: enuMinorCategory.Generic, subminor: enuSubMinorCategory.Accident }
        else if (cat.startsWith("سلامت") || cat.startsWith("ساختمان پزشکان")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("فرهنگ و هنر") || cat.startsWith("تلویزیون")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (cat.includes("علم و فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("علم و دانش")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        else if (cat.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (cat.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
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

    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat

        if (cat.startsWith("آب و هوا")) return { ...mappedCat, minor: enuMinorCategory.Weather }
        if (cat.startsWith("آگهی")) return { ...mappedCat, minor: enuMinorCategory.Advert }
        if (cat.startsWith("آموزشی")) return { ...mappedCat, minor: enuMinorCategory.Education }
        if (cat.startsWith("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("انتخابات")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (cat.startsWith("انسان")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (cat.startsWith("ایران‌گردی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Tourism }
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
        if (cat.startsWith("روانشناسی")) return { ...mappedCat, minor: enuMinorCategory.Psychology }
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
        if (cat.startsWith("فروشنده")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("فضا")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("فن بیان")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
        if (cat.startsWith("فیزیک")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
        if (cat.startsWith("فیلم")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (cat.startsWith("کسب")) return { ...mappedCat, minor: enuMinorCategory.Economics }
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
        if (cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.startsWith("هنری")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Art }
        if (cat.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (cat.startsWith("ویدیو")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.startsWith("یادگیری")) return { ...mappedCat, minor: enuMinorCategory.Education }

        return { major: enuMajorCategory.NA, original: cat }
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
                category: {
                    selector: ".breadcrumb-inner li",
                    startIndex: 1,
                }
            }
        })
    }
}

/***********************************************************/
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

/***********************************************************/
export class eghtesadonline extends clsAsamBased {
    constructor() {
        super(enuDomains.eghtesadonline, "eghtesadonline.com", {
            selectors: {
                article: "article",
                aboveTitle: "h4",
                summary: "p.summary",
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

/***********************************************************/
export class titrekootah extends clsAsamBased {
    constructor() {
        super(enuDomains.titrekootah, "titrekootah.ir", {
            selectors: {
                article: "article",
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

/***********************************************************/
export class didgahemrooz extends clsAsamBased {
    constructor() {
        super(enuDomains.didgahemrooz, "didgahemrooz.ir", {
            selectors: {
                article: "article",
                aboveTitle: "h2.up_title",
                content: {
                    main: "#echo_detail p, .primary_files, .image-top-primary",
                },
                category: {
                    selector: ".news-short-info ul li a"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a span")
            },
            url: {
                removeWWW: true
            }
        })
    }
}

/***********************************************************/
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

/***********************************************************/
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

/***********************************************************/
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

/***********************************************************/
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

/***********************************************************/
export class sharghdaily extends clsAsamBased {
    constructor() {
        super(enuDomains.sharghdaily, "sharghdaily.com", {
            selectors: {
                article: "article, ul.more_album",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                summary: (_, fullHtml: HTMLElement) => fullHtml.querySelector("p.lead"),
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

/***********************************************************/
export class nasim extends clsAsamBased {
    constructor() {
        super(enuDomains.nasim, "nasim.news", {
            selectors: {
                article: "article.news_page_article",
            }
        })
    }
}

/***********************************************************/
export class eghtesadnews extends clsAsamBased {
    constructor() {
        super(enuDomains.eghtesadnews, "eghtesadnews.com", {
            selectors: {
                article: "article.news_page_article",
                content: {
                    main: "#main_ck_editor p, .image",
                    ignoreNodeClasses: ["spacial-blockquote"]
                }
            }
        })
    }

    mapCategory(): IntfMappedCategory {
        return { major: enuMajorCategory.News, minor: enuMinorCategory.Economics }
    }
}

/***********************************************************/
export class afkarnews extends clsAsamBased {
    constructor() {
        super(enuDomains.afkarnews, "afkarnews.com", {
            selectors: {
                article: "#news-article",
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

/***********************************************************/
export class etemadonline extends clsAsamBased {
    constructor() {
        super(enuDomains.etemadonline, "etemadonline.com", {
            selectors: {
                article: "article",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                content: {
                    main: ".echo-detail, img",
                    ignoreNodeClasses: ["news-short-info"]
                },
                datetime: {
                    conatiner: ".news-time",
                    splitter: "/"
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

/***********************************************************/
export class gostaresh extends clsAsamBased {
    constructor() {
        super(enuDomains.gostaresh, "gostaresh.news", {
            selectors: {
                article: "#news-page-article",
                content: {
                    main: "#echo-detail div p, #echo-detail div [style='text-align:justify'] img, .image_top_primary",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a"),
            }
        })
    }
}

/***********************************************************/
export class moniban extends clsAsamBased {
    constructor() {
        super(enuDomains.moniban, "moniban.ir", {
            selectors: {
                article: "article.news_page_article, .album_main",
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

/***********************************************************/
export class honaronline extends clsAsamBased {
    constructor() {
        super(enuDomains.honaronline, "honaronline.ir", {
            selectors: {
                article: "article.news-page-article, .gallary-page, .wrapp-pro",
                summary: "p.mp_lead",
                content: {
                    main: ".album-view-check p, img",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".word_key a")
            },
        })
    }
}

/***********************************************************/
export class mosalasonline extends clsAsamBased {
    constructor() {
        super(enuDomains.mosalasonline, "mosalasonline.com", {
            selectors: {
                article: "#news-page-article, .multi-outer",
                content: {
                    main: "#main-echo-detail p, .primary-files, .landing-album-two figure a",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a")
            },
        })
    }
}

/***********************************************************/
export class tejaratefarda extends clsAsamBased {
    constructor() {
        super(enuDomains.tejaratefarda, "tejaratefarda.com", {
            selectors: {
                article: "#news-page-article",
                subtitle: "h3.subTitle",
                content: {
                    main: ".main-entity, img",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a"),
                category: {
                    selector: ".bread a"
                }
            },
        })
    }
}

/***********************************************************/
export class fartaknews extends clsAsamBased {
    constructor() {
        super(enuDomains.fartaknews, "fartaknews.com", {
            selectors: {
                article: "article",
                subtitle: "[itemprop='description']",
                content: {
                    main: "#content-text [style='text-align:justify'], .news-mainimg-con, .gallery-content",
                },
                tags: "ul.tags li a",
                category: {
                    selector: "ul.news-cat-address li a"
                }
            },
        })
    }
}

/***********************************************************/
export class shayanews extends clsAsamBased {
    constructor() {
        super(enuDomains.shayanews, "shayanews.com", {
            selectors: {
                article: "#news_page_article",
                content: {
                    main: "#echo_detail div [dir='rtl'], .image_top_primary, #echo_detail div [style='text-align:center']",
                },
            },
            url: {
                removeWWW: true
            }
        })
    }
}

/***********************************************************/
export class cann extends clsAsamBased {
    constructor() {
        super(enuDomains.cann, "cann.ir", {
            selectors: {
                article: "article",
                content: {
                    main: "#echo-detail .container",
                },
            },
        })
    }
}

/***********************************************************/
export class shomanews extends clsAsamBased {
    constructor() {
        super(enuDomains.shomanews, "shomanews.com", {
            selectors: {
                article: "article",
                aboveTitle: "h2.news_top_title",
                subtitle: ".news_lead",
                content: {
                    main: "#echo-detail [style='text-align:justify'], #echo-detail [style='text-align: justify;'], .big_img_news div, #echo-detail .big_img_news",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.tag_ul li a")
            },
        })
    }
}

/***********************************************************/
export class mostaghelonline extends clsAsamBased {
    constructor() {
        super(enuDomains.mostaghelonline, "mostaghelonline.com", {
            selectors: {
                article: "article.news-body",
                content: {
                    main: ".echo-detail-inner p, .echo-detail-inner h2, .primary-files, ul.gallery_attach_list li",
                },
            },
        })
    }
}

/***********************************************************/
export class iranart extends clsAsamBased {
    constructor() {
        super(enuDomains.iranart, "iranart.news", {
            selectors: {
                article: "article",
                aboveTitle: "h2.news_uptitle",
                subtitle: "p.news_lead",
                datetime: {
                    conatiner: "time"
                },
                content: {
                    main: "section.article_body p, [itemprop='image']",
                },
                category: {
                    selector: ".bread_crumbs a"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("section.word_key a")
            },
        })
    }
}

/***********************************************************/
export class neshanonline extends clsAsamBased {
    constructor() {
        super(enuDomains.neshanonline, "neshanonline.com", {
            selectors: {
                article: "article.news-article",
                content: {
                    main: ".newsimg-contain p, .newsimg-contain h2, .newsimg-contain img, [itemprop='contentUrl']",
                },
                category: {
                    selector: ".bread_crumbs a"
                },
                tags: "#keyword div a"
            },
        })
    }
}

/***********************************************************/
export class chabokonline extends clsAsamBased {
    constructor() {
        super(enuDomains.chabokonline, "chabokonline.com", {
            selectors: {
                article: "article",
                subtitle: "p.lead-cl",
                content: {
                    main: "#echo-detail p, #echo-detail h3, .big-img-news, .img-con, p.clr13",
                },
                category: {
                    selector: ".bread_crumbs a"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.tag-ul li a")
            },
        })
    }
}

/***********************************************************/
export class toseeirani extends clsAsamBased {
    constructor() {
        super(enuDomains.toseeirani, "toseeirani.ir", {
            selectors: {
                article: "article",
                content: {
                    main: "#echo-detail, .primary-files div, #echo-detail img",
                    ignoreTexts: ["کپی شد"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb li a"),
                },
            },
        })
    }
}

/***********************************************************/
export class baeghtesad extends clsAsamBased {
    constructor() {
        super(enuDomains.baeghtesad, "baeghtesad.com", {
            basePath: "/?s=",
            selectors: {
                article: ".tags",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1 a"),
                summary: (_, fullHtml: HTMLElement) => fullHtml.querySelector(".lead"),
                datetime: {
                    conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time']"),
                    splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
                },
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".post, .head .thumb a"),
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumbs a"),
                },
                tags: "a",
            },
            url: {
                extraInvalidStartPaths: ["/fa/tiny/news-uploads"],
                removeWWW: true
            }
        })
    }

    normalizePath(url: URL): string {
        return url.toString();
    }
}

/***********************************************************/
export class mamlekatonline extends clsAsamBased {
    constructor() {
        super(enuDomains.mamlekatonline, "mamlekatonline.ir", {
            selectors: {
                article: "article, .multi-outer",
                content: {
                    main: ".echo-content, .echo_detail_inner, .landing-album-two figure, .res_img",
                },
            },
        })
    }
}

/***********************************************************/
export class khanefootball extends clsAsamBased {
    constructor() {
        super(enuDomains.khanefootball, "khanefootball.com", {
            selectors: {
                article: "article, .multi-outer",
                content: {
                    main: "#ck_editor p, img.img_content, .landing-album-two figure",
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article-tag a")
            },
        })
    }
}

/***********************************************************/
export class honarmrooz extends clsAsamBased {
    constructor() {
        super(enuDomains.honarmrooz, "honarmrooz.com", {
            selectors: {
                article: "article, .album_main",
                category: {
                    selector: "ul.bread_crump li a"
                }
            },
        })
    }
}

/***********************************************************/
export class moroornews extends clsAsamBased {
    constructor() {
        super(enuDomains.moroornews, "moroornews.com", {
            selectors: {
                article: "article.news-page-article",
                content: {
                    main: ".article-body>*"
                },
                category: {
                    selector: ".news-short-info a",
                    startIndex: 0
                }
            },
        })
    }
}

/***********************************************************/
export class keshavarzplus extends clsAsamBased {
    constructor() {
        super(enuDomains.keshavarzplus, "keshavarzplus.com", {
            selectors: {
                article: "article",
                content: {
                    main: "#echo_detail div, #imageGalleryAttach li"
                },
                category: {
                    selector: "ul.breadcrumb_right li a",
                    startIndex: 0
                }
            },
        })
    }
}

/***********************************************************/
export class armanmeli extends clsAsamBased {
    constructor() {
        super(enuDomains.armanmeli, "armanmeli.ir", {
            selectors: {
                article: "article",
                content: {
                    main: "#echo_detail>*, #echo_detail div:nth-child(1) div:nth-child(1) div div:nth-child(2), .primary_files",
                    ignoreNodeClasses: ["article_tag", "sec_info", "share_news"],
                },
            },
        })
    }
}

/***********************************************************/
export class arshehonline extends clsAsamBased {
    constructor() {
        super(enuDomains.arshehonline, "arshehonline.com", {
            selectors: {
                article: "#news-page-article, .album_content",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1, h1 a"),
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#echo_detail p, .image_top_primary div, .album_content, ul.more_album li div a"),
                },
            },
        })
    }
}

/***********************************************************/
export class khodrotak extends clsAsamBased {
    constructor() {
        super(enuDomains.khodrotak, "khodrotak.com", {
            selectors: {
                article: "#echo-detail, article.album-page",
                subtitle: "p.news-lead, p.clr13",
                content: {
                    main: ".bg-news, .big-img-news, a.album-fancybox",
                },
                category: {
                    selector: ".bread_crumbs a"
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.tag-ul li a")
            },
        })
    }
}

/***********************************************************/
export class zenhar extends clsAsamBased {
    constructor() {
        super(enuDomains.zenhar, "zenhar.news", {
            selectors: {
                article: "article",
                content: {
                    main: ".echo-detail div, .image-top-primary",
                },
            },
        })
    }
}

/***********************************************************/
export class ayandnews extends clsAsamBased {
    constructor() {
        super(enuDomains.ayandnews, "ayandnews.com", {
            selectors: {
                article: "article",
                content: {
                    ignoreNodeClasses: ["article_tag", "sec_info", "share_news"]
                },
            },
        })
    }
}

/***********************************************************/
export class tapesh3 extends clsAsamBased {
    constructor() {
        super(enuDomains.tapesh3, "tapesh3.com", {
            selectors: {
                article: "article",
            },
        })
    }
}

/***********************************************************/
export class panjahopanjonline extends clsAsamBased {
    constructor() {
        super(enuDomains.panjahopanjonline, "55online.news", {
            selectors: {
                article: "article",
                content: {
                    main: "#echo-detail div p, #echo-detail div h3, .image_top_primary"
                }
            },
        })
    }
}

/***********************************************************/
export class donyayemadan extends clsAsamBased {
    constructor() {
        super(enuDomains.donyayemadan, "donyayemadan.com", {
            selectors: {
                article: "article, .album-bg",
            },
        })
    }
}

/***********************************************************/
export class taraznameheghtesad extends clsAsamBased {
    constructor() {
        super(enuDomains.taraznameheghtesad, "taraznameheghtesad.ir", {
            selectors: {
                article: "article",
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("nav.breadcrumb_list ul li a"),
                },
            },
        })
    }
}

/***********************************************************/
export class bazarebours extends clsAsamBased {
    constructor() {
        super(enuDomains.bazarebours, "bazarebours.com", {
            selectors: {
                article: "article",
                content: {
                    main: "#main_ck_editor, .primary-files",
                    ignoreNodeClasses: ["inline_news_box"]
                }
            },
        })
    }
}

/***********************************************************/
export class panjere extends clsAsamBased {
    constructor() {
        super(enuDomains.panjere, "panjere.news", {
            selectors: {
                article: "#news-page-article, .splide__track ",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1 a, h1"),
                subtitle: (_, fullHtml: HTMLElement) => fullHtml.querySelector("p.lead, p.news_lead"),
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.more_album li a, #echo_detail div, .image_top_primary"),
                    ignoreTexts: ["copied"]
                },
                category: {
                    selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.breadcrumb_list li a"),
                },
                tags: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".article_tag a"),
            },
        })
    }
}

/***********************************************************/
export class econegar extends clsAsamBased {
    constructor() {
        super(enuDomains.econegar, "econegar.com", {
            selectors: {
                article: "article",
                content: {
                    ignoreTexts: ["بیشتر بخوانید"]
                }
            },
        })
    }
}

/***********************************************************/
export class rasadeghtesadi extends clsAsamBased {
    constructor() {
        super(enuDomains.rasadeghtesadi, "rasadeghtesadi.com", {
            selectors: {
                article: "article.news_page_article",
                category: {
                    selector: "ul.bread_crump li a"
                }
            },
        })
    }
}

/***********************************************************/
export class gashtaninews extends clsAsamBased {
    constructor() {
        super(enuDomains.gashtaninews, "gashtaninews.com", {
            selectors: {
                article: "article",
                content: {
                    ignoreNodeClasses: ["others_known", "inline-news-box", 'quad_news2'],
                    ignoreTexts: ["پایگاه خبری تحلیلی گشتنی نیوز :"]
                },
                category: {
                    selector: "ul.bread_crump li a"
                }
            },
        })
    }

}

/***********************************************************/
export class revayatnameh extends clsAsamBased {
    constructor() {
        super(enuDomains.revayatnameh, "revayatnameh.com", {
            selectors: {
                article: "article",
                content: {
                    main: "#main_ck_editor, .image",
                    ignoreNodeClasses: ["more-news-in-text"]
                },
                tags: ".tags ul li a"
            },
        })
    }
}

/***********************************************************/
export class sornakhabar extends clsAsamBased {
    constructor() {
        super(enuDomains.sornakhabar, "sornakhabar.com", {
            selectors: {
                article: "article",
            },
        })
    }
}
