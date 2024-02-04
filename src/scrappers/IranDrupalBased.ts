import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
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
    mapCategory(cat?: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News }
        if (!cat) return mappedCat
        const catParts = cat.split('/')
        const first = catParts[0]
        const second = catParts.length > 1 ? catParts[1] : ''

        if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        else if (cat.includes("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        else if (cat.includes("جهان") || cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        else if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        else if (first.startsWith("معارف")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        else if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        else if (second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        else if (second.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        else if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        else if (second.startsWith("شعر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        else if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        else if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        else if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        else if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        else if (second.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        else if ((first.startsWith("اجتماعی") || first.startsWith("جامعه")) && second.includes("تعلیم")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        else if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        else if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        else if (cat.includes("اقتصاد") || cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        else if (cat.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }


        return { major: enuMajorCategory.News }
    }
}
