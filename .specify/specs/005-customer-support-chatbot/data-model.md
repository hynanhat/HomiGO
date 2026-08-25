# Data Model: Customer Support Chatbot

The MVP has no persistent data. All models below exist only in the current browser render lifecycle.

## SupportTopic

Represents one approved category of customer assistance.

| Field | Type | Rules |
|-------|------|-------|
| `id` | Stable string | Unique English source identifier |
| `label` | String | Short Vietnamese suggestion shown to customers |
| `phrases` | String list | Non-empty curated matching phrases |
| `answer` | String | Approved Vietnamese response; plain text only |
| `actionLabel` | String | Optional Vietnamese label for a related route |
| `actionPath` | String | Optional internal HomiGO route beginning with `/` |

Validation rules:

- Every topic has at least one phrase and one non-empty answer.
- Source identifiers and keys are English; customer-visible values are Vietnamese.
- Answers render as text, never as HTML.
- The initial set contains search, listing creation, account, saved listings, and seller upgrade.

## ChatMessage

Represents one ordered message in the temporary conversation.

| Field | Type | Rules |
|-------|------|-------|
| `id` | String | Unique within the current component lifecycle |
| `sender` | `bot` or `user` | Determines label and visual presentation |
| `text` | String | Non-empty; user text is at most 500 characters |
| `actionLabel` | String | Optional approved call-to-action label |
| `actionPath` | String | Optional internal route or support email URI |

## ChatSession

Represents ephemeral component state.

| Field | Type | Initial value | Rules |
|-------|------|---------------|-------|
| `isOpen` | Boolean | `false` | Launcher toggles the value |
| `draft` | String | Empty | Trimmed before submission; maximum 500 characters |
| `error` | String or null | `null` | Vietnamese validation message only |
| `messages` | ChatMessage list | One bot greeting | Append-only during the page lifetime |

State transitions:

```text
CLOSED --launcher--> OPEN --close/Escape--> CLOSED
OPEN + valid question --> append USER --> match topic --> append BOT
OPEN + empty question --> keep messages unchanged + show validation
OPEN + unknown question --> append USER --> append FALLBACK BOT
PAGE RELOAD --> new CLOSED session with one greeting
```

## Relationships

```text
SupportTopic 1 ── creates ── * ChatMessage (bot response)
ChatSession 1 ── contains ── * ChatMessage
```
