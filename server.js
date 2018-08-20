const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const hashIds = require('hashids')

const fetch = require('isomorphic-fetch')

const server = express()
server.use(cors())
server.use(bodyParser.json())

// STORE DATA
const hash = new hashIds()
let index = 0
const data = []
const hashTable = {}

function GetKey() {
    let index = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    const key = `a${hash.encode(index)}`
    while (hashTable[key]) {
        index = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        key = `a${hash.encode(index)}`
    }
    return key
}

server.post('/', (req, res) => {
    const body = req.body
    if (!body.links.view && !body.links.edit) {
        const key = GetKey()
        hashTable[key] = index
        body.links.view = `https://easybracket.herokuapp.com/${index}`
        body.links.edit = `https://easybracket.herokuapp.com/Bracket/${key}`
        data[index] = body
        index++
    } else {
        const string = body.links.view.replace('https://easybracket.herokuapp.com/', '')
        const i = parseInt(string, 10)
        data[i] = body
    }
    res.send({
        view: body.links.view,
        edit: body.links.edit
    })
})

// VIEW
server.get(/\/[0-9]+$/, (req, res) => {
    const string = req.url.replace('/', '')
    const index = parseInt(string, 10)
    console.log(`Sending ${index}`)
    const d = data[index]
    const store = d ? {
        tournamentName: d.tournamentName,
        tournamentFormat: d.tournamentFormat,
        singleEliminationData: d.singleEliminationData,
        roundRobinData: d.roundRobinData,
        roundRobinScoreBoard: d.roundRobinScoreBoard
    } : { error: true }
    res.send(store)
})

// FETCH DATA
server.post(/\/[0-9a-z]+$/i, (req, res) => {
    const key = req.url.replace('/', '')
    const index = hashTable[key]
    const d = data[index]
    const store = d ? {
        tournamentName: d.tournamentName,
        tournamentFormat: d.tournamentFormat,
        teams: d.teams,
        isBracketUpToDate: d.isBracketUpToDate,
        singleEliminationData: d.tournamentFormat === 'Single Elimination' ? d.singleEliminationData : [],
        bestOfSingle: d.bestOfSingle,
        roundRobinData: d.roundRobinData,
        roundRobinScoreBoard: d.roundRobinScoreBoard,
        bestOfRoundRobin: d.bestOfRoundRobin,
        links: d.links
    } : { error: true }
    res.send(store)
})

// Write to the database every 20min

// Wake me up inside
server.get('/wake/me/up/inside', (req, res) => {
    res.send({
        wake:'me',
        up:'inside'
    })
})

setInterval(() => {
    fetch('https://ezbracketapi.herokuapp.com/wake/me/up/inside')
    .catch(() => console.log('gg'))
}, 1500000)

const PORT = process.env.PORT || 1337
server.listen(PORT)