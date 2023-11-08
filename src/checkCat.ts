import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "آموزش",
    "وبگردی",
    "یادداشت",
    "رصد اقتصادی",
    "تکنیکال",
    "بنیادی",
    "آگهی و اطلاعیه",
    "مجامع",
    "مدیران عامل",
    "کارشناسان",
    "فیلم",
    "مدیران ارشد",
    "صوت",
    "رویداد",
    "ارکان بازار سرمایه",
    "روابط عمومی",
    "ماهانه",
    "فصلی",
    "عکس"
   
]
const scrapper = new scrappers.boursenews

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}