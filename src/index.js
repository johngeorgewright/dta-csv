const csv = require('javascript-csv')
const {createWriteStream, readFileSync} = require('fs')
const {join: joinPath, resolve: resolvePath} = require('path')
const request = require('request')
const {parallelLimit, retry} = require('async')
const template = require('lodash.template')

// TODO: retrieve from CLI args
const CSV_PATH = resolvePath(__dirname, '..', 'config', 'BBCSoundEffects.csv')
const DOWNLOAD_PATH = resolvePath(__dirname, '..', 'downloads')
const START_INDEX = 1120
const BATCH_SIZE = 10
const RETRY_NUM = 5
const FILENAME_FORMAT = '<%=CDNumber%>.<%=tracknum%>.<%=description%>.<%=location%>'
const URL_FORMAT = 'http://bbcsfx.acropolis.org.uk/assets/<%=location%>'

const filenameTemplate = template(FILENAME_FORMAT)
const urlTemplate = template(URL_FORMAT)
const data = csv.toArrays(readFileSync(CSV_PATH).toString())
const headers = data.shift()

const createDownloadStream = (url, filename) => (callback) => {
  request(url)
    .on('error', callback)
    .pipe(createWriteStream(filename).on('error', callback))
    .on('finish', callback)
}

const createDownload = (data, index) => (callback) => {
  const line = data.reduce(
    (line, val, index) => ({
      ...line,
      [headers[index]]: val
    }),
    {}
  )

  const url = urlTemplate(line)
  const filename = joinPath(DOWNLOAD_PATH, filenameTemplate(line))

  console.log(`downloading ${url}`)

  retry(RETRY_NUM, createDownloadStream(url, filename), err => {
    if (err) {
      console.log(`Failed to download ${url}`)
      console.log(`Continue from index ${START_INDEX + index}`)
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
