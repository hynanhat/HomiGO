import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

describe('frontend test environment', () => {
  it('provides DOM and accessibility matchers', async () => {
    const { container } = render(
      <main>
        <h1>HomiGO</h1>
      </main>,
    )

    expect(screen.getByRole('heading', { name: 'HomiGO' })).toBeInTheDocument()
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results).toHaveNoViolations()
  })
})
