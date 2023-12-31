import { clsScrapper } from "../modules/clsScrapper";
import { IntfMappedCatgory, enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"

export class lioncomputer extends clsScrapper {
  constructor() {
    super(enuDomains.lioncomputer, "forum.lioncomputer.com", {
      selectors: {
        article: "#comments",
        title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("h1 span"),
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
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul[data-role='breadcrumbList'] li a"),
        },
        comments: {
          container: "#elPostFeed form article",
          author: "aside h3 strong a span",
          datetime: "time",
          text: "div[data-role='commentContent']"
        }
      },
      url: {
        removeWWW: true,
        ignoreContentOnPath: ["/topic"]
      }
    })
  }
  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCat: IntfMappedCatgory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("نرم")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
    else if (second.includes("سخت")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
    else if (second.includes("اینترنت")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    else if (second.includes("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("گـرافیک")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
    else if (second.includes("عمومی")
      || second.includes("بازارچه")
      || second.includes("بلاگ")
      || second.includes("کلاب")) return { ...mappedCat, minor: enuMinorCategory.Generic }
    else if (second.includes("گیمینگ")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
    else if (second.includes("ارزهای")) return { ...mappedCat, subminor: enuMinorCategory.CryptoCurrency }
    return mappedCat
  }
}

export class bazmineh extends clsScrapper {
  constructor() {
    super(enuDomains.bazmineh, "bazmineh.com", {
      selectors: {
        article: ".forumThirdTopics",
        title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("li.active"),
        datetime: {
          conatiner: ".fttbi-meta span",
          splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND"
        },
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.breadcrumb li a"),
        },
        comments: {
          container: ".forumThirdTopicBox",
          author: "ul li:nth-child(2)",
          datetime: ".fttbi-meta span",
          text: ".fttbi-text"
        }
      },
      url: {
        removeWWW: true,
        extraInvalidStartPaths: ["/articles", "/article", "/inspiration", "/quiz", "/fun", "/user", "/marketplace", "/login", "/vendor"]
      }
    })
  }

  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.LifeStyle }
  }
}

export class wppersian extends clsScrapper {
  constructor() {
    super(enuDomains.wppersian, "forum.wp-persian.com", {
      selectors: {
        article: "#pagebody",
        title: "h2.topictitle",
        datetime: {
          conatiner: ".threadauthor small",
          splitter: (el: HTMLElement) => super.extractDate(el, "-") || "DATE NOT FOUND"
        },
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("p.bbcrumb a"),
        },
        comments: {
          container: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#thread li"),
          author: ".threadauthor p strong",
          datetime: ".threadauthor small",
          text: ".threadpost .post"
        }
      },
      url: {
        removeWWW: true,
        extraInvalidStartPaths: ["/tags"]
      }
    })
  }
  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}