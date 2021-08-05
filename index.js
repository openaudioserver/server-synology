const fs = require('fs')
const path = require('path')
const util = require('util')
const existsCache = {}
const bufferCache = {}
const modulePath = __dirname

const existsAsync = util.promisify((filePath, callback) => {
  try {
    const stat = fs.statSync(filePath)
    return callback(null, stat.isFile())
  } catch (error) {
    return callback(null, false)
  }
})

module.exports = {
  wantsRequest: async (library, req) => {
    const homePath = req.urlPath === '/dsaudio'
    if (homePath) {
      req.homePath = true
      return true
    }
    const sourcePath = path.join(modulePath, 'src', `${req.urlPath}.js`)
    const sourcePathExists = existsCache[sourcePath] = existsCache[sourcePath] || await existsAsync(sourcePath)
    if (sourcePathExists) {
      req.sourcePath = sourcePath
      return true
    }
    const synomanPath = path.join(process.env.SYNOMAN_PATH, req.urlPath)
    const synomanExists = existsCache[synomanPath] = existsCache[synomanPath] || await existsAsync(synomanPath)
    if (synomanExists) {
      req.synomanPath = synomanPath
      return true
    }
    return false
  },
  handleRequest: async (library, req, res) => {
    res.statusCode = 200
    if (!req.headers.cookie || req.headers.cookie.indexOf('smid=') === -1) {
      res.setHeader('set-cookie', `smid=${process.env.SYNOLOGY_SMID || 'E9GRXinHCOWZrGINa_VJPiuzMjMWLwkXyJCJT8z_pZ7KZ8Jf7vdLq9vxSf4zpJ7lQAWaO6WOHOZYkVfAnziPPg'}; stay_login=1; id=${process.env.SYNOLOGY_SESSION_ID || 'p0KZoueC'}.${process.env.SYNOLOGY_SERIAL_NUMBER || 'MEqA1130LWN011720'}`)
    }
    if (req.urlPath !== '/webapi/AudioStation/cover.cgi') {
      if (req.urlPath.endsWith('.cgi') || req.urlPath.endsWith('.js')) {
        res.setHeader('content-type', 'application/javascript')
      } else if (req.urlPath.endsWith('.css')) {
        res.setHeader('content-type', 'text/css')
      } else if (req.urlPath.endsWith('.png')) {
        res.setHeader('content-type', 'image/png')
      } else if (req.urlPath.endsWith('.jpg') || req.urlPath.endsWith('.jpeg')) {
        res.setHeader('content-type', 'image/jpeg')
      }
    }
    if (req.sourcePath) {
      try {
        await executeRoute(library, req, res, req.sourcePath)
        return
      } catch (error) {
        console.log('[synology]', req.urlPath, error)
        res.statusCode = 500
        return res.end()
      }
    }
    if (req.homePath) {
      return serveStaticFile(req, res, process.env.DSAUDIO_HTML_PATH)
    }
    if (req.synomanPath) {
      return serveStaticFile(req, res, req.synomanPath)
    }
    res.statusCode = 404
    return res.end()
  }
}

async function serveStaticFile (req, res, filePath) {
  let buffer = bufferCache[filePath] = bufferCache[filePath] || fs.readFileSync(filePath)
  if (req.urlPath === process.env.DSAUDIO_HTML_PATH && process.env.DSAUDIO_THEME_PATH) {
    const themeFilePath = process.env.THEME_PATH
    const themeFilePathExists = existsCache[themeFilePath] = existsCache[themeFilePath] || fs.existsSync(themeFilePath)
    if (themeFilePathExists) {
      const newCSS = fs.readFileSync(process.env.THEME_PATH).toString()
      if (newCSS && newCSS.length) {
        const newHTML = buffer.toString().replace('</head>', `<style>${newCSS}</style></head>`)
        buffer = Buffer.from(newHTML)
      }
    }
  }
  return res.end(buffer)
}

async function executeRoute (library, req, res, filePath) {
  try {
    const sourceFile = require(filePath)
    return sourceFile(library, req, res)
  } catch (error) {
    res.statusCode = 500
    return res.end()
  }
}
