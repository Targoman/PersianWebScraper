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
                splitter: dateOffsetToDate
              },
              category: {
                selector: (_: HTMLElement, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".breadcrumb ul li.navbit a"),
              },
              comments: {
                  container: "ol.posts li",
                  author: ".postdetails .userinfo .username_container .popupmenu.memberaction a",
                  datetime: (cm: HTMLElement) => dateOffsetToDate(cm.querySelector(".posthead .postdate.old span.date")),
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
      super(enuDomains.webhostingtalk, "webhostingtalk.ir")
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
        url: {
          extraInvalidStartPaths: ["/category", "/all", "/1", "/school", "/test"]
        }
      })
  }
}