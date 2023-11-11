import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsXenForoBased extends clsScrapper {
  constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
    const baseConfig: IntfProcessorConfigs = {
      selectors: {
        article: ".block--messages",
        title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
        datetime: {
          conatiner: "time",
          splitter: (el: HTMLElement) => {
            const date = el.getAttribute("datetime")?.match(/\d{4}-\d{2}-\d{2}/);
            if (date)
              return date[0];
            else
              return "NO_DATE";

          }
        },
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.p-breadcrumbs li a span"),
        },
        comments: {
          container: ".js-replyNewMessageContainer article",
          author: ".message-inner .message-cell--user section.message-user .message-userDetails h4 a",
          datetime: "div .message-cell.message-cell--main div header ul.message-attribution-main.listInline li a time",
          text: "div .message-cell.message-cell--main div div div article .bbWrapper"
        }
      },
      url: {
        removeWWW: true
      }
    }

    super(domain, baseURL, deepmerge(baseConfig, conf || {}))
  }
}

export class persiantools extends clsXenForoBased {
  constructor() {
    super(enuDomains.persiantools, "forum.persiantools.com")
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("کامپیوتر") || second.includes("اینترنت")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    else if (second.includes("برنامه")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
    else if (second.includes("موبایل")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("عمومی")) return { ...mappedCategory, minor: enuMinorCategory.Generic }
    else if (second.includes("فرهنگ")) return { ...mappedCategory, minor: enuMinorCategory.Culture }
    else if (second.includes("سبک")) return { ...mappedCategory, minor: enuMinorCategory.LifeStyle }
    else if (second.includes("ورزش")) return { ...mappedCategory, minor: enuMinorCategory.Sport }
    else if (second.includes("اقتصاد")) return { ...mappedCategory, minor: enuMinorCategory.Economy }
    else if (second.includes("تکنولوژی")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech }
    return mappedCategory
  }
}

export class majidonline extends clsXenForoBased {
  constructor() {
    super(enuDomains.majidonline, "forum.majidonline.com", {
      url: {
        ignoreContentOnPath: ["/memebers"]
      }
    })
  }

  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
  }
}

export class bazicenter extends clsXenForoBased {
  constructor() {
    super(enuDomains.bazicenter, "forum.bazicenter.com")
  }

  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Game }
  }
}