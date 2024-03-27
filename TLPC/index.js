const express = require('express');
const fs = require('fs')
const Buffer = require("buffer").Buffer;
const NodeRSA = require('node-rsa');

const app = express();
const port = 3000
const statsPath = "../jsonl"
const cachePath = `${statsPath}/app/cachedInfo`
const approval = `${statsPath}/app/approved`
const approvedCommercial = `${approval}/commercial`
const approvedNonCommercial = `${approval}/non-commercial`

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json())

function loadCachedInfo() {
    if (!fs.existsSync(cachePath)) throw new Error("Unable to open cache file")
    const cached = JSON.parse(fs.readFileSync(cachePath))
    cached.endec = new NodeRSA(cached.rsa.private)
    cached.info.latestDoc = new Date(cached.info.latestDoc)
    return cached
}
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
app.get('/corpusSample/:domain', (req, res) => {
    console.log(req.params)
    const files = fs.readdirSync(statsPath + "/" + req.params.domain).filter(f => f.endsWith('.gz'))
    const file = statsPath + "/" + req.params.domain + "/" + files.at(Math.floor(files.length / 2))
    res.writeHead(200, {
        "Content-Type": "application/gzip",
        "Content-Length": fs.statSync(file).size,
    });
    res.end(fs.readFileSync(file));
})

app.get('/statistics/:domain', (req, res) => {
    console.log(req.params)
    const file = statsPath + "/" + req.params.domain + "-cats.csv"
    res.writeHead(200, {
        "Content-Type": "text/csv",
        "Content-Length": fs.statSync(file).size,
    });
    res.end(fs.readFileSync(file));
})

app.get('/details/:domain', (req, res) => {
    const json = fs.readFileSync(statsPath + "/" + req.params.domain + "-stats.json")
    const info = JSON.parse(json)
    info.oldestArticle = new Date(info.oldestArticle).toLocaleDateString("fa-IR", { year: 'numeric', month: 'long', day: 'numeric' }),
        info.newestArticle = new Date(info.newestArticle).toLocaleDateString("fa-IR", { year: 'numeric', month: 'long', day: 'numeric' }),
        info.urls = formatNumber(info.urls)
    info.fetched = formatNumber(info.fetched)
    info.discarded = formatNumber(info.discarded)
    info.errors = formatNumber(info.errors)
    info.documents = formatNumber(info.documents)
    info.totalWordCount = formatNumber(info.totalWordCount)

    res.render('details', { title: req.params.domain, info, categories: JSON.stringify(info.categories) });
})

app.get("/captcha", (req, res) => {
    const cached = loadCachedInfo()

    const captcha = createCaptcha({
        width: 150,
        height: 50,
        from: 100,
        to: 999,
        lines: 5,
    });
    const image = Buffer.from(captcha.image, "base64");
    const encrypted = cached.endec.encrypt(`${captcha.number}`, 'base64')
    res.cookie('ssid', encrypted, { maxAge: 1000 * 60 * 3, httpOnly: true, signed: false })

    res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": image.length,
    });

    res.end(image);
});

app.get('/', (req, res) => {
    let totalWC = 0
    let totalDocs = 0
    let totalURLs = 0
    let latestDoc = undefined
    let files = []
    const rows = []
    const approved = {commercial:[], nonCommercial:[]}
    const overallStats = {
        majorCatsWC: {
            News: 0,
            Literature: 0,
            Forum: 0,
            Weblog: 0,
            QA: 0,
            Doc: 0,
            Undefined: 0,
        },
        textTypesWC: {
            Formal: 0,
            Informal: 0,
            Hybrid: 0,
            Unk: 0,
        }
    }

    if (!fs.existsSync(cachePath) || Date.now() - fs.statSync(cachePath).mtime > 3600) {
        files = fs.readdirSync(statsPath).filter(fn => fn.endsWith('.json'))

        for (const file of files) {
            const stats = JSON.parse(fs.readFileSync(statsPath + "/" + file))
            let row = `<tr>`
            row += `<th><a target="blank" href="/TLPC/details/${file.split("-").at(0)}">${file.split("-").at(0)}</a></th>`
            row += `<td>${stats.documents}</td>`
            row += `<td>${stats.oldestArticle ? new Date(stats.oldestArticle).toLocaleDateString("fa-IR") : "null"}</td>`
            row += `<td>${stats.newestArticle ? new Date(stats.newestArticle).toLocaleDateString("fa-IR") : "null"}</td>`
            row += `<td>${stats.totalWordCount}</td>`

            totalDocs += stats.documents
            totalWC += stats.totalWordCount
            totalURLs += stats.urls
            const newestArticle = new Date(stats.newestArticle)
            if (stats.newestArticle && (!latestDoc || latestDoc < newestArticle && newestArticle < new Date()))
                latestDoc = newestArticle

            const rowTextTypes = {
                Formal: 0,
                Informal: 0,
                Hybrid: 0,
                Unk: 0
            }
            const rowCats = {
                News: 0,
                Literature: 0,
                Forum: 0,
                Weblog: 0,
                QA: 0,
                Doc: 0,
                Undefined: 0,
            }

            for (const catName of Object.keys(stats.categories)) {
                const catNameParts = catName.split(".")
                if (rowTextTypes[catNameParts.at(0)] != undefined)
                    rowTextTypes[catNameParts.at(0)] += stats.categories[catName].totalWC
                else
                    rowTextTypes['Unk'] += stats.categories[catName].totalWC

                if (catNameParts.length > 1 && rowCats[catNameParts.at(1)] !== undefined)
                    rowCats[catNameParts.at(1)] += stats.categories[catName].totalWC
                else
                    rowCats['Undefined'] += stats.categories[catName].totalWC
            }
            Object.keys(rowCats).forEach(cat => (row += `<td>${rowCats[cat]}</td>`, overallStats.majorCatsWC[cat] += rowCats[cat]));
            Object.keys(rowTextTypes).forEach(type => overallStats.textTypesWC[type] += rowTextTypes[type])
            row += '</tr>'
            rows.push(row)
        }
        const commercialFiles = fs.readdirSync(approvedCommercial).sort((a, b) => parseInt(a.split("-").at(0)) - parseInt(a.split("-").at(0)))
        commercialFiles.forEach(logo => approved.commercial.push(`<div class="approved-logo"><img src="/TLPC/approved/commercial/${logo}" alt="${logo.split("-")[1].split(".")[0]}"></div>`))
        const nonComFiles = fs.readdirSync(approvedNonCommercial).sort((a, b) => parseInt(a.split("-").at(0)) - parseInt(a.split("-").at(0)))
        nonComFiles.forEach(logo => approved.nonCommercial.push(`<div class="approved-logo"><a target="_blank" href="https://huggingface.co/${logo.split(".")[0]}"><img class="avatar" src="/TLPC/approved/non-commercial/${logo}" alt="${logo.split(".")[0]}"></a></div>`))
        const failed = fs.readFileSync(approval + "/failed.csv",  { encoding: 'utf8', flag: 'r' }).trim().split("\n")

        const rsaKey = new NodeRSA({ b: 512 });
        fs.writeFileSync(cachePath, JSON.stringify({
            rsa: {
                public: rsaKey.exportKey('pkcs8-public-pem'),
                private: rsaKey.exportKey('pkcs8-private-pem')
            },
            info: {
                latestDoc,
                totalDocs,
                totalWC,
                totalURLs,
                totalURLs,
                domainCount: files.length
            },
            rows: rows.join("\n"),
            approval: {commercial: approved.commercial.join("\n"), nonCommercial: approved.nonCommercial.join("\n"), failed: failed.join(", ") },
            overallStats
        }))

    }

    const cached = loadCachedInfo()

    res.render('index', {
        rows: cached.rows,
        approval: cached.approval,
        latestDoc: cached.info.latestDoc?.toLocaleDateString("fa-IR", { year: 'numeric', month: 'long', day: 'numeric' }),
        totalDocs: Math.floor(cached.info.totalDocs / 1e6),
        totalWC: Math.floor(cached.info.totalWC / 1e9),
        totalURLs: Math.floor(cached.info.totalURLs / 1e6),
        domainCount: cached.info.domainCount,
        overallStats: JSON.stringify(cached.overallStats)
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});