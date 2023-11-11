import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsIranDrupal extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "article", //, .news_content
                aboveTitle: ".rutitr",
                title: ".title",
                subtitle: ".lead",
                content: {
                    main: '.body>*',
                    alternative: '.album_content>*',
                    textNode: ".body"
                },
                comments: {
                    container: ".comments-list li",
                    datetime: ".date",
                    author: ".author",
                    text: ".comment-body"
                },
                tags: '.tags li',
                datetime: {
                    conatiner: '.date-display-single',
                    splitter: '-'
                },
                category: {
                    selector: (article: HTMLElement) => article.querySelector(".category-breadcrumb")?.querySelectorAll("a"),
                    startIndex: 0,
                }
            },
            url: {
                pathToCheckIndex: 1,
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}


/***********************************************************/
export class rajanews extends clsIranDrupal {
    constructor() {
        super(enuDomains.rajanews, "rajanews.com")
    }
    mapCategory(cat?: string): IntfMappedCatgory {
        if (!cat) return { major: enuMajorCategory.News }
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("توپ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("چند رسانه")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("جهان") || cat.includes("بین")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاست")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Political }
        else if (first.startsWith("معارف")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Religious }
        else if (cat.includes("تاریخ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Historical }
        else if (second.startsWith("سینما")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (second.startsWith("تئاتر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (second.startsWith("موسیقی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("شعر")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        else if (second.startsWith("ادبیات")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگ")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Culture }
        else if (second.startsWith("فوتبال")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (first.startsWith("ورزش")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Sport }
        else if (second.includes("حقوق")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if ((first.startsWith("اجتماعی") || first.startsWith("جامعه")) && second.includes("تعلیم")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("اجتماعی")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Social }
        else if (first.startsWith("سلامت")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد") || cat.includes("بازار")) return { major: enuMajorCategory.News, minor: enuMinorCategory.Economy }
        else if (cat.includes("فناوری")) return { major: enuMajorCategory.News, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }


        return { major: enuMajorCategory.News }
    }
}
