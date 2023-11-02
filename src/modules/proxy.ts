import axios, { AxiosResponse } from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import { always, sleep } from "./common";
import gConfigs from "./gConfigs";
import { IntfProxy } from "./interfaces";
import { log } from "./logger";
import Cache from './timed-cache';

const proxyCache = new Cache
let lastInUse: number = -1

export async function nextProxy(): Promise<IntfProxy | undefined> {
    if (gConfigs.proxies && gConfigs.hostIP) {
        while (always) {
            if (++lastInUse >= gConfigs.proxies.length - 1)
                lastInUse = 0
            const port = gConfigs.proxies[lastInUse]

            log.debug("trying socks port: ", port)
            const cached = proxyCache.get(port)
            if (cached) {
                if (cached.ip !== "FAILED") {
                    log.debug("by cahce: ", cached.ip, cached.port)
                    return cached
                }
            }
            const httpsAgent = new SocksProxyAgent(`socks5://${gConfigs.hostIP}:${port}`);

            const ip = await axios
                .get("https://api.ipify.org", { httpsAgent })
                .then((res: AxiosResponse) => res.data)
                .catch(() => "FAILED")

            if (ip && ip != "FAILED") {
                log.debug("valid proxy: ", port, ip)
                proxyCache.remove(port)
                proxyCache.put(port, { ip, port, agent: httpsAgent })
                return {
                    agent: httpsAgent,
                    port
                }
            } else
                proxyCache.remove(port)

            await sleep(500)
        }
    }
    return undefined
}
