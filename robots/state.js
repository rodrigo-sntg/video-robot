const fs = require('fs')
const contentFilePath = 'content.json'
const scriptFilePath = './content/after-effects-script.js'


function save(content) {
    const constentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, constentString)
}

function load(){
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

function saveScript(content) {
    const contentString = JSON.stringify(content)
    const scriptString = `var content = ${contentString}`
    return fs.writeFileSync(scriptFilePath, scriptString)
  }

module.exports = {
    save,
    load,
    saveScript
}