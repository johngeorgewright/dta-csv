#!/usr/bin/env node
const pkg = require('../package.json')
const {resolve: resolvePath} = require('path')
const Downloader = require('../')
const mkdirp = require('mkdirp-promise')

const argv = require('yargs')
  .version(pkg.version)

  .string('csv-path')
  .describe('csv-path', 'An absolute path to the CSV')

  .string('filename-format')
  .describe('filename-format', 'Use the CSV headers to create a local filename format')

  .string('url-format')
  .describe('url-format', 'Use the CSV headers to format a download URL')

  .string('download-dir')
  .default('download-dir', resolvePath(__dirname, '..', 'downloads'))
  .describe('download-dir', 'The absolute path to put all the downloaded files')

  .number('start-index')
  .default('start-index', 0)
  .describe('start-index', 'What line of the CSV to start reading from (excluding the header)')

  .number('end-index')
  .default('end-index', Infinity)
  .describe('end-index', 'What line of the CSV to finish reading at (excluding the header)')

  .number('batch-size')
  .default('batch-size', 10)
  .describe('batch-size', 'How many files to download at one time')

  .number('retry-num')
  .default('retry-num', 5)
  .describe('retry-num', 'How many time to retry a download if it failed')

  .example('download --csv-path=$(pwd)/config/BBCSoundEffects.csv --filename-format="<%=CDNumber%>.<%=tracknum%>.<%=description%>.<%=location%>" --url-format="http://bbcsfx.acropolis.org.uk/assets/<%=location%>"', 'Given that the first line of the CSV is "CDNumber,tracknum,description,location"')

  .demandOption(['csv-path', 'filename-format', 'url-format'])
  .wrap(null)
  .argv

const downloader = new Downloader({
  csvPath: argv['csv-path'],
  downloadPath: argv['download-dir'],
  startIndex: argv['start-index'],
  endIndex: argv['end-index'],
  batchSize: argv['batch-size'],
  retryNum: argv['retry-num'],
  filenameFormat: argv['filename-format'],
  urlFormat: argv['url-format']
})

mkdirp(argv['download-dir'])
  .then(() => downloader.run())
  .then(() => console.log('finished'))
  .catch(() => {})

console.log(argv)
