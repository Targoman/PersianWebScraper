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
    adlnameh = "adlnameh",
    adlpors = "adlpors",
    adyannet = "adyannet",
    adyannews = "adyannews",
    afarineshdaily = "afarineshdaily",
    afghanwomennews = "afghanwomennews",
    afkarnews = "afkarnews",
    afkarpress = "afkarpress",
    aftabejonoob = "aftabejonoob",
    aftabnews = "aftabnews",
    aftabno = "aftabno",
    aftana = "aftana",
    aftokhabar = "aftokhabar",
    aghigh = "aghigh",
    agorgani = "agorgani",
    agrofoodnews = "agrofoodnews",
    ahannews = "ahannews",
    aiinbimeh = "aiinbimeh",
    akharinkhabar = "akharinkhabar",
    akharinkhodro = "akharinkhodro",
    akhbarbank = "akhbarbank",
    akhbarelmi = "akhbarelmi",
    akhbaremadan = "akhbaremadan",
    akkasee = "akkasee",
    alborzvarzeshi = "alborzvarzeshi",
    alef = "alef",
    alefbakhabar = "alefbakhabar",
    alnajm = "alnajm",
    alodoctor = "alodoctor",
    alomohtava = "alomohtava",
    alwaght = "alwaght",
    amfm = "amfm",
    amu = "amu",
    amuzeshtak = "amuzeshtak",
    ana = "ana",
    anaj = "anaj",
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
    armantabriz = "armantabriz",
    armradio = "armradio",
    arongroups = "arongroups",
    arshehonline = "arshehonline",
    artanpress = "artanpress",
    aryanews = "aryanews",
    arzdigital = "arzdigital",
    arzfi = "arzfi",
    asbebokhar = "asbebokhar",
    asblog = "asblog",
    asemaninews = "asemaninews",
    asemooni = "asemooni",
    ashkannews = "ashkannews",
    asianews = "asianews",
    asiatech = "asiatech",
    asrdena = "asrdena",
    asreesfahannews = "asreesfahannews",
    asrehamoon = "asrehamoon",
    asrekhadamat = "asrekhadamat",
    asriran = "asriran",
    asrkar = "asrkar",
    asrkhabar = "asrkhabar",
    asrpress = "asrpress",
    asrtabriz = "asrtabriz",
    atiyeonline = "atiyeonline",
    atlaspress = "atlaspress",
    avaalborznews = "avaalborznews",
    avablog = "avablog",
    avadiplomatic = "avadiplomatic",
    avalpardakht = "avalpardakht",
    avangpress = "avangpress",
    avapress = "avapress",
    avastarco = "avastarco",
    avayefamenin = "avayefamenin",
    avayekhazar = "avayekhazar",
    avayerodkof = "avayerodkof",
    avayeseymare = "avayeseymare",
    avayetabarestan = "avayetabarestan",
    avayseyedjamal = "avayseyedjamal",
    ayandnews = "ayandnews",
    ayatemandegar = "ayatemandegar",
    azariha = "azariha",
    azaronline = "azaronline",
    azki = "azki",
    b88 = "b88",
    baeghtesad = "baeghtesad",
    baghestannews = "baghestannews",
    baharnews = "baharnews",
    bahjat = "bahjat",
    bakhtarnews = "bakhtarnews",
    balviz = "balviz",
    bamdad24 = "bamdad24",
    bamemeybod = "bamemeybod",
    banifilmonline = "banifilmonline",
    bankdariirani = "bankdariirani",
    banker = "banker",
    barghab = "barghab",
    barghnews = "barghnews",
    barishnews = "barishnews",
    barnamenevis = "barnamenevis",
    bartarinha = "bartarinha",
    basalam = "basalam",
    basijnews = "basijnews",
    basirat = "basirat",
    basna = "basna",
    baten = "baten",
    bayanfarda = "bayanfarda",
    bazarebours = "bazarebours",
    bazarganannews = "bazarganannews",
    bazarnews = "bazarnews",
    bazicenter = "bazicenter",
    bazideraz1404 = "bazideraz1404",
    bazimag = "bazimag",
    bazkhabar = "bazkhabar",
    bazmineh = "bazmineh",
    baztab = "baztab",
    behdasht = "behdasht",
    behtarinideh = "behtarinideh",
    behzisti = "behzisti",
    berouztarinha = "berouztarinha",
    bestfarsi = "bestfarsi",
    beytoote = "beytoote",
    bidarbourse = "bidarbourse",
    birjandtoday = "birjandtoday",
    bitpin = "bitpin",
    blogfa = "blogfa",
    bloghnews = "bloghnews",
    bloging = "bloging",
    blogir = "blogir",
    blogiran = "blogiran",
    blogsazan = "blogsazan",
    blogsky = "blogsky",
    bmn = "bmn",
    bonyadvokala = "bonyadvokala",
    bookland = "bookland",
    borna = "borna",
    bourse24 = "bourse24",
    boursenews = "boursenews",
    boursepress = "boursepress",
    boursy = "boursy",
    boyernews = "boyernews",
    bultannews = "bultannews",
    cafebazaar = "cafebazaar",
    cafeamoozeshgah = "cafeamoozeshgah",
    cafehdanesh = "cafehdanesh",
    cann = "cann",
    car = "car",
    chabokonline = "chabokonline",
    chaharfasl = "chaharfasl",
    chamedanmag = "chamedanmag",
    charkhan = "charkhan",
    charkheghtesadnews = "charkheghtesadnews",
    chekad = "chekad",
    chemibazar = "chemibazar",
    chetor = "chetor",
    chimigan = "chimigan",
    chtn = "chtn",
    cinemaeinews = "cinemaeinews",
    cinemaema = "cinemaema",
    cinemapress = "cinemapress",
    citna = "citna",
    click = "click",
    clickaval = "clickaval",
    controlmgt = "controlmgt",
    cookpad = "cookpad",
    cspf = "cspf",
    dadrah = "dadrah",
    dana = "dana",
    danakhabar = "danakhabar",
    daadyab = "daadyab",
    dadpardaz = "dadpardaz",
    dadvarzyar = "dadvarzyar",
    dailyafghanistan = "dailyafghanistan",
    dailytelegraph = "dailytelegraph",
    daneshjooazad = "daneshjooazad",
    danestanyonline = "danestanyonline",
    dargi = "dargi",
    darsiahkal = "darsiahkal",
    daryanews = "daryanews",
    dbazi = "dbazi",
    defapress = "defapress",
    delgarm = "delgarm",
    deyblog = "deyblog",
    didarnews = "didarnews",
    didbanpress = "didbanpress",
    didgahemrooz = "didgahemrooz",
    digiato = "digiato",
    digikala = "digikala",
    digiro = "digiro",
    digistyle = "digistyle",
    diibache = "diibache",
    dinonline = "dinonline",
    divar = "divar",
    diyareaftab = "diyareaftab",
    diyareayyar = "diyareayyar",
    doctoreto = "doctoreto",
    doctoryab = "doctoryab",
    donyaeeqtesad = "donyaeeqtesad",
    donyayebimeh = "donyayebimeh",
    donyayebourse = "donyayebourse",
    donyayekhodro = "donyayekhodro",
    donyayemadan = "donyayemadan",
    dotic = "dotic",
    drhast = "drhast",
    drsaina = "drsaina",
    dsport = "dsport",
    ecc = "ecc",
    ecobannews = "ecobannews",
    ecoiran = "ecoiran",
    ecoview = "ecoview",
    econegar = "econegar",
    ecofars = "ecofars",
    econapress = "econapress",
    econews = "econews",
    eghtesaad24 = "eghtesaad24",
    eghtesad100 = "eghtesad100",
    eghtesadazad = "eghtesadazad",
    eghtesadbazar = "eghtesadbazar",
    eghtesadbazargani = "eghtesadbazargani",
    eghtesaddaryai = "eghtesaddaryai",
    eghtesadema = "eghtesadema",
    eghtesadgooya = "eghtesadgooya",
    eghtesadnews = "eghtesadnews",
    eghtesadobimeh = "eghtesadobimeh",
    eghtesadonline = "eghtesadonline",
    eghtesadsaramadonline = "eghtesadsaramadonline",
    ekhtebar = "ekhtebar",
    emalls = "emalls",
    energypress = "energypress",
    ensafnews = "ensafnews",
    eporsesh = "eporsesh",
    esfahanemrooz = "esfahanemrooz",
    esfahanshargh = "esfahanshargh",
    esfahanzibaonline = "esfahanzibaonline",
    eskanunion = "eskanunion",
    eslahatnews = "eslahatnews",
    estenadnews = "estenadnews",
    etebarenovin = "etebarenovin",
    etehadnews = "etehadnews",
    etelanews = "etelanews",
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
    farhangpress = "farhangpress",
    farhikhtegandaily = "farhikhtegandaily",
    farnet = "farnet",
    farsnews = "farsnews",
    fartaknews = "fartaknews",
    faryadejonoob = "faryadejonoob",
    faryadenahavand = "faryadenahavand",
    faslejonoob = "faslejonoob",
    fasletejarat = "fasletejarat",
    faslnews = "faslnews",
    fekrshahr = "fekrshahr",
    felezatkhavarmianeh = "felezatkhavarmianeh",
    feraghnews = "feraghnews",
    fhnews = "fhnews",
    figar = "figar",
    filcin = "filcin",
    filmcinemanews = "filmcinemanews",
    filimoshot = "filimoshot",
    filmmagazine = "filmmagazine",
    fitamin = "fitamin",
    flightio = "flightio",
    foodna = "foodna",
    foodpress = "foodpress",
    football360 = "football360",
    fut5al = "fut5al",
    gadgetnews = "gadgetnews",
    gamefa = "gamefa",
    gamene = "gamene",
    gametor = "gametor",
    gardeshban = "gardeshban",
    gerdab = "gerdab",
    getzoop = "getzoop",
    gashtaninews = "gashtaninews",
    ghafaridiet = "ghafaridiet",
    ghalamnews = "ghalamnews",
    ghaznawyantv = "ghaznawyantv",
    gilanestan = "gilanestan",
    gildeylam = "gildeylam",
    gilnovin = "gilnovin",
    gishniz = "gishniz",
    gitionline = "gitionline",
    goaldaily = "goaldaily",
    goftareno = "goftareno",
    goldashtkerman = "goldashtkerman",
    golvani = "golvani",
    gooyait = "gooyait",
    gostaresh = "gostaresh",
    gozareshekhabar = "gozareshekhabar",
    gozaresheonline = "gozaresheonline",
    gsm = "gsm",
    haal = "haal",
    hadana = "hadana",
    hadese24 = "hadese24",
    hadeseilam = "hadeseilam",
    hadith = "hadith",
    haftesobh = "haftesobh",
    haftgard = "haftgard",
    haftrah = "haftrah",
    haje = "haje",
    hamedanonline = "hamedanonline",
    hamgardi = "hamgardi",
    hammihanonline = "hammihanonline",
    hamrah = "hamrah",
    hamrahmoshaver = "hamrahmoshaver",
    hamshahrionline = "hamshahrionline",
    hamyarwp = "hamyarwp",
    hakimemehr = "hakimemehr",
    harfonline = "harfonline",
    hashtam = "hashtam",
    hashtdeynews = "hashtdeynews",
    hashtsobh = "hashtsobh",
    hawzahnews = "hawzahnews",
    hayat = "hayat",
    hedayatgar = "hedayatgar",
    hibna = "hibna",
    hidoctor = "hidoctor",
    hisalamat = "hisalamat",
    hitalki = "hitalki",
    honareseda = "honareseda",
    honarguilan = "honarguilan",
    honarmrooz = "honarmrooz",
    honarnews = "honarnews",
    honaronline = "honaronline",
    hormozban = "hormozban",
    hormozgantoday = "hormozgantoday",
    hourgan = "hourgan",
    iana = "iana",
    ibena = "ibena",
    ibna = "ibna",
    icana = "icana",
    iccnews = "iccnews",
    icro = "icro",
    ictnews = "ictnews",
    ictnn = "ictnn",
    ictpress = "ictpress",
    idpay = "idpay",
    ifsm = "ifsm",
    ihkn = "ihkn",
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
    ipemdad = "ipemdad",
    ipresta = "ipresta",
    iqna = "iqna",
    irafnews = "irafnews",
    iran361 = "iran361",
    iranacademy = "iranacademy",
    iranart = "iranart",
    iranbroker = "iranbroker",
    irancell = "irancell",
    irancook = "irancook",
    irandoc = "irandoc",
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
    irsteel = "irsteel",
    isblog = "isblog",
    iscanews = "iscanews",
    isignal = "isignal",
    islamquest = "islamquest",
    isna = "isna",
    isovisit = "isovisit",
    istanews = "istanews",
    iswnews = "iswnews",
    itna = "itna",
    itnanews = "itnanews",
    ivahid = "ivahid",
    ivnanews = "ivnanews",
    iwna = "iwna",
    jabama = "jabama",
    jadidpress = "jadidpress",
    jadoogaran = "jadoogaran",
    jadvalyab = "jadvalyab",
    jahaneghtesad = "jahaneghtesad",
    jahanemana = "jahanemana",
    jahanipress = "jahanipress",
    jahannews = "jahannews",
    jahansanatnews = "jahansanatnews",
    jahatpress = "jahatpress",
    jamejamonline = "jamejamonline",
    jar = "jar",
    javanonline = "javanonline",
    jeebnews = "jeebnews",
    jenayi = "jenayi",
    jezman = "jezman",
    jobinja = "jobinja",
    jomhooronline = "jomhooronline",
    jomhornews = "jomhornews",
    jomhouriat = "jomhouriat",
    joomlafarsi = "joomlafarsi",
    kafebook = "kafebook",
    kalleh = "kalleh",
    kamapress = "kamapress",
    kanoonhend = "kanoonhend",
    kanoonnews = "kanoonnews",
    karafarinnews = "karafarinnews",
    karajemrouz = "karajemrouz",
    karlancer = "karlancer",
    karokasb = "karokasb",
    karotech = "karotech",
    kashanefarda = "kashanefarda",
    kashkan = "kashkan",
    kayhan = "kayhan",
    kebnanews = "kebnanews",
    kermaneno = "kermaneno",
    keshavarzplus = "keshavarzplus",
    keshwarnews = "keshwarnews",
    ketabnews = "ketabnews",
    khabaredagh = "khabaredagh",
    khabaresabzevaran = "khabaresabzevaran",
    khabareshahr = "khabareshahr",
    khabarfoori = "khabarfoori",
    khabarkhodro = "khabarkhodro",
    khabarmachine = "khabarmachine",
    khabarnews = "khabarnews",
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
    khootoot = "khootoot",
    khoramabadfarda = "khoramabadfarda",
    khordad = "khordad",
    khordokalan = "khordokalan",
    khuzpress = "khuzpress",
    kidzy = "kidzy",
    kishvandnews = "kishvandnews",
    kohnaninews = "kohnaninews",
    kojaro = "kojaro",
    koodakpress = "koodakpress",
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
    madanname = "madanname",
    madannews = "madannews",
    madarsho = "madarsho",
    magiran = "magiran",
    mahyanews = "mahyanews",
    mejalehhafteh = "mejalehhafteh",
    majidonline = "majidonline",
    maktabkhooneh = "maktabkhooneh",
    malltina = "malltina",
    mamlekatema = "mamlekatema",
    mamlekatonline = "mamlekatonline",
    mana = "mana",
    manbaekhabar = "manbaekhabar",
    mardomenoonline = "mardomenoonline",
    marinenews = "marinenews",
    marznews = "marznews",
    mashhadomran = "mashhadomran",
    mashreghnews = "mashreghnews",
    masireqtesad = "masireqtesad",
    masiretaze = "masiretaze",
    mazandmajles = "mazandmajles",
    mdeast = "mdeast",
    mednews = "mednews",
    mefda = "mefda",
    meghdadit = "meghdadit",
    mehrdadcivil = "mehrdadcivil",
    mehrnews = "mehrnews",
    melipayamak = "melipayamak",
    memar = "memar",
    mendellab = "mendellab",
    menhayefootballonline = "menhayefootballonline",
    miare = "miare",
    mihandownload = "mihandownload",
    mihanpezeshk = "mihanpezeshk",
    mihansignal = "mihansignal",
    mihanwebhost = "mihanwebhost",
    mihanwp = "mihanwp",
    migna = "migna",
    mirmalas = "mirmalas",
    mizanonline = "mizanonline",
    mizbanfa = "mizbanfa",
    moaser = "moaser",
    modara = "modara",
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
    mouood = "mouood",
    mrud = "mrud",
    msrt = "msrt",
    myindustry = "myindustry",
    myket = "myket",
    nabzefanavari = "nabzefanavari",
    nabzemarketing = "nabzemarketing",
    nabznaft = "nabznaft",
    naftonline = "naftonline",
    naghdfarsi = "naghdfarsi",
    naghsheeghtesadonline = "naghsheeghtesadonline",
    namava = "namava",
    namayande = "namayande",
    namayebank = "namayebank",
    namehnews = "namehnews",
    namnak = "namnak",
    nasim = "nasim",
    nasrblog = "nasrblog",
    nasrnews = "nasrnews",
    nateghan = "nateghan",
    navadeghtesadi = "navadeghtesadi",
    navajonob = "navajonob",
    navidtorbat = "navidtorbat",
    nazaratshora = "nazaratshora",
    nedayeesfahan = "nedayeesfahan",
    nedayetajan = "nedayetajan",
    nedaymardom2ostan = "nedaymardom2ostan",
    nesfejahan = "nesfejahan",
    neshanonline = "neshanonline",
    neshateshahr = "neshateshahr",
    niknews = "niknews",
    nikru = "nikru",
    niloblog = "niloblog",
    niniban = "niniban",
    ninisite = "ninisite",
    niniweblog = "niniweblog",
    nipoto = "nipoto",
    noandish = "noandish",
    nobitex = "nobitex",
    nohsobh = "nohsobh",
    nojavanha = "nojavanha",
    noozdahkala = "noozdahkala",
    nournews = "nournews",
    novin = "novin",
    nuranews = "nuranews",
    ofoghetazenews = "ofoghetazenews",
    ofoghilam = "ofoghilam",
    ofoghjonoub = "ofoghjonoub",
    ofoghnews = "ofoghnews",
    ofoghoeghtesad = "ofoghoeghtesad",
    ofoghtehran = "ofoghtehran",
    oghyanos = "oghyanos",
    oipf = "oipf",
    okala = "okala",
    oloompezeshki = "oloompezeshki",
    omideghtesadonline = "omideghtesadonline",
    onlypet = "onlypet",
    ooma = "ooma",
    oshida = "oshida",
    ostanes = "ostanes",
    otagh24 = "otagh24",
    otaghiranonline = "otaghiranonline",
    ourpresident = "ourpresident",
    p30world = "p30world",
    pana = "pana",
    panahemardomnews = "panahemardomnews",
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
    petrotahlil = "petrotahlil",
    pezeshket = "pezeshket",
    pezhvakkurdestan = "pezhvakkurdestan",
    pgnews = "pgnews",
    pishgamfanavari = "pishgamfanavari",
    plaza = "plaza",
    podium = "podium",
    polymervapooshesh = "polymervapooshesh",
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
    qalampress = "qalampress",
    qartalnews = "qartalnews",
    qavanin = "qavanin",
    qudsonline = "qudsonline",
    quera = "quera",
    qumpress = "qumpress",
    quskonline = "quskonline",
    raaknews = "raaknews",
    raby = "raby",
    radareghtesad = "radareghtesad",
    radiofarhang = "radiofarhang",
    rahatblog = "rahatblog",
    rahbordbank = "rahbordbank",
    rahbordemoaser = "rahbordemoaser",
    railnews = "railnews",
    rajanews = "rajanews",
    ramzarz = "ramzarz",
    rasadeghtesadi = "rasadeghtesadi",
    rasaderooz = "rasaderooz",
    rasanews = "rasanews",
    rasekhoon = "rasekhoon",
    rastineh = "rastineh",
    rawanshenas = "rawanshenas",
    rayamarketing = "rayamarketing",
    raygansms = "raygansms",
    razavi = "razavi",
    razebaghaa = "razebaghaa",
    razminews = "razminews",
    rcmajlis = "rcmajlis",
    rcs = "rcs",
    revayatnameh = "revayatnameh",
    rokna = "rokna",
    romanman = "romanman",
    roocket = "roocket",
    rooyesheafkar = "rooyesheafkar",
    roozgarpress  = "roozgarpress",
    rooziato = "rooziato",
    roozno = "roozno",
    roozplus = "roozplus",
    roshadent = "roshadent",
    roshanayrah = "roshanayrah",
    rotbehonline = "rotbehonline",
    rourasti = "rourasti",
    roustapress = "roustapress",
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
    sahabpress = "sahabpress",
    sahebkhabar = "sahebkhabar",
    sahebnews = "sahebnews",
    sakhtafzarmag = "sakhtafzarmag",
    sakkook = "sakkook",
    salamatnews = "salamatnews",
    salameno = "salameno",
    salampaveh = "salampaveh",
    samanehha = "samanehha",
    sanapress = "sanapress",
    sanatsenf = "sanatsenf",
    sangneveshte = "sangneveshte",
    saramadeakhbar = "saramadeakhbar",
    sarmayefarda = "sarmayefarda",
    sarpoosh = "sarpoosh",
    sariasan = "sariasan",
    sarmadnews = "sarmadnews",
    scorize = "scorize",
    sedanews = "sedanews",
    sedayeanak = "sedayeanak",
    sedayebourse = "sedayebourse",
    sedayecheragheomidnews = "sedayecheragheomidnews",
    sedayekhavaran = "sedayekhavaran",
    sedayemoallem = "sedayemoallem",
    sedayerey = "sedayerey",
    sedayiran = "sedayiran",
    sedayostan = "sedayostan",
    segosh = "segosh",
    sellfree = "sellfree",
    sena = "sena",
    sepidarnews = "sepidarnews",
    seratnews = "seratnews",
    sesotweb = "sesotweb",
    sevenlearn = "sevenlearn",
    shababpress = "shababpress",
    shabakehmag = "shabakehmag",
    shabestan = "shabestan",
    shaer = "shaer",
    shafaonline = "shafaonline",
    shahidyaran = "shahidyaran",
    shahr = "shahr",
    shahr20 = "shahr20",
    shahraranews = "shahraranews",
    shahrebours = "shahrebours",
    shahrsakhtafzar = "shahrsakhtafzar",
    shahryarnews = "shahryarnews",
    shamsnews = "shamsnews",
    shana = "shana",
    shapourkhast = "shapourkhast",
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
    siasatrooz = "siasatrooz",
    sid = "sid",
    sinapress = "sinapress",
    sinapub = "sinapub",
    sistani = "sistani",
    smtnews = "smtnews",
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
    swn = "swn",
    taaghche = "taaghche",
    tabnak = "tabnak",
    tabnakbato = "tabnakbato",
    tabnakjavan = "tabnakjavan",
    tabyincenter = "tabyincenter",
    tadbir24 = "tadbir24",
    tafahomonline = "tafahomonline",
    tahlilbazaar = "tahlilbazaar",
    tahririeh = "tahririeh",
    tajhiznews = "tajhiznews",
    tala = "tala",
    talayedarankhabar = "talayedarankhabar",
    tanishnews = "tanishnews",
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
    techna = "techna",
    technoc = "technoc",
    technolife = "technolife",
    technotice = "technotice",
    techranco = "techranco",
    techrato = "techrato",
    tehranbehesht = "tehranbehesht",
    tehraneconomy = "tehraneconomy",
    tehrannews = "tehrannews",
    tehranpress = "tehranpress",
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
    tolosiyasat = "tolosiyasat",
    toonblog = "toonblog",
    toseeirani = "toseeirani",
    toseepooya = "toseepooya",
    transis = "transis",
    trip = "trip",
    trt = "trt",
    turkmensesi = "turkmensesi",
    turkmensnews = "turkmensnews",
    ucan = "ucan",
    upna = "upna",
    uptvs = "uptvs",
    vaghteshomal = "vaghteshomal",
    vakawi = "vakawi",
    vakiltik = "vakiltik",
    vananews = "vananews",
    vaghtesobh = "vaghtesobh",
    varknews = "varknews",
    varune = "varune",
    varzesh3 = "varzesh3",
    varzesh360 = "varzesh360",
    varzeshi91 = "varzeshi91",
    vido = "vido",
    vigiato = "vigiato",
    virgool = "virgool",
    vindad = "vindad",
    voiceart = "voiceart",
    watan24 = "watan24",
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
    yazdaneh = "yazdaneh",
    yazdfarda = "yazdfarda",
    yazeco = "yazeco",
    yekpezeshk = "yekpezeshk",
    yektanet = "yektanet",
    yjc = "yjc",
    zanjani = "zanjani",
    zenhar = "zenhar",
    zhaket = "zhaket",
    zibamoon = "zibamoon",
    ziryanmukryan = "ziryanmukryan",
    zisaan = "zisaan",
    zoomarz = "zoomarz",
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

export interface IntfKeyVal { [key: string]: any }
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
        meta?: IntfKeyVal
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
    textType: enuTextType,
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
    keepHashtag?: boolean
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
