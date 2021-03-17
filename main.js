// Pour installer les dependances / To install dependencies :
// Dans la console tapez: / In console type:
// npm init
// npm i word-wrap && npm i node-fetch && npm i fs && npm i xml-js && npm i canvas

// SCRIPT BY DALVI (https://github.com/Dalvii/)

const wrap = require('word-wrap');
const fetch = require('node-fetch');
const fs = require('fs');
const convert = require('xml-js');
const Canvas = require('canvas');
const { registerFont, createCanvas } = require('canvas')
registerFont('bahnschrift.ttf', { family: 'Bahnschrift' })

// GET PLEX TOKEN: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/

const PLEX_API = '?X-Plex-Token=YOUR_PLEX_TOKEN'
const PLEX_URL = 'http://your_server:32400'
const SECTION = '1'
const MODE = 'mutiple' // 'unique' ou 'mutiple' pour 1 seul image ou divisé plusieurs

async function get() {
    if (Number(SECTION) >= 0) {} else return console.log(`Search 'key=' corresponding to your Library and put this number in 'SECTION =' ${PLEX_URL}/library/sections/all?X-Plex-Token=${PLEX_API}`),
    console.log(`\nCherchez 'key=' dans le lien suivant et mettez dans 'SECTION =' le numero correspondant a votre bibliotheque ${PLEX_URL}/library/sections/all?X-Plex-Token=${PLEX_API}`)

    // get plex xml api result : xml -> json
    const xml = await fetch(`${PLEX_URL}/library/sections/${SECTION}/all${PLEX_API}`, {method: 'GET'}).then(response => response.text()).catch(console.error);
    let json = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4})).MediaContainer.Directory == undefined ? JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4})).MediaContainer.Video : JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4})).MediaContainer.Directory

    const poster_list = []
    const title_list = []
    json.forEach(i => {
        poster_list.push(PLEX_URL + i._attributes.thumb + PLEX_API)
        title_list.push(i._attributes.title.length > 31 ? i._attributes.title.substring(-i._attributes.title.length,31)+'...' : i._attributes.title)
    });

    const library = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4})).MediaContainer._attributes.librarySectionTitle
    console.log(library)
    console.log('Script by Dalvi https://github.com/Dalvii/')
    console.log('Il y a '+title_list.length+ ' éléments en tout')

    let y_total = Math.ceil(poster_list.length/7) * 430 + 300
    let x_pos = [150, 428.3, 706.6, 984.9, 1263.2, 1541.5, 2200-150-230]
    let y_pos = -280

    let pages = (MODE === 'unique' ? 1 : Math.ceil(poster_list.length/7/7))

    for (let y = 0; y < pages; y++) {
        
        console.log('page '+(y+1)+' avec '+(MODE === 'unique' ? poster_list.length : Math.min(poster_list.length, 49))+' images...')

        const canvas = Canvas.createCanvas(2200, (MODE === 'unique' ? y_total : 3310));
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 23px "Bahnschrift"';
        ctx.fillStyle = '#ffffff';
    
        // background set
        const bg = await Canvas.loadImage('./bg.png');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < (MODE === 'unique' ? poster_list.length : Math.min(poster_list.length, 49)); i++) {
            if (i%7 == 0) y_pos += 430;
            const poster = await Canvas.loadImage(poster_list[i]);
            ctx.drawImage(poster, x_pos[i%7], y_pos, 230, 340);
            ctx.fillText(wrap(title_list[i], {width: 21}), x_pos[i%7]-5, y_pos+368)
        }


        // Reset+supprime les 49 premiers elements pour le mode multiple
        y_pos = -280
        poster_list.splice(0,49)
        title_list.splice(0,49)
        
        // Build image
        canvas.toBuffer()
        const out = fs.createWriteStream(__dirname + '/'+library+'_'+y+'.jpg')
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () => { console.log('Terminé !') })
    }
}
get()
