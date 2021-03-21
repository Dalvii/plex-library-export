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
const UNIQUE_MIN_POSTERS_PER_ROW = process.env.UNIQUE_MIN_POSTERS_PER_ROW ?? 7;
const OUTPUT_DIR = path.join(__dirname, 'output');

process.on('SIGINT', () => {
    console.info("Exit");
    process.exit(0);
});

const pageMargin = 100;
const posterWidth = 230;
const posterHeight = 340;
const posterRightMargin = 30;
const posterBottomMargin = 90;
const totalPosterWidth = posterWidth + posterRightMargin;
const totalPosterHeight = posterHeight + posterBottomMargin;

const getURL = (type) => {
    switch (type) {
        case 'section':
            return `${PLEX_URL}/library/sections/${SECTION}/all?X-Plex-Token=${PLEX_TOKEN}`;
        case 'all':
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

const calculateUniqueCanvasSize = (titleCount) => {
    let postersPerRow = UNIQUE_MIN_POSTERS_PER_ROW - 1;
    let x_total;
    let y_total = 99999; // to run at least once

    // canvas limit
    while (y_total > 32768) {
        postersPerRow += 1;
        x_total = postersPerRow * totalPosterWidth + 2 * pageMargin - posterRightMargin;
        y_total = Math.ceil(titleCount / postersPerRow) * totalPosterHeight + pageMargin;
    }

    return {
        x_total,
        y_total,
        postersPerRow,
    };
};

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
        const xml = await fetch(getURL('all'), { method: 'GET' })
            .then(res => res.text())
            .catch(handleError);

        const json = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));
        console.log('[Error] SECTION needs to be assigned a library key on line 15');
        json.MediaContainer.Directory.map(item => {
            const library = item._attributes;
            console.log(`${library.key} = ${library.title} (${library.type})`)
        });
        process.exit(0);
    }

    // Fetch the contents of the library and convert XML to JSON
    const xml = await fetch(getURL('section'), { method: 'GET' })
        .then(response => response.text())
        .catch(handleError);

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
    console.log(`[Info] There are ${title_list.length} elements total`)

    let x_total, y_total, postersPerRow;

    if (MODE === 'unique') {
        const sizes = calculateUniqueCanvasSize(title_list.length);
        x_total = sizes.x_total;
        y_total = sizes.y_total;
        postersPerRow = sizes.postersPerRow;
    }

    if (MODE === 'multiple') {
        postersPerRow = 7;
        x_total = totalPosterWidth * postersPerRow - posterRightMargin + 2 * pageMargin;
        y_total = totalPosterHeight * (49 / postersPerRow) + pageMargin;
    }

    let x_pos = [pageMargin];
    for (let i = 0; i < postersPerRow - 1; i += 1) {
        x_pos.push(x_pos[i] + totalPosterWidth);
    }

    let pages = MODE === 'unique' ? 1 : Math.ceil(poster_list.length / postersPerRow / postersPerRow);

    for (let y = 0; y < pages; y += 1) {
        const posterCount = MODE === 'unique' ? poster_list.length : Math.min(poster_list.length, 49);
        console.log(`[Info] Page ${y + 1} with ${posterCount} images...`)

        const canvas = Canvas.createCanvas(x_total, y_total);
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 23px "Bahnschrift"';
        ctx.fillStyle = '#ffffff';

        // background set
        const bg = await Canvas.loadImage('./assets/background.png');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < posterCount; i += 1) {
            const y_pos = Math.floor(i / postersPerRow) * totalPosterHeight + pageMargin;

            const poster = await Canvas.loadImage(poster_list[i]);
            ctx.drawImage(poster, x_pos[i % postersPerRow], y_pos, posterWidth, posterHeight);
            ctx.fillText(wrap(title_list[i], { width: 21 }), x_pos[i % postersPerRow] - 5, y_pos + posterHeight + 28);
        }

        // Deletes the first 49 elements for multiple mode 
        if (MODE === 'multiple') {
            poster_list.splice(0, 49)
            title_list.splice(0, 49)
        }

        // Build image
        canvas.toBuffer();
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }

        const out = fs.createWriteStream(`${__dirname}/output/${library}_${y}.jpg`);
        const stream = canvas.createJPEGStream();

        stream.pipe(out);
        out.on('finish', () => {
            console.log('[Info] Completed! You will find the images in the "output" directory');
        });
    }
}

get()
