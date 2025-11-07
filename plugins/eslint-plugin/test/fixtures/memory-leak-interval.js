// Test fixture for memory-leak-interval rule
// This file has timers without any cleanup

// SHOULD TRIGGER: setInterval without cleanup
function badExample1() {
  const interval = setInterval(() => {
    console.log('tick')
  }, 1000)
}

// SHOULD TRIGGER: setTimeout without cleanup
function badExample2() {
  setTimeout(() => {
    console.log('delayed')
  }, 1000)
}
