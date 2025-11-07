// Test fixture for nested-loops rule

// SHOULD TRIGGER: nested for loops
function badExample1(users, posts) {
  for (const user of users) {
    for (const post of posts) {
      if (post.userId === user.id) {
        console.log(post)
      }
    }
  }
}

// SHOULD TRIGGER: while inside for
function badExample2(items, values) {
  for (let i = 0; i < items.length; i++) {
    let j = 0
    while (j < values.length) {
      if (items[i] === values[j]) {
        console.log('match')
      }
      j++
    }
  }
}

// SHOULD NOT TRIGGER: single loop
function goodExample1(users) {
  for (const user of users) {
    console.log(user)
  }
}

// SHOULD NOT TRIGGER: sequential loops
function goodExample2(users, posts) {
  for (const user of users) {
    console.log(user)
  }
  for (const post of posts) {
    console.log(post)
  }
}
