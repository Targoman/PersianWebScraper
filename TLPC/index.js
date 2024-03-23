const express = require('express');
const fs = require('fs')

const app = express();
const port = 3000
const cachePath = './data.table'
const statsPath = "../jsonl"

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/details/:domain', (req, res) => {
    res.render('details', { title: req.params.domain, json: fs.readFileSync(statsPath + "/" + req.params.domain + "-stats.json") });
})

app.get('/', (req, res) => {
    let totalWC = 0
    let totalDocs = 0
    let totalURLs = 0
    let latestDoc = undefined
    let files = []
    const rows = []
    if (!fs.existsSync(cachePath) || Date.now() - fs.statSync(cachePath).mtime > 3600) {
        files = fs.readdirSync(statsPath).filter(fn => fn.endsWith('.json'))

        for (const file of files) {
            const stats = JSON.parse(fs.readFileSync(statsPath + "/" + file))
            let row = `<tr>`
            row += `<th><a target="blank" href="/details/${file.split("-").at(0)}">${file.split("-").at(0)}</a></th>`
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

            const rowCats = {
                News: 0,
                Literature: 0,
                Forum: 0,
                Weblog: 0,
                QA: 0,
                Doc: 0,
                Undefined: 0,
                NA: 0
            }

            for (const catName of Object.keys(stats.categories)) {
                const major = catName.split(".").at(0)
                if (major === "News") rowCats.News += stats.categories[catName].totalWC
                if (major === "Literature") rowCats.Literature += stats.categories[catName].totalWC
                if (major === "Forum") rowCats.Forum += stats.categories[catName].totalWC
                if (major === "Weblog") rowCats.Weblog += stats.categories[catName].totalWC
                if (major === "QA") rowCats.QA += stats.categories[catName].totalWC
                if (major === "Doc") rowCats.Doc += stats.categories[catName].totalWC
                if (major === "Undefined") rowCats.Undefined += stats.categories[catName].totalWC
                if (major === "NA") rowCats.NA += stats.categories[catName].totalWC
            }
            row += `<td>${rowCats.News}</td>`
            row += `<td>${rowCats.Literature}</td>`
            row += `<td>${rowCats.Forum}</td>`
            row += `<td>${rowCats.Weblog}</td>`
            row += `<td>${rowCats.QA}</td>`
            row += `<td>${rowCats.Doc}</td>`
            row += `<td>${rowCats.Undefined}</td>`
            row += `<td>${rowCats.NA}</td>`
            row += '</tr>'
            rows.push(row)
        }
        fs.writeFileSync(cachePath, rows.join("\n"))
    }

    res.render('index', {
        rows: fs.readFileSync(cachePath),
        latestDoc: latestDoc.toLocaleDateString("fa-IR", { year: 'numeric', month: 'long', day: 'numeric' }),
        totalDocs: Math.floor(totalDocs / 1e6),
        totalWC: Math.floor(totalWC / 1e9),
        totalURLs: Math.floor(totalURLs / 1e6),
        domainCount: files.length
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});