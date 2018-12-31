const request = require('request')
const fs = require('fs')
var count = 0
var lastdl = 0
var running = true

console.log('MemeDownLoad 1.0\n------------------------\nBy ItsErikSquared and Powered by MemeLoad')

request("https://api.memeload.us/v1/stats", {
    json: true
}, (error, response, body) => {
    count = body.meme_count
    console.log(`[MDL] Downloading ${count} memes`)

    fs.exists("./memes", (exists) => {
        if (!exists)
            fs.mkdir('./memes')
    })

    download(1)
    downloadJson(1)
})

setInterval(async () => {
    request("https://api.memeload.us/v1/stats", {
        json: true
    }, (error, response, body) => {
        if (count != body.meme_count && !running) {
            count = body.meme_count
            console.log(`[UPDATE] Count Updated to ${count}`)
            download(lastdl)
        }
    })
}, 30000)

function download(i, loop = true) {
    verify(i - 1)
    running = true
    lastdl = i
    fs.exists(`./memes/${i}.png`, (exists) => {
        if (!exists) {
            console.log(`[MDL] Downloading #${i} of ${count} (${((i/count) * 100).toFixed(3)}%)`)
            request(`https://cdn.memeload.us/img/${i}.png`).pipe(fs.createWriteStream(`./memes/${i}.png`)).on('finish', () => {
                downloadJson(i, loop)
            })
        } else {
            console.log(`[MDL] Meme #${i} exists, skipping`)
            downloadJson(i, loop)
        }
    })
}

function downloadJson(i, loop = true) {
    if (i > count) {
        console.log('[MDL/J] Main Download Completed')
        running = false
        return
    }
    fs.exists(`./memes/${i}.json`, (exists) => {
        if (!exists) {
            console.log(`[MDLJ] Downloading #${i} of ${count} (${((i/count) * 100).toFixed(3)}%)`)
            request(`https://api.memeload.us/v1/get/${i}`).pipe(fs.createWriteStream(`./memes/${i}.json`)).on('finish', () => {
                if(loop)
                download(++i)
            })
        } else {
            console.log(`[MDLJ] Meme #${i} exists, skipping`)
            if(loop)
            download(++i)
        }
    })
}

function verify(i) {
    if(i == 0) return
    console.log(`[MDV] Verifying ${i}`)
    if (fs.statSync(`./memes/${i}.png`).size == 0) {
        download(i, false)
    }
    if (fs.statSync(`./memes/${i}.json`).size == 0) {
        downloadJson(i, false)
    }
}