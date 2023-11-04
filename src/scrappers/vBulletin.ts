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
}

export class barnamenevis extends clsVBulletinBased {
  constructor() {
    super(enuDomains.barnamenevis, "barnamenevis.org")
  }

  mapCategory(): IntfMappedCatgory {
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.ScienceTech, subminor: enuSubMinorCategory.IT }
  }
}

export class p30world extends clsVBulletinBased {
  constructor() {
    super(enuDomains.p30world, "forum.p30world.com")
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
}

export class boursy extends clsVBulletinBased {
  constructor() {
    super(enuDomains.boursy, "forums.boursy.com", {
      url: {
        removeWWW: true
      }
    })
  }

  mapCategory(cat?:string): IntfMappedCatgory {
    if(cat === "انجمن/تالار فرهنگی- هنری و آزاد") return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Culture }
    return { major: enuMajorCategory.Forum, minor: enuMinorCategory.Economics }
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
}

export class joomlafarsi extends clsVBulletinBased {
  constructor() {
    super(enuDomains.joomlafarsi, "forum.joomlafarsi.com", {
      url: {
        removeWWW: true
      }
    })
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
}

export class oghyanos extends clsVBulletinBased {
  constructor() {
    super(enuDomains.oghyanos, "forum.oghyanos.ir", {
      url: {
        removeWWW: true
      }
    })
  }
}