import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "صفحه نخست/سیاسی",
    "صفحه نخست/عمومی",
    "صفحه نخست/سلامت",
    "صفحه نخست/فرهنگ",
    "صفحه نخست/ورزشی",
    "صفحه نخست",
    "صفحه نخست/جامعه",
    "صفحه نخست/طنز و کاریکاتور",
    "صفحه نخست/اقتصادی",
    "صفحه نخست/بین الملل",
    "صفحه نخست/علم",
    "سلامت/سلامت",
    "سلامت",
    "اجتماعی/اجتماعی",
    "اجتماعی",
    "ورزشی",
    "ورزشی/ورزشی",
    "هنری/هنری",
    "سیاسی/سیاسی",
    "حوادث",
    "حوادث/حوادث",
    "علم و فنآوری/علم و فنآوری",
    "هنری",
    "سیاسی",
    "اقتصادى/اقتصاد",
    "اقتصادى",
    "علم و فنآوری",
    "جهان/جهان",
    "جهان",
    "خودرو/خودرو "  
]
const scrapper = new scrappers.noandish

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}