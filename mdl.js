const request = require('request')
const fs = require('fs')
var count = 0
var lastdl = 1
var running = false

var api = 'https://api.memeload.us/v1/'
var cdn = 'https://cdn.memeload.us/'

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('SIGINT', () => {
  rl.question('[MDL] Are you sure you want to exit? ', (answer) => {
    if (answer.match(/^y(es)?$/i)) {
      console.log('[MDL] One moment while we stop your download...')
      clearInterval(updater)
      count = lastdl + 1
      rl.pause()
    }
  })
})

console.log('MemeDownLoad 1.0\n------------------------\nBy ItsErikSquared and Powered by MemeLoad')
console.log('\n\nTo kill, just press CTRL+C and type `y(es)`.')

fs.exists('./memes', async (exists) => {
  if (!exists) {
    await new Promise((resolve) => fs.mkdir('./memes', resolve))
    console.log('[Files] Folder `./memes` created.')
  }
})

var updater = setInterval(updateCount, 30000)
updateCount()

async function massDownload () {
  if (!running) {
    running = true
    console.log('[MDL] Download started')
    for (var i = lastdl; i < count; i++) {
//       await download(`${api}get/${i}`, `${i}.json`) (Disabled Because 500 Error)
      await download(`${cdn}image?id=${i}`, `${i}.png`)
//       await download(`${cdn}img-full/${i}.png`, `${i}.full.png`) (No Longer A Item)
      console.log(`[%] ${i} of ${count} downloaded (${((i / count) * 100).toFixed(3)}%)`)
      lastdl = i
    }
    console.log('[MDL] Download completed')
    running = false
  }
}

function download (from, to) {
  return new Promise((resolve) => {
    fs.exists(`./memes/${to}`, async (exists) => {
      if (exists) {
        console.log(`[Files] ${to} already exists, skipping`)
        resolve()
      } else {
        request(`${from}`).pipe(fs.createWriteStream(`./memes/${to}`)).on('finish', resolve)
        console.log(`[Files] ${from} downloaded to ${to}`)
      }
    })
  })
}

function updateCount () {
  request(`${api}stats`, {
    json: true
  }, (error, response, body) => {
    if (error) console.error(error)
    count = body.meme_count
    console.log(`[Update] Count set to ${count}`)
    massDownload()
  })
}
