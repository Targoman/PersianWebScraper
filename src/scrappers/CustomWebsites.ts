import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, IntfProxy } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import { getArvanCookie } from "../modules/request";

export class divar extends clsScrapper {
  constructor() {
    super(enuDomains.divar, "divar.ir", {
      basePath: "/s/iran",
      selectors: {
        article: "article .kt-row",
        title: ".kt-page-title__title",
        subtitle: ".kt-page-title__subtitle",
        datetime: {
          acceptNoDate: true
        },
        content: {
          main: "p.kt-description-row__text, .kt-col-5 section:nth-child(1) .post-page__section--padded, img.kt-image-block__image",
        },
        category: {
          selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.kt-breadcrumbs li a")
        },
        tags: "nav .kt-wrapper-row a button"
      }
    })
  }
}

export class dotic extends clsScrapper {
  constructor() {
    super(enuDomains.dotic, "dotic.ir", {
      selectors: {
        article: ".details_right",
        title: ".title",
        subtitle: ".lead",
        datetime: {
          conatiner: ".details_right_info li:nth-child(2)",
          splitter: (el: HTMLElement) => super.extractDate(el, el.classList.contains("comment-date") ? " " : "|") || "DATE NOT FOUND",
        },
        content: {
          main: ".matn",
          ignoreNodeClasses: ["pull-left"]
        },
        category: {
          selector: ".tags:nth-child(2) a"
        },
        tags: ".tags:nth-child(3) a"
      },
      url: { removeWWW: true }
    })
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }

  async initialCookie(proxy?: IntfProxy, url?: string) {
    return await getArvanCookie(url || "https://dotic.ir", this.baseURL, proxy)
  }
}

export class ekhtebar extends clsScrapper {
  constructor() {
    super(enuDomains.ekhtebar, "ekhtebar.ir", {
      selectors: {
        article: "#the-post",
        title: ".entry-title",
        subtitle: ".lead",
        datetime: {
          conatiner: ".date",
        },
        content: {
          main: ".entry-content",
          ignoreNodeClasses: ["ez-toc-container", "ez-toc-title-container", "post-bottom-meta", "ez-toc-list"],
          ignoreTexts: ["بیشتر بخوانید:"]
        },
        category: {
          selector: "#breadcrumb a",
          startIndex: 1
        },
        tags: ".tagcloud a"
      },
      url: { removeWWW: true }
    })
  }

}

export class qavanin extends clsScrapper {
  constructor() {
    super(enuDomains.qavanin, "qavanin.ir", {
      selectors: {
        article: "section.normal-section#about",
        title: "h1",
        subtitle: "h2",
        datetime: {
          conatiner: "h2",
          splitter: (el: HTMLElement) => super.extractDate(el.innerText.replace("مصوب ", "").replace(/ .*/, ""), " ") || "DATE NOT FOUND"
        },
        content: {
          main: "#treeText",
          ignoreTexts: ["متن این مصوبه هنوز وارد سامانه نشده است لطفا قسمت تصویر را نیز ملاحظه فرمایید."]
        },
        category: {
          selector: "#breadcrumb a",
          startIndex: 1
        },
        tags: ".tagcloud a"
      },
      url: { removeWWW: true }
    })
  }
  async initialCookie(proxy?: IntfProxy, url?: string) {
    return await getArvanCookie(url || "https://dotic.ir", this.baseURL, proxy)
  }
}

export class rcmajlis extends clsScrapper {
  constructor() {
    super(enuDomains.rcmajlis, "rc.majlis.ir", {
      selectors: {
        article: "section.normal-section#about",
        title: "h1",
        subtitle: "h2",
        datetime: {
          conatiner: "h2",
          splitter: (el: HTMLElement) => super.extractDate(el.innerText.replace("مصوب ", "").replace(/ .*/, ""), " ") || "DATE NOT FOUND"
        },
        content: {
          main: "#treeText",
          ignoreTexts: ["متن این مصوبه هنوز وارد سامانه نشده است لطفا قسمت تصویر را نیز ملاحظه فرمایید."]
        },
        category: {
          selector: "#breadcrumb a",
          startIndex: 1
        },
        tags: ".tagcloud a"
      },
      url: { removeWWW: true }
    })
  }
  async initialCookie(proxy?: IntfProxy, url?: string) {
    return await getArvanCookie(url || "https://dotic.ir", this.baseURL, proxy)
  }
}

export class shenasname extends clsScrapper {
  constructor() {
    super(enuDomains.shenasname, "shenasname.ir", {
      selectors: {
        article: "article, [itemprop='mainEntity']",
        title: ".entry-title, .qa-main-heading h1 a", 
        datetime: {
          conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[property='article:published_time'], time"),
          splitter: (el: HTMLElement) => (el.getAttribute("content") || el.getAttribute("datetime"))?.substring(0, 10) || "NO_DATE"
        },
        content: {
          main: ".entry-content",
          ignoreNodeClasses: ["ez-toc-v2_0_62", "wp-block-button__link", "post-bottom-meta"],
          ignoreTexts: [/.*ایتا.*/, /.*بله.*/, /.*روبیکا.*/, /.*سروش.*/, /.*شناسنامه قانون در پیام‌رسان‌های داخلی.*/, /.*henasname.*/]
        },
        category: {
          selector: "span.post-cat-wrap, .qa-q-view-main a.qa-category-link",
        },
        tags: "span.tagcloud a",
        comments: {
          container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article, .qa-a-list .qa-a-list-item, .qa-q-view-main"),
          author: "footer .comment-author b, [itemprop='name']",
          datetime: "time",
          text: ".comment-content, [itemprop='text']"
        }
      },
    })
  }
}

export class labourlaw extends clsScrapper {
  constructor() {
    super(enuDomains.labourlaw, "labourlaw.ir", {
      selectors: {
        article: "[itemprop='mainContentOfPage']",
        title: "h1",
        datetime: {
          conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("time"),
          splitter: (el: HTMLElement) => el.getAttribute("datetime")?.substring(0, 10) || "NO_DATE"
        },
        content: {
          main: ".entry-content",
          ignoreNodeClasses: ["yarpp-related"],
          ignoreTexts: ["بازگشت به فهرست"]
        },
      },
      url: { removeWWW: true }
    })
  }
}

export class sistani extends clsScrapper {
  constructor() {
    super(enuDomains.sistani, "sistani.org", {
      basePath: "/persian",
      selectors: {
        article: "#content-rtl, .book-text",
        title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
        datetime: {
          acceptNoDate: true
        },
        content: {
          main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll(".book-text, .one-qa, #content-rtl"),
        },
        category: {
          selector: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("h3 a, h1.abi-sq-rtl a, h1 a")
        }
      },
      url: { 
        removeWWW: true,
        extraInvalidStartPaths: ["/arabic", "/urdu", "/english", "/turkish", "/azari", "/french", "/persian/send-question/"]
      }
    })
  }
}

export class agorgani extends clsScrapper {
  constructor() {
    super(enuDomains.agorgani, "site.agorgani.ir", {
      selectors: {
        article: "body.single-post, #the-post",
        title: "h1",
        datetime: {
          conatiner: "span.date",
          acceptNoDate: true
        },
        content: {
          main: ".entry-content, figure.single-featured-image",
        },
        category: {
          selector: "a.post-cat"
        },
        comments: {
          container: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("ol.comment-list li article"),
          author: "footer .comment-author b",
          text: ".comment-content"
        }
      },
      url: { 
        extraInvalidStartPaths: ["/ar"]
      }
    })
  }
}

export class shoragc extends clsScrapper {
  constructor() {
    super(enuDomains.shoragc, "shora-gc.ir", {
      selectors: {
        article: ".news_main_body",
        title: "h1",
        aboveTitle: ".newspage_rutitr",
        subtitle: ".newspage_subtitle",
        datetime: {
          conatiner: "span.date_2",
          acceptNoDate: true
        },
        content: {
          main: ".body, .news_album_main_part div a",
          ignoreNodeClasses: ["download_link"]
        },
        category: {
          selector: ".news_path a"
        },
        tags: "a.tags_item",
      },
      url: { 
        extraInvalidStartPaths: ["/ar"]
      }
    })
  }
}

export class saafi extends clsScrapper {
  constructor() {
    super(enuDomains.saafi, "saafi.com", {
      selectors: {
        article: ".matn",
        title: ".field-name-title-field .field-item",
        datetime: {
          conatiner: (_, fullHtml: HTMLElement) => fullHtml.querySelector("meta[name='dcterms.date']"),
          splitter: (el: HTMLElement) => el.getAttribute("content")?.substring(0, 10) || "NO_DATE"
        },
        content: {
          main: ".bodyasli, .gallerygallery .sb-gallery-gallery",
        },
      },
      url: { 
        extraInvalidStartPaths: ["/ar", "/az", "/ur", "en", "/Invalid"]
      }
    })
  }
}