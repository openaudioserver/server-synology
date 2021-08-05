module.exports = async (library, req, res) => {
  let response
  switch (req.postData.method) {
    case 'getinfo':
      response = await getPlayList(library, req.postData)
      break
    case 'list':
      response = await listPlayLists(library, req.postData)
      break
    case 'create':
      response = await createNormalPlayList(library, req.postData)
      break
    case 'add_track':
      response = await addTrackToNormalPlayList(library, req.postData)
      break
    case 'createsmart':
      response = await createSmartPlayList(library, req.postData)
      break
    case 'updatesmart':
      response = await updateSmartPlayList(library, req.postData)
      break
    case 'rename':
      response = await renamePlayList(library, req.postData)
      break
    case 'delete':
      response = await deletePlaylist(library, req.postData)
      break
  }
  if (response) {
    return res.end(JSON.stringify(response))
  }
  res.statusCode = 404
  return res.end('{ "success": false }')
}

async function getPlayList (library, options) {
  const response = {
    offset: 0,
    data: {
      playlists: library.playLists.filter(playList => playList.id === options.id)
    },
    success: true
  }
  response.data.playlists = JSON.parse(JSON.stringify(response.data.playlists))
  for (const playlist of response.data.playlists) {
    for (const i in playlist.additional.tracks) {
      if (playlist.additional.tracks[i].substring) {
        playlist.additional.tracks[i] = library.media.filter(song => song.path === playlist.additional.tracks[i])[0]
      }
    }
  }
  response.data.total = response.data.playlists.length
  return response
}

async function listPlayLists (library) {
  const response = {
    offset: 0,
    data: {
      playlists: library.playLists
    },
    success: true
  }
  response.data.playlists = JSON.parse(JSON.stringify(response.data.playlists))
  for (const playlist of response.data.playlists) {
    for (const i in playlist.additional.tracks) {
      if (playlist.additional.tracks[i].substring) {
        playlist.additional.tracks[i] = library.media.filter(song => song.path === playlist.additional.tracks[i])[0]
      }
    }
  }
  response.data.total = response.data.playlists.length
  return response
}

async function createNormalPlayList (library, options) {
  const playList = {
    id: `playlist_personal_normal/${options.name}`,
    name: options.name,
    library: 'personal',
    type: 'normal',
    sharing_status: 'none',
    additional:
    {
      sharing_info:
      {
        date_available: '0',
        date_expired: '0',
        id: '',
        status: 'none',
        url: ''
      },
      songs: [],
      songs_offset: 0,
      songs_total: 0
    }
  }
  if (options.tracks) {
    const songs = options.tracks.split(',')
    for (const songid of songs) {
      const song = library.media.filter(song => song.id === songid)[0]
      playList.additional.tracks.push(song.path)
    }
  } else {
    for (const song of library.playingQueue) {
      playList.additional.tracks.push(song.path)
    }
  }
  library.playLists.push(playList)
  library.rewritePlayLists()
  return {
    data: {
      id: `playlist_personal_normal/${options.name}`
    },
    success: true
  }
}

async function addTrackToNormalPlayList (library, options) {
  const playList = library.playLists.filter(playList => playList.id === options.id)[0]
  if (options.album) {
    const album = options.album.split('"').join('')
    const artistName = options.album_artist.split('"').join('')
    const artist = library.artists.filter(artist => artist.name === artistName)[0]
    const songs = library.media.filter(song => song.album === album && song.artists.indexOf(artist.id) > -1)
    for (const song of songs) {
      playList.additional.tracks.push(song.path)
    }
  } else if (options.artist) {
    const artistName = options.artist.split('"').join('')
    const artist = library.artists.filter(artist => artist.name === artistName)[0]
    const songs = library.media.filter(song => song.artists.indexOf(artist.id) > -1)
    for (const song of songs) {
      playList.additional.tracks.push(song.path)
    }
  } else if (options.composer) {
    const composerName = options.composer.split('"').join('')
    const composer = library.composers.filter(composer => composer.name === composerName)[0]
    const songs = library.media.filter(song => song.composers.indexOf(composer.id) > -1)
    for (const song of songs) {
      playList.additional.tracks.push(song.path)
    }
  } else if (options.genre) {
    const genreName = options.genre.split('"').join('')
    const genre = library.genres.filter(genre => genre.name === genreName)[0]
    const songs = library.media.filter(song => song.genres.indexOf(genre.id) > -1)
    for (const song of songs) {
      playList.additional.tracks.push(song.path)
    }
  }
  library.rewritePlayLists()
  return {
    data: {
      id: options.name
    },
    success: true
  }
}

async function createSmartPlayList (library, options) {
  const playList = {
    id: `playlist_personal_smart/${options.name}`,
    name: options.name,
    library: 'personal',
    type: 'smart',
    sharing_status: 'none',
    additional:
    {
      rules: JSON.parse(options.rules_json),
      rules_conjunction: options.conj_rule
    }
  }
  library.playLists.push(playList)
  library.rewritePlayLists()
  return {
    data: {
      id: playList.id
    },
    success: true
  }
}

async function updateSmartPlayList (library, options) {
  const playList = library.playLists.filter(playList => playList.id === options.id)
  playList.id = `playlist_personal_smart/${options.name}`
  playList.name = options.new_name
  playList.additional = {
    rules: JSON.parse(options.rules_json)
  }
  library.rewritePlayLists()
  return {
    data: {
      id: playList.id
    },
    success: true
  }
}

async function renamePlayList (library, options) {
  const playList = library.playLists.filter(playList => playList.name === options.id.split('/')[1])
  playList.id = `playlist_personal_normal/${options.new_name}`
  playList.name = options.new_name
  library.rewritePlayLists()
  return {
    data: {
      id: `playlist_personal_normal/${playList.id}`
    },
    success: true
  }
}

async function deletePlaylist (library, options) {
  const ids = options.id.split(',')
  for (const id of ids) {
    const playList = library.playLists.filter(playList => playList.id === id)[0]
    library.playLists.splice(library.playLists.indexOf(playList), 1)
  }
  library.rewritePlayLists()
  return { success: true }
}
