import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "عکس و فیلم",
    "وبلاگستان",
    "سیاست",
    "جهان",
    "جامعه",
    "جنگ نرم",
    "فرهنگ و هنر",
    "گزارش‌ویژه",
    "جهاد و مقاومت",
    "دفاع و امنیت",
    "ورزش",
    "صفحه نخست",
    "اقتصاد",
    "بهارستان نهم",
    "ویژه‌نامه 9 دی",
    "دهه فجر",
    "مجله سینمایی",
    "تاریخ",
    "فیلم و صوت",
    "حسینیه",
    "دین",
    "تحولات منطقه",
    "یورو 2016",
    "انتخابات امریکا",
    "انتخابات",
    "بازار",
    "بورس",
    "دیدگاه",
    "جام جهانی 2022"
]

const scrapper = new scrappers.mashreghnews

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}