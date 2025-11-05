// Nuxt middleware with blocking operations

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Issue 1: Heavy computation in middleware (blocks every route!)
  const token = to.query.token as string

  if (token) {
    // Issue 2: Sync crypto operation - blocks event loop
    const crypto = await import('crypto')
    const hash = crypto.pbkdf2Sync(token, 'salt', 100000, 64, 'sha512')

    // Issue 3: Sequential DB checks (should be parallel)
    const user = await $fetch('/api/auth/user')
    const permissions = await $fetch('/api/auth/permissions')
    const settings = await $fetch('/api/auth/settings')

    // Issue 4: O(n²) permission check
    const allowedRoutes = []
    for (const permission of permissions) {
      for (const route of permission.routes) {
        if (route.path === to.path) {
          allowedRoutes.push(route)
        }
      }
    }

    if (allowedRoutes.length === 0) {
      return navigateTo('/unauthorized')
    }
  }
})
