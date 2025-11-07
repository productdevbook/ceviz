// Test fixture for sequential-requests rule

// SHOULD TRIGGER: sequential await calls
async function badExample1() {
  const data1 = await fetch('/api/1')
  const data2 = await fetch('/api/2')
  const data3 = await fetch('/api/3')
}

// SHOULD NOT TRIGGER: single await
async function goodExample1() {
  const data = await fetch('/api/data')
  return data
}
