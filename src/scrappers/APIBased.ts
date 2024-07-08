
import { clsScrapper } from "../modules/clsScrapper";
import { enuDomains, enuMajorCategory, enuMinorCategory, enuTextType, IntfMappedCategory, IntfPageContent } from "../modules/interfaces";
import { axiosGet, IntfRequestParams } from "../modules/request";
import { log } from "../modules/logger";
import { date2Gregorian, normalizeText } from "../modules/common";

export class irandoc extends clsScrapper {
    constructor() {
        super(enuDomains.irandoc, "ganj.irandoc.ac.ir", {
            api: async (url: URL, reqParams: IntfRequestParams, data?: any) => {
                const pageContent: IntfPageContent = { url: url.toString(), links: [] }
                if (url.pathname === "" || url.pathname === "/")
                    pageContent.links.push(`https://ganj.irandoc.ac.ir/api/v1/search/main?basicscope=1&keywords=%D8%A7`)
                else if (url.pathname === "/api/v1/search/main")
                    data.results?.forEach((result: any) => pageContent.links.push(`https://ganj.irandoc.ac.ir/api/v1/articles/${result.uuid}`))
                else {
                    pageContent.url = `https://ganj.irandoc.ac.ir///#/articles/${data.uuid}`
                    pageContent.article = { title: normalizeText(data.title) }
                    pageContent.article.date = date2Gregorian(`${data.ja_pub_yyyy}/06/01`)
                    pageContent.article.meta = {
                        type: data.publishable_type_en,
                        grade: data.grade.title_fa,
                        hasFullText: data.fulltext_status ? true : false,
                        hasSample: data.sample_accessible ? true : false,
                        uuid: data.uuid,
                        contributions: [],
                        affiliates: []
                    }
                    data.contributions.forEach(c => pageContent?.article?.meta?.contributions.push({
                        fullName: { fa: c.researcher?.full_name_fa, en: c.researcher?.full_name_en },
                        role: c.role.title_fa
                    }))
                    data.partnerships.forEach(p => pageContent?.article?.meta?.affiliates.push({
                        major: p.organization?.super_organization?.title,
                        minor: p.organization?.title,
                        type: p.role.title_fa
                    }))
                    pageContent.category = data.field.title_fa

                    pageContent.article.summary = await axiosGet(log, {
                        ...reqParams,
                        url: `https://ganj.irandoc.ac.ir/api/v1/articles/${data.uuid}/show_abstract`,
                        onSuccess: (res: any) => normalizeText(res.abstract),
                        onFail: (e) => { log.error(e) }
                    })

                    await axiosGet(log, {
                        ...reqParams,
                        url: `https://ganj.irandoc.ac.ir/api/v1/articles/${data.uuid}/show_tags`,
                        onSuccess: (res: any) => {
                            res.tags.forEach(tag => {
                                if (pageContent.article && !pageContent.article.tags) pageContent.article.tags = []
                                if (tag.title_fa) {
                                    pageContent.article?.tags?.push(tag.title_fa)
                                    pageContent.links.push(`https://ganj.irandoc.ac.ir/api/v1/search/main?basicscope=1&keywords=${tag.title_fa}`)
                                }
                                if (tag.title_en) {
                                    pageContent.article?.tags?.push(tag.title_en)
                                    pageContent.links.push(`https://ganj.irandoc.ac.ir/api/v1/search/main?basicscope=1&keywords=${tag.title_en}`)
                                }
                            })
                        },
                        onFail: (e) => { log.error(e) }
                    })

                    await axiosGet(log, {
                        ...reqParams,
                        url: `https://ganj.irandoc.ac.ir/api/v1/articles/${data.uuid}/show_additional_fields`,
                        onSuccess: (res: any) => {
                            if (pageContent.article) {
                                pageContent.article.meta = { "refs": {} }
                                if (res.references_en) pageContent.article.meta["refs"]["nonFa"] = normalizeText(res.references_en)
                                if (res.references_fa) pageContent.article.meta["refs"]["nonFa"] = normalizeText(res.references_fa)
                                pageContent.article.meta["toc"] = res.table_of_contents
                            }
                        },
                        onFail: (e) => { log.error(e) }
                    })
                }
                return pageContent
            },
            url: { removeWWW: true }
        })
    }

    mapCategoryImpl(): IntfMappedCategory {
        return { textType: enuTextType.Formal, major: enuMajorCategory.Doc, minor: enuMinorCategory.University }
    }
}
