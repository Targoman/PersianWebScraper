import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuSubMinorCategory, enuTextType, IntfMappedCategory, IntfProcessorConfigs } from "../modules/interfaces";
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
        extraInvalidStartPaths: ["/member", "/forumdisplay", "/search", "/external", "/private", "/newreply", "/printthread", "/attachment",
          "/sendmessage", "/misc", "/category", "/all", "/1", "/school", "/test"
        ]
      },
      preHTMLParse: (html) => { html = html.replace(/>[ \t\n\r]+?</g, "> <"); return html; }
    }

    super(domain, baseURL, deepmerge(baseConfig, conf || {}))
  }
  protected normalizePath(url: URL): string {
    const protocol = `http${this.pConf.url?.forceHTTP ? "" : "s"}://`
    if (url.pathname === '/showthread.php' && url.searchParams?.has('t'))
      return + url.hostname + url.pathname + '?t=' + url.searchParams.get("t") + "&page=" + (url.searchParams.get('page') || "1")

    if (/\/threads\/[0-9]+-.*/.test(url.pathname) || /\/forums\/[0-9]+-.*/.test(url.pathname)) {
      const rx = /.*\/page([0-9]+).*/
      const page = rx.test(url.pathname) ? url.pathname.replace(rx, "$1") : "1"
      return protocol + url.hostname + url.pathname.split("-").at(0) + "/page" + page
    }

    const sp: string[] = []
    for (const [key, value] of url.searchParams.entries())  // each 'entry' is a [key, value] tupple
      if (key !== 's') sp.push(key + "=" + value)

    return protocol + url.hostname + url.pathname + (sp.length ? ("?" + sp.join("&")) : "")
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

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    if (!cat) return mappedCat
    void cat, first, second

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    if (second.includes("شبکه")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    if (second.includes("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
    if (second.includes("داده")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    return mappedCat
  }
}

export class barnamenevis extends clsVBulletinBased {
  constructor() {
    super(enuDomains.barnamenevis, "barnamenevis.org")
  }

  mapCategoryImpl(): IntfMappedCategory {
    return {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
  }
}

export class p30world extends clsVBulletinBased {
  constructor() {
    super(enuDomains.p30world, "forum.p30world.com")
  }

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, }
    if (!cat) return mappedCat
    void cat, first, second

    if (second.includes("سیستم")) return { ...mappedCat, subminor: enuSubMinorCategory.Software }
    if (second.includes("سخت")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
    if (second.includes("اینترنت")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    if (second.includes("موبایل")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
    if (second.includes("گـرافیک")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
    if (second.includes("هـنــــر")) return { ...mappedCat, subminor: enuSubMinorCategory.Art }
    if (second.includes("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
    if (second.includes("لپ تاپ")) return { ...mappedCat, subminor: enuSubMinorCategory.Hardware }
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
    })
  }

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
    if (!cat) return mappedCat
    void cat, first, second

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    if (second.includes("تبلت‌")) return { ...mappedCat, subminor: enuSubMinorCategory.Mobile }
    if (second.includes("اینترنت")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    if (second.includes("بازی")) return { ...mappedCat, subminor: enuSubMinorCategory.Game }
    if (second.includes("شبکه")) return { ...mappedCat, subminor: enuMinorCategory.IT }
    if (second.includes("امنیت")) return { ...mappedCat, subminor: enuSubMinorCategory.Security }
    if (second.includes("سایر")) return { ...mappedCat, subminor: enuMinorCategory.Generic }
    if (second.includes("تحصیل")) return { ...mappedCat, minor: enuMinorCategory.Education, subminor: enuMinorCategory.Education }
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
  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    void cat, first, second
    if (cat === "انجمن/تالار فرهنگی- هنری و آزاد") return {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.Culture }
    return {textType:enuTextType.Formal, major: enuMajorCategory.Weblog, minor:enuMinorCategory.Economics }
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
  mapCategoryImpl(): IntfMappedCategory {
    return {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
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
  mapCategoryImpl(): IntfMappedCategory {
    return {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Hardware }
  }
}

export class joomlafarsi extends clsVBulletinBased {
  constructor() {
    super(enuDomains.joomlafarsi, "forum.joomlafarsi.com", {
      selectors: {
        datetime: {
          splitter: (el: HTMLElement) => {
            const date = el.textContent.match(/\d{2}-\d{2}-\d{4}/);
            if (date) {
              const dateParts = date[0].split("-")
              if (dateParts.length === 3)
                return dateParts[2] + '-' + dateParts[0] + '-' + dateParts[1];
              return "INVALID_DATE"
            }
            else
              return "NO_DATE";
          }
        }
      },
      url: {
        removeWWW: true
      }
    })
  }
  mapCategoryImpl(): IntfMappedCategory {
    return {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Software }
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
  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = {textType:enuTextType.Informal, major: enuMajorCategory.Forum, minor: enuMinorCategory.LifeStyle }
    if (!cat) return mappedCat
    void cat, first, second

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

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = {textType: enuTextType.Informal, major: enuMajorCategory.Forum }
    if (!cat) return mappedCat
    void cat, first, second

    if (second.includes("آموزش")) return { ...mappedCat, minor: enuMinorCategory.Education }
    if (second.includes("موبایل")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Mobile }
    if (second.includes("عمومی")) return { ...mappedCat, minor: enuMinorCategory.Generic }
    if (second.includes("مذهب")) return { ...mappedCat, minor: enuMinorCategory.Religious }
    if (second.includes("رایانه")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuMinorCategory.IT }
    if (second.includes("خانواده")) return { ...mappedCat, minor: enuMinorCategory.LifeStyle }
    if (second.includes("هنر")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Art }
    if (second.includes("تفریح")) return { ...mappedCat, minor: enuMinorCategory.Fun }
    if (second.includes("تاریخ")) return { ...mappedCat, minor: enuMinorCategory.Historical }
    if (second.includes("گیاهان")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.Agriculture }
    if (second.includes("دفاعی")) return { ...mappedCat, minor: enuMinorCategory.Defence }
    if (second.includes("علمی")) return { ...mappedCat, minor: enuMinorCategory.ScienceTech }
    return mappedCat
  }
}

export class avastarco extends clsVBulletinBased {
  constructor() {
    super(enuDomains.avastarco, "forum.avastarco.com", {
      selectors: {
        category: {
          selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll("#breadcrumb ul li a"),
          startIndex: 2,
          lastIndex: 4
        },
        comments: {
          author: "a.username strong b",
        }
      },
      url: {
        removeWWW: true,
        extraInvalidStartPaths: ["/forum/members"]
      }
    })
  }
}

export class akkasee extends clsVBulletinBased {
  constructor() {
    super(enuDomains.akkasee, "forum.akkasee.com", {
      selectors: {
        category: {
          startIndex: 1,
          lastIndex: 3
        }
      },
      url: {
        removeWWW: true,
        forceHTTP: true
      }
    })
  }
}