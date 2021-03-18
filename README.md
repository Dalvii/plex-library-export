# Plex library image export
Export Plex libraries at image format for a better preview of what you have on your Plex.
Items will be set in 7x7 format.

***CAUTION: (unique mode only) BIG LIBRAIRIES WITH MORE THAN 525 ITEMS WILL NOT WORK DUE OF A LIMITATION OF PNG IMAGE, I'M WORKING ON A FIX THAT WILL ARRIVE SOON !! (sorry for that)***

## Node install
You need Node.js to run this script: [Download](https://nodejs.org/en/download/)
Then download the repo,
and type in the directory console:
```
npm install
```

## Run
```
npm run start
// or
node main.js
```

## Configuration
You need to modify the script to match your plex.
```
const PLEX_TOKEN = '';
const PLEX_URL = 'http://localhost:32400';
const SECTION = '0';
const MODE = 'unique';
```
[To find your Plex token...](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)

## Images build mode
There is 2 mode for export
- Unique: One long image with every items in it (size: 2200xXXXX)
- Multiple: Images depending of how many items you got (size: 2200x3310)

## Background
You can change the background of the image by naming it `background.png`

## Infos
- Discord : `Dalvi#3682`

## Example Anime
![Example Anime](https://i.imgur.com/zFthiLW.jpg)

## Example Movies
![Example Movies](https://i.imgur.com/hEk9YZQ.jpg)

