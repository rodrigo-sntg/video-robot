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
    const content = state.load()
    
    // await convertAllImages(content)
    // await createAllSentencesImages(content)
    await generateMltScript(content);
    // await createYoutubeThumbnail();
    // await createAfterEffectsScript(content)
    
    await renderVideo(content.renderType, content);

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

    async function generateMltScript(content) {

      const transitionLengthDoubled = "00:00:01,120";
      const transitionLength = "00:00:00,560";

      const audioLengthObject = fillAudioLengthObject(content);

      const imageLengthObject = fillImageLengthObject(audioLengthObject, transitionLength);

      const gapObject = fillGapObject(imageLengthObject, transitionLength, transitionLengthDoubled);
      
      const transitionObject = fillTransitionObject(imageLengthObject, transitionLength, gapObject);

      const filterObject = fillFilterWithAudioObject(audioLengthObject, transitionLength);
      
      // const filterObject = fillFilterObject(imageLengthObject, trans);

      // const fadeObject = fillFadeWithAudioObject(audioLengthObject, imageLengthObject);
      const fadeObject = fillFadeObject(imageLengthObject);


      fs.readFile( './templates/3/kdenlive_template.mlt', 'utf-8', function(err, data) {
        
        // var json = parser.toJson(data);

        data = replaceGap(data, gapObject);

        data = replaceAudioLength(data, audioLengthObject);

        data = replaceImageLength(data, imageLengthObject);

        data = replaceFade(data, fadeObject);

        data = replaceFilter(data, filterObject);
        
        data = replaceTransitions(data, transitionObject);


        fs.writeFileSync('./templates/3/final.mlt', data)

      });


    }

  function fillAudioLengthObject(content) {
    audioLengthObject = {};
    audioLengthObject.audio0 = getTimeString(content.audioInfoList[0].duration * 1000 + ''); // time is in millis, times 1000 to convert to seconds.
    audioLengthObject.audio1 = getTimeString(content.audioInfoList[1].duration * 1000 + '');
    audioLengthObject.audio2 = getTimeString(content.audioInfoList[2].duration * 1000 + '');
    audioLengthObject.audio3 = getTimeString(content.audioInfoList[3].duration * 1000 + '');
    audioLengthObject.audio4 = getTimeString(content.audioInfoList[4].duration * 1000 + '');
    audioLengthObject.audio5 = getTimeString(content.audioInfoList[5].duration * 1000 + '');
    audioLengthObject.audio6 = getTimeString(content.audioInfoList[6].duration * 1000 + '');
    return audioLengthObject;
  }

  function fillImageLengthObject(audioLengthObject, half) {
    imageLengthObject = {};
    imageLengthObject.converted0 = getSumTimeString(audioLengthObject.audio0, "00:00:04,000"); // adding 4 seconds before starting the audio
    imageLengthObject.converted1 = getSumTimeString(audioLengthObject.audio1, half);
    imageLengthObject.converted2 = getSumTimeString(audioLengthObject.audio2, half);
    imageLengthObject.converted3 = getSumTimeString(audioLengthObject.audio3, half);
    imageLengthObject.converted4 = getSumTimeString(audioLengthObject.audio4, half);
    imageLengthObject.converted5 = audioLengthObject.audio5
    imageLengthObject.converted6 = getSumTimeString(audioLengthObject.audio6, half);
    return imageLengthObject;
  }

  function fillGapObject(imageLengthObject, half, full) {
    gapObject = {};
    gapObject.gap0 = getDiffTimeString(imageLengthObject.converted0, half);
    gapObject.gap1 = getDiffTimeString(imageLengthObject.converted1, full);
    gapObject.gap2 = getDiffTimeString(imageLengthObject.converted2, full);
    gapObject.gap3 = getDiffTimeString(imageLengthObject.converted3, half);
    gapObject.gap4 = getDiffTimeString(imageLengthObject.converted4, half);
    gapObject.gap5 = getDiffTimeString(imageLengthObject.converted5, half);
    gapObject.gap6 = getDiffTimeString(imageLengthObject.converted6, full);
    return gapObject;
  }

  function fillTransitionObject(imageLengthObject, half, gapObject) {
    transitionObject = {}
    transitionObject.transition0In = getDiffTimeString(imageLengthObject.converted0, half);
    transitionObject.transition0Out = imageLengthObject.converted0;
    transitionObject.transition1In = getSumTimeString(transitionObject.transition0Out, gapObject.gap1);
    transitionObject.transition1Out = getSumTimeString(transitionObject.transition1In, half);
    transitionObject.transition2In = getSumTimeString(transitionObject.transition1Out, gapObject.gap2);
    transitionObject.transition2Out = getSumTimeString(transitionObject.transition2In, half);
    transitionObject.transition3In = getSumTimeString(transitionObject.transition2Out, gapObject.gap3);
    transitionObject.transition3Out = getSumTimeString(transitionObject.transition3In, half);
    transitionObject.transition4In = getSumTimeString(transitionObject.transition3Out, gapObject.gap4);
    transitionObject.transition4Out = getSumTimeString(transitionObject.transition4In, half);
    transitionObject.transition5In = getSumTimeString(transitionObject.transition4Out, gapObject.gap5);
    transitionObject.transition5Out = getSumTimeString(transitionObject.transition5In, half);
    transitionObject.transition6In = getSumTimeString(transitionObject.transition5Out, gapObject.gap6);
    transitionObject.transition6Out = getSumTimeString(transitionObject.transition6In, half);
    return transitionObject;
  }

  function fillFilterObject(imageLengthObject, trans) {
    let filterObject = {}
    filterObject.transition0In = getDiffTimeString(imageLengthObject.converted0, trans);
    filterObject.transition0Out = imageLengthObject.converted0;
    filterObject.transition1In = getDiffTimeString(imageLengthObject.converted1, trans);
    filterObject.transition1Out = imageLengthObject.converted1
    filterObject.transition2In = getDiffTimeString(imageLengthObject.converted2, trans);
    filterObject.transition2Out = imageLengthObject.converted2
    filterObject.transition3In = getDiffTimeString(imageLengthObject.converted3, trans);
    filterObject.transition3Out = imageLengthObject.converted3
    filterObject.transition4In = getDiffTimeString(imageLengthObject.converted4, trans);
    filterObject.transition4Out = imageLengthObject.converted4
    filterObject.transition5In = getDiffTimeString(imageLengthObject.converted5, trans);
    filterObject.transition5Out = imageLengthObject.converted5
    filterObject.transition6In = getDiffTimeString(imageLengthObject.converted6, trans);
    filterObject.transition6Out = imageLengthObject.converted6
    return filterObject;
  }

  function fillFilterWithAudioObject(audioLengthObject, half) {
    let filterObject = {}
    filterObject.transition0In = getDiffTimeString(audioLengthObject.audio0, half);
    filterObject.transition0Out = audioLengthObject.audio0;
    filterObject.transition1In = getDiffTimeString(audioLengthObject.audio1, half);
    filterObject.transition1Out = audioLengthObject.audio1
    filterObject.transition2In = getDiffTimeString(audioLengthObject.audio2, half);
    filterObject.transition2Out = audioLengthObject.audio2
    filterObject.transition3In = getDiffTimeString(audioLengthObject.audio3, half);
    filterObject.transition3Out = audioLengthObject.audio3
    filterObject.transition4In = getDiffTimeString(audioLengthObject.audio4, half);
    filterObject.transition4Out = audioLengthObject.audio4
    filterObject.transition5In = getDiffTimeString(audioLengthObject.audio5, half);
    filterObject.transition5Out = audioLengthObject.audio5
    filterObject.transition6In = getDiffTimeString(audioLengthObject.audio6, half);
    filterObject.transition6Out = audioLengthObject.audio6
    return filterObject;
  }

  function fillFadeObject(imageLengthObject) {
    fadeObject = {};
    fadeObject.fade0In = getTransitionIn(imageLengthObject.converted0);
    fadeObject.fade0Out = imageLengthObject.converted0;
    fadeObject.fade1In = getTransitionIn(imageLengthObject.converted1);
    fadeObject.fade1Out = imageLengthObject.converted1
    fadeObject.fade2In = getTransitionIn(imageLengthObject.converted2);
    fadeObject.fade2Out = imageLengthObject.converted2
    fadeObject.fade3In = getTransitionIn(imageLengthObject.converted3);
    fadeObject.fade3Out = imageLengthObject.converted3;
    fadeObject.fade4In = getTransitionIn(imageLengthObject.converted4);
    fadeObject.fade4Out = imageLengthObject.converted4
    fadeObject.fade5In = getTransitionIn(imageLengthObject.converted5);
    fadeObject.fade5Out = imageLengthObject.converted5;
    fadeObject.fade6In = getTransitionIn(imageLengthObject.converted6);
    fadeObject.fade6Out = imageLengthObject.converted6;
    return fadeObject;
  }

  function fillFadeWithAudioObject(audioLengthObject, imageLengthObject) {
    fadeObject = {};
    fadeObject.fade0In = getTransitionIn(imageLengthObject.converted0);
    fadeObject.fade0Out = imageLengthObject.converted0;
    fadeObject.fade1In = getTransitionIn(audioLengthObject.audio1);
    fadeObject.fade1Out = audioLengthObject.audio1
    fadeObject.fade2In = getTransitionIn(audioLengthObject.audio2);
    fadeObject.fade2Out = audioLengthObject.audio2
    fadeObject.fade3In = getTransitionIn(audioLengthObject.audio3);
    fadeObject.fade3Out = audioLengthObject.audio3;
    fadeObject.fade4In = getTransitionIn(audioLengthObject.audio4);
    fadeObject.fade4Out = audioLengthObject.audio4
    fadeObject.fade5In = getTransitionIn(audioLengthObject.audio5);
    fadeObject.fade5Out = audioLengthObject.audio5;
    fadeObject.fade6In = getTransitionIn(audioLengthObject.audio6);
    fadeObject.fade6Out = audioLengthObject.audio6;
    return fadeObject;
  }

  function replaceTransitions(data, transitionObject) {
    data = data.split('${transtion-0-in}').join(transitionObject.transition0In);
    data = data.split('${transtion-0-out}').join(transitionObject.transition0Out);
    data = data.split('${transtion-1-in}').join(transitionObject.transition1In);
    data = data.split('${transtion-1-out}').join(transitionObject.transition1Out);
    data = data.split('${transtion-2-in}').join(transitionObject.transition2In);
    data = data.split('${transtion-2-out}').join(transitionObject.transition2Out);
    data = data.split('${transtion-3-in}').join(transitionObject.transition3In);
    data = data.split('${transtion-3-out}').join(transitionObject.transition3Out);
    data = data.split('${transtion-4-in}').join(transitionObject.transition4In);
    data = data.split('${transtion-4-out}').join(transitionObject.transition4Out);
    data = data.split('${transtion-5-in}').join(transitionObject.transition5In);
    data = data.split('${transtion-5-out}').join(transitionObject.transition5Out);
    data = data.split('${transtion-6-in}').join(transitionObject.transition6In);
    data = data.split('${transtion-6-out}').join(transitionObject.transition6Out);
    return data;
  }

  function replaceFilter(data, filterObject) {
    data = data.split('${filter-0-in}').join(filterObject.transition0In);
    data = data.split('${filter-0-out}').join(filterObject.transition0Out);
    data = data.split('${filter-1-in}').join(filterObject.transition1In);
    data = data.split('${filter-1-out}').join(filterObject.transition1Out);
    data = data.split('${filter-2-in}').join(filterObject.transition2In);
    data = data.split('${filter-2-out}').join(filterObject.transition2Out);
    data = data.split('${filter-3-in}').join(filterObject.transition3In);
    data = data.split('${filter-3-out}').join(filterObject.transition3Out);
    data = data.split('${filter-4-in}').join(filterObject.transition4In);
    data = data.split('${filter-4-out}').join(filterObject.transition4Out);
    data = data.split('${filter-5-in}').join(filterObject.transition5In);
    data = data.split('${filter-5-out}').join(filterObject.transition5Out);
    data = data.split('${filter-6-in}').join(filterObject.transition6In);
    data = data.split('${filter-6-out}').join(filterObject.transition6Out);
    return data;
  }

  function replaceFade(data, fadeObject) {
    data = data.split('${fade-0-in}').join(fadeObject.fade0In);
    data = data.split('${fade-0-out}').join(fadeObject.fade0Out);
    data = data.split('${fade-1-in}').join(fadeObject.fade1In);
    data = data.split('${fade-1-out}').join(fadeObject.fade1Out);
    data = data.split('${fade-2-in}').join(fadeObject.fade2In);
    data = data.split('${fade-2-out}').join(fadeObject.fade2Out);
    data = data.split('${fade-3-in}').join(fadeObject.fade3In);
    data = data.split('${fade-3-out}').join(fadeObject.fade3Out);
    data = data.split('${fade-4-in}').join(fadeObject.fade4In);
    data = data.split('${fade-4-out}').join(fadeObject.fade4Out);
    data = data.split('${fade-5-in}').join(fadeObject.fade5In);
    data = data.split('${fade-5-out}').join(fadeObject.fade5Out);
    data = data.split('${fade-6-in}').join(fadeObject.fade6In);
    data = data.split('${fade-6-out}').join(fadeObject.fade6Out);
    return data;
  }

  function replaceImageLength(data, imageLengthObject) {
    data = data.split('${0-converted}').join(imageLengthObject.converted0);
    data = data.split('${1-converted}').join(imageLengthObject.converted1);
    data = data.split('${2-converted}').join(imageLengthObject.converted2);
    data = data.split('${3-converted}').join(imageLengthObject.converted3);
    data = data.split('${4-converted}').join(imageLengthObject.converted4);
    data = data.split('${5-converted}').join(imageLengthObject.converted5);
    data = data.split('${6-converted}').join(imageLengthObject.converted6);
    return data;
  }

  function replaceAudioLength(data, audioLengthObject) {
    data = data.split('${0-audio}').join(audioLengthObject.audio0);
    data = data.split('${1-audio}').join(audioLengthObject.audio1);
    data = data.split('${2-audio}').join(audioLengthObject.audio2);
    data = data.split('${3-audio}').join(audioLengthObject.audio3);
    data = data.split('${4-audio}').join(audioLengthObject.audio4);
    data = data.split('${5-audio}').join(audioLengthObject.audio5);
    data = data.split('${6-audio}').join(audioLengthObject.audio6);
    return data;
  }

  function replaceGap(data, gapObject) {
    data = data.split('${0-gap}').join(gapObject.gap0);
    data = data.split('${1-gap}').join(gapObject.gap1);
    data = data.split('${2-gap}').join(gapObject.gap2);
    data = data.split('${3-gap}').join(gapObject.gap3);
    data = data.split('${4-gap}').join(gapObject.gap4);
    data = data.split('${5-gap}').join(gapObject.gap5);
    data = data.split('${6-gap}').join(gapObject.gap6);
    return data;
  }

    async function renderVideoWithKdenlive() {

      return new Promise((resolve, reject) => {
        const systemPlatform=os.platform
        
        const templateFilePath = fromRoot('./templates/3/final.mlt')

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

    function getTimeString(init){

      init = init.replace(',','.')
      
      const result = moment.duration(init).asSeconds()

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