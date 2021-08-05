const queryCGI = JSON.stringify(require('./query.cgi.json'))

module.exports = (library, req, res) => {
  if (req.postData.query === 'all' && req.postData.api === 'SYNO.API.Info' && req.postData.method === 'query' && req.postData.version === '1') {
    return res.end(queryCGI)
  }
}
