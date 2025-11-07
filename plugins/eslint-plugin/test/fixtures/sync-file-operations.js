// Test fixture for sync-file-operations rule
import fs from 'node:fs'

// SHOULD TRIGGER: readFileSync
function _badExample1() {
  const data = fs.readFileSync('file.txt', 'utf-8')
  return data
}

// SHOULD TRIGGER: writeFileSync
function _badExample2() {
  fs.writeFileSync('file.txt', 'data')
}

// SHOULD NOT TRIGGER: async readFile
async function _goodExample1() {
  const data = await fs.promises.readFile('file.txt', 'utf-8')
  return data
}

// SHOULD NOT TRIGGER: no file operations
function _goodExample2() {
  console.log('no file ops')
}
