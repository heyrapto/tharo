# 🛡️ methara

**The high-performance, local-first utility belt for AI Agents.**

`methara` is a lightweight, zero-dependency (at runtime) TypeScript library designed to provide AI Agents with the essential tools they need to process human language locally, securely, and with extreme speed.

[![NPM Version](https://img.shields.io/npm/v/methara.svg)](https://www.npmjs.com/package/methara)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

### Installation

```bash
npm install methara
```

### Basic Usage

```typescript
import { Intent, Entities, Guard } from 'methara';

const input = "Hey @alice, remind me to check the ORD-12345 status tomorrow at 2pm";

// 1. Sanitize input (Mask PII)
const cleanInput = Guard.maskPII(input);

// 2. Detect Intent
const intent = Intent.analyze(cleanInput); 
// { type: 'task', action: 'reminder', confidence: 0.85 }

// 3. Extract Entities
const data = Entities.extract(input);
// { date: 2026-05-09..., time: '14:00', mentions: ['@alice'], trackingId: 'ORD-12345' }
```

---

## 🧩 Modules

### 🧠 Intent Detection
Analyze user messages to determine what they want to do without calling an LLM.
- **Actions**: `create`, `delete`, `view`, `update`, `complete`, `reminder`.
- **Scope**: `single`, `all`, `team`.

### 🔍 Entity Extraction
Extract structured data from natural language.
- **Dates & Times**: Relative (tomorrow, next Friday) and absolute formats.
- **Mentions**: Extracts `@usernames`.
- **Tracking IDs**: Detects common formats like `ORD-123`, `TKT-456`.
- **Quantities**: Converts word-numbers ("three") to integers (`3`).

### 🛡️ Guard (Security & PII)
Protect your agent from prompt injection and sensitive data leaks.
- **PII Masking**: Emails, Phone numbers, Credit Cards, SSNs, IP Addresses.
- **Injection Protection**: Detects common "jailbreak" and "ignore previous instructions" phrases.
- **Profanity Filter**: Localized check for toxic language.

### 📊 User Patterns
Understand *how* your users communicate over time.
- **Urgency Level**: Detects `high`, `medium`, or `low` based on tone and keywords.
- **Style Analysis**: Identifies `formal` vs `casual` and `detailed` vs `concise` communication.
- **Preferences**: Tracks time-of-day and task-style preferences.

### ⚙️ Text Processor
Optimize your context window and token usage.
- **Shrink**: Removes stopwords and normalizes whitespace (reduces tokens by 20-40%).
- **Token Counter**: Accurate character-based token approximation.
- **Signature Removal**: Strips email signatures and boilerplate.

---

## 🛠️ Advanced Configuration

`methara` is built with ESM and TypeScript from the ground up, ensuring full compatibility with modern Node.js environments (v18+).

```typescript
import { Processor } from 'methara';

const longText = "Very long conversation history...";
const optimized = Processor.shrink(longText, {
  removeStopwords: true,
  removeSignature: true
});
```

---

## 📄 License

MIT © 2026
