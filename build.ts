import { inlineSource } from 'inline-source'
import * as path from 'node:path'
import * as fs from 'node:fs'

function checkAndCreateDirectory(directory: string) {
  if (!fs.existsSync(directory)){
    fs.mkdirSync(directory, { recursive: true })
  }
}

const htmlpath = path.resolve('index.html')

inlineSource(htmlpath, {
  compress: true,
  rootpath: path.resolve('./'),
  // Skip all css types and png formats
  ignore: [],
})
  .then((html) => {
    // Do something with html
    checkAndCreateDirectory(path.resolve('./build'))
    fs.writeFileSync(path.resolve('./build/index.html'), html)
console.log('Done')
  })
  .catch((err) => {
    // Handle error
    console.log(err)
  })
