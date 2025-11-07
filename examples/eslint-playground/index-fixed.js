// Fixed examples showing correct patterns for all 5 ceviz ESLint rules

// Rule 1: array-find-in-loop - Use Map for O(n+m) complexity
// Rule 5: sync-file-operations - Use async file operations
import fs from 'node:fs/promises'

const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
const ids = [1, 2, 3, 4, 5]

const userMap = new Map(users.map(u => [u.id, u]))
for (const id of ids) {
  const user = userMap.get(id)
  console.log(user)
}

// Rule 2: nested-loops - Flatten or use different algorithm
const arr1 = [1, 2, 3, 4, 5]
const arr2 = [6, 7, 8, 9, 10]

const results = arr1.flatMap(a => arr2.map(b => a * b))
console.log(results)

// Rule 3: memory-leak-interval - Store and cleanup timer
function _startTimer() {
  const timerId = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(timerId)
}

// Rule 4: sequential-requests - Use Promise.all for parallel execution
async function _fetchData() {
  const [data1, data2, data3] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments'),
  ])
  return { data1, data2, data3 }
}

async function _readConfig() {
  const config = await fs.readFile('./config.json', 'utf8')
  return JSON.parse(config)
}
