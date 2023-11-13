import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import deepmerge from "deepmerge";

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
                datetime: { conatiner: '.article__info-date a', splitter: " " }
            },
            url: {
                removeWWW: true,
                pathToCheckIndex:1
            }
        }
        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

/***********************************************************/
export class spnfa extends clsSputnikBased {
    constructor() {
        super(enuDomains.spnfa, "spnfa.ir")
    }

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
    }
}

/***********************************************************/
export class sputnikaf extends clsSputnikBased {
    constructor() {
        super(enuDomains.sputnikaf, "sputnik.af")
    }

    mapCategory(): IntfMappedCatgory {
        return { major: enuMajorCategory.News }
    }
}
