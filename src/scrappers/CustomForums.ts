import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains } from "../modules/interfaces";
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
                  if(date)
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
              removeWWW: true
            }
        })
    }
}