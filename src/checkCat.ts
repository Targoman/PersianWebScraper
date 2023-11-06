import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "نی نی بان/سبک زندگی",
    "نی نی بان/صفحه نخست",
    "نی نی بان/بارداری",
    "نی نی بان/زایمان",
    "نی نی بان/کودک",
    "نی نی بان/قصد بارداری",
    "نی نی بان/نوزاد",
    "نی نی بان/سلامت عمومی",
    "نی نی بان/ناباروری",
    "نی نی بان/ویدئو",
   
]

const scrapper = new scrappers.niniban

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}