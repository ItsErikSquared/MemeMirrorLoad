const request = require('request')
const fs = require('fs')
var count = 0
var lastdl = 0
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

fs.exists('./memes', (exists) => {
  if (!exists) {
    fs.mkdir('./memes')
    console.log('[Files] Folder `./memes` created.')
  }
})

// updateCount()
// var updater = setInterval(updateCount, 30000)
count = 10
massDownload()

async function massDownload () {
  if (!running) {
    running = true
    console.log('[MDL] Download Started')
    for (var i = 1; i < count; i++) {
      await download(`${api}get/${i}`, `${i}.json`)
      await download(`${cdn}img/${i}.png`, `${i}.png`)
      await download(`${cdn}img-full/${i}.png`, `${i}.full.png`)
    }
    console.log('[MDL] Download Completed')
  }
}

function download (from, to) {
  return new Promise((resolve) => {
    fs.exists(`./memes/${to}`, async (exists) => {
      if (exists) {
        console.log(`[Files] ${to} already exists, skipping`)
      } else {
        request(`${from}`).pipe(fs.createWriteStream(`./memes/${to}`)).on('finish', resolve())
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
  })
}
