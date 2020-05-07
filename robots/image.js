const imageDownloader = require('image-downloader')
const Jimp = require("jimp")
const gm = require('gm').subClass({imageMagick: true})
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot(){
    const content = state.load()

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)
    await convertAllImagesToPng(content)
    await convertAllImages(content)
    await createAllSentencesImages(content)
    await createYoutubeThumbnail();


    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          let query
    
          if (sentenceIndex === 0) {
            query = `${content.searchTerm}`
          } else {
            query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
          }
    
          console.log(`> [image-robot] Querying Google Images with: "${query}"`)
    
          content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
          content.sentences[sentenceIndex].googleSearchQuery = query
        }
      }
    
    
    
    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
          auth: googleSearchCredentials.apiKey,
          cx: googleSearchCredentials.searchEngineId,
          q: query,
          searchType: 'image',
          num: 2
        })
    
        const imagesUrl = response.data.items.map((item) => {
          return item.link
        })
    
        return imagesUrl
      }

    async function downloadAllImages(content) {
        content.downloadedImages = []
    
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          const images = content.sentences[sentenceIndex].images
    
          for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
            const imageUrl = images[imageIndex]
    
            try {
              if (content.downloadedImages.includes(imageUrl)) {
                throw new Error('Image already downloaded')
              }
    
              await downloadAndSave(imageUrl, `${sentenceIndex}-original.jpg`)
              content.downloadedImages.push(imageUrl)
              console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`)
              break
            } catch(error) {
              console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)
            }
          }
        }
      }
    
      async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
          url: url,
          dest: `./content/${fileName}`
        })
      }

      async function convertAllImagesToPng(content){
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await convertToPng(sentenceIndex)
        }
      }

      async function convertToPng(sentenceIndex){
        return new Promise((resolve,reject) => {
            const inputFile = `./content/${sentenceIndex}-original.jpg`

            Jimp.read(inputFile, function (err, image) {
                if (err) {
                    reject(err)
                } else {
                    const name = inputFile.replace('.jpg','.png')
                    image.write(name)
                    resolve()
                }
            })


            
        })
        
      }

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
}
module.exports = robot