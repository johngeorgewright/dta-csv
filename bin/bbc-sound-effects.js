#!/usr/bin/env node
const {resolve: resolvePath} = require('path')
const Downloader = require('../')

const argv = require('yargs')
  .usage('Usage: $0 --start-index [num]')
  .argv

const downloader = new Downloader({
  csvPath: resolvePath(__dirname, '..', 'config', 'BBCSoundEffects.csv'),
  downloadPath: resolvePath(__dirname, '..', 'downloads'),
  startIndex: argv['start-index'] || 0,
  filenameFormat: '<%=CDNumber%>.<%=tracknum%>.<%=description%>.<%=location%>',
  urlFormat: 'http://bbcsfx.acropolis.org.uk/assets/<%=location%>'
})

downloader
  .run()
  .then(() => console.log('finished'))
  .catch(() => {})
