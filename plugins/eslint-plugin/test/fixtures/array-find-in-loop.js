// Array find/filter/map operations inside loops
function matchUsers(orders, users) {
  const results = []
  for (let i = 0; i < orders.length; i++) {
    const user = users.find(u => u.id === orders[i].userId)
    results.push({ order: orders[i], user })
  }
  return results
}

function filterByCategory(items, categories) {
  for (const category of categories) {
    const filtered = items.filter(item => item.category === category)
    console.log(filtered)
  }
}
