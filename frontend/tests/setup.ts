import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import * as axeMatchers from 'vitest-axe/matchers'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { server } from './mocks/server'

expect.extend(axeMatchers)
configure({ asyncUtilTimeout: 3_000 })

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  window.localStorage.clear()
  window.sessionStorage.clear()
})

afterAll(() => server.close())
