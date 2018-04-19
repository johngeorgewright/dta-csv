const csv = require('javascript-csv')
const {createWriteStream, readFileSync} = require('fs')
const {join: joinPath, resolve: resolvePath} = require('path')
const request = require('request')
const mkdirp = require('mkdirp')
const {parallelLimit, retry} = require('async')

const BASE_URL = 'http://bbcsfx.acropolis.org.uk/assets/'
const CSV_PATH = resolvePath(__dirname, '..', 'config', 'BBCSoundEffects.csv')
const DOWNLOAD_PATH = resolvePath(__dirname, '..', 'downloads')
const START_INDEX = 240
const BATCH_SIZE = 10
const RETRY_NUM = 5

const data = csv.toArrays(readFileSync(CSV_PATH).toString())
const headers = data.shift()

const createDownloadStream = (url, filename) => (callback) => {
  request(url)
    .on('error', callback)
    .pipe(createWriteStream(filename).on('error', callback))
    .on('finish', callback)
}

const createDownload = ([location, description, secs, category, CDNumber, CDName, tracknum], index) => (callback) => {
  const url = BASE_URL + location
  const filename = joinPath(DOWNLOAD_PATH, `${CDNumber}.${tracknum}.${description}.${location}`)

  console.log(`downloading ${url}`)

  retry(RETRY_NUM, createDownloadStream(url, filename), err => {
    if (err) {
      console.log(`Failed to download ${url}`)
      console.log(`Continue from index ${index}`)
    }

    callback(err)
  })
}

parallelLimit(
  data.slice(START_INDEX).map(createDownload),
  BATCH_SIZE,
  (err) => {
    if (!err) {
      console.log('finished')
    }
  }
)
