# Server: Synology

A module for [Open Audio Server](https://github.com/openaudioserver/open-audio-server) that adds compatibility with the Synology DS Audio apps for iPhone and Android, and with some additional work the [Synology Audiostation](https://www.synology.com/en-us/dsm/feature/audio_station) web interface.

### Documentation

- [How to use](#how-to-use)
- [Index data structure](#index-data-structure)
- [Using the API with NodeJS](#using-the-media-index-with-nodejs)

## How to use

First install the module with `NPM`:

    $ npm install @openaudioserver/server-synology

If you are using [Library](https://github.com/openaudioserver/library) from the command-line include the module name in your arguments:

    $ node scanner.js @openaudioserver/library-radio /path/to/files

If you are using [Library](https://github.com/openaudioserver/library) with NodeJS include the module name in the parameters:

    const Library = require('@openaudioserver/library')
    await Library.scan(['@openaudioserver/library-radio'], ['/path/to/files'])

## Index data structure

[Top of page](#documentation)

## Using the API with NodeJS

[Top of page](#documentation)

## License

MIT
