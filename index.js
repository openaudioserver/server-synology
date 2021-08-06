global.SMID = 'E9GRXinHCOWZrGINa_VJPiuzMjMWLwkXyJCJT8z_pZ7KZ8Jf7vdLq9vxSf4zpJ7lQAWaO6WOHOZYkVfAnziPPg'
global.ID = 'p0KZoueC'
global.SERIAL = 'MEqA1130LWN011720'
global.TOKEN = 'rpTd8mTtIbqJA'

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
    if (!req.headers.cookie || req.headers.cookie.indexOf('id') === -1) {
      res.setHeader('set-cookie', `id=${global.ID}.${global.SERIAL}; same-site: none; secure; path=/;`)
    } else if (!req.headers.cookie || req.headers.cookie.indexOf('smid') === -1) {
      res.setHeader('set-cookie', `smid=${global.SMID}; same-site: none; secure; path=/;`)
    }
    res.statusCode = 200
    if (req.urlPath.indexOf('.cgi/') > -1) {
      req.urlPath = req.urlPath.substring(0, req.urlPath.indexOf('.cgi/') + '.cgi'.length)
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
    console.log('[synology]', 'error executing route', error)
    res.statusCode = 500
    return res.end()
  }
}

async function serveHomePage (req, res) {
  const css = [
    '/scripts/ext-3/resources/css/ext-all.css',
    '/scripts/ext-3/resources/css/xtheme-gray.css',
    '/scripts/ext-3/ux/ux-all.css',
    '/synoSDSjslib/sds.css',
    '/webman/resources/css/desktop.css',
    '/webman/modules/AHAManager/style.css',
    '/webman/modules/EzInternet/style.css',
    '/webman/modules/Share/style.css',
    '/webman/modules/SecurityScan/style.css',
    '/webman/modules/Utils/style.css',
    '/webman/modules/StorageManager/style.css',
    '/webman/modules/WelcomeApp/style.css',
    '/webman/modules/DiskMessageHandler/style.css',
    '/webman/modules/AudioPlayer/style.css',
    '/webman/modules/ThumbConvertProgress/style.css',
    '/webman/modules/FileBrowser/style.css',
    '/webman/modules/MyDSCenter/style.css',
    '/webman/modules/BandwidthControl/style.css',
    '/webman/modules/SystemInfoApp/style.css',
    '/webman/modules/iSCSI/style.css',
    '/webman/modules/SupportForm/style.css',
    '/webman/modules/Widgets/style.css',
    '/webman/modules/WelcomeTip/style.css',
    '/webman/modules/PkgManApp/style.css',
    '/webman/modules/HelpBrowser/style.css',
    '/webman/modules/ConfigBackup/style.css',
    '/webman/modules/ResourceMonitor/style.css',
    '/webman/modules/LogCenter/style.css',
    '/webman/modules/DataDrivenDocuments/style.css',
    '/webman/modules/TaskSchedulerUtils/style.css',
    '/webman/modules/DSMNotify/style.css',
    '/webman/modules/PollingTask/style.css',
    '/webman/modules/HotkeyManager/style.css',
    '/webman/modules/VideoPlayer2/style.css',
    '/webman/modules/ClipBoardJS/style.css',
    '/webman/modules/FileTaskMonitor/style.css',
    '/webman/modules/AviaryEditor/style.css',
    '/webman/modules/AdminCenter/style.css',
    '/webman/modules/PersonalSettings/style.css',
    '/webman/modules/ExternalDevices/style.css',
    '/webman/modules/PhotoViewer/style.css',
    '/webman/modules/C3/style.css',
    '/webman/modules/TaskSchedulerWidget/style.css',
    '/webman/3rdparty/OAuthService/style.css',
    '/webman/3rdparty/AudioStation/style.css',
    '/webman/3rdparty/SynoFinder/style.css'
  ]
  const js = [
    '/webapi/entry.cgi?api=SYNO.Core.Desktop.Defs&version=1&method=getjs',
    '/webapi/entry.cgi?api=SYNO.Core.Desktop.JSUIString&version=1&method=getjs&lang=enu',
    '/webapi/entry.cgi?api=SYNO.Core.Desktop.UIString&version=1&method=getjs&lang=enu',
    '/scripts/prototype-1.7.2/prototype.js',
    '/scripts/ext-3/adapter/ext/ext-base.js',
    '/scripts/ext-3/ext-all.js',
    '/scripts/ext-3/ux/ux-all.js',
    '/scripts/scrollbar/flexcroll.js',
    '/synoSDSjslib/sds.js',
    '/webman/desktop.js',
    '/webapi/entry.cgi?api=SYNO.Core.Desktop.SessionData&version=1&method=getjs',
    '/webman/security.cgi'
  ]
  const tags = []
  for (const file of css) {
    tags.push(`<link rel="stylesheet" href="${file}" />`)
  }
  for (const file of js) {
    tags.push(`<script src="${file}" />`)
  }
  return res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>Synology compatibility for Open Audio Server</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=11" />
    <meta name="msapplication-TileImage" content="resources/images/icon_tile.png" />
    <meta name="application-name" content="AudioStation" />
    <meta name="msapplication-TileColor" content="#246BB3" />
    <link rel="apple-touch-icon" href="webman/resources/images/icon_dsm_96.png" />
    <link rel="mask-icon"  color="#0086E5" href="webman/safari_pin_icon.svg" />
    <link rel="shortcut icon" href="webman/favicon.ico" />
    <link rel="shortcut icon" sizes="96x96" href="webman/resources/images/icon_dsm_96.png" />
    <link rel="shortcut icon" sizes="64x64" href="webman/resources/images/icon_dsm_64.png" />
    <link rel="shortcut icon" sizes="48x48" href="webman/resources/images/icon_dsm_48.png" />
    <link rel="shortcut icon" sizes="32x32" href="webman/resources/images/icon_dsm_32.png" />
    <link rel="shortcut icon" sizes="16x16" href="webman/resources/images/icon_dsm_16.png" />
    ${tags.join('\n')}
  </head>
  <body role="application"></body></html>`)
}
