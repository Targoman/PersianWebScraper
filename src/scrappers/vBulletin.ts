import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
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
        extraInvalidStartPaths: ["/member", "/forumdisplay", "/search", "/external", "/private", "/newreply.php", "/printthread.php", "/attachment.php",
		"/newreply"
	]
      },
      preHTMLParse: (html) => { html = html.replace(/>[ \t\n\r]+?</g, "> <"); return html; }
    }

    super(domain, baseURL, deepmerge(baseConfig, conf || {}))
  }
  protected normalizePath(url: URL): string {
      if (url.hostname === 'showthread.php' && url.searchParams?.has('t') && url.searchParams.has('page'))
           return 'https://' + url.hostname + url.pathname + '?t=' + url.searchParams.get("t") + "&page=" + url.searchParams.get('page')
      return url.toString()
  }
}

export class webhostingtalk extends clsVBulletinBased {
  constructor() {
    super(enuDomains.webhostingtalk, "webhostingtalk.ir", {
      selectors: {
        datetime: {
          conatiner: "span.date",
        },
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    else if (second.includes("شبکه")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    else if (second.includes("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
    else if (second.includes("داده")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    return mappedCat
  }
}

export class barnamenevis extends clsVBulletinBased {
  constructor() {
    super(enuDomains.barnamenevis, "barnamenevis.org" )
  }

  mapCategory(): IntfMappedCategory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}

export class p30world extends clsVBulletinBased {
  constructor() {
    super(enuDomains.p30world, "forum.p30world.com")
  }

  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("سیستم")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
    else if (second.includes("سخت")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
    else if (second.includes("اینترنت")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    else if (second.includes("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("گـرافیک")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
    else if (second.includes("هـنــــر")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
    else if (second.includes("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
    else if (second.includes("لپ تاپ")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
    return mappedCat
  }
}

export class tarfandestan extends clsVBulletinBased {
  constructor() {
    super(enuDomains.tarfandestan, "tarfandestan.com", {
      selectors: {
        datetime: {
          conatiner: "span.date",
        },
      },
      url: {
        extraInvalidStartPaths: ["/category", "/all", "/1", "/school", "/test"]
      }
    })
  }

  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    else if (second.includes("تبلت‌")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("اینترنت")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    else if (second.includes("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
    else if (second.includes("شبکه")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    else if (second.includes("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
    else if (second.includes("سایر")) return { ...mappedCat, subminor: enuMinorCategory.Generic }
    else if (second.includes("تحصیل")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Education }
    return mappedCat
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
  mapCategory(cat?: string): IntfMappedCategory {
    if (cat === "انجمن/تالار فرهنگی- هنری و آزاد") return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Culture }
    return { major: enuMajorCategory.NA, original: cat }
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
  mapCategory(): IntfMappedCategory {
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
  mapCategory(): IntfMappedCategory {
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
  mapCategory(): IntfMappedCategory {
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
  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum, minor: enuMinorCategory.LifeStyle }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) mappedCat.subminor = enuMinorCategory.Education
    else if (second.includes("پزشکی")) mappedCat.subminor = enuMinorCategory.Health
    else if (second.includes("جنسی")) mappedCat.subminor = enuMinorCategory.Health
    else if (second.includes("روانشناسی")) mappedCat.subminor = enuMinorCategory.Psychology
    else if (second.includes("هنر")) mappedCat.subminor = enuMinorCategory.Culture
    return mappedCat
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

  mapCategory(cat?: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Forum }
    if (!cat) return mappedCat
    const catParts = cat.split('/')
    const second = catParts.length > 1 ? catParts[1] : ''

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    else if (second.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
    else if (second.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
    else if (second.includes("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
    else if (second.includes("رایانه")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    else if (second.includes("خانواده")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
    else if (second.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Art }
    else if (second.includes("تفریح")) return { ...mappedCat, minor: enuMinorCategory.Fun }
    else if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
    else if (second.includes("گیاهان")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Agriculture }
    else if (second.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Defence }
    else if (second.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
    return mappedCat
  }
}
