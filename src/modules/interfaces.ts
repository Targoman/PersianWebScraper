import { SocksProxyAgent } from "socks-proxy-agent"
import { HTMLElement } from "node-html-parser"
import { IntfRequestParams } from "./request"

export enum enuDomains {
    aa = "aa",
    abadannews = "abadannews",
    abantether = "abantether",
    abtaab = "abtaab",
    achareh = "achareh",
    activeidea = "activeidea",
    adleiranian = "adleiranian",
    adlpors = "adlpors",
    afghanwomennews = "afghanwomennews",
    afkarnews = "afkarnews",
    aftabnews = "aftabnews",
    aftabno = "aftabno",
    aftokhabar = "aftokhabar",
    aghigh = "aghigh",
    agorgani = "agorgani",
    ahannews = "ahannews",
    akharinkhabar = "akharinkhabar",
    akharinkhodro = "akharinkhodro",
    akhbarelmi = "akhbarelmi",
    alborzvarzeshi = "alborzvarzeshi",
    alef = "alef",
    alnajm = "alnajm",
    alodoctor = "alodoctor",
    alomohtava = "alomohtava",
    amuzeshtak = "amuzeshtak",
    ana = "ana",
    andishemoaser = "andishemoaser",
    anthropologyandculture = "anthropologyandculture",
    apademy = "apademy",
    aparat = "aparat",
    arakhabar = "arakhabar",
    arannews = "arannews",
    arazcloud = "arazcloud",
    arda = "arda",
    ariamoons = "ariamoons",
    ariananews = "ariananews",
    armanekerman = "armanekerman",
    armanmeli = "armanmeli",
    armanshargh = "armanshargh",
    armradio = "armradio",
    arongroups = "arongroups",
    arshehonline = "arshehonline",
    artanpress = "artanpress",
    aryanews = "aryanews",
    arzdigital = "arzdigital",
    arzfi = "arzfi",
    asbebokhar = "asbebokhar",
    asblog = "asblog",
    asemooni = "asemooni",
    asianews = "asianews",
    asiatech = "asiatech",
    asrdena = "asrdena",
    asreesfahannews = "asreesfahannews",
    asrehamoon = "asrehamoon",
    asriran = "asriran",
    asrkhabar = "asrkhabar",
    asrpress = "asrpress",
    atiyeonline = "atiyeonline",
    atlaspress = "atlaspress",
    avaalborznews = "avaalborznews",
    avablog = "avablog",
    avadiplomatic = "avadiplomatic",
    avalpardakht = "avalpardakht",
    avayefamenin = "avayefamenin",
    avayekhazar = "avayekhazar",
    avayerodkof = "avayerodkof",
    avayeseymare = "avayeseymare",
    avayseyedjamal = "avayseyedjamal",
    ayandnews = "ayandnews",
    ayatemandegar = "ayatemandegar",
    azaronline = "azaronline",
    azki = "azki",
    b88 = "b88",
    baeghtesad = "baeghtesad",
    baghestannews = "baghestannews",
    baharnews = "baharnews",
    bahjat = "bahjat",
    bakhtarnews = "bakhtarnews",
    bamdad24 = "bamdad24",
    bamemeybod = "bamemeybod",
    banifilmonline = "banifilmonline",
    bankdariirani = "bankdariirani",
    banker = "banker",
    barghab = "barghab",
    barghnews = "barghnews",
    barnamenevis = "barnamenevis",
    bartarinha = "bartarinha",
    basalam = "basalam",
    basijnews = "basijnews",
    basirat = "basirat",
    basna = "basna",
    bayanfarda = "bayanfarda",
    bazarebours = "bazarebours",
    bazarnews = "bazarnews",
    bazicenter = "bazicenter",
    bazideraz1404 = "bazideraz1404",
    bazimag = "bazimag",
    bazkhabar = "bazkhabar",
    bazmineh = "bazmineh",
    behdasht = "behdasht",
    behtarinideh = "behtarinideh",
    behzisti = "behzisti",
    bestfarsi = "bestfarsi",
    beytoote = "beytoote",
    bidarbourse = "bidarbourse",
    bitpin = "bitpin",
    blogfa = "blogfa",
    bloghnews = "bloghnews",
    bloging = "bloging",
    blogir = "blogir",
    blogiran = "blogiran",
    blogsazan = "blogsazan",
    blogsky = "blogsky",
    bonyadvokala = "bonyadvokala",
    bookland = "bookland",
    borna = "borna",
    boursenews = "boursenews",
    boursepress = "boursepress",
    boursy = "boursy",
    boyernews = "boyernews",
    bultannews = "bultannews",
    cafebazaar = "cafebazaar",
    cafeamoozeshgah = "cafeamoozeshgah",
    cann = "cann",
    car = "car",
    chabokonline = "chabokonline",
    chamedanmag = "chamedanmag",
    charkhan = "charkhan",
    chekad = "chekad",
    chemibazar = "chemibazar",
    chetor = "chetor",
    chtn = "chtn",
    cinemaeinews = "cinemaeinews",
    cinemaema = "cinemaema",
    cinemapress = "cinemapress",
    citna = "citna",
    click = "click",
    clickaval = "clickaval",
    controlmgt = "controlmgt",
    cookpad = "cookpad",
    dadrah = "dadrah",
    danakhabar = "danakhabar",
    daadyab = "daadyab",
    dadpardaz = "dadpardaz",
    dadvarzyar = "dadvarzyar",
    dailytelegraph = "dailytelegraph",
    dargi = "dargi",
    daryanews = "daryanews",
    dbazi = "dbazi",
    defapress = "defapress",
    deyblog = "deyblog",
    didarnews = "didarnews",
    didgahemrooz = "didgahemrooz",
    digiato = "digiato",
    digikala = "digikala",
    digiro = "digiro",
    digistyle = "digistyle",
    diibache = "diibache",
    divar = "divar",
    diyareaftab = "diyareaftab",
    diyareayyar = "diyareayyar",
    doctoreto = "doctoreto",
    doctoryab = "doctoryab",
    donyaeeqtesad = "donyaeeqtesad",
    donyayekhodro = "donyayekhodro",
    donyayemadan = "donyayemadan",
    dotic = "dotic",
    drhast = "drhast",
    drsaina = "drsaina",
    dsport = "dsport",
    ecc = "ecc",
    ecoiran = "ecoiran",
    ecoview = "ecoview",
    econegar = "econegar",
    ecofars = "ecofars",
    econews = "econews",
    eghtesaad24 = "eghtesaad24",
    eghtesad100 = "eghtesad100",
    eghtesadazad = "eghtesadazad",
    eghtesadbazar = "eghtesadbazar",
    eghtesadnews = "eghtesadnews",
    eghtesadonline = "eghtesadonline",
    ekhtebar = "ekhtebar",
    emalls = "emalls",
    energypress = "energypress",
    ensafnews = "ensafnews",
    eporsesh = "eporsesh",
    esfahanemrooz = "esfahanemrooz",
    esfahanshargh = "esfahanshargh",
    esfahanzibaonline = "esfahanzibaonline",
    eslahatnews = "eslahatnews",
    etehadnews = "etehadnews",
    etemadonline = "etemadonline",
    ettelaat = "ettelaat",
    euronews = "euronews",
    evjaj = "evjaj",
    exbito = "exbito",
    eximnews = "eximnews",
    extern = "extern",
    faab = "faab",
    faradars = "faradars",
    faradeed = "faradeed",
    faramedia = "faramedia",
    fararu = "fararu",
    farazdaily = "farazdaily",
    farazsms = "farazsms",
    fardaname = "fardaname",
    fardanews = "fardanews",
    fardayeeghtesad = "fardayeeghtesad",
    fardayekerman = "fardayekerman",
    fardmag = "fardmag",
    farhangemrooz = "farhangemrooz",
    farhangesadid = "farhangesadid",
    farhikhtegandaily = "farhikhtegandaily",
    farsnews = "farsnews",
    fartaknews = "fartaknews",
    faryadenahavand = "faryadenahavand",
    faslejonoob = "faslejonoob",
    fekrshahr = "fekrshahr",
    felezatkhavarmianeh = "felezatkhavarmianeh",
    fhnews = "fhnews",
    filcin = "filcin",
    filmcinemanews = "filmcinemanews",
    filimoshot = "filimoshot",
    filmmagazine = "filmmagazine",
    fitamin = "fitamin",
    flightio = "flightio",
    foodpress = "foodpress",
    football360 = "football360",
    gadgetnews = "gadgetnews",
    gamefa = "gamefa",
    gamene = "gamene",
    gametor = "gametor",
    gardeshban = "gardeshban",
    getzoop = "getzoop",
    gashtaninews = "gashtaninews",
    ghafaridiet = "ghafaridiet",
    ghalamnews = "ghalamnews",
    gishniz = "gishniz",
    gitionline = "gitionline",
    goftareno = "goftareno",
    goldashtkerman = "goldashtkerman",
    golvani = "golvani",
    gooyait = "gooyait",
    gostaresh = "gostaresh",
    gozareshekhabar = "gozareshekhabar",
    haal = "haal",
    hadese24 = "hadese24",
    hadeseilam = "hadeseilam",
    hadith = "hadith",
    haftgard = "haftgard",
    haje = "haje",
    hamedanonline = "hamedanonline",
    hamgardi = "hamgardi",
    hamrah = "hamrah",
    hamrahmoshaver = "hamrahmoshaver",
    hamshahrionline = "hamshahrionline",
    hamyarwp = "hamyarwp",
    hakimemehr = "hakimemehr",
    harfonline = "harfonline",
    hashtam = "hashtam",
    hashtsobh = "hashtsobh",
    hawzahnews = "hawzahnews",
    hayat = "hayat",
    hedayatgar = "hedayatgar",
    hidoctor = "hidoctor",
    hisalamat = "hisalamat",
    hitalki = "hitalki",
    honareseda = "honareseda",
    honarguilan = "honarguilan",
    honarmrooz = "honarmrooz",
    honarnews = "honarnews",
    honaronline = "honaronline",
    hormozgantoday = "hormozgantoday",
    hourgan = "hourgan",
    iana = "iana",
    ibna = "ibna",
    ictnews = "ictnews",
    ictnn = "ictnn",
    ictpress = "ictpress",
    idpay = "idpay",
    ifsm = "ifsm",
    iichs = "iichs",
    ilamebidar = "ilamebidar",
    ilamrasaneh = "ilamrasaneh",
    ilamrouydad = "ilamrouydad",
    iliadmag = "iliadmag",
    ilna = "ilna",
    imereport = "imereport",
    imna = "imna",
    infogramacademy = "infogramacademy",
    inn = "inn",
    intitr = "intitr",
    ipresta = "ipresta",
    iqna = "iqna",
    iranacademy = "iranacademy",
    iranart = "iranart",
    irancell = "irancell",
    irancook = "irancook",
    iraneconomist = "iraneconomist",
    iranestekhdam = "iranestekhdam",
    iraneurope = "iraneurope",
    iranhotelonline = "iranhotelonline",
    iranicard = "iranicard",
    iranirooz = "iranirooz",
    iranjib = "iranjib",
    irasin = "irasin",
    irdc = "irdc",
    irdiplomacy = "irdiplomacy",
    iribnews = "iribnews",
    irna = "irna",
    isblog = "isblog",
    iscanews = "iscanews",
    isovisit = "isovisit",
    islamquest = "islamquest",
    isna = "isna",
    itna = "itna",
    itnanews = "itnanews",
    ivahid = "ivahid",
    ivnanews = "ivnanews",
    iwna = "iwna",
    jabama = "jabama",
    jadidpress = "jadidpress",
    jadoogaran = "jadoogaran",
    jadvalyab = "jadvalyab",
    jahanemana = "jahanemana",
    jahannews = "jahannews",
    jahansanatnews = "jahansanatnews",
    jamejamonline = "jamejamonline",
    jar = "jar",
    javanonline = "javanonline",
    jeebnews = "jeebnews",
    jobinja = "jobinja",
    jomhornews = "jomhornews",
    jomhouriat = "jomhouriat",
    joomlafarsi = "joomlafarsi",
    kalleh = "kalleh",
    kamapress = "kamapress",
    kanoonhend = "kanoonhend",
    kanoonnews = "kanoonnews",
    karafarinnews = "karafarinnews",
    karajemrouz = "karajemrouz",
    karlancer = "karlancer",
    karokasb = "karokasb",
    karotech = "karotech",
    kayhan = "kayhan",
    kebnanews = "kebnanews",
    kermaneno = "kermaneno",
    keshavarzplus = "keshavarzplus",
    ketabnews = "ketabnews",
    khabaredagh = "khabaredagh",
    khabaresabzevaran = "khabaresabzevaran",
    khabarfoori = "khabarfoori",
    khabarkhodro = "khabarkhodro",
    khabarmachine = "khabarmachine",
    khabaronline = "khabaronline",
    khabarvarzeshi = "khabarvarzeshi",
    khamenei = "khamenei",
    khanefootball = "khanefootball",
    khanomsin = "khanomsin",
    khanoumi = "khanoumi",
    khatebazar = "khatebazar",
    khateshomal = "khateshomal",
    kheiriran = "kheiriran",
    khodrokaar = "khodrokaar",
    khodronevis = "khodronevis",
    khodropluss = "khodropluss",
    khodrotak = "khodrotak",
    khoorna = "khoorna",
    khoramabadfarda = "khoramabadfarda",
    khordad = "khordad",
    khuzpress = "khuzpress",
    kidzy = "kidzy",
    kojaro = "kojaro",
    kordtoday = "kordtoday",
    ksymg = "ksymg",
    kurdistantv = "kurdistantv",
    kurdpress = "kurdpress",
    labourlaw = "labourlaw",
    lastsecond = "lastsecond",
    liangroup = "liangroup",
    lioncomputer = "lioncomputer",
    lisna = "lisna",
    lkiran = "lkiran",
    madarsho = "madarsho",
    magiran = "magiran",
    mahyanews = "mahyanews",
    majidonline = "majidonline",
    maktabkhooneh = "maktabkhooneh",
    malltina = "malltina",
    mamlekatonline = "mamlekatonline",
    mana = "mana",
    manbaekhabar = "manbaekhabar",
    mardomenoonline = "mardomenoonline",
    marinenews = "marinenews",
    mashreghnews = "mashreghnews",
    mdeast = "mdeast",
    mednews = "mednews",
    mefda = "mefda",
    meghdadit = "meghdadit",
    mehrdadcivil = "mehrdadcivil",
    mehrnews = "mehrnews",
    melipayamak = "melipayamak",
    mendellab = "mendellab",
    miare = "miare",
    mihandownload = "mihandownload",
    mihanpezeshk = "mihanpezeshk",
    mihanwebhost = "mihanwebhost",
    mihanwp = "mihanwp",
    migna = "migna",
    mirmalas = "mirmalas",
    mizanonline = "mizanonline",
    mizbanfa = "mizbanfa",
    moaser = "moaser",
    modireweb = "modireweb",
    mojerasa = "mojerasa",
    mojnews = "mojnews",
    mokhatab24 = "mokhatab24",
    moniban = "moniban",
    monoblog = "monoblog",
    mopon = "mopon",
    moroornews = "moroornews",
    mosalasonline = "mosalasonline",
    mosbatesabz = "mosbatesabz",
    moshaver = "moshaver",
    moshaveranetahsili = "moshaveranetahsili",
    mostaghelonline = "mostaghelonline",
    motamem = "motamem",
    mrud = "mrud",
    msrt = "msrt",
    myket = "myket",
    nabzefanavari = "nabzefanavari",
    nabzemarketing = "nabzemarketing",
    nabznaft = "nabznaft",
    naftonline = "naftonline",
    naghdfarsi = "naghdfarsi",
    naghsheeghtesadonline = "naghsheeghtesadonline",
    namava = "namava",
    namehnews = "namehnews",
    namnak = "namnak",
    nasim = "nasim",
    nasrblog = "nasrblog",
    nateghan = "nateghan",
    navajonob = "navajonob",
    nazaratshora = "nazaratshora",
    nedayeesfahan = "nedayeesfahan",
    neshanonline = "neshanonline",
    neshateshahr = "neshateshahr",
    niknews = "niknews",
    niloblog = "niloblog",
    niniban = "niniban",
    ninisite = "ninisite",
    niniweblog = "niniweblog",
    noandish = "noandish",
    nobitex = "nobitex",
    nohsobh = "nohsobh",
    noozdahkala = "noozdahkala",
    nournews = "nournews",
    novin = "novin",
    ofoghetazenews = "ofoghetazenews",
    ofoghilam = "ofoghilam",
    ofoghjonoub = "ofoghjonoub",
    ofoghnews = "ofoghnews",
    oghyanos = "oghyanos",
    oipf = "oipf",
    okala = "okala",
    oloompezeshki = "oloompezeshki",
    oshida = "oshida",
    p30world = "p30world",
    pana = "pana",
    panamag = "panamag",
    panjahopanjonline = "panjahopanjonline",
    panjere = "panjere",
    pansadonavadohasht = "pansadonavadohasht",
    par30games = "par30games",
    parscoders = "parscoders",
    parsfootball = "parsfootball",
    parshistory = "parshistory",
    parsiblog = "parsiblog",
    parsine = "parsine",
    parspack = "parspack",
    pasokhgoo = "pasokhgoo",
    passgoal = "passgoal",
    payamefori = "payamefori",
    payamekhanevadeh = "payamekhanevadeh",
    payamgostar = "payamgostar",
    paydarymelli = "paydarymelli",
    paziresh24 = "paziresh24",
    pdf = "pdf",
    pedal = "pedal",
    peivast = "peivast",
    persiankhodro = "persiankhodro",
    persiantools = "persiantools",
    perspolisnews = "perspolisnews",
    pezeshket = "pezeshket",
    pgnews = "pgnews",
    pishgamfanavari = "pishgamfanavari",
    plaza = "plaza",
    podium = "podium",
    ponisha = "ponisha",
    poonehmedia = "poonehmedia",
    pooyeonline = "pooyeonline",
    porsan = "porsan",
    portal = "portal",
    poyeshgarangil = "poyeshgarangil",
    prisons = "prisons",
    psarena = "psarena",
    pspro = "pspro",
    purson = "purson",
    qavanin = "qavanin",
    qudsonline = "qudsonline",
    quera = "quera",
    quskonline = "quskonline",
    raaknews = "raaknews",
    radareghtesad = "radareghtesad",
    rahatblog = "rahatblog",
    rahbordemoaser = "rahbordemoaser",
    rajanews = "rajanews",
    ramzarz = "ramzarz",
    rasadeghtesadi = "rasadeghtesadi",
    rasanews = "rasanews",
    rasekhoon = "rasekhoon",
    rastineh = "rastineh",
    rawanshenas = "rawanshenas",
    rayamarketing = "rayamarketing",
    raygansms = "raygansms",
    rcmajlis = "rcmajlis",
    rcs = "rcs",
    revayatnameh = "revayatnameh",
    rokna = "rokna",
    romanman = "romanman",
    roocket = "roocket",
    roozgarpress  = "roozgarpress",
    rooziato = "rooziato",
    roozno = "roozno",
    roozplus = "roozplus",
    roshadent = "roshadent",
    roshanayrah = "roshanayrah",
    rouydad24 = "rouydad24",
    rouzeeghtesad = "rouzeeghtesad",
    rozblog = "rozblog",
    saafi = "saafi",
    saat24 = "saat24",
    saatesalamat = "saatesalamat",
    sabakhabar = "sabakhabar",
    sadohejdahsafar = "sadohejdahsafar",
    saednews = "saednews",
    safheeghtesad = "safheeghtesad",
    safirelorestan = "safirelorestan",
    sahebkhabar = "sahebkhabar",
    sahebnews = "sahebnews",
    sakhtafzarmag = "sakhtafzarmag",
    sakkook = "sakkook",
    salamatnews = "salamatnews",
    salameno = "salameno",
    samanehha = "samanehha",
    sanapress = "sanapress",
    sarpoosh = "sarpoosh",
    sariasan = "sariasan",
    sarmadnews = "sarmadnews",
    scorize = "scorize",
    sedayebourse = "sedayebourse",
    sedayiran = "sedayiran",
    sellfree = "sellfree",
    sena = "sena",
    seratnews = "seratnews",
    sesotweb = "sesotweb",
    sevenlearn = "sevenlearn",
    shabakehmag = "shabakehmag",
    shabestan = "shabestan",
    shaer = "shaer",
    shafaonline = "shafaonline",
    shahr = "shahr",
    shahr20 = "shahr20",
    shahraranews = "shahraranews",
    shahrsakhtafzar = "shahrsakhtafzar",
    shahryarnews = "shahryarnews",
    shana = "shana",
    sharghdaily = "sharghdaily",
    sharghnegar = "sharghnegar",
    shayanews = "shayanews",
    shereno = "shereno",
    shenasname = "shenasname",
    sheypoor = "sheypoor",
    shianews = "shianews",
    shiraze = "shiraze",
    shirintanz = "shirintanz",
    shoaresal = "shoaresal",
    shohadayeiran = "shohadayeiran",
    shomalnews = "shomalnews",
    shomanews = "shomanews",
    shomavaeghtesad = "shomavaeghtesad",
    shooshan = "shooshan",
    shoragc = "shoragc",
    sid = "sid",
    sinapress = "sinapress",
    sinapub = "sinapub",
    sistani = "sistani",
    snapp = "snapp",
    snappfood = "snappfood",
    snappmarket = "snappmarket",
    snapptrip = "snapptrip",
    snn = "snn",
    sobheqazvin = "sobheqazvin",
    sobheqtesad = "sobheqtesad",
    sobhesahel = "sobhesahel",
    sobhtazeh = "sobhtazeh",
    sofiamag = "sofiamag",
    soft98 = "soft98",
    soja = "soja",
    sokannews = "sokannews",
    sornakhabar = "sornakhabar",
    spnfa = "spnfa",
    sputnikaf = "sputnikaf",
    taaghche = "taaghche",
    tabnak = "tabnak",
    tabnakbato = "tabnakbato",
    tabnakjavan = "tabnakjavan",
    tadbir24 = "tadbir24",
    tahlilbazaar = "tahlilbazaar",
    tahririeh = "tahririeh",
    tapesh3 = "tapesh3",
    tarafdari = "tarafdari",
    taraz = "taraz",
    taraznameheghtesad = "taraznameheghtesad",
    tarfandestan = "tarfandestan",
    tarikhema = "tarikhema",
    tarikhirani = "tarikhirani",
    tarjomic = "tarjomic",
    tasnim = "tasnim",
    tazenews = "tazenews",
    tccim = "tccim",
    tebna = "tebna",
    tebyan = "tebyan",
    techfars = "techfars",
    technoc = "technoc",
    technolife = "technolife",
    techranco = "techranco",
    techrato = "techrato",
    tehranbehesht = "tehranbehesht",
    tehrannews = "tehrannews",
    tehranserver = "tehranserver",
    tejaratefarda = "tejaratefarda",
    tejaratemrouz = "tejaratemrouz",
    tejaratonline = "tejaratonline",
    telescope = "telescope",
    theater = "theater",
    tik = "tik",
    tinn = "tinn",
    titre20 = "titre20",
    titrekootah = "titrekootah",
    tlyn = "tlyn",
    toonblog = "toonblog",
    toseeirani = "toseeirani",
    transis = "transis",
    trip = "trip",
    trt = "trt",
    turkmensesi = "turkmensesi",
    turkmensnews = "turkmensnews",
    ucan = "ucan",
    uptvs = "uptvs",
    vaghteshomal = "vaghteshomal",
    vakiltik = "vakiltik",
    vananews = "vananews",
    vaghtesobh = "vaghtesobh",
    varknews = "varknews",
    varune = "varune",
    varzesh3 = "varzesh3",
    varzesh360 = "varzesh360",
    vido = "vido",
    vigiato = "vigiato",
    virgool = "virgool",
    vindad = "vindad",
    voiceart = "voiceart",
    watereng = "watereng",
    webhostingtalk = "webhostingtalk",
    webkima = "webkima",
    webpouya = "webpouya",
    wikibooks = "wikibooks",
    wikifa = "wikifa",
    wikifeqh = "wikifeqh",
    wikigardi = "wikigardi",
    wikihoghoogh = "wikihoghoogh",
    wikijoo = "wikijoo",
    wikiravan = "wikiravan",
    wikishahid = "wikishahid",
    wikishia = "wikishia",
    wikisource = "wikisource",
    wikivoyage = "wikivoyage",
    wppersian = "wppersian",
    yaftenews = "yaftenews",
    yaghoutnews = "yaghoutnews",
    yazdfarda = "yazdfarda",
    yazeco = "yazeco",
    yekpezeshk = "yekpezeshk",
    yektanet = "yektanet",
    yjc = "yjc",
    zanjani = "zanjani",
    zenhar = "zenhar",
    zhaket = "zhaket",
    zibamoon = "zibamoon",
    zisaan = "zisaan",
    zoomg = "zoomg",
    zoomit = "zoomit",
    zoomtech = "zoomtech",
}

export interface IntfGlobalConfigs {
    debugVerbosity?: number,
    showInfo?: boolean,
    debugDB?: boolean,
    showWarnings?: boolean,
    db?: string,
    maxConcurrent?: number,
    delay?: number,
    corpora?: string,
    proxies?: string[] | string,
    hostIP?: string,
    logPath?: string,
    compact?: boolean
}

export enum enuTextType {
    paragraph = "p",
    caption = "caption",
    cite = "cite",
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    alt = "alt",
    link = "link",
    ilink = "ilink",
    li = "li",
    blockquote = "blockquote"
}

export interface IntfKeyVal { [key: string]: string }
export interface IntfText { text: string, type: enuTextType, ref?: string }
export interface IntfComment { text: string, author?: string, date?: string }
export interface IntfImage { src: string, alt?: string }
export interface IntfContentHolder { texts: IntfText[], images: IntfImage[] }

export interface IntfQAcontainer {
    q: IntfComment,
    a?: IntfComment[]
}

export interface IntfPageContent {
    url: string,
    category?: string,
    article?: {
        date?: string,
        title?: string,
        aboveTitle?: string,
        subtitle?: string,
        summary?: string,
        content?: IntfText[],
        comments?: IntfComment[]
        qa?: IntfQAcontainer[]
        images?: IntfImage[],
        tags?: string[],
    }
    links: string[],
}

export interface IntfDocFilecontent {
    url: string,
    category: string | IntfMappedCategory,
    date?: string,
    title?: string,
    aboveTitle?: string,
    subtitle?: string,
    summary?: string,
    content?: IntfText[],
    comments?: IntfComment[]
    images?: IntfImage[],
    tags?: string[],
    qa?: IntfQAcontainer[]
}

export enum enuTextType {
    Formal = "Formal",
    Informal = "Informal",
    Hybrid = "Hybrid",
    Unk = "Unk"
}

export enum enuMajorCategory {
    Undefined = "Undefined",
    News = "News",
    QA = "QA",
    Literature = "Literature",
    Forum = "Forum",
    Weblog = "Weblog",
    SocialMedia = "SocialMedia",
    Doc = "Doc",
}

export enum enuMinorCategory {
    Political = "Political",
    FAQ = "FAQ",
    Social = "Social",
    Health = "Health",
    Medical = "Medical",
    Psychology = "psychology",
    Economics = "Economics",
    Culture = "Art&Culture",
    Consultation = "Consultation",
    Sport = "Sport",
    ScienceTech = "Science&Tech",
    Job = "Job",
    SEO = "SEO",
    Journalism = "Journalism",
    Undefined = "Undefined",
    Generic = "Generic",
    Food = "Food",
    Multimedia = "Multimedia",
    Talk = "Talk",
    Discussion = "Discussion",
    Poem = "Poem",
    Text = "Text",
    Local = "Local",
    Religious = "Religious",
    Law = "Law",
    LifeStyle = "LifeStyle",
    Game = "Game",
    Education = "Education",
    Literature = "Literature",
    Historical = "Historical",
    University = "University",
    Defence = "Defence",
    Fun = "Fun",
    Insurance = "Insurance",
    Weather = "Weather",
    Advert = "Advert",
    CryptoCurrency = "CryptoCurrency",
    IT = "IT",
    ICT = "ICT",
    DigitalMarketing = "DigitalMarketing",
    Tourism = "Tourism",
    Startup = "Startup",
    Cooking = "Cooking"
}

export enum enuSubMinorCategory {
    Game = "Game",
    Cosmos = "Cosmos",
    GoldSilver = "GoldSilver",
    Reportage = "Reportage",
    Security = "Security",
    Mobile = "Mobile",
    Robotic = "Robotic",
    Hardware = "Hardware",
    Network = "Network",
    Software = "Software",
    Chemical = "Chemical",
    Language = "Language",
    Car = "Car",
    Energy = "Energy",
    Gadgets = "Gadgets",
    AI = "AI",
    IOT = "IOT",
    Intl = "Intl",
    Accident = "Accident",
    Art = "Art",
    Agriculture = "Agriculture",
    TV = "TV",
    Pet = "Pet",
    Petroleum = "Petroleum",
    Radio = "Radio",
    Book = "Book",
    Podcast = "Podcast",
    Celebrities = "Celebrities",
    Cinema = "Cinema",
    Photo = "Photo",
    Insurance = "Insurance",
    Documentary = "Documentary",
    Music = "Music",
    Media = "Media",
    Theatre = "Theatre",
    Football = "Football",
    Basketball = "Basketball",
    Nautics = "Nautics",
    Chess = "Chess",
    Bicycle = "Bicycle",
    Karate = "Karate",
    Ball = "Ball",
    Wrestling = "Wrestling",
    Martial = "Martial",
    Weightlifting = "Weightlifting",
    Women = "Women",
    Animals = "Animals",
    Police = "Police"
}

export interface IntfMappedCategory {
    textType : enuTextType,
    major: enuMajorCategory,
    minor?: enuMinorCategory,
    subminor?: enuSubMinorCategory | enuMinorCategory,
    original?: string
}

export interface IntfProxy {
    agent: SocksProxyAgent,
    port: string
}

export interface IntfSelectorFunction {
    (article: HTMLElement, fullHtml: HTMLElement, url: URL): HTMLElement | null | undefined
}

export interface IntfIsValidFunction {
    (article: HTMLElement, fullHtml: HTMLElement): boolean
}

export interface IntfSelectAllFunction {
    (article: HTMLElement, fullHtml: HTMLElement): HTMLElement[] | undefined
}

export interface IntfIgnoreTextElementFunction {
    (el: HTMLElement, index: number, allElements: HTMLElement[]): boolean
}
export interface IntfGetCommentsByAPI {
    (url: URL, reParams: IntfRequestParams): Promise<IntfComment[]>
}

export interface IntfSelectorToString {
    (element: HTMLElement, fullHtml?: HTMLElement): string
}

export interface IntfURLNormalizationConf {
    extraValidDomains?: string[]
    extraInvalidStartPaths?: string[],
    ignoreContentOnPath?: string[],
    removeWWW?: boolean,
    pathToCheckIndex?: number | null
    validPathsItemsToNormalize?: string[],
    forceHTTP?: boolean
}

export interface IntfCommentContainer {
    container?: string | IntfSelectAllFunction
    datetime?: string | IntfSelectorToString
    author?: string | IntfSelectorFunction
    text?: string | IntfSelectorFunction
}

export interface IntfProcessorConfigs {
    selectors?: {
        article?: string | IntfSelectorFunction,
        aboveTitle?: string | IntfSelectorFunction,
        title?: string | IntfSelectorFunction,
        acceptNoTitle?: boolean
        subtitle?: string | IntfSelectorFunction,
        summary?: string | IntfSelectorFunction,
        content?: {
            main?: string | IntfSelectAllFunction,
            alternative?: string | IntfSelectAllFunction,
            textNode?: string | IntfSelectorFunction,
            alterTextContent?: IntfSelectorToString,
            ignoreTexts?: string[] | RegExp[],
            ignoreNodeClasses?: string[] | IntfIsValidFunction,
            qa?: {
                containers: string | IntfSelectAllFunction
                q: IntfCommentContainer
                a: IntfCommentContainer
            }
        },
        comments?: IntfCommentContainer | IntfGetCommentsByAPI,
        tags?: string | IntfSelectAllFunction,
        datetime?: {
            conatiner?: string | IntfSelectorFunction,
            splitter?: string | IntfSelectorToString,
            isGregorian?: boolean
            acceptNoDate?: boolean
        }
        category?: {
            selector?: string | IntfSelectAllFunction,
            startIndex?: number,
            lastIndex?: number
        }
    },
    api?: { (url: URL, reParams: IntfRequestParams, data?: string): Promise<IntfPageContent> },
    url?: IntfURLNormalizationConf
    basePath?: string
    preHTMLParse?: (html: string) => string
}

export const INVALID_URL = "/Invalid"
