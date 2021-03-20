// https://github.com/Dalvii/plex-library-export
// Thanks to DrKain for his help
const wrap = require('word-wrap');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const convert = require('xml-js');
const Canvas = require('canvas');
const { registerFont } = require('canvas');
require('dotenv').config()

registerFont('assets/bahnschrift.ttf', { family: 'Bahnschrift' }); // Load font

// GET PLEX TOKEN: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_URL = process.env.PLEX_URL
const SECTION = process.env.SECTION;
const MODE = process.env.MODE; // 'unique' or 'multiple' for 1 single image or several for each page 
const OUTPUT_DIR = path.join(__dirname, 'output');

const getURL = (type) => {
    switch (type) {
        case 'all':
            return `${PLEX_URL}/library/sections/${SECTION}/all?X-Plex-Token=${PLEX_TOKEN}`;
        case 'sections':
            return `${PLEX_URL}/library/sections/all?X-Plex-Token=${PLEX_TOKEN}`;
    }
}

const truncate = (str, n) => (str.length > n) ? str.substr(0, n - 1) + '...' : str;

const handleError = (err) => {
    if (`${err}`.includes('ECONNREFUSED')) {
        console.log('[Error] Unable to connect to the Plex server. Please ensure PLEX_URL on line 14 is correct');
    } else console.log(`[Error] ${err}`);
    process.exit(0);
}

async function get() {
    // Ensure MODE is valid
    if (!['unique', 'multiple'].includes(MODE)) {
        console.log('[Error] MODE must be either \'unique\' or \'multiple\'');
        process.exit(0);
    }

    // Ensure PLEX_TOKEN is set
    if (PLEX_TOKEN === '') {
        console.log('[Error] PLEX_TOKEN is not set on line 13');
        process.exit(0);
    }

    // If a library key is not set, print out the available keys
    if (Number(SECTION) == 0) {
        const xml = await fetch(getURL('sections'), { method: 'GET' }).then(res => res.text()).catch(handleError);
        const json = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));
        console.log('[Error] SECTION needs to be assigned a library key on line 15');
        json.MediaContainer.Directory.map(item => {
            const library = item._attributes;
            console.log(`${library.key} = ${library.title} (${library.type})`)
        });
        process.exit(0);
    }

    // Fetch the contents of the library and convert XML to JSON
    const xml = await fetch(getURL('all'), { method: 'GET' }).then(response => response.text()).catch(handleError);
    const json = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));
    const content = json.MediaContainer.Directory == undefined ? json.MediaContainer.Video : json.MediaContainer.Directory;
    const library = json.MediaContainer._attributes.librarySectionTitle;

    const poster_list = [];
    const title_list = [];

    content.forEach(i => {
        poster_list.push(`${PLEX_URL}${i._attributes.thumb}?X-Plex-Token=${PLEX_TOKEN}`);
        title_list.push(truncate(i._attributes.title, 31));
    });

    console.log(`[Info] Exporting Library: ${library}, this will take few time...`)
    console.log('[Info] Script by Dalvi https://github.com/Dalvii/')
    console.log('[Info] There are ' + title_list.length + ' elements total')

    let y_total = Math.min((Math.ceil(poster_list.length/7) * 430 + 300), 32400)
    let x_pos = [150, 428.3, 706.6, 984.9, 1263.2, 1541.5, 2200 - 150 - 230]
    let y_pos = -280

    let big_image = poster_list.length > 525
    let pages = MODE === 'unique' ? (big_image == true ? Math.ceil(poster_list.length / 525) : 1 ) : Math.ceil(poster_list.length / 7 / 7)

    for (let y = 0; y < pages; y++) {

        console.log('[Info] Page ' + (y + 1) + ' with ' + (MODE === 'unique' ? Math.min(poster_list.length, 525) : Math.min(poster_list.length, 49)) + ' images...')

        const canvas = Canvas.createCanvas(2200, (MODE === 'unique' ? y_total : 3310));
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 23px "Bahnschrift"';
        ctx.fillStyle = '#ffffff';

        // background set
        const bg = await Canvas.loadImage('./assets/background.png');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < Math.min(525, (MODE === 'unique' ? poster_list.length : Math.min(poster_list.length, 49))); i++) {
            if (i % 7 == 0) y_pos += 430;
            const poster = await Canvas.loadImage(poster_list[i]);
            ctx.drawImage(poster, x_pos[i % 7], y_pos, 230, 340);
            ctx.fillText(wrap(title_list[i], { width: 21 }), x_pos[i % 7] - 5, y_pos + 368);
        }

        // Reset + Deletes the first 49 elements for multiple mode 
        y_pos = -280;
        if (MODE === 'multiple') {
            poster_list.splice(0, 49)
            title_list.splice(0, 49)
        }

        // If "unique" mode is set, and the image is taller than 32400 pixels
        if (big_image == true && MODE === 'unique') {
            poster_list.splice(0, 525)
            title_list.splice(0, 525)
        }

        // Build image
        canvas.toBuffer();
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }

        const out = fs.createWriteStream(__dirname + '/output/' + library + '_' + y + '.jpg');
        const stream = canvas.createJPEGStream();

        stream.pipe(out);
        out.on('finish', () => {
            console.log('[Info] Completed! You will find the images in the "output" directory');
        });
    }
}

get()
