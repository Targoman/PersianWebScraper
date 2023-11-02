import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains } from "../modules/interfaces";

export class wikifa extends clsScrapper {
    constructor() {
        super(enuDomains.wikifa, "fa.wikipedia.org", {
            selectors: {
                article: "main",
                title: "h1",
                content: {
                    main: "#mw-content-text p, img",
                },
                datetime:{acceptNoDate: true},
                tags: "#mw-normal-catlinks ul li a",
                category: {
                    selector: "#mw-normal-catlinks ul li a",
                }
            },
          url: {
            removeWWW: true
          }
        })
    }
}