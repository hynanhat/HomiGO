import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { SUPPORT_TOPICS } from './chatbotKnowledge'
import { SupportChatbot } from './SupportChatbot'

function renderChatbot() {
  return render(<MemoryRouter><SupportChatbot /></MemoryRouter>)
}

describe('SupportChatbot suggestions', () => {
  it('opens with a greeting and can be closed and opened again', async () => {
    const user = userEvent.setup()
    renderChatbot()

    const launcher = screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' })
    expect(launcher).toHaveAttribute('aria-expanded', 'false')

    await user.click(launcher)

    expect(screen.getByRole('dialog', { name: 'Hỗ trợ khách hàng' })).toBeInTheDocument()
    expect(screen.getByText(/Mình là trợ lý HomiGO/)).toBeInTheDocument()
    expect(launcher).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: 'Đóng hỗ trợ khách hàng' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(launcher)
    expect(screen.getByRole('dialog', { name: 'Hỗ trợ khách hàng' })).toBeInTheDocument()
  })

  it('adds each selected suggestion and its approved response in order', async () => {
    const user = userEvent.setup()
    renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))

    const log = screen.getByRole('log', { name: 'Nội dung trò chuyện' })
    for (const topic of SUPPORT_TOPICS) {
      await user.click(screen.getByRole('button', { name: topic.label }))
      expect(within(log).getByText(topic.label)).toBeInTheDocument()
      expect(within(log).getByText(topic.answer)).toBeInTheDocument()
      expect(within(log).getByRole('link', { name: topic.action.label })).toHaveAttribute('href', topic.action.path)
    }

    const messages = within(log).getAllByRole('listitem')
    expect(messages).toHaveLength(1 + SUPPORT_TOPICS.length * 2)
    expect(messages.at(-2)).toHaveTextContent(SUPPORT_TOPICS.at(-1)?.label ?? '')
    expect(messages.at(-1)).toHaveTextContent(SUPPORT_TOPICS.at(-1)?.answer ?? '')
  })
})

describe('SupportChatbot typed questions', () => {
  it('submits a Vietnamese question with Enter, shows its answer, and clears the draft', async () => {
    const user = userEvent.setup()
    renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))

    const input = screen.getByRole('textbox', { name: 'Câu hỏi của bạn' })
    expect(input).toHaveAttribute('maxlength', '500')

    await user.type(input, 'toi muon dang tin{Enter}')

    const log = screen.getByRole('log', { name: 'Nội dung trò chuyện' })
    expect(within(log).getByText('toi muon dang tin')).toBeInTheDocument()
    expect(within(log).getByText(/Để đăng tin, bạn cần đăng nhập/)).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('rejects blank input without appending a message', async () => {
    const user = userEvent.setup()
    renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))

    const log = screen.getByRole('log', { name: 'Nội dung trò chuyện' })
    const beforeCount = within(log).getAllByRole('listitem').length
    await user.type(screen.getByRole('textbox', { name: 'Câu hỏi của bạn' }), '   ')
    await user.click(screen.getByRole('button', { name: 'Gửi câu hỏi' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập câu hỏi.')
    expect(within(log).getAllByRole('listitem')).toHaveLength(beforeCount)
  })

  it('keeps multiple typed turns in submission order', async () => {
    const user = userEvent.setup()
    renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))
    const input = screen.getByRole('textbox', { name: 'Câu hỏi của bạn' })

    await user.type(input, 'tìm căn hộ{Enter}')
    await user.type(input, 'đổi thông tin cá nhân{Enter}')

    const messages = within(screen.getByRole('log', { name: 'Nội dung trò chuyện' })).getAllByRole('listitem')
    expect(messages).toHaveLength(5)
    expect(messages[1]).toHaveTextContent('tìm căn hộ')
    expect(messages[3]).toHaveTextContent('đổi thông tin cá nhân')
  })
})

describe('SupportChatbot fallback', () => {
  it('offers the support email for an unknown question', async () => {
    const user = userEvent.setup()
    renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))

    await user.type(screen.getByRole('textbox', { name: 'Câu hỏi của bạn' }), 'Hôm nay thời tiết thế nào?{Enter}')

    const log = screen.getByRole('log', { name: 'Nội dung trò chuyện' })
    expect(within(log).getByText(/Mình chưa hiểu rõ câu hỏi này/)).toBeInTheDocument()
    expect(within(log).getByRole('link', { name: 'Gửi email hỗ trợ' })).toHaveAttribute('href', 'mailto:hotro@homigo.vn')
  })
})

describe('SupportChatbot accessibility', () => {
  it('moves focus into the dialog and returns it to the launcher after Escape', async () => {
    const user = userEvent.setup()
    renderChatbot()
    const launcher = screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' })

    await user.click(launcher)
    expect(screen.getByRole('textbox', { name: 'Câu hỏi của bạn' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(launcher).toHaveFocus()
  })

  it('has no detectable accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderChatbot()
    await user.click(screen.getByRole('button', { name: 'Mở hỗ trợ khách hàng' }))

    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
