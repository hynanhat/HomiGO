import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui'
import {
  SUPPORT_GREETING,
  SUPPORT_FALLBACK,
  SUPPORT_TOPICS,
  findSupportTopic,
  getSupportTopic,
  type ChatMessage,
  type SupportAction,
  type SupportTopicId,
} from './chatbotKnowledge'

const INITIAL_MESSAGES: readonly ChatMessage[] = [
  { id: 'greeting', sender: 'bot', text: SUPPORT_GREETING },
]

function MessageAction({ action }: { action: SupportAction }) {
  const className =
    'mt-2 inline-flex font-semibold text-brand-700 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-600'
  if (action.path.startsWith('/')) {
    return (
      <Link className={className} to={action.path}>
        {action.label}
      </Link>
    )
  }
  return (
    <a className={className} href={action.path}>
      {action.label}
    </a>
  )
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([...INITIAL_MESSAGES])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messageCounter = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const createMessageId = (sender: ChatMessage['sender']) => {
    messageCounter.current += 1
    return `${sender}-${messageCounter.current}`
  }

  const selectTopic = (topicId: SupportTopicId) => {
    const topic = getSupportTopic(topicId)
    setMessages((current) => [
      ...current,
      { id: createMessageId('user'), sender: 'user', text: topic.label },
      { id: createMessageId('bot'), sender: 'bot', text: topic.answer, action: topic.action },
    ])
  }

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const question = draft.trim()
    if (!question) {
      setError('Vui lòng nhập câu hỏi.')
      return
    }

    const topic = findSupportTopic(question)
    const response = topic ?? SUPPORT_FALLBACK
    setMessages((current) => [
      ...current,
      { id: createMessageId('user'), sender: 'user', text: question },
      { id: createMessageId('bot'), sender: 'bot', text: response.answer, action: response.action },
    ])
    setDraft('')
    setError(null)
  }

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen])

  return (
    <div className="support-chatbot">
      {isOpen && (
        <section
          id="support-chatbot-panel"
          className="support-chatbot-panel"
          role="dialog"
          aria-labelledby="support-chatbot-title"
        >
          <header className="support-chatbot-header">
            <div className="flex min-w-0 items-center gap-3">
              <span className="support-chatbot-avatar" aria-hidden="true">
                <Bot className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 id="support-chatbot-title" className="font-bold text-white">
                  Hỗ trợ khách hàng
                </h2>
                <p className="text-xs text-brand-100">Trợ lý HomiGO</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Đóng hỗ trợ khách hàng"
              onClick={() => setIsOpen(false)}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </header>

          <div
            ref={logRef}
            className="support-chatbot-log"
            role="log"
            aria-label="Nội dung trò chuyện"
            aria-live="polite"
            aria-relevant="additions"
            aria-atomic="false"
          >
            <ol className="grid gap-3">
              {messages.map((message) => (
                <li key={message.id} className={`support-chatbot-message is-${message.sender}`}>
                  <span className="sr-only">
                    {message.sender === 'bot' ? 'Trợ lý HomiGO:' : 'Bạn:'}
                  </span>
                  <p>{message.text}</p>
                  {message.action && <MessageAction action={message.action} />}
                </li>
              ))}
            </ol>
          </div>

          <div className="support-chatbot-suggestions" aria-label="Câu hỏi gợi ý">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Bạn muốn hỏi về
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPORT_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className="support-chatbot-suggestion"
                  onClick={() => selectTopic(topic.id)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <form className="support-chatbot-composer" onSubmit={submitQuestion}>
            <label className="sr-only" htmlFor="support-chatbot-question">
              Câu hỏi của bạn
            </label>
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                id="support-chatbot-question"
                className="support-chatbot-input"
                type="text"
                value={draft}
                maxLength={500}
                placeholder="Nhập câu hỏi..."
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'support-chatbot-error' : undefined}
                onChange={(event) => {
                  setDraft(event.target.value)
                  if (error) setError(null)
                }}
              />
              <Button type="submit" size="md" aria-label="Gửi câu hỏi" className="shrink-0 px-3">
                <Send className="size-5" aria-hidden="true" />
              </Button>
            </div>
            {error && (
              <p
                id="support-chatbot-error"
                className="mt-1 text-sm font-medium text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
          </form>
        </section>
      )}

      <button
        type="button"
        className="support-chatbot-launcher"
        aria-label="Mở hỗ trợ khách hàng"
        aria-controls="support-chatbot-panel"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="size-6" aria-hidden="true" />
        <span className="hidden font-semibold sm:inline">Hỗ trợ</span>
      </button>
    </div>
  )
}
