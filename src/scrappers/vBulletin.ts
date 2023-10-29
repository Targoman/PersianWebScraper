import { clsScrapper } from "../modules/clsScrapper";
import { dateOffsetToDate } from "../modules/common";
import { enuDomains, IntfProcessorConfigs } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import deepmerge from "deepmerge";

class clsVBulletinBased extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
              article: ".postlist",
              title: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelector("span.threadtitle a"),
              datetime: {
                conatiner: "span.date",
              },
              category: {
                selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb ul li.navbit a"),
              },
              comments: {
                  container: "ol.posts li",
                  author: ".postdetails .userinfo .username_container .popupmenu.memberaction a",
                  datetime: ".posthead .postdate.old span.date",
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
}

export class soft98 extends clsVBulletinBased {
  constructor() {
      super(enuDomains.soft98, "forum.soft98.ir", {
        selectors: {
          datetime: {
            conatiner: "span.date",
            splitter: (el: HTMLElement) => {
              const date = el.textContent.match(/\d{4}-\d{2}-\d{2}/);
              if(date)
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