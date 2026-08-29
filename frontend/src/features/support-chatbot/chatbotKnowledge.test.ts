import { describe, expect, it } from 'vitest'
import { findSupportTopic, normalizeVietnameseInput } from './chatbotKnowledge'

describe('normalizeVietnameseInput', () => {
  it.each([
    ['  ĐĂNG   TIN!!! ', 'dang tin'],
    ['Tài khoản', 'tai khoan'],
    [`Ta\u0300i khoa\u0309n`, 'tai khoan'],
    ['Lưu-tin yêu thích?', 'luu tin yeu thich'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeVietnameseInput(input)).toBe(expected)
  })
})

describe('findSupportTopic', () => {
  it.each([
    ['Tôi muốn tìm căn hộ tại Hà Nội', 'property-search'],
    ['toi muon dang tin ban nha', 'create-listing'],
    ['Làm sao đổi thông tin cá nhân?', 'account'],
    ['Xem lại danh sách yêu thích ở đâu?', 'saved-listings'],
    ['Tôi muốn trở thành người bán', 'seller-upgrade'],
  ])('matches %s to %s', (question, expectedTopic) => {
    expect(findSupportTopic(question)?.id).toBe(expectedTopic)
  })

  it.each(['Hôm nay thời tiết thế nào?', 'tin nhà', 'đăng tin tài khoản', 'xin chào'])(
    'returns null for low-confidence or ambiguous input: %s',
    (question) => {
      expect(findSupportTopic(question)).toBeNull()
    },
  )
})
