import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "صفحه اصلی/علمی، فرهنگی",
    "صفحه اصلی/آرشیو اخبار قدیمی",
    "صفحه اصلی/استان‌ها",
    "صفحه اصلی/بین الملل",
    "صفحه اصلی/مراجع و علما",
    "صفحه اصلی/گفتگو",
    "صفحه اصلی/پرونده‌های ویژه",
    "صفحه اصلی/حوزه علمیه قم",
    "صفحه اصلی/گزارش ها",
    "صفحه اصلی/کل اخبار",
    "صفحه اصلی/فیلم و صوت",
    "صفحه اصلی/عکس",
    "صفحه اصلی/اخبار قدیمی",
    "صفحه اصلی/عکس2",
    "صفحه اصلی/سال اقتصاد و فرهنگ",
    "صفحه اصلی/ویژه بانوان",
    "صفحه اصلی/پخش زنده"
]
const scrapper = new scrappers.hawzahnews

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}