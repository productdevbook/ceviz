import fs from 'node:fs'

// Synchronous file operations blocking event loop
function loadConfig() {
  const data = fs.readFileSync('./config.json', 'utf8')
  return JSON.parse(data)
}

function saveLog(message) {
  fs.writeFileSync('./log.txt', message, 'utf8')
}

function checkExists(path) {
  return fs.existsSync(path)
}

// Good: using async versions
async function loadConfigAsync() {
  const data = await fs.promises.readFile('./config.json', 'utf8')
  return JSON.parse(data)
}
