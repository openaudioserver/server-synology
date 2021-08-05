module.exports = (library, req, res) => {
  if (req.postData.action === 'getNumberOfPlugins') {
    return res.end('{"hasPlugIn" : 0, "success" : true }')
  }
}
