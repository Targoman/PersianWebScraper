import { clsScrapper } from "../modules/clsScrapper"
import { enuDomains } from "../modules/interfaces"
import { HTMLElement } from "node-html-parser"

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
  