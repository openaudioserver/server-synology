const queryCGI = JSON.stringify(require('./query.cgi.json'))

module.exports = (library, req, res) => {
  return res.end(queryCGI)
}
