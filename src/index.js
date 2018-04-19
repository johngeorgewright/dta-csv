const csv = require('javascript-csv')
const {createWriteStream, readFileSync} = require('fs')
const {join: joinPath} = require('path')
const request = require('request')
const {parallelLimit, retry} = require('async')
const template = require('lodash.template')

const createDownload = (url, filename) => (callback) => {
  request(url)
    .on('error', callback)
    .pipe(createWriteStream(filename).on('error', callback))
    .on('finish', callback)
}

class Downloader {
  constructor ({
    csvPath,
    downloadPath,
    startIndex = 0,
    endIndex = Infinity,
    batchSize = 10,
    retryNum = 5,
    filenameFormat,
    urlFormat
  } = {}) {
    this.downloadPath = downloadPath
    this.startIndex = startIndex
    this.batchSize = batchSize
    this.retryNum = retryNum
    this.filenameTemplate = template(filenameFormat)
    this.urlTemplate = template(urlFormat)
    this.data = csv.toArrays(readFileSync(csvPath).toString())
    this.endIndex = endIndex
    this.headers = this.data.shift()
    this.createDownload = this.createDownload.bind(this)
  }

  createDownload (data, index) {
    return (callback) => {
      const line = data.reduce(
        (line, val, index) => ({
          ...line,
          [this.headers[index]]: val
        }),
        {}
      )

      const url = this.urlTemplate(line)
      const filename = joinPath(this.downloadPath, this.filenameTemplate(line))

      console.log(`downloading ${url}`)

      retry(this.retryNum, createDownload(url, filename), err => {
        if (err) {
          console.log(`Failed to download ${url}`)
          console.log(`Continue from index ${this.startIndex + index}`)
        }

        callback(err)
      })
    }
  }

  run () {
    return new Promise((resolve, reject) => {
      parallelLimit(
        this.data.slice(this.startIndex, this.endIndex).map(this.createDownload),
        this.batchSize,
        (err) => err ? reject(err) : resolve()
      )
    })
  }
}

module.exports = Downloader
