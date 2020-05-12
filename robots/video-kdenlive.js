const gm = require("gm").subClass({ imageMagick: true });
var exec = require('child_process').exec, child;
const state = require("./state.js");
const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


const path = require('path')
const os = require('os');
const rootPath = path.resolve(__dirname, '..')

const fromRoot = relPath => path.resolve(rootPath, relPath)



async function robot(){
    const content = state.load()

    await renderVideoWithKdenlive(content);

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
          loop: 5, // seconds
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
    
        videoshow(images, videoOptions)
          // .audio("song.mp3")
          .save("video.mp4")
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
    
      async function renderVideo(type, content) {
        if (type == "after") {
          await renderVideoWithAfterEffects();
        } else {
          await renderVideoWithNode(content);
        }
      }
}
module.exports = robot