// Examples demonstrating all 5 ceviz ESLint rules

// Rule 1: array-find-in-loop - O(n*m) complexity
// Rule 5: sync-file-operations - blocking event loop
import fs from 'node:fs'

const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
const ids = [1, 2, 3, 4, 5]

for (const id of ids) {
  const user = users.find(u => u.id === id)
  console.log(user)
}

// Rule 2: nested-loops - O(n²) complexity
const arr1 = [1, 2, 3, 4, 5]
const arr2 = [6, 7, 8, 9, 10]

for (const a of arr1) {
  for (const b of arr2) {
    console.log(a * b)
  }
}

// Rule 3: memory-leak-interval - no cleanup
function _startTimer() {
  setInterval(() => {
    console.log('tick')
  }, 1000)
}

// Rule 4: sequential-requests - could be parallelized
async function _fetchData() {
  const data1 = await fetch('/api/users')
  const data2 = await fetch('/api/posts')
  const data3 = await fetch('/api/comments')
  return { data1, data2, data3 }
}

function _readConfig() {
  const config = fs.readFileSync('./config.json', 'utf8')
  return JSON.parse(config)
}
