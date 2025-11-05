// Nuxt composable with performance issues

export const useData = () => {
  const items = ref<any[]>([])
  const categories = ref<any[]>([])

  // Issue 1: Array.find() inside filter - O(n*m)
  const filteredItems = computed(() => {
    return items.value.filter(item => {
      const category = categories.value.find(cat => cat.id === item.categoryId)
      return category && category.active
    })
  })

  // Issue 2: Deep reactive - performance overhead
  const state = reactive({
    user: {
      profile: {
        settings: {
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: true,
              sms: true
            }
          }
        }
      }
    },
    data: new Array(10000).fill({ value: 'test' }) // Large array, all reactive!
  })

  // Issue 3: Watch with deep: true - heavy
  watch([items, categories], () => {
    console.log('Heavy recomputation')
    // Expensive operation on every change
    items.value.forEach(item => {
      item.computed = heavyCalculation(item)
    })
  }, { deep: true })

  return {
    items,
    categories,
    filteredItems,
    state
  }
}

function heavyCalculation(item: any) {
  let result = 0
  for (let i = 0; i < 1000; i++) {
    result += item.value * i
  }
  return result
}
