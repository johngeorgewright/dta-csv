const {resolve: resolvePath} = require('path')
const Downloader = require('../')

const downloader = new Downloader({
  csvPath: resolvePath(__dirname, '..', 'config', 'BBCSoundEffects.csv'),
  downloadPath: resolvePath(__dirname, '..', 'downloads'),
  startIndex: 1498,
  filenameFormat: '<%=CDNumber%>.<%=tracknum%>.<%=description%>.<%=location%>',
  urlFormat: 'http://bbcsfx.acropolis.org.uk/assets/<%=location%>'
})

;(async () => {
  try {
    await downloader.run()
    console.log('finished')
  } catch (error) {}
})()
