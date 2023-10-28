import { existsSync, mkdirSync, writeFileSync } from "fs"
import { Md5 } from "ts-md5"
import { fa2En, sleep, normalizeText, persianMonthNumber, always } from "./common"
import clsDB, { enuURLStatus } from "./db"
import gConfigs from "./gConfigs"
import {
    enuDomains,
    enuTextType,
    IntfPageContent,
    IntfProxy,
    IntfProcessorConfigs,
    IntfComment,
    IntfSelectorFunction,
    IntfSelectAllFunction,
    IntfImage,
    IntfContentHolder,
    IntfDateSplitter,
    IntfIsValidFunction,
    IntfURLNormaliziztionConf
} from "./interfaces"
import { log } from "./logger"
import HP, { HTMLElement, Node, NodeType } from "node-html-parser"
import { axiosGet, IntfRequestParams } from "./request"
import { nextProxy } from "./proxy"

interface IntfProcessedElement {
    text?: string,
    type?: enuTextType,
    ref?: string
}

/******************************************* */
const debugNodeProcessor = false
let stack: string[] = []
/******************************************* */

export abstract class clsScrapper {
    protected domain: enuDomains
    protected baseURL: string
    protected pConf: IntfProcessorConfigs
    private corporaPath: string
    protected db: clsDB
    private queue: { [key: number]: string }
    private proxyCookie: { [key: string]: string }

    constructor(name: enuDomains, baseURL: string, processorConfigs: IntfProcessorConfigs) {
        this.domain = name
        this.baseURL = baseURL
        this.pConf = processorConfigs
        this.db = new clsDB(name)
        this.corporaPath = gConfigs.corpora + "/" + this.domain
        this.queue = {}
        this.proxyCookie = {}
    }

    async check(url: string) {
        log.info(await this.getPageContent(url))
    }

    async start(recheck = false) {
        try {
            log.progress("Starting " + this.domain)
            this.db.init()
            if (!existsSync(this.corporaPath))
                if (!mkdirSync(this.corporaPath, { recursive: true }))
                    throw new Error("Unable to create corpora directory: " + this.corporaPath)

            if (!await this.init())
                throw "Unable to init"

            const checkFinished = async (count = 0) => {
                try {
                    const stats = await this.db.stats() || {}

                    if (stats['remaining'] == 0 && stats['processed'] > 0) {
                        if (count <= 1000) {
                            log.status({ ...stats, countDown: 1000 - count })
                            return setTimeout(() => checkFinished(++count), 1000)
                        } else {
                            log.status({ ...stats, fetching: "FINISHED" })
                            log.info("!!!! FINISHED !!!!")
                            process.exit()
                        }
                    }
                    log.status(stats)
                } catch (e: any) { /**/ }
                setTimeout(checkFinished, 1000)
            }

            setTimeout(checkFinished, 3000)

            this.db.reset()
            if (recheck || (await this.db.hasAnyURL() === undefined)) {
                log.debug({ recheck })
                if (!await this.retrieveAndProcessPage(this.normalizePath(this.safeCreateURL("https://" + this.baseURL + "/"))))
                    throw new Error("No content retrieved")
            }
            await sleep(1000)
            await this.processNextUrl()
        }
        catch (e: any) {
            log.error(e.message)
        }
    }

    private tagName2Type(tagName: string) {
        switch (tagName) {
            case 'P': return enuTextType.paragraph
            case 'H1': return enuTextType.h1
            case 'H2': return enuTextType.h2
            case 'H3': return enuTextType.h3
            case 'H4': return enuTextType.h4
            case 'A': return enuTextType.link
            case 'LI': return enuTextType.li
            case 'SPAN': return enuTextType.paragraph
            case 'STRONG': return enuTextType.paragraph
            case 'DIV': return enuTextType.paragraph
            case 'CITE': return enuTextType.paragraph
            case 'BLOCKQUOTE': return enuTextType.blockquote
            default: return
        }
    }

    private safeCreateURL(url: string) {
        try {
            return new URL(url)
        } catch (e) {
            return new URL("https://" + this.baseURL + "/Invalid/" + url)
        }
    }

    private processElement(el: HTMLElement, ignoreClasses?: string[] | IntfIsValidFunction): IntfProcessedElement[] {
        const mustBeIgnored = (el: HTMLElement): boolean => {
            if (ignoreClasses) {
                if (typeof ignoreClasses === "function") {
                    const fakeNode = HP.parse(`<div>${el.outerHTML}</div>`)
                    return ignoreClasses(fakeNode, fakeNode) ? true : false
                } else {
                    let found = false
                    for (let i = 0; i < ignoreClasses.length; ++i)
                        if (el.classList.contains(ignoreClasses[i])) {
                            found = true
                            break
                        }
                    if (found) {
                        debugNodeProcessor && log.debug("========> Ignored Node:", el.outerHTML)
                        return true
                    }
                }
            }
            return false
        }

        if (mustBeIgnored(el) || el.tagName === "STYLE" || el.tagName === "SCRIPT")
            return []

        const breakToParagraphs = (container: IntfProcessedElement[], text?: string, type?: enuTextType, ref?: string) => {
            text?.split("\n").forEach(par => container.push({ text: par, type, ref }))
        }

        if (el.tagName === "UL" || el.tagName === "OL") {
            let content: IntfProcessedElement[] = []
            stack.push("UL")

            el.childNodes.forEach((node: Node) => {
                if (node.nodeType === NodeType.ELEMENT_NODE) {
                    const li = (node as HTMLElement)
                    if (mustBeIgnored(li)) return
                    stack.push("LI")
                    const extracted = this.processElement(li, ignoreClasses)
                    if (extracted.length)
                        content = [...content, ...extracted]
                    debugNodeProcessor && log.debug(li.tagName, stack.join(">"), content, el.outerHTML)
                    stack.pop()
                }
            })
            debugNodeProcessor && log.debug(el.tagName, stack.join(">"), content, el.outerHTML)
            stack.pop()
            return content
        } else if (el.tagName === "A") {
            const innerContent: IntfProcessedElement[] = []
            const innerImage = el.querySelector("img")
            stack.push("A")
            if (innerImage) {
                stack.push("InnerImage")
                innerContent.push(this.processElement(innerImage)[0])
                stack.pop()
            }
            try {
                const ref = this.normalizeRef(el.getAttribute("href") || "")
                const refURL = this.safeCreateURL(ref)
                const sameDomain = this.isSameDomain(refURL)
                const type = sameDomain ? enuTextType.ilink : enuTextType.link
                const text = normalizeText(el.innerText)
                if (text && type && text.length > 2) {
                    if (sameDomain && refURL.pathname.replace(/\/\//g, "/") === "/" || refURL.pathname === "")
                        breakToParagraphs(innerContent, text, enuTextType.paragraph)
                    else
                        innerContent.push({ text, type, ref })
                }
                debugNodeProcessor && log.debug("A", stack.join(">"), innerContent, el.outerHTML);
                stack.pop()
                return innerContent
            } catch (e) {
                log.debug(e)
                stack.pop()
                throw e
            }
        } else if (el.tagName === "IMG") {
            stack.push("IMG")
            const result = { text: normalizeText(el.getAttribute("alt")), type: enuTextType.alt, ref: this.normalizeRef(el.getAttribute("data-src") || el.getAttribute("src") || "/") }
            debugNodeProcessor && log.debug("IMG", stack.join(">"), result, el.outerHTML)
            stack.pop()
            return [result]
        } else {
            let effectiveText = ""
            let effectiveType = this.tagName2Type(el.tagName)
            let effectiveRef: string | undefined
            let content: IntfProcessedElement[] = []
            stack.push("NODE")

            el.childNodes.forEach((node: Node) => {
                if (node.nodeType === NodeType.ELEMENT_NODE) {
                    const currNode = (node as HTMLElement)
                    debugNodeProcessor && log.debug(currNode.tagName, stack.join(">"), { currNode: currNode.innerText.substring(0, 200) + "..." })
                    if (currNode.tagName === "BR") {
                        stack.push("BR")
                        const textResult = { text: normalizeText(effectiveText), type: effectiveType || enuTextType.paragraph }
                        debugNodeProcessor && log.debug(currNode.tagName, stack.join(">"), { content, textResult })
                        content.push(textResult)
                        effectiveText = ""
                        effectiveType = enuTextType.paragraph
                        stack.pop()
                        // } else if (currNode.tagName === "P") {
                        //     stack.push("P")
                        //     const textResult = { text: normalizeText(effectiveText), type: effectiveType || enuTextType.paragraph }
                        //     debugNodeProcessor && log.debug(currNode.tagName, stack.join(">"), { content, textResult })
                        //     content.push(textResult)

                        //     const extracted = this.processElement(currNode, ignoreClasses)

                        //     effectiveText = ""
                        //     effectiveType = enuTextType.paragraph
                        //     stack.pop()
                    } else {
                        stack.push(currNode.tagName)
                        const extracted = this.processElement(currNode, ignoreClasses)
                        debugNodeProcessor && log.debug(currNode.tagName, stack.join(">"), { extracted })

                        if (extracted.length === 1) {
                            if (extracted[0].type === enuTextType.alt) {
                                content.push(extracted[0])
                            } else {
                                if (extracted[0].text)
                                    effectiveText += " " + extracted[0].text
                                if (extracted[0].type)
                                    effectiveType = extracted[0].type
                                if (extracted[0].ref)
                                    effectiveRef = extracted[0].ref
                            }
                        } else if (extracted.length) {
                            debugNodeProcessor && log.debug(currNode.tagName, stack.join(">"), { extracted })
                            content = [...content, ...extracted]
                        }
                        stack.pop()
                    }
                } else {
                    stack.push("TEXT")
                    effectiveText += " " + node.textContent
                    debugNodeProcessor && log.debug(stack.join(">"), { node: node.textContent.substring(0, 200) + "..." })
                    stack.pop()
                }
            })
            stack.pop()

            const textResult: IntfProcessedElement[] = []
            breakToParagraphs(textResult, normalizeText(effectiveText), effectiveType, effectiveRef)

            debugNodeProcessor && log.debug("beforeFinal", el.tagName, stack.join(">"), el.classNames, { content, textResult })
            const result = [...content, ...textResult]
            debugNodeProcessor && log.debug("RESULT>>>>>", el.tagName, stack.join(">"), { result }, el.outerHTML)

            return result
        }
    }

    private normalizeRef(ref: string) {
        ref = ref.trim()
        if (ref.startsWith("data:"))
            return ""
        if (!ref.includes("://"))
            ref = `https://www.${this.baseURL}` + `/${ref.startsWith("#") ? "/" : ref}`.replace(/\/\//g, "/").replace(/\/\//g, "/")
        return this.normalizePath(this.safeCreateURL(ref))
    }

    autoExtractDate(datetimeStr: string) {
        const dateParts: string[] = []
        datetimeStr = datetimeStr.trim().replace(/[،,/\n-]/g, " ")
        const dateStrParts = datetimeStr.split(" ")

        for (const i in dateStrParts) {
            const part = dateStrParts[i]
            if (part.includes(":"))
                continue
            if (isNaN(parseInt(fa2En(part)))) {
                const month = fa2En(persianMonthNumber(part))
                if (isNaN(parseInt(month)))
                    continue
                if (dateParts.length > 0)
                    dateParts.push(persianMonthNumber(part) + "")
                else {
                    return "INVALID_DATE"
                }
            } else {
                dateParts.push(part)
            }
        }

        if (dateParts.length === 3)
            return dateParts.reverse().join('-')
        log.debug({ datetimeStr, splitted: datetimeStr.split(" "), dateParts })
        return "INVALID_DATE"
    }

    protected extractDate(datetimeEl?: HTMLElement | string, splitter: string | IntfDateSplitter = " ", fullHtml?: HTMLElement) {
        if (!datetimeEl) return undefined
        if (typeof splitter === "function" && typeof datetimeEl !== "string") {
            return fa2En(splitter(datetimeEl, fullHtml))
        } else {
            const datetime = normalizeText((typeof datetimeEl === "string" ? datetimeEl : datetimeEl?.innerText)?.trim().replace(/[\r\n]/g, ""))
            if (!datetime) {
                return this.autoExtractDate(typeof datetimeEl === "string" ? datetimeEl : datetimeEl.innerText)
            }
            let datetimeParts = datetime?.split(typeof splitter === "string" ? splitter : " ")

            let date: string
            const dateString = normalizeText(datetimeParts[datetimeParts.length - 1].includes(":")
                ? datetimeParts[datetimeParts.length - 2]
                : datetimeParts[datetimeParts.length - 1]
            ) || "NO_DATE"

            if (dateString === "NO_DATE")
                log.debug("======>", datetimeParts, splitter)

            datetimeParts = dateString?.split(" ")
            if (datetimeParts.length > 1)
                date = datetimeParts[datetimeParts.length - 1].trim() + "-"
                    + persianMonthNumber(datetimeParts[datetimeParts.length - 2]) + "-"
                    + datetimeParts[datetimeParts.length - 3].trim()
            else
                date = datetimeParts[0].replace(/\//g, "-")

            if (date.split("-").length < 3)
                return this.autoExtractDate(typeof datetimeEl === "string" ? datetimeEl : datetimeEl.innerText)
            return fa2En(date);
        }
    }


    private processTextContent(textEl: HTMLElement, contentContainer: IntfContentHolder, ignoreClasses?: string[] | IntfIsValidFunction, ignoredText?: string[]) {
        debugNodeProcessor && log.debug("+++++++++++START+++++++++")
        stack = []
        const extracted = this.processElement(textEl, ignoreClasses)

        debugNodeProcessor && log.debug("//////////RESULT/////////")
        debugNodeProcessor && log.debug(extracted)
        debugNodeProcessor && log.debug("----------BEFORE EXCLUDE---------")


        extracted.forEach(pt => {
            if (pt.type === enuTextType.alt && pt.ref) {
                const img: IntfImage = { src: this.normalizeRef(pt.ref) }
                if (pt.text) img.alt = pt.text
                contentContainer.images.push(img)
            } else if (pt.type && pt.text
                && (pt.text?.length > 30 || (
                    pt.text.startsWith("پایان پیام") === false
                    && pt.text.startsWith("انتهای پیام") === false
                    && pt.text.match(/^[*]*$/) === null
                    && (!ignoredText || !ignoredText.includes(pt.text))
                ))
            ) {
                if (this.pConf.selectors?.content?.ignoreTexts) {
                    if (this.pConf.selectors?.content?.ignoreTexts.length && typeof this.pConf.selectors?.content?.ignoreTexts[0] === "string") {
                        for (let i = 0; i < this.pConf.selectors?.content?.ignoreTexts.length; ++i)
                            if (pt.text === this.pConf.selectors?.content?.ignoreTexts[i])
                                return
                    }
                    else
                        for (let i = 0; i < this.pConf.selectors?.content?.ignoreTexts.length; ++i)
                            if (pt.text.match(this.pConf.selectors?.content?.ignoreTexts[i]))
                                return
                }

                pt.text = normalizeText(pt.text)
                if (pt.text) {
                    if (pt.ref)
                        contentContainer.texts.push({ type: pt.type, text: pt.text, ref: this.normalizeRef(pt.ref) })
                    else
                        contentContainer.texts.push({ type: pt.type, text: pt.text })
                }
            }
        })
        debugNodeProcessor && log.debug({ contentContainer })
        debugNodeProcessor && log.debug("----------FINISH---------")
    }

    private async storePage(page?: IntfPageContent, id?: number) {
        if (page) {
            let wc = 0
            page.article?.content?.forEach(c => (wc += c.text.split(" ").length))
            page.article?.comments?.forEach(c => (wc += c.text.split(" ").length))
            page.article?.images?.forEach(c => (wc += c.alt ? c.alt.split(" ").length : 0))
            log.progress(`storing: ${id}:${page.url} -> {body: ${page.article?.content?.length}, comments: ${page.article?.comments?.length},  wc: ${wc}, links: ${page.links.length}}`)
            page.links.forEach((link: string) => this.db.addToMustFetch(link))
            if (id) {
                try {
                    if (page.article) {
                        const filePath: string = this.corporaPath + "/" + (page.article?.date ? fa2En(page.article?.date.replace(/\//g, "-")) : "noDate")
                        if (!existsSync(filePath))
                            if (!mkdirSync(filePath, { recursive: true }))
                                throw new Error("Unable to create file path: " + filePath)

                        const toWrite = { url: page.url, category: page.category, ...page.article }
                        writeFileSync(filePath + "/" + Md5.hashStr(page.url),
                            gConfigs.compact ? JSON.stringify(toWrite) : JSON.stringify(toWrite, null, 2)
                        )
                        this.db.setStatus(id, enuURLStatus.Content, null, wc)
                        log.debug("content stored in: " + filePath + "/" + Md5.hashStr(page.url))
                    } else
                        this.db.setStatus(id, enuURLStatus.Finished)
                    if (page.article?.content?.length === 0)
                        log.file(this.domain, "No content found on: ", page.url)
                } catch (e) {
                    console.error(e)
                    throw e
                }
            }
        }
    }

    protected filterLinks(links: HTMLElement[]) {
        const validLinks: string[] = []

        links.forEach((link: HTMLElement) => {
            const href = link.getAttribute("href")
            if (href) {
                try {
                    if (href.startsWith("#")
                        || href.startsWith("javascript:")
                        || href.startsWith("tel:"))
                        return

                    const url = this.safeCreateURL(this.normalizeRef(href))

                    if (url.pathname === "" || url.pathname === "/" || !this.isValidInternalLink(url)) {
                        //log.debug("ignoredDomain--->" + href)
                        return
                    }

                    validLinks.push(this.normalizePath(url))
                } catch (e) {
                    log.debug(e)
                }
            }
        })
        return validLinks
    }

    /*****************************************/
    private async processNextUrl() {
        if (Object.keys(this.queue).length >= (gConfigs.maxConcurrent || 1)) {
            await sleep(100)
            return this.processNextUrl()
        }

        try {
            let toFetch = await this.db.nextURL(enuURLStatus.New)
            if (!toFetch)
                toFetch = await this.db.nextURL(enuURLStatus.Error)

            if (toFetch) {
                this.retrieveAndProcessPage(toFetch["url"], toFetch["id"])
                await sleep(100)
            } else
                await sleep(2000);
            return this.processNextUrl()
        } catch (e: any) {
            log.error(e.message)
        }
    }

    private async retrieveAndProcessPage(url: string, id?: number) {
        try {
            if (!this.isValidInternalLink(this.safeCreateURL(url))) {
                if (id) this.db.setStatus(id, enuURLStatus.Discarded)
                return false
            }
        } catch (e) { return false }
        try {
            if (id) this.queue[id] = url
            const content = await this.getPageContent(url)
            await this.storePage(content, id)
        } catch (e: any) {
            if (id) {
                this.db.setStatus(id, enuURLStatus.Error, e.message)
                delete this.queue[id]
            }
            return false
        }

        if (id) delete this.queue[id]
        return true
    }

    private async getPageContent(url: string) {
        const proxy = await nextProxy()
        const cookie = await this.retrieveCookie(proxy, url)
        url = this.normalizePath(this.safeCreateURL(url))
        log.progress("retrieving: ", url, proxy?.port, cookie)

        const reqParams = { url, onSuccess: (data: any, resCookie: any) => ({ data, resCookie }), proxy, cookie, headers: this.extraHeaders() }
        const result = await axiosGet(log, reqParams)
        if (!result || result.err) {
            delete this.proxyCookie[proxy?.port || "none"]
            throw new Error(result?.err || "ERROR")
        }

        this.proxyCookie[proxy?.port || "none"] = result.resCookie
        const html = this.pConf.preHTMLParse ? this.pConf.preHTMLParse(result.data) : result.data
        return await this.parse(url, HP.parse(html, { parseNoneClosedTags: true }), result.data, reqParams);
    }

    private async retrieveCookie(proxy?: IntfProxy, url?: string): Promise<string | undefined> {
        let cookie: string | undefined = this.proxyCookie[proxy?.port || "none"]
        if (!cookie)
            cookie = await this.initialCookie(proxy, url)

        return cookie
    }

    private async parse(url: string, parsedHtml: HTMLElement, html: string, reqParams: IntfRequestParams): Promise<IntfPageContent> {
        void html
        try {
            const links = this.filterLinks(parsedHtml.querySelectorAll("a"))
            const article = this.selectElement(parsedHtml, parsedHtml, this.pConf.selectors?.article)
            //log.debug(parsedHtml.outerHTML, this.pConf.selectors?.article, article?.outerHTML)
            if (article)
                return await this.processContentBox(url, links, article, parsedHtml, reqParams)
            else {
                const ldJson = parsedHtml.querySelector('script[type="application/ld+json"]')
                if (!always && ldJson) {
                    let jsonText = ldJson.innerText.trim()
                    if (jsonText.endsWith(";"))
                        jsonText = jsonText.substring(0, jsonText.length - 2)
                    const json = JSON.parse(jsonText)
                    if (json) {
                        const result: IntfPageContent = { url, links }
                        void result
                    }
                    return { url, links, article: { content: [{ text: "ARTICLE NOT FOUND", type: enuTextType.h1 }] } }
                } else {
                    return { url, links }
                }
            }
        } catch (e) {
            log.debug(e)
            throw e
        }
    }

    private selectElement(el: HTMLElement, fullHtml: HTMLElement, selector?: string | IntfSelectorFunction) {
        if (!selector) return undefined
        if (typeof selector === "string") {
            return el.querySelector(selector)
        } else
            return selector(el, fullHtml)
    }

    private selectAllElements = (article: HTMLElement, fullHtml: HTMLElement, selector?: string | IntfSelectAllFunction): HTMLElement[] | undefined => {
        if (!selector) return []
        if (typeof selector === "string")
            return article.querySelectorAll(selector)
        else
            return selector(article, fullHtml)
    }

    private async processContentBox(url: string, links: string[], article: HTMLElement, fullHtml: HTMLElement, reqParams: IntfRequestParams) {
        void fullHtml
        article.querySelectorAll("script").forEach(x => x.remove());

        const aboveTitle = normalizeText(this.selectElement(article, fullHtml, this.pConf.selectors?.aboveTitle)?.innerText)
        const title = normalizeText(this.selectElement(article, fullHtml, this.pConf.selectors?.title)?.innerText)
        const subtitle = normalizeText(this.selectElement(article, fullHtml, this.pConf.selectors?.subtitle)?.innerText)
        const summary = normalizeText(this.selectElement(article, fullHtml, this.pConf.selectors?.summary)?.innerText)

        const datetimeElement = this.selectElement(article, fullHtml, this.pConf.selectors?.datetime?.conatiner) || undefined
        let date: string | undefined = this.extractDate(datetimeElement, this.pConf.selectors?.datetime?.splitter, fullHtml)
        const tags = this.selectAllElements(article, fullHtml, this.pConf.selectors?.tags)?.map(tag => (normalizeText(tag.innerText) || "").replace(/[,،؛]/g, ""))

        const categoryEl = this.selectAllElements(article, fullHtml, this.pConf.selectors?.category?.selector)
        let category: string | undefined
        if (categoryEl) {
            const startIndex = this.pConf.selectors?.category?.startIndex || 0
            category = categoryEl.at(startIndex)?.innerText.trim()
                + (categoryEl.length > startIndex + 1 ? "/" + categoryEl.at(startIndex + 1)?.innerText.trim() : "")
            category = normalizeText(category)
        }

        const content: IntfContentHolder = { texts: [], images: [] }
        let contentElements = this.selectAllElements(article, fullHtml, this.pConf.selectors?.content?.main)
        if (!contentElements || contentElements.length === 0)
            contentElements = this.selectAllElements(article, fullHtml, this.pConf.selectors?.content?.alternative)
        if (contentElements) {
            contentElements.forEach((textEl: HTMLElement, index, all) => {
                if (this.textNodeMustBeIgnored(textEl, index, all))
                    return
                this.processTextContent(textEl, content, this.pConf.selectors?.content?.ignoreNodeClasses)
            });

            let fullContentLenght = 0
            content.texts.forEach(item => (fullContentLenght += item.text.length))

            let parentTextNode = this.selectElement(article, fullHtml, this.pConf.selectors?.content?.textNode)
            if (!parentTextNode)
                parentTextNode = this.selectElement(fullHtml, fullHtml, this.pConf.selectors?.content?.textNode)

            const parentTextNodeInnerText = normalizeText(parentTextNode?.innerText)
            if (parentTextNode && parentTextNodeInnerText && parentTextNodeInnerText.length > fullContentLenght * 2) {
                //parentText.split("\n").forEach(par => (content.texts.push({ text: parentText, type: enuTextType.paragraph })))
                debugNodeProcessor && log.debug(parentTextNode?.outerHTML, parentTextNodeInnerText)

                this.processTextContent(parentTextNode, content, this.pConf.selectors?.content?.ignoreNodeClasses)
            }
        }

        let comments: IntfComment[] = []
        const commentSelector = this.pConf.selectors?.comments
        if (commentSelector) {
            if (typeof commentSelector === "function") {
                try {
                    const Url = this.safeCreateURL(url)
                    comments = await commentSelector(Url, reqParams)
                } catch (e) {
                    log.debug(e)
                    throw e
                }
            } else {
                this.selectAllElements(article, fullHtml, commentSelector.container)?.forEach(
                    (comEl: HTMLElement) => {
                        const text = normalizeText(this.selectElement(comEl, fullHtml, commentSelector.text)?.innerText)
                        const author = normalizeText(this.selectElement(comEl, fullHtml, commentSelector.author)?.innerText)
                        let el: HTMLElement | string | undefined
                        if (typeof commentSelector.datetime === "string")
                            el = this.selectElement(comEl, fullHtml, commentSelector.datetime) || undefined
                        else if (commentSelector.datetime !== undefined)
                            el = commentSelector.datetime(comEl)

                        const date = this.extractDate(el, this.pConf.selectors?.datetime?.splitter)

                        if (text && text?.length > 2) {
                            const cmnt: IntfComment = { text }
                            if(date)
                                cmnt.date = date
                            if (author?.length && author !== 'ناشناس')
                                cmnt.author = author
                            comments.push(cmnt)
                        }
                    }
                );
            }
        }

        const result: IntfPageContent = {
            url, links
        }

        if (category) result.category = category
        if (!date) {
            if ((title || subtitle)) {
                log.debug({ txt: datetimeElement?.innerText, article: article.innerHTML.substring(0, 10000) })
                if ((gConfigs.debugVerbosity || 0) > 9)
                    throw new Error("Datetime not found:")
                else
                    log.file(this.domain, "Datetime not found: " + url)
            }
            date = "NO_DATE"
        }
        if (!title) {
            if ((date && date !== "NO_DATE") || subtitle) {
                if ((gConfigs.debugVerbosity || 0) > 9)
                    throw new Error("Title not found")
                else
                    log.file(this.domain, "Title not found: " + url)
            }
            return result
        }
        result.article = { date }
        if (result.article) {
            if (aboveTitle) result.article.aboveTitle = aboveTitle
            if (title) result.article.title = title
            if (subtitle) result.article.subtitle = subtitle
            if (summary && summary !== subtitle) result.article.summary = summary
            if (content.texts.length) result.article.content = content.texts
            if (tags && tags.length) result.article.tags = tags
            if (comments?.length) result.article.comments = comments
            if (content.images.length) {
                result.article.images = []
                content.images.forEach(img => {
                    let found = false
                    for (let i = 0; i < (result.article?.images || []).length; i++)
                        if (result.article?.images?.at(i)?.src === img.src) {
                            found = true
                            break
                        }
                    if (!found)
                        result.article?.images?.push(img)
                })
            }
        }

        return result
    }


    private isSameDomain(url: URL) {
        const validDomains = [this.baseURL.replace(/\//g, ""), ...this.pConf.url?.extraValidDomains || []]
        let sameDomain = false
        for (let i = 0; i < validDomains.length; ++i)
            if (url.hostname.endsWith(validDomains[i])) {
                sameDomain = true
                break
            }
        return sameDomain
    }

    private isValidInternalLink(url: URL): boolean {
        if (!this.isSameDomain(url))
            return false

        const invalidStartPaths = [
            "/print/", "/fa/print/", "/printmail/", "/newspart-print", "/print-content", "/printnews",
            "/upload/", "/fa/upload/", "/fa/download/", "/download/", "/files/", "/img/",
            "/redirect/",
            "/fa/rss/", "/rss/",
            "/fa/ads/", "/ads/",
            "/save", "/fa/save",
            "/ar/", "/en/", "/tr/", "/ru/", "/fr/", "/es", "/sw/", "/ps/", "/ha/",
            "/hi/", "/bd/", "/zh/", "/az/", "/my/", "/id/", "/ph/", "/de/", "/ur/", "/it/", "/tj/",
            ...this.pConf.url?.extraInvalidStartPaths || []]
        const invalidEndPaths = [
            "jpg", "png", "mp4", "mp3", "pdf", "flv", "gif", "jpeg", "xlsx", "zip", "3gp"
        ]

        for (let i = 0; i < invalidStartPaths?.length; ++i) {
            if (url.pathname.toLowerCase().startsWith(invalidStartPaths[i])) {
                //log.debug("ignoredPath", url.pathname)
                return false
            }
            if (url.pathname.toLowerCase().endsWith(invalidEndPaths[i])) {
                //log.debug("ignoredPath", url.pathname)
                return false
            }

        }
        return true
    }

    async runQuery(query: string) {
        this.db.init()
        log.info(this.db.runQuery(query))
    }

    /**********************************************8*/
    protected async init(): Promise<boolean> { return true }
    protected textNodeMustBeIgnored(textEl: HTMLElement, index: number, allElements: HTMLElement[]): boolean {
        void textEl, index, allElements
        return false
    }
    protected extraHeaders() { return {} }
    protected async initialCookie(proxy?: IntfProxy, url?: string): Promise<string | undefined> {
        void proxy, url; return undefined
    }

    protected normalizePath(url: URL, conf?: IntfURLNormaliziztionConf): string {
        const effective: IntfURLNormaliziztionConf = {
            extraInvalidStartPaths: conf && conf.extraInvalidStartPaths !== undefined ? conf.extraInvalidStartPaths : this.pConf.url?.extraInvalidStartPaths,
            extraValidDomains: conf && conf.extraValidDomains !== undefined ? conf.extraValidDomains : this.pConf.url?.extraValidDomains,
            pathToCheckIndex: conf && conf.pathToCheckIndex !== undefined ? conf.pathToCheckIndex : this.pConf.url?.pathToCheckIndex,
            removeWWW: conf && conf.removeWWW !== undefined ? conf.removeWWW : this.pConf.url?.removeWWW,
            validPathsItemsToNormalize: conf && conf.validPathsItemsToNormalize !== undefined ? conf.validPathsItemsToNormalize : this.pConf.url?.validPathsItemsToNormalize,
        }
        let hostname = url.hostname
        if (effective.removeWWW) {
            if (hostname.startsWith("www."))
                hostname = hostname.substring(4)
        } else {
            if (!hostname.startsWith("www."))
                hostname = "www." + hostname
        }
        const pathParts = url.pathname.split("/")
        let path = url.pathname

        const validPathsToNormalize = effective.validPathsItemsToNormalize || ["news", "media", "photo"]
        const pathToCheckIndex = effective.pathToCheckIndex
        if (typeof pathToCheckIndex === "number") {
            if (validPathsToNormalize?.includes(pathParts[pathToCheckIndex]))
                path = `${pathParts.slice(0, pathToCheckIndex + 1).join("/")}/${pathParts[pathToCheckIndex + 1]}`
        }
        return url.protocol + "//" + hostname + path + url.search
    }
}
