// Nested loops causing O(n²) complexity
function processData(items, categories) {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      if (items[i].category === categories[j].name) {
        console.log(items[i], categories[j])
      }
    }
  }
}

// Triple nested loop - O(n³)
function processMatrix(data) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      for (let k = 0; k < data[i][j].length; k++) {
        data[i][j][k] *= 2
      }
    }
  }
}
