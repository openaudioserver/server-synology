const fs = require('fs')
const path = require('path')
const entryCGI1 = fs.readFileSync(path.join(__dirname, 'entry.cgi.1.js')).toString()
const entryCGI2 = fs.readFileSync(path.join(__dirname, 'entry.cgi.2.js')).toString()
const entryCGI3 = fs.readFileSync(path.join(__dirname, 'entry.cgi.3.js')).toString()
const entryCGI4 = fs.readFileSync(path.join(__dirname, 'entry.cgi.4.js')).toString()
const entryCGI5 = JSON.stringify(require('./entry.cgi.5.json'))

module.exports = (library, req, res) => {
  if (req.queryData.method === 'getjs') {
    res.setHeader('content-type', 'application/javascript; charset="UTF-8"')
  }
  if (req.queryData.api === 'SYNO.Core.Desktop.Defs' && req.queryData.method === 'getjs') {
    return res.end(entryCGI1)
  } else if (req.queryData.api === 'SYNO.Core.Desktop.JSUIString' && req.queryData.method === 'getjs') {
    return res.end(entryCGI2)
  } else if (req.queryData.api === 'SYNO.Core.Desktop.SessionData' && req.queryData.method === 'getjs') {
    return res.end(entryCGI3.replace('SESSIONID', `${process.env.SYNOLOGY_SESSION_ID || 'p0KZoueC'}.${process.env.SYNOLOGY_SERIAL_NUMBER || 'MEqA1130LWN011720'}`))
  } else if (req.queryData.api === 'SYNO.Core.Desktop.UIString' && req.queryData.method === 'getjs') {
    return res.end(entryCGI4)
  } else if (req.postData.api === 'SYNO.Core.Desktop.Initdata' && req.postData.launch_app === '"SYNO.SDS.AudioStation.Application"') {
    return res.end(entryCGI5.replace('SERIAL', process.env.SYNOLOGY_SERIAL_NUMBER).replace('SESSIONID', `${process.env.SYNOLOGY_SESSION_ID || 'p0KZoueC'}.${process.env.SYNOLOGY_SERIAL_NUMBER || 'MEqA1130LWN011720'}`))
  } else if (req.postData.api === 'SYNO.Core.Desktop.Initdata' && req.postData.action === '"external_ip"') {
    return res.end('{ "data": { "external_ip": "0.0.0.0" }, "success": true }')
  } else if (req.postData.api === 'SYNO.Core.Desktop.Timeout') {
    return res.end('{ "data": { "timeout": 15 }, "success": true }')
  } else if (req.postData.api === 'SYNO.FileStation.BackgroundTask' && req.postData.method === 'list') {
    return res.end('{ "data": { "offset": 0, "tasks": [], "total": 0 }, "success": true }')
  } else if (req.postData.api === 'SYNO.Core.DataCollect.Application' && req.postData.app === '"SYNO.SDS.AudioStation.AppWindow"') {
    return res.end('{ "success": true }')
  } else if (req.postData.api === 'SYNO.Core.UserSettings' && req.postData.method === 'apply') {
    return res.end('{ "success": true }')
  } else if (req.postData.api === 'SYNO.Entry.Request' && req.postData.mode === '"parallel"') {
    return res.end('{ "data": { "has_fail": false, "result": [{ "api": "SYNO.Core.Desktop.Timeout", "method": "check", "success": true, "version": 1 }] }, "success": true }')
  }
  // AudioStation pinning and playlists routes through this URL
  if (req.postData.api === 'SYNO.AudioStation.Pin') {
    const pinList = require('../webapi/AudioStation/pinlist.js')
    return pinList(library, req, res)
  } else if (req.postData.api === 'SYNO.AudioStation.Browse.Playlist') {
    const playList = require('../webapi/AudioStation/playlist.cgi.js')
    return playList(library, req, res)
  }
  console.log('unsupported ending', req.url)
  res.end()
}
