import he from "he"
import { HTMLElement, Node, NodeType } from "node-html-parser";
import jmoment from 'jalali-moment'
import { PersianShaper } from "arabic-persian-reshaper"
import { log } from "./logger";

export function parseEnum(e: any, str: string) {
    const enumKeys = Object.keys(e);
    for (let i = 0; i < enumKeys.length; i++)
        if (enumKeys[i] === str || e[enumKeys[i]] === str)
            return e[enumKeys[i]]
    return ""
}

export function prompt(message: string) {
    /* eslint-disable */
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    return new Promise<string>((resolve) => rl.question(message, resolve));
}

export async function sleep(ms: number) {
    //log.progress(`Sleeping for ${ms} miliseconds`)
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const fa2enMap = {
    "۰": 0,
    "۱": 1,
    "۲": 2,
    "۳": 3,
    "۴": 4,
    "۵": 5,
    "۶": 6,
    "۷": 7,
    "۸": 8,
    "۹": 9,
};

export function formatNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function normalizeCategory(cat?: string) {
    return cat ? normalizeText(cat.replace(/[\n\t]/g, " ").replace(/[,]/g, ' -').substring(0, 100)) : 'Undefined'
}

export function isIranProvinceString(str: string) {
    return str.startsWith("ایران")
        || str.startsWith("استان")
        || str.startsWith("آذربایجان")
        || str.startsWith("اردبیل")
        || str.includes("تهران")
        || str.startsWith("اصفهان")
        || str.startsWith("البرز")
        || str.startsWith("ایلام")
        || str.startsWith("بوشهر")
        || str.startsWith("چهارمحال")
        || str.startsWith("خراسان")
        || str.startsWith("خوزستان")
        || str.startsWith("زنجان")
        || str.startsWith("سمنان")
        || str.startsWith("سیستان")
        || str.startsWith("فارس")
        || str.startsWith("قزوین")
        || str.startsWith("قم")
        || str.startsWith("کاشان")
        || str.startsWith("کردستان")
        || str.startsWith("کرمان")
        || str.startsWith("کهگلویه")
        || str.startsWith("گلستان")
        || str.startsWith("گیلان")
        || str.startsWith("لرستان")
        || str.startsWith("مازندران")
        || str.startsWith("مرکزی")
        || str.startsWith("هرمزگان")
        || str.startsWith("همدان")
        || str.startsWith("یزد")
}

function parseFaCurrency(number: string) {
    if (!number)
        return 0
    let result = 0


    number = number
        .replace(/,/g, "")
        .replace("تومان", "")
        .replace("ریال", "")
        .trim();


    number.split("").forEach((char) => {
        result *= 10;
        result += (char in fa2enMap) ? fa2enMap[char] : parseInt(char);
    });

    return result;
}

export function fa2En(text: string | number) {
    return typeof text === 'number' ? text + "" : text.split("").map(c => c in fa2enMap ? fa2enMap[c] : c).join("")
}

export function persianMonthNumber(month: string): string | number {
    switch (normalizeText(month).replace(".", "")) {
        case "فروردین": return "01"
        case "اردیبهشت": return "02"
        case "خرداد": return "03"
        case "تیر": return "04"
        case "مرداد": return "05"
        case "شهریور": return "06"
        case "مهر": return "07"
        case "آبان": return "08"
        case "آذر": return "09"
        case "دی": return "10"
        case "دى": return "10"
        case "بهمن": return "11"
        case "اسفند": return "12"
        case "Jan": return "01"
        case "January": return "01"
        case "Feb": return "02"
        case "February": return "02"
        case "Mar": return "03"
        case "March": return "03"
        case "Apr": return "04"
        case "April": return "04"
        case "May": return "05"
        case "Jun": return "06"
        case "June": return "06"
        case "Jul": return "07"
        case "July": return "07"
        case "Aug": return "08"
        case "August": return "08"
        case "Sep": return "09"
        case "September": return "09"
        case "Oct": return "10"
        case "October": return "10"
        case "Nov": return "11"
        case "November": return "11"
        case "Dec": return "12"
        case "December": return "12"
        default: return NaN
    }
}

export function normalizeText(text?: string) {
    if (!text)
        return text
    return PersianShaper.convertArabicBack(
        he.decode(text)
            .replace(/\r\n/g, ' ')
            .replace(/\r/g, '')
            .replace(/\t/g, ' ')
            .replace(/  /g, " ")
            .replace(/  /g, " ")
            .replace(/&#1740;/g, 'ی')
            .replace(/ي/g, 'ی')
            .replace(/ى/g, 'ی')
    ).trim()
}

export function getElementAtIndex(nodes: Node[], index: number) {
    let j = 0
    for (let i = 0; i < nodes.length; i++)
        if (nodes[i].nodeType === NodeType.ELEMENT_NODE) {
            if (j === index)
                return (nodes[i] as HTMLElement)
            j++
        }
    return
}

export function wordCount(str?: string): number {
    return str?.split(" ").length || 0
}


export function dateOffsetToDate(el?: HTMLElement | string | null) {
    if (!el) return "NullDateElement"
    const dateParts = (typeof el === "string" ? el : el.innerText).split(" ")
    let effectiveDate = jmoment().locale('fa');
    const offset = parseInt(fa2En(dateParts[0]))

    switch (dateParts.length > 1 && dateParts[1]) {
        case "روز": effectiveDate = effectiveDate.subtract(offset, "days"); break
        case "ماه": effectiveDate = effectiveDate.subtract(offset, "months"); break
        case "سال": effectiveDate = effectiveDate.subtract(offset, "years"); break
    }
    return date2Gregorian(effectiveDate.format('YYYY-M-D'))
}

export function date2Gregorian(date?: string): string | undefined {
    if (!date) return date
    date = fa2En(date)
    if (isNaN(parseInt(date[0]))) return normalizeText(date)
    date = date.replace(/\//g, "-")
    const dateParts = date.split("-")
    try {
        if (dateParts.length >= 3) {
            if (dateParts[0].length === 4 || dateParts[dateParts.length - 1].length === 4) {
                if (dateParts[0].startsWith('14') || dateParts[0].startsWith('13'))
                    return jmoment.from(date, "fa").locale("en").format('YYYY-MM-DD')
                else
                    return jmoment.from(date, "en").locale("en").format('YYYY-MM-DD')
            }
            if (parseInt(dateParts[0]) < 50)
                date = "14" + date
            else
                date = "13" + date
            return jmoment.from(date, "fa").locale("en").format('YYYY-MM-DD')
        }
    } catch (e) {/* */ }
    log.error("Invalid Date: ", date)
    return "INVALID: " + date
}


export const always = true


