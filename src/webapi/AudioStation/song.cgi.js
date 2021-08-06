module.exports = async (library, req, res) => {
  let response
  switch (req.postData.method) {
    case 'list':
      response = await listSongs(library, req.postData)
      break
    case 'setrating':
      response = await setRating(library, req.postData)
      break
  }
  if (response) {
    return res.end(JSON.stringify(response))
  }
  res.statusCode = 404
  return res.end('{ "success": false }')
}

async function listSongs (library, options) {
  return library.getObjects(library.albums, options)
}

async function setRating (library, options) {
  const songids = options.id.split(',')
  for (const songid of songids) {
    const song = library.media.filter(song => song.id === songid)[0]
    song.additional.song_rating.rating = parseInt(options.rating, 10)
  }
  await library.rewriteRatings()
  return listSongs(options)
}
