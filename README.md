# Plex library image export
Export Plex libraries at image format for a better preview of what you have on your Plex.
Items will be set in 7x7 format.

## Node install
You need Node.js to run this script: [Download](https://nodejs.org/en/download/)
Then download the repo,
and type in the directory console:
```
$ npm init
```
Then install dependencies:
```
$ npm i word-wrap node-fetch fs xml-js canvas
```

## Run
```
$ node ./main.js
```

## Configuration
You need to modify the script to match your plex.
```
const PLEX_API = '?X-Plex-Token=YOUR_PLEX_TOKEN'
const PLEX_URL = 'http://your_server:32400'
const SECTION = '1'
const MODE = 'mutiple'
```
[To find your Plex token...](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)

## Images build mode
There is 2 mode for export
- One long image with every items in it (size: 2200xXXXX)
- Multiple images depending of how many items you got (size: 2200x3310)

## Background
You can change the background of the image by naming it `bg.png`

## Infos
- Discord : `Dalvi#3682`

## Exemple

<img src="https://github.com/Dalvii/plex-library-export/blob/main/exemple_Animes_full.jpg?raw=true" width="70%"></img>

<img src="https://github.com/Dalvii/plex-library-export/blob/main/exemple_movies.jpg?raw=true" width="70%"></img>
