import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "صفحه نخست/عمومی",
    "چند رسانه ای/عمومی",
    "فرهنگی/عمومی",
    "سیاسی/عمومی",
    "فضای مجازی/عمومی",
    "بین الملل/عمومی",
    "عمومی",
    "صفحه نخست/بین الملل",
    "صفحه نخست/سیاسی",
    "صفحه نخست/اجتماعی",
    "صفحه نخست/فرهنگی - هنری",
    "صفحه نخست/ورزشی",
    "صفحه نخست/حوادث",
    "صفحه نخست/اقتصادی",
    "صفحه نخست/پزشکی و سلامت",
    "اجتماعی",
    "سیاسی",
    "اجتماعی/عمومی",
    "چند رسانه ای/صوت",
    "چند رسانه ای/فیلم",
    "هجوم خاموش",
    "ایثار و شهادت",
    "پویا نمایی",
    "خبری",
    "مذهبی",
    "طنز"
]
const scrapper = new scrappers.shohadayeiran

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}