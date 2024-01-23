import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
import deepmerge from "deepmerge";
import { HTMLElement } from "node-html-parser"

class clsSputnikBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: ".article",
                aboveTitle: ".uptitle",
                title: ".article__title",
                subtitle: ".article__announce-text",
                content: {
                    main: '.article__body .article__block .article__text, .article__body .article__block .article__photo-item, .online__article .online__item',
                    ignoreTexts: [/^© .*/],
                    ignoreNodeClasses: ["js-message_video_player", "online__item-top"]
                },
                tags: '.tags li',
                datetime: {
                    conatiner: '.article__info-date a',
                    splitter: (el: HTMLElement) => el.innerText.split(" ").at(1)?.split(".").reverse().join("-") || "INVALID_DATE",
                    isGregorian: true
                }
            },
            url: {
                removeWWW: true,
                pathToCheckIndex: 1
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }

    public mapCategory(category?: string, tags?: string[]): IntfMappedCategory {
        void category, tags
        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class spnfa extends clsSputnikBased {
    constructor() {
        super(enuDomains.spnfa, "spnfa.ir")
    }
}

/***********************************************************/
export class sputnikaf extends clsSputnikBased {
    constructor() {
        super(enuDomains.sputnikaf, "sputnik.af")
    }
}
