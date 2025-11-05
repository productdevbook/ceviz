<template>
  <div>
    <div v-for="item in processedItems" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
// Performance issues in Vue component

const items = ref<any[]>([])
const filters = ref<any[]>([])

// Issue 1: Heavy computed without memoization
const processedItems = computed(() => {
  // Issue 2: Nested loops in computed - O(n*m)
  return items.value.map(item => {
    const matchedFilters = []
    for (const filter of filters.value) {
      for (const rule of filter.rules) {
        if (rule.key === item.type) {
          matchedFilters.push(filter)
        }
      }
    }

    return {
      ...item,
      filters: matchedFilters
    }
  })
})

// Issue 3: Memory leak - interval never cleared
let pollingInterval: any

onMounted(() => {
  pollingInterval = setInterval(() => {
    fetchData()
  }, 5000)
  // No clearInterval in onUnmounted!
})

// Issue 4: Sequential fetches (waterfall)
async function fetchData() {
  const users = await $fetch('/api/users')
  const posts = await $fetch('/api/posts')
  const comments = await $fetch('/api/comments')

  items.value = combineData(users, posts, comments)
}

function combineData(users: any, posts: any, comments: any) {
  return users
}
</script>
