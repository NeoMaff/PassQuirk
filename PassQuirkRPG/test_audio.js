const { createAudioResource, StreamType } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');

console.log('Testing Audio Resource Creation...');
console.log('FFmpeg Path:', ffmpeg);
process.env.FFMPEG_PATH = ffmpeg;

const filePath = path.join(process.cwd(), 'bot/assets/music_intro.wav');
console.log('File Path:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('ERROR: File does not exist!');
    process.exit(1);
}

try {
    console.log('Creating audio resource...');
    const resource = createAudioResource(filePath, {
        inlineVolume: true
    });
    console.log('Resource created successfully!');
    console.log('Resource type:', resource.edges.type);
} catch (error) {
    console.error('CRASHED during createAudioResource:', error.message);
}
