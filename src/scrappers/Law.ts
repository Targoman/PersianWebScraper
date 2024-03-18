import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, IntfMappedCategory, IntfProxy } from "../modules/interfaces";
import { HTMLElement } from "node-html-parser"
import { getArvanCookie } from "../modules/request";

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

  mapCategoryImpl(): IntfMappedCategory {
    return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
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
  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News, minor: enuMinorCategory.Law }

    if (!cat) return mappedCat
    void cat, first, second

    if (first.startsWith('آزمون') || first.startsWith('وکالت')) return { ...mappedCat, subminor: enuMinorCategory.Education }
    if (first.startsWith('آگهی')) return { ...mappedCat, minor: enuMinorCategory.Advert }
    if (first.startsWith('آموزش')) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law, subminor: enuMinorCategory.Education }
    if (first.startsWith('آوای')) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law }
    if (first.startsWith('دانلود')) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law }
    if (first.startsWith('قوانین') || first.startsWith('منابع')) return { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }
    if (first.startsWith('ویدئو')) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law, subminor: enuMinorCategory.Law }
    return mappedCat
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
          splitter: (el: HTMLElement) => super.extractDate(el.innerText.replace("مصوب ", "").replace(/ .*/g, ""), " ") || "DATE NOT FOUND"
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
    return await getArvanCookie(url || "https://qavanin.ir", this.baseURL, proxy)
  }
  mapCategoryImpl(): IntfMappedCategory {
    return { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }
  }
}

export class rcmajlis extends clsScrapper {
  constructor() {
    super(enuDomains.rcmajlis, "rc.majlis.ir", {
      selectors: {
        article: "#newsSingle .col-lg-9, #newsSingle .col-12, #reportSingle .col-12",
        title: "h1",
        subtitle: ".filter.p-2",
        datetime: {
          acceptNoDate: true,
          conatiner: (_: HTMLElement, fullHTML: HTMLElement) =>
            fullHTML.querySelector('#reportSingle')
              ? fullHTML.querySelector('.detail-report li:nth-child(3) span.persian-num')
              : fullHTML.querySelector('.legal-draft-details .text-primary, .detail-report li:nth-child(2) span.persian-num, .law-meta-container .persian-num')

        },
        content: {
          main: ".content.persian-num",
          alternative: ".law-description .law_text",
          ignoreTexts: ["پایان پیام"]
        },
        category: {
          selector: (_: HTMLElement, fullHTML: HTMLElement) => fullHTML.querySelectorAll('.breadcrumb a')
        },
        tags: (article: HTMLElement, fullHTML: HTMLElement) => fullHTML.querySelector("#reportSingle") ? article.querySelectorAll(".meta-single-page")?.at(2)?.querySelectorAll('a') : article.querySelectorAll(".meta-single-page a")
      },
      url: {
        removeWWW: true,
        extraInvalidStartPaths: ["/fa/law/print_version", "/fa/news/print_version", "/fa/report/print_version"]
      }
    })
  }

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.News, minor: enuMinorCategory.Law }

    if (!cat) return mappedCat
    void cat, first, second

    if (second.startsWith('قوانین') || second.startsWith('طرح')) return { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }
    return mappedCat
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
          splitter: (el: HTMLElement) => el.getAttribute("content") || el.getAttribute("datetime")?.split("T").at(0) || "NO_DATE"
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

  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }

    if (!cat) return mappedCat
    void cat, first, second

    if (first.startsWith('آزمون') || first.startsWith('وکالت')) return { ...mappedCat, subminor: enuMinorCategory.Education }
    if (first.startsWith('آموزش')) return { major: enuMajorCategory.Weblog, minor: enuMinorCategory.Law, subminor: enuMinorCategory.Education }
    if (first.startsWith('آگهی')) return { ...mappedCat, minor: enuMinorCategory.Advert }
    if (first.startsWith('اخبار')) return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }

    return mappedCat
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
  mapCategoryImpl(): IntfMappedCategory {
    return { major: enuMajorCategory.News, minor: enuMinorCategory.Law }
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
  mapCategoryImpl(cat: string | undefined, first: string, second: string): IntfMappedCategory {
    const mappedCat: IntfMappedCategory = { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }
    if (!cat) return mappedCat
    void cat, first, second

    if (first.startsWith('انطباق') || first.startsWith('قانون')) return { major: enuMajorCategory.Doc, minor: enuMinorCategory.Law }

    return mappedCat
  }
}

