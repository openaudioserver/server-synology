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
  const result = await library.getObjects(library.tracks, options)
  const response = {
    data: {
      songs: result.data || [],
      offset: result.offset || 0,
      limit: result.limit || 1000,
      total: result.total || 0
    },
    success: true
  }
  for (const song of response.data.songs) {
    song.type = 'file'
    song.additional = {
      song_audio: {
        bitrate: song.bitrate,
        channel: song.numberOfChannels,
        codec: song.codecProfile,
        container: song.container,
        duration: song.duration,
        filesize: song.size,
        frequency: song.sampleRate
      },
      song_rating: {
        rating: 0
      },
      song_tag: {
        artist: song.artist || '',
        album: song.album || '',
        album_artist: song.albumartist || song.artist || '',
        title: song.title || '',
        composers: song.composers || [],
        genre: song.genres || [],
        artists: song.artists || [],
        disc: song.disc || 0,
        track: song.track || 0,
        year: song.year || 0
      }
    }
  }
  return response
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
