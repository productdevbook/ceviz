// setInterval without clearInterval causing memory leaks
function startPolling() {
  setInterval(() => {
    fetchData()
  }, 5000)
}

class DataPoller {
  start() {
    setInterval(() => {
      this.poll()
    }, 1000)
  }

  poll() {
    console.log('polling')
  }
}
