import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { IntfKeyVal, IntfProxy } from "./interfaces";
import { clsLogger } from "./logger";
import { log } from "./logger";
import { sleep } from "./common";

const defaultUA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
function configWithUA(reqParams: IntfRequestParams) {
    if (!reqParams.conf)
        reqParams.conf = { headers: { 'User-Agent': reqParams.ua || defaultUA } }
    else if (!reqParams.conf.headers)
        reqParams.conf.headers = { 'User-Agent': reqParams.ua || defaultUA }
    else
        reqParams.conf.headers['User-Agent'] = reqParams.ua || defaultUA

    if (reqParams.headers && reqParams.conf) {
        Object.keys(reqParams.headers).forEach(key => {
            if (reqParams.conf && reqParams.headers)
                reqParams.conf.headers = { ...reqParams.conf?.headers, [key]: reqParams.headers[key] }
        })
    }
    if (reqParams.conf.headers) {
        reqParams.conf.headers['Connection'] = "Close"
        reqParams.conf.headers['Accept'] = "text/html"
        reqParams.conf.headers["Accept-Encoding"] = "gzip, deflate, br"
        if (reqParams.cookie) 
            reqParams.conf.headers['Cookie'] = reqParams.cookie
    }

    if (reqParams.proxy?.agent) {
        reqParams.conf.httpAgent = reqParams.proxy?.agent
        reqParams.conf.httpsAgent = reqParams.proxy?.agent
    }
    reqParams.conf.maxRedirects = 3

    reqParams.conf.timeout = 30000
    return reqParams.conf;
}

export function requestError(error: AxiosError, retries: number, oErrorMessage = "") {
    if (error.response)
        return { err: oErrorMessage + error.message, errCode: -error.response.status || -621, retries }
    else if (error.request)
        return { err: oErrorMessage + error.message, errCode: -622, retries }
    else
        return { err: oErrorMessage + error.message, errCode: -623, retries }
}

axios.interceptors.request.use(request => {
    void log
    //log.debug('Starting Request', JSON.stringify(request, null, 2))
    return request
})
axios.interceptors.response.use(response => {
    //log.debug('Response', JSON.stringify(response, null, 2))
    return response
})

export interface IntfRequestParams {
    url: string,
    ua?: string,
    conf?: AxiosRequestConfig,
    headers?: IntfKeyVal,
    onSuccess: (data: any, cookie?: string, res?: AxiosResponse, retries?: number) => any,
    onFail?: (err: AxiosError, retries: number) => any,
    oErrorMessage?: string,
    proxy?: IntfProxy,
    cookie?: string
}

export async function axiosGet(log: clsLogger, params: IntfRequestParams, retries = 1) {
    await sleep(1000)
    log.api(`GET(${1 - retries}): ` + params.url, params.conf?.params, params.proxy?.port, params.cookie)

    return await axios
        .get(params.url, configWithUA(params))
        .then(async (res) => {
            const data = res.data
            if (res.data.includes("arvancloud")) {
                const cookie = await getArvanCookie(params.url, (new URL(params.url).hostname), params.proxy)
                await sleep(2100)
                return await axiosGet(log, { ...params, cookie })
            }
            return params.onSuccess(data, params.cookie, res, 3 - retries);
        })
        .catch(async (err: AxiosError) => {
            return await onAxiosError(err, params, retries, (cookie?: string) => axiosGet(log, { ...params, cookie }, retries - 1))
        });
}

export async function axiosPost(log: clsLogger, data: any, params: IntfRequestParams, retries = 1) {
    await sleep(1000)
    log.api(`POST(${1 - retries}): ` + params.url, data, params.conf?.params, params.proxy?.port, params.cookie)

    return await axios
        .post(params.url, data, configWithUA(params))
        .then((res) => {
            const data = res.data
            return params.onSuccess(data, params.cookie, res, 3 - retries);
        })
        .catch(async (err: AxiosError) => {
            return await onAxiosError(err, params, retries, (cookie?: string) => axiosPost(log, data, { ...params, cookie }, retries - 1))
        });
}

export async function getArvanCookie(url: string, domain: string, proxy?: IntfProxy) {
    try {
        log.progress("Retrieving Arvan CDN cookie")
        const res = await axios.get(url, { httpAgent: proxy?.agent, httpsAgent: proxy?.agent })
        const arvanPage = res.data
        let evalStr = arvanPage.substring(arvanPage.indexOf("eval") + 6)
        evalStr = evalStr.substring(0, evalStr.indexOf("exports") - 5)
        const hash = eval(evalStr)
        void domain
        const cookie = `__arcsjs=${hash}`//; Max-Age=9000; Path=/; Domain=${encodeURIComponent(domain.startsWith("www") ? domain.substring(4) : domain)}; SameSite=None; Secure`
        log.debug("Initial cookie: ", cookie)
        return cookie
    } catch (e) {
        log.debug(e)
        throw e
    }
}

/********************************************/
async function onAxiosError(err: AxiosError, params: IntfRequestParams, retries: number, callback: any) {
    if (err.response) {
        if (err.response.status == 429)
            return await callback(params.cookie);
    } else if (err?.request?._currentRequest?.res?.rawHeaders?.includes("Set-Cookie")) {
        const cookie = err.request._currentRequest.res.rawHeaders[err.request._currentRequest.res.rawHeaders.indexOf("Set-Cookie") + 1]
        log.debug("CDN cookie retrieved: " + cookie)
        return await callback(cookie)
    }

    if (params.onFail)
        return params.onFail(err, retries)
    else if (retries > 0) {
        log.apiDebugError(err)
        log.warn("Retrying", retries);
        return await axiosGet(log, params, retries - 1);
    } else {
        log.apiDebugError(err);
        return requestError(err, 3 - retries, params.oErrorMessage);
    }
}

