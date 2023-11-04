import he from "he"
import { HTMLElement, Node, NodeType } from "node-html-parser";
import jmoment from 'jalali-moment'

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

export function normalizeCategory(cat?:string) {
    return cat ? normalizeText(cat.replace(/[\n\t]/g, " ").replace(/[,]/g, ' -').substring(0,100)) : 'Undefined'
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
    switch (month) {
        case "فروردین": return "۰۱"
        case "اردیبهشت": return "۰۲"
        case "خرداد": return "۰۳"
        case "تیر": return "۰۴"
        case "مرداد": return "۰۵"
        case "شهریور": return "۰۶"
        case "مهر": return "۰۷"
        case "آبان": return "۰۸"
        case "آذر": return "۰۹"
        case "دی": return "۱۰"
        case "بهمن": return "۱۱"
        case "اسفند": return "۱۲"
        default: return NaN
    }
}

export function normalizeText(text?: string) {
    if (!text)
        return text
    return he.decode(text).trim()
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/  /g, " ")
        .replace(/  /g, " ")
        .replace(/&#1740;/g, 'ی')
        .replace(/ي/g, 'ی')
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

export function dateOffsetToDate(el?: HTMLElement|null) {
    if(!el) return "NullDateElement"
    const dateParts = el.innerText.split(" ")
    let effectiveDate = jmoment().locale('fa');
    const offset = parseInt(fa2En(dateParts[0]))

    switch (dateParts.length > 1 && dateParts[1]) {
        case "روز": effectiveDate = effectiveDate.subtract(offset, "days"); break
        case "ماه": effectiveDate = effectiveDate.subtract(offset, "months"); break
        case "سال": effectiveDate = effectiveDate.subtract(offset, "years"); break
    }
    return effectiveDate.format('YYYY-M-D')
}


export const always = true


