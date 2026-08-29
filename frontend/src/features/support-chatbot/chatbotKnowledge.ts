export type SupportTopicId =
  'property-search' | 'create-listing' | 'account' | 'saved-listings' | 'seller-upgrade'

export interface SupportAction {
  label: string
  path: string
}

export interface SupportTopic {
  id: SupportTopicId
  label: string
  phrases: readonly string[]
  answer: string
  action: SupportAction
}

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  action?: SupportAction
}

export const SUPPORT_GREETING =
  'Xin chào! Mình là trợ lý HomiGO. Mình có thể giúp bạn tìm hiểu nhanh về bất động sản, đăng tin và tài khoản.'

export const SUPPORT_FALLBACK = {
  answer:
    'Mình chưa hiểu rõ câu hỏi này. Bạn có thể thử diễn đạt ngắn gọn hơn hoặc liên hệ đội ngũ HomiGO để được hỗ trợ.',
  action: {
    label: 'Gửi email hỗ trợ',
    path: 'mailto:hotro@homigo.vn',
  },
} as const

export const SUPPORT_TOPICS = [
  {
    id: 'property-search',
    label: 'Tìm bất động sản',
    phrases: [
      'tìm bất động sản',
      'tìm nhà',
      'tìm căn hộ',
      'lọc bất động sản',
      'xem danh sách',
      'mua nhà',
      'thuê nhà',
    ],
    answer:
      'Bạn vào trang Bất động sản để tìm kiếm và lọc tin theo loại hình, giao dịch, vị trí, mức giá hoặc diện tích.',
    action: { label: 'Khám phá bất động sản', path: '/listings' },
  },
  {
    id: 'create-listing',
    label: 'Đăng tin như thế nào?',
    phrases: [
      'đăng tin',
      'tạo tin',
      'đăng bán',
      'đăng cho thuê',
      'bán bất động sản',
      'đăng bất động sản',
    ],
    answer:
      'Để đăng tin, bạn cần đăng nhập bằng tài khoản người bán, mở trang Đăng tin, điền đầy đủ thông tin và gửi tin để quản trị viên duyệt.',
    action: { label: 'Đi đến trang đăng tin', path: '/seller/listings/new' },
  },
  {
    id: 'account',
    label: 'Quản lý tài khoản',
    phrases: [
      'tài khoản',
      'hồ sơ',
      'đổi thông tin',
      'thông tin cá nhân',
      'đổi mật khẩu',
      'bảo mật',
    ],
    answer:
      'Bạn có thể cập nhật họ tên, số điện thoại và thông tin cá nhân trong trang Hồ sơ. Mật khẩu được quản lý riêng trong mục Bảo mật.',
    action: { label: 'Mở hồ sơ của tôi', path: '/account/profile' },
  },
  {
    id: 'saved-listings',
    label: 'Lưu tin yêu thích',
    phrases: ['lưu tin', 'tin yêu thích', 'danh sách yêu thích', 'bỏ lưu', 'đã lưu', 'xem lại tin'],
    answer:
      'Khi đã đăng nhập, bạn chọn biểu tượng yêu thích trên tin bất động sản. Các tin đã lưu sẽ nằm trong trang Tin đã lưu.',
    action: { label: 'Xem tin đã lưu', path: '/saved-listings' },
  },
  {
    id: 'seller-upgrade',
    label: 'Nâng cấp người bán',
    phrases: [
      'nâng cấp người bán',
      'trở thành người bán',
      'tài khoản người bán',
      'quyền người bán',
      'seller',
      'nâng cấp tài khoản',
    ],
    answer:
      'Tài khoản thường cần hoàn tất quy trình nâng cấp để trở thành người bán. Sau khi thanh toán được xác nhận, bạn có thể tạo và quản lý tin.',
    action: { label: 'Xem gói người bán', path: '/seller/upgrade' },
  },
] as const satisfies readonly SupportTopic[]

export function getSupportTopic(topicId: SupportTopicId): SupportTopic {
  const topic = SUPPORT_TOPICS.find((candidate) => candidate.id === topicId)
  if (!topic) throw new Error(`Unknown support topic: ${topicId}`)
  return topic
}

export function normalizeVietnameseInput(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function scorePhrase(question: string, phrase: string): number {
  const normalizedPhrase = normalizeVietnameseInput(phrase)
  const wordCount = normalizedPhrase.split(' ').length
  if (question === normalizedPhrase) return 4 + wordCount * 2
  if (` ${question} `.includes(` ${normalizedPhrase} `)) return wordCount === 1 ? 2 : wordCount * 2
  return 0
}

export function findSupportTopic(input: string): SupportTopic | null {
  const question = normalizeVietnameseInput(input)
  if (!question) return null

  const ranked = SUPPORT_TOPICS.map((topic) => ({
    topic,
    score: topic.phrases.reduce((total, phrase) => total + scorePhrase(question, phrase), 0),
  })).sort((left, right) => right.score - left.score)

  const best = ranked[0]
  const runnerUp = ranked[1]
  if (!best || best.score < 4 || best.score === runnerUp?.score) return null
  return best.topic
}
