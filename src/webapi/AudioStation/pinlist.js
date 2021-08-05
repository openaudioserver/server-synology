module.exports = async (library, req, res) => {
  let response
  switch (req.postData.method) {
    case 'list':
      response = await listPinnedItems(library)
      break
    case 'pin':
      response = await pinItem(library, req.postData)
      break
    case 'unpin':
      response = await unpinItem(library, req.postData)
      break
    case 'rename':
      response = await renameItem(library, req.postData)
      break
    case 'reorder':
      response = await reorderPinnedItems(library, req.postData)
      break
  }
  if (response) {
    return res.end(JSON.stringify(response))
  }
  res.statusCode = 404
  return res.end('{ "success": false }')
}

async function listPinnedItems (library) {
  const response = {
    data: {
      items: library.pinList
    },
    success: true
  }
  return response
}

async function pinItem (library, options) {
  const items = JSON.parse(options.items)
  for (const item of items) {
    item.id = (library.pinList.length + 1).toString()
    item.name = item.genre || item.composer || item.artist || item.folder
    library.pinList.push(item)
  }
  library.rewritePins()
  return { success: true }
}

async function unpinItem (library, options) {
  const items = JSON.parse(options.items)
  for (const id of items) {
    const pin = library.pinList.filter(pin => pin.id === id)[0]
    library.pinList.splice(library.pinList.indexOf(pin.id), 1)
  }
  library.rewritePins()
  return { success: true }
}

async function renameItem (library, options) {
  const items = JSON.parse(options.items)
  for (const id of items) {
    const pin = library.pinList.filter(pin => pin.id === id)[0]
    pin.name = options.name
  }
  library.rewritePins()
  return { success: true }
}

async function reorderPinnedItems (library, options) {
  const newArray = []
  const newOrder = JSON.parse(options.items)
  for (const id of newOrder) {
    const pin = library.pinList.filter(pin => pin.id === id)[0]
    newArray.push(pin)
  }
  library.pinList.length = 0
  for (const pin of newArray) {
    pin.id = (library.pinList.length + 1).toString()
    library.pinList.push(pin)
  }
  return { success: true }
}
