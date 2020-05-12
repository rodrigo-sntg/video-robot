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

    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          let query
    
          if (sentenceIndex === 0) {
            query = `${content.searchTerm}`
          } else if (content.sentences[sentenceIndex].keywords[0].indexOf(content.searchTerm) > 0 ){
            query = `${content.sentences[sentenceIndex].keywords[0]}`
          }
          else {
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

}
module.exports = robot