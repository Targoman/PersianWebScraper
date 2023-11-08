import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "بورس و بازار سرمایه/بانك و بیمه",
    "مسکن، انرژی، کسب و کار/راه و مسکن",
    "ایران/ایران",
    "صنعت،معدن و تجارت/صنعت و معدن",
    "بورس و بازار سرمایه",
    "صنعت،معدن و تجارت",
    "اقتصاد",
    "ایران",
    "مسکن، انرژی، کسب و کار",
    "خواندنی ها/اصناف",
    "بانك و بیمه/بیمه",
    "بانك و بیمه/بانك",
    "خانه",
    "خواندنی ها",
    "خانه/سیاست",
    "خانه/گزارش تحلیلی",
    "خانه/جامعه",
    "خانه/یادداشت",
    "خانه/فیلم",
    "خانه/ورزش",
    "خانه/عکس",
    "خانه/فرهنگ " 
]
const scrapper = new scrappers.tejaratonline

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}