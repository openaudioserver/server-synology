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
  const response = await library.getObjects(library.genres,
    {
      sortBy: options.sort_by,
      sortDirection: options.sort_direction,
      offset: options.offset,
      limit: options.limit
    })
  return response
}

async function listDefaultGenres (library) {
  return {
    data: {
      default_genres: [
        { name: 'Pop', title: 'Pop', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Rock', title: 'Rock', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Blues', title: 'Blues', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Dance', title: 'Dance', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'World', title: 'World', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Country', title: 'Country', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Rnb', title: 'Rnb', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Ballad', title: 'Ballad', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Soundtrack', title: 'Soundtrack', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Jazz', title: 'Jazz', genres: [], additional: { avg_rating: { rating: 0 } } },
        { name: 'Funk', title: 'Funk', genres: [], additional: { avg_rating: { rating: 0 } } }]
    },
    success: true
  }
}
