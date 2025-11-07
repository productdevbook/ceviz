// Test fixture for array-find-in-loop rule
// This file contains examples of the anti-pattern we want to detect

// SHOULD TRIGGER: .find() inside for loop
function _badExample1(items, users) {
  for (const item of items) {
    const user = users.find(u => u.id === item.userId)
    console.log(user)
  }
}

// SHOULD TRIGGER: .filter() inside while loop
function _badExample2(items, array) {
  let i = 0
  while (i < items.length) {
    const matches = array.filter(x => x.value > items[i])
    i++
  }
}

// SHOULD TRIGGER: .includes() inside forEach
function _badExample3(items, validIds) {
  items.forEach((item) => {
    if (validIds.includes(item.id)) {
      console.log('valid')
    }
  })
}

// SHOULD NOT TRIGGER: .find() outside loop
function _goodExample1(users) {
  const user = users.find(u => u.id === 1)
  return user
}

// SHOULD NOT TRIGGER: Map lookup inside loop
function _goodExample2(items, userMap) {
  for (const item of items) {
    const user = userMap.get(item.userId)
    console.log(user)
  }
}
