module.exports = async (library, req, res) => {
  let response
  switch (req.postData.method) {
    case 'list':
      response = await listArtists(library, req.postData)
      break
  }
  if (response) {
    return res.end(JSON.stringify(response))
  }
  res.statusCode = 404
  return res.end('{ "success": false }')
}

async function listArtists (library, options) {
  const category = library.creditCategories.filter(category => category.name === 'artist')[0]
  const artists = library.credits.filter(credit => credit.categories.indexOf(category.id) > -1)
  return library.getObjects(artists, {
    options
  })
}
