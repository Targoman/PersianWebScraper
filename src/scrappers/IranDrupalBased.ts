import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, enuTextType, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
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
    mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
        const mappedCat: IntfMappedCategory = { textType: enuTextType.Formal, major: enuMajorCategory.News }
        if (!cat) return mappedCat
        void cat, first, second

        if (second.startsWith("توپ")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Ball }
        if (cat.includes("چند رسانه")) return { ...mappedCat, minor: enuMinorCategory.Multimedia }
        if (cat.includes("جهان") || cat.includes("بین")) return { ...mappedCat, minor: enuMinorCategory.Political, subminor: enuSubMinorCategory.Intl }
        if (cat.includes("سیاست")) return { ...mappedCat, minor: enuMinorCategory.Political }
        if (first.startsWith("معارف")) return { ...mappedCat, minor: enuMinorCategory.Religious }
        if (cat.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
        if (second.startsWith("سینما")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Cinema }
        if (second.startsWith("تئاتر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Theatre }
        if (second.startsWith("موسیقی")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuSubMinorCategory.Music }
        if (second.startsWith("شعر")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Poem }
        if (second.startsWith("ادبیات")) return { ...mappedCat, minor: enuMinorCategory.Culture, subminor: enuMinorCategory.Literature }
        if (cat.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
        if (second.startsWith("فوتبال")) return { ...mappedCat, minor: enuMinorCategory.Sport, subminor: enuSubMinorCategory.Football }
        if (first.startsWith("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
        if (second.includes("حقوق")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Law }
        if ((first.startsWith("اجتماعی") || first.startsWith("جامعه")) && second.includes("تعلیم")) return { ...mappedCat, minor: enuMinorCategory.Social, subminor: enuMinorCategory.Education }
        if (cat.includes("اجتماعی")) return { ...mappedCat, minor: enuMinorCategory.Social }
        if (first.startsWith("سلامت")) return { ...mappedCat, minor: enuMinorCategory.Health }
        if (cat.includes("اقتصاد") || cat.includes("بازار")) return { ...mappedCat, minor: enuMinorCategory.Economics }
        if (cat.includes("فناوری")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }

        return mappedCat
    }
}
