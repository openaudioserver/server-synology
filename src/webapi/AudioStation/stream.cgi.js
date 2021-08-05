const fs = require('fs')

module.exports = {
  streamFile,
  transcodeMP3,
  httpRequest: async (library, _, res, _2, queryData) => {
    let response
    switch (queryData.method) {
      case 'stream':
        response = await streamFile(library, queryData)
        break
      case 'transcode':
        response = await transcodeMP3(library, queryData)
        break
    }
    if (response.buffer) {
      res.writeHead(206, {
        'content-type': response.contentType,
        'content-length': response.buffer.length
      })
      return res.end(response.buffer)
    }
    res.statusCode = 404
    return res.end('{ "success": false }')
  }
}

async function transcodeMP3 (library, options) {
  return streamFile(options)
}

async function streamFile (library, options) {
  const song = library.media.filter(song => song.id === options.id)[0]
  const contentType = song.path.endsWith('.flac') ? 'audio/flac' : 'audio/mpeg'
  const buffer = fs.readFileSync(song.path)
  return { buffer, contentType }
}
