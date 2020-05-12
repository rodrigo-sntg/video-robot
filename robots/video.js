const gm = require('gm').subClass({imageMagick: true})
var exec = require('child_process').exec, child;
const state = require('./state.js')

const spawn = require('child_process').spawn
const path = require('path')
const os = require('os');
const rootPath = path.resolve(__dirname, '..')

const fromRoot = relPath => path.resolve(rootPath, relPath)

const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


async function robot(){
    const content = state.load()

    await convertAllImages(content)
    await createAllSentencesImages(content)
    await createYoutubeThumbnail();
    await createAfterEffectsScript(content)
    
    await renderVideo(content.renderType, content);

    state.save(content)

    async function convertAllImages(content){
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await convertImage(sentenceIndex)
        }
    }

    async function convertImage(sentenceIndex){
        return new Promise((resolve,reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080

            gm()
            .in(inputFile)
            .out('(')
              .out('-clone')
              .out('0')
              .out('-background','white')
              .out('-blur','0x9')
              .out('-resize',`${width}x${height}^`)
            .out(')')
            .out('(')
              .out('-clone')
              .out('0')
              .out('-background', 'white')
              .out('-resize',`${width}x${height}`)
            .out(')')
            .out('-delete','0')
            .out('-gravity','center')
            .out('-compose','over')
            .out('-composite')
            .out('-extent',`${width}x${height}`)
            .write(outputFile, (error) => {
                if (error) {
                    return reject(error)
                }

                console.log(`> Image Converted: ${inputFile}`)
                resolve()
            })

            
        })
    }

    async function createAllSentencesImages(content){
      for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
      }
    }

    async function createSentenceImage(sentenceIndex, sentenceText){
        return new Promise((resolve,reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`

            const templateSettings = {
                  0: {
                      size: '1920x400',
                      gravity: 'center'
                  },
                  1: {
                      size: '1920x1080',
                      gravity: 'center'
                  },
                  2: {
                      size: '800x1080',
                      gravity: 'west'
                  },
                  3: {
                      size: '1920x400',
                      gravity: 'center'
                  },
                  4: {
                      size: '1920x1080',
                      gravity: 'center'
                  },
                  5: {
                      size: '800x400',
                      gravity: 'west'
                  },
                  6: {
                      size: '1920x400',
                      gravity: 'center'
                  }
            }

            gm()
            .out('-size', templateSettings[sentenceIndex].size)
            .out('-gravity', templateSettings[sentenceIndex].gravity)
            .out('-background','transparent')
            .out('-fill','white')
            .out('-kerning','-1')
            .out(`caption: ${sentenceText}`)
            .write(outputFile, (error) => {
                if (error) {
                    return reject(error)
                }

                console.log(`> Sentence Created: ${outputFile}`)
                resolve()
            })

            
        })
    }

    async function createYoutubeThumbnail(){
      return new Promise((resolve,reject) => {
          gm().in('./content/0-converted.png')
          .write('./content/youtube-thumnail.png', (error) => {
              if (error) {
                  return reject(error)
              }

              console.log(`> Youtube Thumbnail created.`)
              resolve()
          })
      })
    }

    async function createAfterEffectsScript(content) {
      await state.saveScript(content)
    }
    
    async function renderVideoWithAfterEffects() {
      return new Promise((resolve, reject) => {
        const systemPlatform=os.platform
        
        if (systemPlatform== 'darwin'){
          const aerenderFilePath = '/Applications/Adobe After Effects CC 2019/aerender'
        }else if (systemPlatform=='win32'){
          const aerenderFilePath = '%programfiles%\Adobe\Adobe After Effects CC\Arquivos de suporte\aerender.exe'
        }else{
          return reject(new Error('System not Supported'))
        }
        
        const templateFilePath = fromRoot('./templates/1/template.aep')
        const destinationFilePath = fromRoot('./content/output.mov')
  
        console.log('> [video-robot] Starting After Effects')
  
        const aerender = spawn(aerenderFilePath, [
          '-comp', 'main',
          '-project', templateFilePath,
          '-output', destinationFilePath
        ])
  
        aerender.stdout.on('data', (data) => {
          process.stdout.write(data)
        })
  
        aerender.on('close', () => {
          console.log('> [video-robot] After Effects closed')
          resolve()
        })
      })
    }

    async function renderVideoWithNode(content) {
      let images = [];
  
      for (
        let sentenceIndex = 0;
        sentenceIndex < content.sentences.length;
        sentenceIndex++
      ) {
        images.push({
          path: `./content/${sentenceIndex}-converted.png`,
          caption: content.sentences[sentenceIndex].text
        });
      }
  
      const videoOptions = {
        fps: 25,
        loop: 7, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: "libx264",
        size: "640x?",
        audioBitrate: "128k",
        audioChannels: 2,
        format: "mp4",
        pixelFormat: "yuv420p",
        useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
        subtitleStyle: {
          Fontname: "Verdana",
          Fontsize: "40",
          PrimaryColour: "11861244",
          SecondaryColour: "11861244",
          TertiaryColour: "11861244",
          BackColour: "-2147483640",
          Bold: "2",
          Italic: "0",
          BorderStyle: "2",
          Outline: "2",
          Shadow: "3",
          Alignment: "1", // left, middle, right
          MarginL: "40",
          MarginR: "60",
          MarginV: "40"
        }
      };
      const outputPath = fromRoot('./content/video.mp4')
      const audioPath = fromRoot('./templates/1/newsroom.mp3')
      videoshow(images, videoOptions)
        .audio(audioPath)
        .save(outputPath)
        .on("start", function(command) {
          console.log("ffmpeg process started:", command);
        })
        .on("error", function(err, stdout, stderr) {
          console.error("Error:", err);
          console.error("ffmpeg stderr:", stderr);
        })
        .on("end", function(output) {
          console.error("Video created in:", output);
        });
    }

    async function renderVideoWithKdenlive() {
      return new Promise((resolve, reject) => {
        const systemPlatform=os.platform
        
        const templateFilePath = fromRoot('./templates/2/template.mlt')

        if (systemPlatform=='linux'){
          console.log('> [video-robot] Rendering kdenlive')
          exec(`/usr/bin/melt ${templateFilePath}`, (error, stdout, stderr) => {
            if (error) {
              console.log('> [video-robot] Error Rendering kdenlive')
              reject('error')
            }
            console.log('> [video-robot] Kdenlive rendering completed')
            resolve(stdout? stdout : stderr);
          });
          
        }else{
          return reject(new Error('System not Supported'))
        }
        
      })
    }
  
    async function renderVideo(type, content) {
      type = type.toLowerCase();
      
      if (type == "after") {
        await renderVideoWithAfterEffects();
      } if(type == "kdenlive") {
        await renderVideoWithKdenlive(content);
      }else {
        await renderVideoWithNode(content);
      }
    }
}
module.exports = robot