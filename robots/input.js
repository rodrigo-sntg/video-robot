const readline = require('readline-sync')
const state = require('./state.js')

function robot(){

    const content = {
        maximumSentences: 7
    }
    
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.renderType = askAndReturnRenderType()

    state.save(content)
    
    function askAndReturnSearchTerm() {
        return readline.question('Type a wikipedia search term: ')
    }
    
    function askAndReturnPrefix() {
        const prefixes = ['Who is','What is','The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }

    function askAndReturnRenderType() {
        const prefixes = ['Kdenlive','FFMPEG','After Effects']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose video rendering type: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
}



module.exports = robot