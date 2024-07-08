import { clsScrapper } from "../modules/clsScrapper";
import { IntfProcessorConfigs, enuDomains } from "../modules/interfaces";
import deepmerge from "deepmerge";
import { HTMLElement } from "node-html-parser"

class clsWiki extends clsScrapper {
    constructor(domain: enuDomains, baseURL: string, conf?: IntfProcessorConfigs) {
        const baseConfig: IntfProcessorConfigs = {
            selectors: {
                article: "main, .mw-body",
                title: "h1",
                content: {
                    main: "#mw-content-text p, img",
                },
                datetime: {
                    acceptNoDate: true
                },
                tags: "#mw-normal-catlinks ul li a",
                category: {
                    selector: ".subpages a",
                }
            },
            url: {
                removeWWW: true
            }
        }

        super(domain, baseURL, deepmerge(baseConfig, conf || {}))
    }
}

export class wikifa extends clsWiki {
    constructor() {
        super(enuDomains.wikifa, "fa.wikipedia.org", {
            selectors: {
                category: {
                    selector: "#mw-normal-catlinks ul li a",
                }
            },
        })
    }
}

export class wikihoghoogh extends clsWiki {
    constructor() {
        super(enuDomains.wikihoghoogh, "wikihoghoogh.net")
    }
}

export class wikivoyage extends clsWiki {
    constructor() {
        super(enuDomains.wikivoyage, "fa.wikivoyage.org", {
            selectors: {
                category: {
                    selector: "span.ext-geocrumbs-breadcrumbs bdi",
                }
            }
        })
    }
}

export class wikibooks extends clsWiki {
    constructor() {
        super(enuDomains.wikibooks, "fa.wikibooks.org")
    }
}

export class wikisource extends clsWiki {
    constructor() {
        super(enuDomains.wikisource, "fa.wikisource.org", {
            selectors: {
                content: {
                    main: "#mw-content-text p, img, span.beyt",
                }
            }
        })
    }
}

export class wikishia extends clsWiki {
    constructor() {
        super(enuDomains.wikishia, "fa.wikishia.net", {
            basePath: "/view/صفحهٔ_اصلی",
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/w"]
            }
        })
    }
}

export class wikishahid extends clsWiki {
    constructor() {
        super(enuDomains.wikishahid, "wikishahid.com", {
            selectors: {
                article: ".rade",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("div[style='margin:2px 2px 2px 2px;']"),
                    ignoreNodeClasses: ["black", "Tools-pdf", "titlemenu", "edit_tpc", "rade"]
                },
                datetime: {
                    acceptNoDate: true
                },
            },
            url: {
                removeWWW: true,
                extraInvalidStartPaths: ["/talk/edit", "/eidt"]
            }
        })
    }
}

export class wikifeqh extends clsWiki {
    constructor() {
        super(enuDomains.wikifeqh, "fa.wikifeqh.ir", {
            selectors: {
                article: ".rade",
                title: (_, fullHtml: HTMLElement) => fullHtml.querySelector("h1"),
                content: {
                    main: (_, fullHtml: HTMLElement) => fullHtml.querySelectorAll("div[style='margin:2px 2px 2px 2px;']"),
                    ignoreNodeClasses: ["black", "Tools-pdf", "titlemenu", "edit_tpc", "rade"]
                },
            },
        })
    }
}

export class wikijoo extends clsWiki {
    constructor() {
        super(enuDomains.wikijoo, "wikijoo.ir", { 
            url: {
                removeWWW: true,
            }
        })
    }
}