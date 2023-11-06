import { clsScrapper } from "../modules/clsScrapper";
import { dateOffsetToDate } from "../modules/common";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCatgory, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsVBulletinBased extends clsScrapper {
  constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
    const baseConfig: IntfProcessorConfigs = {
      selectors: {
        article: ".postlist",
        title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("span.threadtitle a"),
        datetime: {
          conatiner: "span.date, i.StampDate",
        },
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb ul li.navbit a"),
        },
        comments: {
          container: "ol.posts li",
          author: ".postdetails .userinfo .username_container .popupmenu.memberaction a, a.username",
          datetime: ".posthead .postdate.old span.date, i.StampDate",
          text: ".postdetails .postbody .postrow .content > div"
        }
      },
      url: {
        extraInvalidStartPaths: ["/member", "/forumdisplay", "/search", "/external"]
      }
    }



    super(domain, baseURL, deepmerge(baseConfig, conf || {}))
  }
}

export class webhostingtalk extends clsVBulletinBased {
  constructor() {
    super(enuDomains.webhostingtalk, "webhostingtalk.ir", {
      selectors: {
        datetime: {
          conatiner: "span.date",
          splitter: dateOffsetToDate
        },
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCategory, minor: enuMinorCategory.Education }
    else if (second.includes("شبکه")) return { ...mappedCategory, subminor: enuSubMinorCategory.IT }
    else if (second.includes("امنیت")) return { ...mappedCategory, subminor: enuSubMinorCategory.Security }
    else if (second.includes("داده")) return { ...mappedCategory, subminor: enuSubMinorCategory.IT }
    return mappedCategory
  }
}

export class barnamenevis extends clsVBulletinBased {
  constructor() {
    super(enuDomains.barnamenevis, "barnamenevis.org")
  }

  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}

export class p30world extends clsVBulletinBased {
  constructor() {
    super(enuDomains.p30world, "forum.p30world.com")
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("سیستم")) return { ...mappedCategory, subminor: enuSubMinorCategory.Software }
    else if (second.includes("سخت")) return { ...mappedCategory, subminor: enuSubMinorCategory.Hardware }
    else if (second.includes("اینترنت")) return { ...mappedCategory, subminor: enuSubMinorCategory.IT }
    else if (second.includes("موبایل")) return { ...mappedCategory, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("گـرافیک")) return { ...mappedCategory, subminor: enuSubMinorCategory.Art }
    else if (second.includes("هـنــــر")) return { ...mappedCategory, subminor: enuSubMinorCategory.Art }
    else if (second.includes("بازی")) return { ...mappedCategory, subminor: enuSubMinorCategory.Game }
    else if (second.includes("لپ تاپ")) return { ...mappedCategory, subminor: enuSubMinorCategory.Hardware }
    return mappedCategory
  }
}

export class tarfandestan extends clsVBulletinBased {
  constructor() {
    super(enuDomains.tarfandestan, "tarfandestan.com", {
      selectors: {
        datetime: {
          conatiner: "span.date",
          splitter: dateOffsetToDate
        },
      },
      url: {
        extraInvalidStartPaths: ["/category", "/all", "/1", "/school", "/test"]
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCategory, minor: enuMinorCategory.Education }
    else if (second.includes("تبلت‌")) return { ...mappedCategory, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("اینترنت")) return { ...mappedCategory, subminor: enuSubMinorCategory.IT }
    else if (second.includes("بازی")) return { ...mappedCategory, subminor: enuSubMinorCategory.Game }
    else if (second.includes("شبکه")) return { ...mappedCategory, subminor: enuSubMinorCategory.IT }
    else if (second.includes("امنیت")) return { ...mappedCategory, subminor: enuSubMinorCategory.Security }
    else if (second.includes("سایر")) return { ...mappedCategory, subminor: enuMinorCategory.Generic }
    else if (second.includes("تحصیل")) return { ...mappedCategory, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Education }
    return mappedCategory
  }
}

export class boursy extends clsVBulletinBased {
  constructor() {
    super(enuDomains.boursy, "forums.boursy.com", {
      url: {
        removeWWW: true
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    if (cat === "انجمن/تالار فرهنگی- هنری و آزاد") return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Culture }
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Economy }
  }

}

export class soft98 extends clsVBulletinBased {
  constructor() {
    super(enuDomains.soft98, "forum.soft98.ir", {
      selectors: {
        datetime: {
          conatiner: "span.date",
          splitter: (el: HTMLElement) => {
            const date = el.textContent.match(/\d{4}-\d{2}-\d{2}/);
            if (date)
              return date[0];
            else
              return "NO_DATE";
          }
        },
      },
      url: {
        removeWWW: true
      }
    })
  }
  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}

export class sakhtafzarmag extends clsVBulletinBased {
  constructor() {
    super(enuDomains.sakhtafzarmag, "forums.sakhtafzarmag.com", {
      selectors: {
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ul.cf li a")
        }
      },
      url: {
        removeWWW: true
      }
    })
  }
  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
  }
}

export class joomlafarsi extends clsVBulletinBased {
  constructor() {
    super(enuDomains.joomlafarsi, "forum.joomlafarsi.com", {
      url: {
        removeWWW: true
      }
    })
  }
  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}

export class moshaver extends clsVBulletinBased {
  constructor() {
    super(enuDomains.moshaver, "forum.moshaver.co", {
      url: {
        removeWWW: true
      }
    })
  }
  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.LifeStyle }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) mappedCategory.subminor = enuMinorCategory.Education
    else if (second.includes("پزشکی")) mappedCategory.subminor = enuMinorCategory.Health
    else if (second.includes("جنسی")) mappedCategory.subminor = enuMinorCategory.Health
    else if (second.includes("روانشناسی")) mappedCategory.subminor = enuMinorCategory.Health
    else if (second.includes("هنر")) mappedCategory.subminor = enuMinorCategory.Culture
    return mappedCategory
  }
}

export class oghyanos extends clsVBulletinBased {
  constructor() {
    super(enuDomains.oghyanos, "forum.oghyanos.ir", {
      url: {
        removeWWW: true
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCatgory {
    const mappedCategory: IntfMappedCatgory = { major: enuMajorCategory.Forum }
    if (!cat) return mappedCategory
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCategory, minor: enuMinorCategory.Education }
    else if (second.includes("موبایل")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("عمومی")) return { ...mappedCategory, minor: enuMinorCategory.Generic }
    else if (second.includes("مذهب")) return { ...mappedCategory, minor: enuMinorCategory.Religious }
    else if (second.includes("رایانه")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
    else if (second.includes("خانواده")) return { ...mappedCategory, minor: enuMinorCategory.LifeStyle }
    else if (second.includes("هنر")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Art }
    else if (second.includes("تفریح")) return { ...mappedCategory, minor: enuMinorCategory.Fun }
    else if (second.includes("تاریخ")) return { ...mappedCategory, minor: enuMinorCategory.Historical }
    else if (second.includes("گیاهان")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Agriculture }
    else if (second.includes("دفاعی")) return { ...mappedCategory, minor: enuMinorCategory.Defence }
    else if (second.includes("علمی")) return { ...mappedCategory, minor: enuMinorCategory.ScienceTech }
    return mappedCategory
  }
}