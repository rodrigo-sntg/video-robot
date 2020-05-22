fs = require('fs');
const moment = require('moment')
const parser = require('xml2json');

const MLT = require('mlt');
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
    // const content = state.load()
    mltTest();
    // console.log(secondsToHms(10.5))
    // console.log(getSumTimeString('00:00:12,312','00:00:00,650'))
    // console.log(getDiffTimeString('00:00:12,312','00:00:01,120'))


    // await convertAllImages(content)
    // await createAllSentencesImages(content)
    // await createYoutubeThumbnail();
    // await createAfterEffectsScript(content)
    
    // await renderVideo(content.renderType, content);

    // state.save(content)

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

    async function mltTest() {
      // const mlt = new MLT; 
      // music = new MLT.Producer.Audio({source: './content/0-audio-sentence.wav'});
      // mlt.push(music);

      const over = "00:00:01,120";
      const trans = "00:00:00,560";

     
      const audio0 = "00:00:04,200";
      const audio1 = "00:00:08,620";
      const audio2 = "00:00:06,775";
      const audio3 = "00:00:03,652";
      const audio4 = "00:00:09,399";
      const audio5 = "00:00:10,412";
      const audio6 = "00:00:09,199";

      // const converted0 = getSumTimeString(audio0, "00:00:05,000");
      // const converted1 = "00:00:08,770";
      // const converted2 = "00:00:06,925";
      // const converted3 = "00:00:03,775";
      // const converted4 = "00:00:09,549";
      // const converted5 = "00:00:10,562";
      // const converted6 = "00:00:09,349";

      const converted0 = getSumTimeString(audio0, "00:00:05,000");
      const converted1 = getSumTimeString(audio1, trans);
      const converted2 = getSumTimeString(audio2, trans);
      const converted3 = getSumTimeString(audio3, trans);
      const converted4 = getSumTimeString(audio4, trans);
      const converted5 = getSumTimeString(audio5, trans);
      const converted6 = getSumTimeString(audio6, trans);
      
      const gap0 = getDiffTimeString(converted0, trans);
      const gap1 = getDiffTimeString(converted1, over);
      const gap2 = getDiffTimeString(converted2, over);
      const gap3 = getDiffTimeString(converted3, over);
      const gap4 = getDiffTimeString(converted4, over);
      const gap5 = getDiffTimeString(converted5, over);
      const gap6 = getDiffTimeString(converted6, over);

      const transition0In = getDiffTimeString(converted0, trans);
      const transition0Out = converted0;
      const transition1In = getSumTimeString(transition0Out, gap1);
      const transition1Out = getSumTimeString(transition1In, trans)
      const transition2In = getSumTimeString(transition1Out, gap2);
      const transition2Out = getSumTimeString(transition2In, trans);
      const transition3In = getSumTimeString(transition2Out, gap3);
      const transition3Out = getSumTimeString(transition3In, trans);
      const transition4In = getSumTimeString(transition3Out, gap4);
      const transition4Out = getSumTimeString(transition4In, trans);
      const transition5In = getSumTimeString(transition4Out, gap5);
      const transition5Out = getSumTimeString(transition5In, trans);
      const transition6In = getSumTimeString(transition5Out, gap6);
      const transition6Out = getSumTimeString(transition6In, gap6);



      const fade0In = getTransitionIn(audio0);
      const fade0Out = audio0;
      const fade1In = getTransitionIn(audio1);
      const fade1Out = audio1;
      const fade2In = getTransitionIn(audio2);
      const fade2Out = audio2;
      const fade3In = getTransitionIn(audio3);
      const fade3Out = audio3;
      const fade4In = getTransitionIn(audio4);
      const fade4Out = audio4;
      const fade5In = getTransitionIn(audio5);
      const fade5Out = audio5;
      const fade6In = getTransitionIn(audio6);
      const fade6Out = audio6;

      fs.readFile( './templates/3/templateCorrected.mlt', 'utf-8', function(err, data) {
        
        // var json = parser.toJson(data);

        const blank = 4;
        const transitionLength = 0.750;

        data = data.split('${0-gap}').join(gap0);
        data = data.split('${1-gap}').join(gap1);
        data = data.split('${2-gap}').join(gap2);
        data = data.split('${3-gap}').join(gap3);
        data = data.split('${4-gap}').join(gap4);
        data = data.split('${5-gap}').join(gap5);
        data = data.split('${6-gap}').join(gap6);

        data = data.split('${0-audio}').join(audio0);
        data = data.split('${1-audio}').join(audio1);
        data = data.split('${2-audio}').join(audio2);
        data = data.split('${3-audio}').join(audio3);
        data = data.split('${4-audio}').join(audio4);
        data = data.split('${5-audio}').join(audio5);
        data = data.split('${6-audio}').join(audio6);

        data = data.split('${0-converted}').join(converted0);
        data = data.split('${1-converted}').join(converted1);
        data = data.split('${2-converted}').join(converted2);
        data = data.split('${3-converted}').join(converted3);
        data = data.split('${4-converted}').join(converted4);
        data = data.split('${5-converted}').join(converted5);
        data = data.split('${6-converted}').join(converted6);

        data = data.split('${fade-0-in}').join(fade0In);
        data = data.split('${fade-0-out}').join(fade0Out);
        data = data.split('${fade-1-in}').join(fade1In);
        data = data.split('${fade-1-out}').join(fade1Out);
        data = data.split('${fade-2-in}').join(fade2In);
        data = data.split('${fade-2-out}').join(fade2Out);
        data = data.split('${fade-3-in}').join(fade3In);
        data = data.split('${fade-3-out}').join(fade3Out);
        data = data.split('${fade-4-in}').join(fade4In);
        data = data.split('${fade-4-out}').join(fade4Out);
        data = data.split('${fade-5-in}').join(fade5In);
        data = data.split('${fade-5-out}').join(fade5Out);
        data = data.split('${fade-6-in}').join(fade6In);
        data = data.split('${fade-6-out}').join(fade6Out);
        
        data = data.split('${transtion-0-in}').join(transition0In);
        data = data.split('${transtion-0-out}').join(transition0Out);
        data = data.split('${transtion-1-in}').join(transition1In);
        data = data.split('${transtion-1-out}').join(transition1Out);
        data = data.split('${transtion-2-in}').join(transition2In);
        data = data.split('${transtion-2-out}').join(transition2Out);
        data = data.split('${transtion-3-in}').join(transition3In);
        data = data.split('${transtion-3-out}').join(transition3Out);
        data = data.split('${transtion-4-in}').join(transition4In);
        data = data.split('${transtion-4-out}').join(transition4Out);
        data = data.split('${transtion-5-in}').join(transition5In);
        data = data.split('${transtion-5-out}').join(transition5Out);
        data = data.split('${transtion-6-in}').join(transition6In);
        data = data.split('${transtion-6-out}').join(transition6Out);


        fs.writeFileSync('./templates/3/novo.mlt', data)

        // var obj = JSON.parse(json)
        // console.log("to json ->", json);
      });

    }

    async function renderVideoWithKdenlive() {
      const mlt = new MLT; 
      music = new MLT.Producer.Audio({source: '/home/jeffrey/Downloads/crazy.mp3'});
      mlt.push(music);

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

    function getTransitionIn(out){
      let arr = out.split(':');
      let number = Number(arr[2].replace(',','.'))

      number -= 0.750;
      var last = '';

      if (number < 10) 
        last = ("0"+number).replace('.',',')
      
      else
        last = (number + '').replace('.',',')
      
      arr[2] = last;
      
      return arr.join(':')
    }

    function getSumTimeString(init, sum){

      init = init.replace(',','.')
      sum = sum.replace(',','.')
      
      const result = moment.duration(init).asSeconds() + moment.duration(sum).asSeconds()

      return secondsToHms(result)
    }

    function getDiffTimeString(init, diff){

      init = init.replace(',','.')
      diff = diff.replace(',','.')
      
      const result = moment.duration(init).asSeconds() - moment.duration(diff).asSeconds()

      return secondsToHms(result)
    }

    function secondsToHms(d) {
      var hours   = Math.floor(d / 3600);
      var minutes = Math.floor((d - (hours * 3600)) / 60);
      var seconds = d - (hours * 3600) - (minutes * 60);

      var rest = (d + '').split('.')[1]

      if(!rest) 
        rest = 000;

        if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return hours + ':' + minutes + ':' + (seconds + '').replace('.',',');
      // return `${hours}:${minutes}:${seconds}.${rest}`
  }
}
module.exports = robot