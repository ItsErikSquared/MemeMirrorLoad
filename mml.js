const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const http = require('http')
const https = require('https')

var privateKey = fs.readFileSync('./server.key')
var certificate = fs.readFileSync('./server.cert')

var count = 0

function updateStats () {
  fs.readdir('./memes/', (err, files) => {
    if (err) console.error(err)
    count = Math.floor(files.length / 2) - 1
    console.log(`[MML] Count Updated to ${count}`)
  })
}

console.log('MemeMirrorLoad 1.0\n------------------------\nBy ItsErikSquared and Powered by MemeLoad')

app.get('/*', (req, res, next) => {
  updateStats()
  next()
  console.log(`[Connection] ${new Date().toUTCString()} ${req.ip} -> ${req.url}`)
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/img/:id.png', (req, res) => {
  fs.exists(`./memes/${req.params.id}.png`, (exists) => {
    if (exists) {
      res.header('Content-Type: image/png')
      res.end(fs.readFileSync(`./memes/${req.params.id}.png`), 'binary')
    } else {
      res.json({
        'powered_by': 'Memeload',
        'error': 'Path not found.'
      })
    }
  })
})

app.get('/img-full/:id.png', (req, res) => {
  fs.exists(`./memes/${req.params.id}.png`, (exists) => {
    if (exists) {
      res.header('Content-Type: image/png')
      res.end(fs.readFileSync(`./memes/${req.params.id}.full.png`), 'binary')
    } else {
      res.json({
        'powered_by': 'Memeload',
        'error': 'Path not found.'
      })
    }
  })
})

app.get('/v1/get/:id', (req, res) => {
  fs.exists(`./memes/${req.params.id}.png`, (exists) => {
    if (exists) {
      var output = JSON.parse(fs.readFileSync(`./memes/${req.params.id}.json`))
      output.data.image = `https://memeload.itserikmc.com/img/${req.params.id}.png`
      output.powered_by = 'MemeMirrorLoad'
      res.json(output)
    } else {
      res.json({
        'powered_by': 'MemeMirrorLoad',
        'error': 'The meme requested was not found.'
      })
    }
  })
})

app.get('/v1/new', (req, res) => {
  fs.exists(`./memes/${count}.png`, (exists) => {
    if (exists) {
      var output = JSON.parse(fs.readFileSync(`./memes/${count}.json`))
      output.data.image = `https://memeload.itserikmc.com/img/${count}.png`
      output.powered_by = 'MemeMirrorLoad'
      res.json(output)
    } else {
      res.json({
        'powered_by': 'MemeMirrorLoad',
        'error': 'The meme requested was not found.'
      })
    }
  })
})

app.get('/v1/random', (req, res) => {
  var id = Math.floor(Math.random() * count) + 1
  var output = JSON.parse(fs.readFileSync(`./memes/${id}.json`))
  output.data.image = `https://memeload.itserikmc.com/img/${id}.png`
  output.powered_by = 'MemeMirrorLoad'
  res.json(output)
})

app.get('/v1/stats', (req, res) => {
  res.json({
    'meme_count': count,
    'powered_by': 'MemeMirrorLoad'
  })
})

var httpServer = http.createServer(app)
var httpsServer = https.createServer({
  key: privateKey,
  cert: certificate
}, app)

httpServer.listen(80)
httpsServer.listen(443)
