const algorithmia = require('algorithmia')
const lexrank = require('lexrank.js')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const algorithmiaLang = require('../credentials/algorithmia.json').lang
const sentenceBoundaryDetection = require(`sbd`)
const base64 = require('base-64');
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

const gotitaiApiKey = require('../credentials/gotitai.json').apiKeyBase64
const user = require('../credentials/gotitai.json').user
const passwd = require('../credentials/gotitai.json').passwd


const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

const state = require('./state.js')

const wikiLanguages = {'Portuguese' : 'pt', 'English':'en'}
const gotitLanguages = {'Portuguese' : 'PtBr', 'English':'EnUs'}

async function robot() {
    const content = state.load()
    await fetchContentFromWiki(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    // await breakContentIntoLexicalRankedSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    await fetchGotItAi(content)

    state.save(content)

    
    async function fetchContentFromWiki(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgo = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        // const wikipediaResponse = await wikipediaAlgo.pipe(content.searchTerm)
        var term = {
          "articleName": content.searchTerm,
          "lang": wikiLanguages[content.language]
        }
        const wikipediaResponse = await wikipediaAlgo.pipe(term)

        const wikipediaContent = wikipediaResponse.get()
        
        content.sourceContentOriginal = wikipediaContent
        
    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal.content)
        const withoutDatesInParenthesis = removeDatesInParenthesis(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParenthesis

        function removeBlankLinesAndMarkdown(text){
            text = text.replace(/['"]+/g, '')
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParenthesis(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []
    
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
          content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
          })
        })
    }

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        console.log('> [text-robot] Starting to fetch keywords from Watson')
        const listOfKeywordsToFetch = []
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence)
            listOfKeywordsToFetch.push(
              fetchWatsonAndReturnKeywords(sentence)
            )
        }
      
        await Promise.all(listOfKeywordsToFetch)

      }

    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
          nlu.analyze({
            text: sentence.text,
            features: {
              keywords: {}
            }
          }, (error, response) => {
            if (error) {
              reject(error)
              return
            }
    
            const keywords = response.keywords.map((keyword) => {
              return keyword.text
            })

            sentence.keywords = keywords
    
            resolve(keywords)
          })
        })
      }

      async function breakContentIntoLexicalRankedSentences(content) {
        content.sentences = []

        lexrank(content.sourceContentSanitized, (err, result) => {
          if (err) {
            throw error
          }

          sentences = result[0].sort(function(a,b){return b.weight.average - a.weight.average})
          
          sentences.forEach((sentence) => {
            content.sentences.push({
              text: sentence.text,
              keywords: [],
              images: []
            })
          })
        })
      }

      async function fetchGotItAi(content) {
        var body =  {   'T': content.sentences[0].text, 'EM': true , 'SL': gotitLanguages[content.language] , "S": true};
        const fetch = require("node-fetch")
        const url = "https://api.gotit.ai/NLU/Analyze"
        console.log('> [text-robot] Getting feeling from GotIt.Ai')
        const getData = async url => {
          try {
            const response = await fetch(url, {
              'method': 'post',
              'body':	JSON.stringify(body),
              'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64.encode(`${user}:${passwd}`)}`
                }	 
            })
            const json = await response.json()
            let arr = Object.values(json.emotions);
            let max = Math.max(...arr);
            if(json.emotions.sadness == max) {
              content.feeling = "sadness"
            } else if(json.emotions.joy == max) {
              content.feeling = "sadness"
            } else if(json.emotions.fear == max) {
              content.feeling = "sadness"
            } else if(json.emotions.disgust == max) {
              content.feeling = "sadness"
            } else if(json.emotions.anger == max) {
              content.feeling = "sadness"
            } else {
              content.feeling = "1"
      
            }
            console.log(`> [text-robot] the feeling is ${content.feeling}: by GotIt.Ai`)
          } catch (error) {
            console.log(`> [text-robot] ${error}`)
          }
        };
        await getData(url)
      }


    
}

module.exports = robot