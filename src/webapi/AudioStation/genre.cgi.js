const fs = require('fs')
const path = require('path')
const existsCache = {}

module.exports = async (library, req, res) => {
  let response
  switch (req.postData.method) {
    case 'list':
      response = await listGenres(library, req.postData)
      break
    case 'list_default_genre':
      response = await listDefaultGenres(library)
      break
  }
  if (response) {
    return res.end(JSON.stringify(response))
  }
  res.statusCode = 404
  return res.end('{ "success": false }')
}

async function listGenres (library, options) {
  const response = await library.getObjects(library.genres, {
    sortBy: options.sort_by,
    sortDirection: options.sort_direction,
    offset: options.offset,
    limit: options.limit
  })
  return response
}

async function listDefaultGenres (library) {
  const response = {
    data: {
      default_genres: []
    },
    success: true
  }
  if (library.genres) {
    for (const genre of library.genres) {
      const imagePath = path.join(process.env.SYNOMAN_PATH, `/webman/3rdparty/AudioStation/images/_2x/cover_${genre.name.toLowerCase()}.png`)
      const exists = existsCache[imagePath] = existsCache[imagePath] || fs.existsSync(imagePath)
      if (exists) {
        response.data.default_genres.push(genre)
      }
    }
  }
  return response
}
