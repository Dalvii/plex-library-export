# Plex library image export
Export Plex libraries at image format for a better preview of what you have on your Plex.
Items will be set in 7x7 format.

***CAUTION: (unique mode only) Unique image are limited by 320400 pixel long (about 525 items), so the script will still divide them***

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
If you do now know the library `SECTION` ID then run the script. The console will print the IDs for each library.
Configuration is in `.env` file
```
PLEX_TOKEN=Your-Plex-Token
PLEX_URL=http://localhost:32400
SECTION=0
MODE=unique
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
- Thanks to DrKain

## Example Anime
![Example Anime](https://i.imgur.com/zFthiLW.jpg)

## Example Movies
![Example Movies](https://i.imgur.com/hEk9YZQ.jpg)

