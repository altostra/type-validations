const { promisify } = require('util')
const glob = promisify(require('glob'))
const { promises: fs } = require('fs')
const readFile = fs.readFile
const writeFile = fs.writeFile
const uglify = require('terser')

main()
  .then(x => console.log(`Minified ${x} files.`))
  .catch(console.error)

async function main() {
  try {
    const jsFiles = await glob('lib/**/*.js', { ignore: ['tests', 'node_modules'] })
    const ops = jsFiles.map(minifyFile)

    return Promise.all(ops).then(x => x.length)
  } catch (err) {
    throw new Error(`Some files failed to minify: ${err.messsage}`)
  }
}

async function minifyFile(name) {
  try {
    const content = await readFile(name, 'utf8')
    const minified = await uglify.minify(content)

    if (minified.error) { throw minified.error }

    return writeFile(name, minified.code, 'utf8')
  } catch (err) {
    throw new Error(`Failed to minify ${name}: ${err.message}`)
  }
}
