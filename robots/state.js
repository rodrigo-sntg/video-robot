const fs = require('fs')
const contentFilePath = 'content.json'

function save(content) {
    const constentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, constentString)
}

function load(){
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    load
}