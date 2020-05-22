const getAudioDurationInSeconds = require('./helpers/get-duration')
const watsonCredentials = require('../credentials/watson-tts.json')
const { IamAuthenticator } = require('ibm-watson/auth');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const fs = require('fs');
const state = require('./state.js')
const apiKey = watsonCredentials.apikey;

async function robot(){
    const content = state.load()
    
    
    const watsonLanguages = {'Portuguese' : 'pt-BR_IsabelaV3Voice', 'English':'en-US_LisaV3Voice'}
    const voice = watsonLanguages[content.language];

    const textToSpeech = new TextToSpeechV1({
        authenticator: new IamAuthenticator({ apikey: apiKey }),
        url: 'https://stream.watsonplatform.net/text-to-speech/api/'
        });

    await createAllSentencesImages(content);

    state.save(content)


    
    async function createAllSentencesImages(content){
        console.log('> [audio-robot] Starting to create sentences audio with watson text to speech')
        content.audioInfoList = [];
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text, content)
        }
      }
  
      async function createSentenceImage(sentenceIndex, sentenceText, content){
        return new Promise((resolve,reject) => {

            const fileName = `./content/${sentenceIndex}-audio-sentence.wav`;
            let audioInfo = {
                src: fileName,
                duration: 0
            }
        
            var params = {
                text: sentenceText,
                voice: voice,
                accept: 'audio/wav'
            };
    
            textToSpeech.synthesize(params)
                .then(response => {
                    const audio = response.result;
                    return textToSpeech.repairWavHeaderStream(audio);
                })
                .then(async (repairedFile) => {
                    fs.writeFileSync(fileName, repairedFile);
                    
                    const duration = await getAudioDurationInSeconds(fileName);

                    audioInfo.duration = duration;
                    content.audioInfoList.push(audioInfo);

                    console.log(`> [audio-robot] ${fileName} created`);

                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
              })
        
        
        
        
      }
      
}

module.exports = robot