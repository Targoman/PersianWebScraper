import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "نوشته‌ها/توضیح کرمان موتور در مورد",
    "خبر افزایش قیمت خودروهای هیوندای",
    "نقد و بررسی‌/بررسی تلویزیون",
    "رپورتاژ آگهی/خودرو",
    "معرفی و بررسی خودرو/خودرو",
    "علمی/امنیت",
    "بررسی و جعبه گشایی/ویدیو",
    "تکنولوژی/موبایل",
    "تکنولوژی/سلامت",
    "کسب و کار",
    "تکنولوژی/نرم افزار و اپلیکیشن"
]
const scrapper = new scrappers.digiato

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}