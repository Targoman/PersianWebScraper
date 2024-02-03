import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
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

  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("کامپیوتر") || second.includes("اینترنت")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    else if (second.includes("برنامه")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
    else if (second.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
    else if (second.includes("فرهنگ")) return { ...mappedCat, minor: enuMinorCategory.Culture }
    else if (second.includes("سبک")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
    else if (second.includes("ورزش")) return { ...mappedCat, minor: enuMinorCategory.Sport }
    else if (second.includes("اقتصاد")) return { ...mappedCat, minor: enuMinorCategory.Economics }
    else if (second.includes("تکنولوژی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
    return mappedCat
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

  mapCategory(): IntfMappedCategory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
  }
}

export class bazicenter extends clsXenForoBased {
  constructor() {
    super(enuDomains.bazicenter, "forum.bazicenter.com")
  }

  mapCategory(): IntfMappedCategory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Game }
  }
}