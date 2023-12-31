import { normalizeCategory } from './modules/common';
import { log } from './modules/logger';
import * as scrappers from './scrappers'

const cats = [
    "اخبار فرهنگی و هنری",
    "اخبار علمی و آموزشی",
    "تیتر امروز روزنامه ها",
    "اخبار سیاسی و اجتماعی",
    "اخبار ورزشی و نتایج مسابقات",
    "تصاویر ویژه روز",
    "انعکاس",
    "عکس خبری",
    "اخبار پزشکی",
    "بیماری ها و راه درمان",
    "دکوراسیون و چیدمان",
    "دانستنیهای جنسی",
    "هنر در خانه",
    "مكانهای تاریخی جهان",
    "پیشگیری بهتر از درمان",
    "اخبار اقتصادی و بازرگانی",
    "اخبار اجتماعی",
    "اخبار کنکور و دانشگاه",
    "اخبار سیاست خارجی",
    "اخبار بین الملل",
    "اخبار حوادث",
    "نامزدی، عقد و بعد از ازدواج",
    "ورزشکاران",
    "اطلاعات دارویی",
    "دنیای خودرو",
    "اخبار گوناگون",
    "دانستنی های سفر",
    "هنر و هنرمند",
    "اطلاعات مشاغل",
    "دنیای بازیگران",
    "آرایش موها",
    "نکات مهم آشپزی",
    "لباس و کیف و کفش",
    "اخبار تکنولوژی",
    "فال روزانه",
    "فرهنگ زندگی",
    "ایدز و انواع اعتیاد",
    "مناسبتها در ایران و جهان",
    "تغذیه سالم",
    "شعر و ترانه",
    "مکانهای تفریحی جهان",
    "بارداری و زایمان",
    "مهارتهای زندگی",
    "آموزش انواع غذاها",
    "درمان با ورزش",
    "نگه داری مواد غذایی",
    "عجایب گردشگری",
    "متفرقه",
    "بهداشت مادر کودک",
    "آرایش صورت",
    "مشاوره خانواده",
    "شستشو ، نظافت ، لکه گیری",
    "سلامت پوست",
    "تعلیم و تربیت",
    "بازار خودرو",
    "تعبیر خواب",
    "روانشناسی زناشویی",
    "خواص مواد غذایی",
    "رژیم درمانی",
    "کارت پستال و تصاویر متحرک",
    "تغذیه کودک",
    "مد و مدگرایی",
    "بیماری های شایع کودکان",
    "برای زندگی بهتر",
    "داروهای گیاهی و طب سنتی",
    "اختراعات جدید",
    "چرا ، زیرا و چگونه",
    "دانستنیهای نوزادان",
    "گیاهان،حیوانات و آکواریوم",
    "بهداشت بانوان",
    "هنرهای دستی و ترسیمی",
    "سرگرمی کودکان",
    "ترفندهای کامپیوتری",
    "مطالب طنز و خنده دار",
    "ترفندهای اینترنتی",
    "فال و طالع بینی",
    "تاریخ و تمدن",
    "روانشناسی کودکان",
    "تست روانشناسی",
    "اعمال مستحبی",
    "اس ام اس های جالب",
    "مکانهای زیارتی ایران و جهان",
    "بچه های سالم",
    "داروخانه معنوی",
    "دانستنیهای قبل از ازدواج",
    "متفرقه دینی",
    "نوآوری و کشفیات علمی",
    "معما و تست هوش",
    "زندگینامه شعرا و دانشمندان",
    "تقویم تاریخ",
    "مكانهای تاریخی ایران",
    "آیا می دانید ؟",
    "آزمایش ها و تجهیزات پزشکی",
    "کالری شیرینی جات",
    "داستانهای خواندنی",
    "زیبایی اندام",
    "رازهای موفقیت",
    "خلاقیت در کودکان",
    "تجهیزات ایمنی و بهداشتی",
    "دنیای ضرب المثل",
    "اخبار مد و ستاره ها",
    "آموزش شیرینی پزی",
    "رفتار از کودکی تا نوجوانی",
    "فرزندان و امتحانات",
    "زندگینامه بزرگان دینی",
    "نکات و قوانین حقوقی",
    "ورزش عمومی",
    "خواندنیهای دیدنی",
    "موبایل ، لپ تاپ و تبلت",
    "کوچه پس کوچه های تفاهم",
    "والدین موفق",
    "احکام دینی",
    "مکانهای تفریحی ایران",
    "متفرقه اینترنت و كامپیوتر",
    "ابزار و ماشین آلات",
    "تاریخچه رشته های ورزشی",
    "غذاهای رژیمی",
    "گرافیک دستی و کامپیوتری",
    "دوران سالمندی",
    "آکادمی هنر",
    "طلا و جواهرات",
    "شعر و قصه کودکانه",
    "تصاویر وسایل نقلیه",
    "سلامت موها",
    "کالری نوشیدنی ها",
    "لوازم آرایشی",
    "تزئینات عقد و عروسی",
    "احادیث و سخنان بزرگان",
    "کاریکاتور و تصاویر طنز",
    "کالری خشکبار",
    "معرفی رشته های تحصیلی",
    "نوشیدنی ها",
    "گزارشهای علمی",
    "سرمایه های دیجیتالی",
    "شهر حکایت",
    "انواع مربا و ترشیجات",
    "کالری انواع غذاها",
    "کالری میوه ها",
    "فرش و گلیم",
    "تور مسافرتی",
    "اصول و فروع دین",
    "سفر به اعماق تاریخ",
    "ورزش درمانی",
    "آرامش سبز",
    "بازیهای محلی",
    "کالری ادویه جات",
    "کالری آش ها و سوپ ها",
    "کالری گوشت ها",
    "معرفی دانشگاه ها و مراکز علمی",
    "اصول تعمیر و نگهداری خودرو",
    "کالری سبزیجات و صیفی جات",
    "کالری لبنیات",
    "خدمات فنی و تاسیسات",
    "کالری چربی ها",
    "کالری سس ها و سالادها",
    "کالری حبوبات و غلات",
    "آرزوی های کودکانه",
    "احادیث در باب زندگی",
    "ایدز",
    "کارت شارژ",
    "فال چوب "  
]
const scrapper = new scrappers.beytoote

for (const index in cats) {
    const mapped = scrapper.mapCategory(normalizeCategory(cats[index]))
    log.info(cats[index], mapped)
}