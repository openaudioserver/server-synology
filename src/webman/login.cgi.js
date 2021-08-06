module.exports = (library, req, res) => {
  return res.end(`{ "SynoToken": "${global.TOKEN}", "result": "success", "success": true }`)
}
