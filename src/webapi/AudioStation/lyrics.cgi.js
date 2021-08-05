module.exports = async (library, req, res) => {
  const response = await list(library)
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

async function list (library) {
  const response = {
    data: {
      lyrics: ''
    },
    success: true
  }
  return response
}
