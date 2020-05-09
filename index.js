
const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image.js'),
    video: require('./robots/video.js'),
    videoFFmpeg: require('./robots/video-ffmpeg'),
}

async function start() {
    // robots.input()
    // await robots.text()
    // await robots.image()
    // await robots.video()
    await robots.videoFFmpeg()

    const content = robots.state.load()
    console.dir(content, { depth: null })
}

start()