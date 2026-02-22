<script setup>
import {
  Sparkles, Code2, FolderGit2,
  GraduationCap, MessageCircle, Paperclip, ArrowRight,
  Copy, ThumbsUp, X, FileText
} from 'lucide-vue-next';

// ── State ────────────────────────────────────────────────────────────────────
const chatInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const chatContainer = ref(null);
const inputRef = ref(null);
const fileInputRef = ref(null);
const attachedFile = ref(null);
const showWelcome = computed(() => messages.value.length === 0);

// ── Helpers ──────────────────────────────────────────────────────────────────
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' });
  }
};

const formatMessage = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

const fillInput = (text) => {
  chatInput.value = text;
  inputRef.value?.focus();
};

// ── File Attachment ───────────────────────────────────────────────────────────
const triggerFileInput = () => fileInputRef.value?.click();

const removeAttachment = () => {
  attachedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const onFileSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedFile.value = { name: file.name, type: 'image', preview: e.target.result, data: e.target.result };
    };
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf') {
    attachedFile.value = { name: file.name, type: 'pdf', preview: null, data: null, loading: true };
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((d, b) => d + String.fromCharCode(b), ''));
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf: base64 }),
      });
      const { text } = await res.json();
      attachedFile.value = { ...attachedFile.value, data: text, loading: false };
    } catch {
      attachedFile.value = null;
      alert('Could not read PDF. Please try another file.');
    }
  } else {
    alert('Only images and PDF files are supported.');
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

// ── Send ──────────────────────────────────────────────────────────────────────
const handleSend = async () => {
  const text = chatInput.value.trim();
  if (!text && !attachedFile.value) return;

  const file = attachedFile.value;
  let userContent;

  if (file) {
    const parts = [];
    if (file.type === 'image') parts.push({ type: 'image', image: file.data });
    else if (file.type === 'pdf') parts.push({ type: 'text', text: `[Attached PDF: ${file.name}]\n\n${file.data}` });
    if (text) parts.push({ type: 'text', text });
    userContent = parts;
  } else {
    userContent = text;
  }

  const displayText = text || `[Attached: ${file?.name}]`;
  messages.value.push({
    id: Date.now(),
    text: displayText,
    sender: 'user',
    attachment: file ? { name: file.name, type: file.type, preview: file.preview } : null,
  });

  chatInput.value = '';
  attachedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const apiMessages = messages.value.slice(0, -1).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
    apiMessages.push({ role: 'user', content: userContent });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
    });
    if (!response.ok) throw new Error('Failed');
    const aiResponse = await response.text();
    messages.value.push({ id: Date.now() + 1, text: aiResponse, sender: 'ai' });
  } catch {
    messages.value.push({ id: Date.now() + 1, text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// ── Suggestion cards ──────────────────────────────────────────────────────────
// Colors are CSS custom properties set via :style — keeps the template clean
// and avoids dynamic Tailwind class strings.
const suggestions = [
  {
    title: 'Tech Stack Experience',
    desc: 'What is your experience with Nuxt 3?',
    icon: Code2,
    vars: {
      '--accent':       'rgb(96, 165, 250)',
      '--accent-soft':  'rgba(59, 130, 246, 0.1)',
      '--accent-hover': 'rgba(59, 130, 246, 0.2)',
      '--border-hover': 'rgba(59, 130, 246, 0.3)',
      '--text-hover':   'rgb(147, 197, 253)',
    },
  },
  {
    title: 'Recent Projects',
    desc: 'Tell me about your recent projects.',
    icon: FolderGit2,
    vars: {
      '--accent':       'rgb(232, 121, 249)',
      '--accent-soft':  'rgba(217, 70, 239, 0.1)',
      '--accent-hover': 'rgba(217, 70, 239, 0.2)',
      '--border-hover': 'rgba(217, 70, 239, 0.3)',
      '--text-hover':   'rgb(240, 171, 252)',
    },
  },
  {
    title: 'Education',
    desc: 'What is your educational background?',
    icon: GraduationCap,
    vars: {
      '--accent':       'rgb(45, 212, 191)',
      '--accent-soft':  'rgba(20, 184, 166, 0.1)',
      '--accent-hover': 'rgba(20, 184, 166, 0.2)',
      '--border-hover': 'rgba(20, 184, 166, 0.3)',
      '--text-hover':   'rgb(94, 234, 212)',
    },
  },
  {
    title: 'Contact Info',
    desc: 'How can I reach out to you?',
    icon: MessageCircle,
    vars: {
      '--accent':       'rgb(251, 191, 36)',
      '--accent-soft':  'rgba(245, 158, 11, 0.1)',
      '--accent-hover': 'rgba(245, 158, 11, 0.2)',
      '--border-hover': 'rgba(245, 158, 11, 0.3)',
      '--text-hover':   'rgb(252, 211, 77)',
    },
  },
];
</script>

<template>
  <main class="chat-root">

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*,.pdf,application/pdf"
      class="file-input-hidden"
      @change="onFileSelected"
    />

    <!-- Scroll area -->
    <div ref="chatContainer" class="chat-scroll-area">

      <!-- Welcome screen -->
      <Transition name="fade">
        <div v-if="showWelcome" class="welcome-screen">
          <div class="welcome-content">
            <div class="welcome-icon-wrap">
              <div class="welcome-icon-glow"></div>
              <Sparkles class="welcome-icon" />
            </div>
            <div class="welcome-text">
              <h1 class="welcome-title">Chirag's AI Twin</h1>
              <p class="welcome-subtitle">
                I've analyzed Chirag's professional documents. Ask me about his tech stack, experience, or recent projects.
              </p>
            </div>
          </div>

          <!-- Suggestion cards -->
          <div class="suggestion-grid">
            <button
              v-for="s in suggestions"
              :key="s.title"
              @click="fillInput(s.desc)"
              class="suggestion-card"
              :style="s.vars"
            >
              <div class="suggestion-card-inner">
                <div class="suggestion-icon">
                  <component :is="s.icon" class="suggestion-icon-svg" />
                </div>
                <span class="suggestion-label">{{ s.title }}</span>
              </div>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Message stream -->
      <div class="message-stream">
        <div
          v-for="m in messages"
          :key="m.id"
          class="message-row"
          :class="{ 'message-row--user': m.sender === 'user' }"
        >

          <!-- AI message -->
          <template v-if="m.sender === 'ai'">
            <div class="ai-avatar">
              <Sparkles class="ai-avatar-icon" />
            </div>
            <div class="ai-bubble-wrap">
              <div class="ai-bubble-text" v-html="formatMessage(m.text)"></div>
              <div class="ai-actions">
                <button class="ai-action-btn"><Copy class="ai-action-icon" /></button>
                <button class="ai-action-btn"><ThumbsUp class="ai-action-icon" /></button>
              </div>
            </div>
          </template>

          <!-- User message -->
          <template v-else>
            <div class="user-bubble-wrap">
              <img
                v-if="m.attachment?.type === 'image'"
                :src="m.attachment.preview"
                alt="Attached image"
                class="user-attachment-image"
              />
              <div v-if="m.attachment?.type === 'pdf'" class="user-attachment-pdf">
                <FileText class="user-attachment-pdf-icon" />
                <span class="user-attachment-pdf-name">{{ m.attachment.name }}</span>
              </div>
              <div
                v-if="m.text && m.text !== `[Attached: ${m.attachment?.name}]`"
                class="user-text-bubble"
              >
                {{ m.text }}
              </div>
            </div>
          </template>

        </div>

        <!-- Typing indicator -->
        <div v-if="isLoading" class="typing-indicator">
          <div class="typing-avatar">
            <Sparkles class="typing-avatar-icon" />
          </div>
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Input area -->
    <div class="input-area">
      <div class="input-area-inner">

        <!-- Attachment chip -->
        <Transition name="chip-slide">
          <div v-if="attachedFile" class="attachment-chip-row">
            <div class="attachment-chip">
              <img
                v-if="attachedFile.type === 'image' && attachedFile.preview"
                :src="attachedFile.preview"
                alt=""
                class="attachment-chip-thumb"
              />
              <template v-else>
                <FileText v-if="!attachedFile.loading" class="attachment-chip-pdf-icon" />
                <svg v-else class="attachment-chip-spinner" fill="none" viewBox="0 0 24 24">
                  <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </template>
              <span class="attachment-chip-name">{{ attachedFile.name }}</span>
              <button @click="removeAttachment" class="attachment-chip-remove">
                <X class="attachment-chip-remove-icon" />
              </button>
            </div>
          </div>
        </Transition>

        <!-- Input pill -->
        <div class="input-pill">
          <Sparkles class="input-sparkle" />
          <input
            ref="inputRef"
            v-model="chatInput"
            type="text"
            @keydown.enter.prevent="handleSend"
            class="chat-input"
            :placeholder="attachedFile ? 'Add a message or just send the file…' : 'Ask anything…'"
            autocomplete="off"
          />
          <div class="input-actions">
            <button
              @click="triggerFileInput"
              title="Attach PDF or image"
              class="attach-btn"
              :class="{ 'attach-btn--active': !!attachedFile }"
            >
              <Paperclip class="input-action-icon" />
            </button>
            <button
              @click="handleSend"
              :disabled="!chatInput.trim() && !attachedFile"
              class="send-btn"
            >
              <ArrowRight class="input-action-icon" />
            </button>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="disclaimer">AI generated content.</p>

      </div>
    </div>

  </main>
</template>

<style scoped>
/* ── Root Layout ─────────────────────────────────────────────────────────── */

.chat-root {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  height: 100%;
  max-width: 56rem;
  margin: 0 auto;
  width: 100%;
}

.file-input-hidden {
  display: none;
}

/* ── Scroll Area ─────────────────────────────────────────────────────────── */

.chat-scroll-area {
  flex: 1 1 0%;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 10rem;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

@media (min-width: 768px) {
  .chat-scroll-area {
    padding: 2rem;
    padding-bottom: 10rem;
  }
}

.chat-scroll-area::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* ── Welcome Screen ──────────────────────────────────────────────────────── */

.welcome-screen {
  width: 100%;
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  min-height: 50vh;
  animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.welcome-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 42rem;
  margin: 0 auto;
}

.welcome-icon-wrap {
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background-color: #0f111a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.welcome-icon-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top right,
    rgba(139, 92, 246, 0.2),
    rgba(217, 70, 239, 0.2)
  );
  opacity: 0.5;
  filter: blur(24px);
  transition: opacity 0.7s ease;
}

.welcome-icon-wrap:hover .welcome-icon-glow {
  opacity: 0.75;
}

.welcome-icon {
  width: 2rem;
  height: 2rem;
  color: #a5b4fc;
  position: relative;
  z-index: 10;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1rem;
}

.welcome-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.875rem;
  font-weight: 500;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin: 0;
}

@media (min-width: 768px) {
  .welcome-title {
    font-size: 2.25rem;
  }
}

.welcome-subtitle {
  max-width: 28rem;
  margin: 0 auto;
  font-size: 1.125rem;
  line-height: 1.625;
  font-weight: 300;
  color: #94a3b8;
}

/* ── Suggestion Cards ────────────────────────────────────────────────────── */

.suggestion-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  width: 100%;
  max-width: 42rem;
  padding: 0 0.5rem;
}

@media (min-width: 768px) {
  .suggestion-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.suggestion-card {
  text-align: left;
  padding: 0.875rem;
  border-radius: 0.75rem;
  background-color: rgba(19, 19, 43, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  background-color: rgba(26, 26, 53, 0.6);
  border-color: var(--border-hover);
}

.suggestion-card-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.suggestion-icon {
  padding: 0.375rem;
  border-radius: 0.5rem;
  background-color: var(--accent-soft);
  color: var(--accent);
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.suggestion-card:hover .suggestion-icon {
  background-color: var(--accent-hover);
}

.suggestion-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
}

.suggestion-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
  transition: color 0.3s ease;
}

.suggestion-card:hover .suggestion-label {
  color: var(--text-hover);
}

/* ── Message Stream ──────────────────────────────────────────────────────── */

.message-stream {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding-top: 1rem;
}

.message-row {
  display: flex;
  gap: 1rem;
  animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.message-row--user {
  justify-content: flex-end;
}

/* AI bubble */
.ai-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
}

.ai-avatar-icon {
  width: 1rem;
  height: 1rem;
  color: #818cf8;
}

.ai-bubble-wrap {
  flex: 1 1 0%;
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-bubble-text {
  font-size: 0.875rem;
  line-height: 1.625;
  color: #cbd5e1;
  font-weight: 300;
}

.ai-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.ai-bubble-wrap:hover .ai-actions {
  opacity: 1;
}

.ai-action-btn {
  color: #475569;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.ai-action-btn:hover {
  color: #94a3b8;
}

.ai-action-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* User bubble */
.user-bubble-wrap {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.user-attachment-image {
  max-width: 260px;
  max-height: 180px;
  border-radius: 1rem;
  border-top-right-radius: 0.125rem;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.user-attachment-pdf {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1f1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.5rem 0.75rem;
}

.user-attachment-pdf-icon {
  width: 1rem;
  height: 1rem;
  color: #818cf8;
  flex-shrink: 0;
}

.user-attachment-pdf-name {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.user-text-bubble {
  font-size: 0.875rem;
  line-height: 1.625;
  background-color: #1f1f2e;
  color: #e2e8f0;
  border-radius: 1.5rem;
  border-top-right-radius: 0.375rem;
  padding: 0.625rem 1.25rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-weight: 300;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.typing-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-avatar-icon {
  width: 1rem;
  height: 1rem;
  color: #818cf8;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  padding: 0.625rem 0.75rem;
}

.typing-dot {
  width: 0.25rem;
  height: 0.25rem;
  background-color: #64748b;
  border-radius: 9999px;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

/* ── Input Area ──────────────────────────────────────────────────────────── */

.input-area {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  width: 100%;
  padding: 0 1rem;
  z-index: 40;
}

.input-area-inner {
  max-width: 48rem;
  margin: 0 auto;
}

/* Attachment chip */
.attachment-chip-row {
  margin-bottom: 0.5rem;
  padding: 0 1rem;
}

.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1f1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.375rem 0.75rem;
  max-width: 20rem;
}

.attachment-chip-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.attachment-chip-pdf-icon {
  width: 1rem;
  height: 1rem;
  color: #818cf8;
  flex-shrink: 0;
}

.attachment-chip-spinner {
  width: 1rem;
  height: 1rem;
  color: #818cf8;
  flex-shrink: 0;
  animation: spin 1s linear infinite;
}

.attachment-chip-name {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.attachment-chip-remove {
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 0.25rem;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
}

.attachment-chip-remove:hover {
  color: #cbd5e1;
}

.attachment-chip-remove-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Input pill */
.input-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #1f1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.input-pill:hover,
.input-pill:focus-within {
  background-color: #252536;
  border-color: rgba(255, 255, 255, 0.2);
}

.input-sparkle {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: #818cf8;
}

.chat-input {
  flex: 1 1 0%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.125rem;
  font-weight: 300;
  letter-spacing: 0.025em;
  height: 1.5rem;
  color: inherit;
  caret-color: #818cf8;
}

.chat-input::placeholder {
  color: #64748b;
  font-weight: 300;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding-left: 0.75rem;
}

.input-action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.attach-btn {
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 9999px;
  transition: color 0.15s ease, background-color 0.15s ease;
  display: flex;
  align-items: center;
}

.attach-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.attach-btn--active {
  color: #818cf8;
}

.send-btn {
  color: #818cf8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 9999px;
  transition: color 0.15s ease, background-color 0.15s ease;
  display: flex;
  align-items: center;
}

.send-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #a5b4fc;
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 12px;
  color: #64748b;
  font-weight: 300;
}

/* ── Rich Text ───────────────────────────────────────────────────────────── */

.ai-bubble-text :deep(strong) {
  font-weight: 600;
  color: #e2e8f0;
}

.ai-bubble-text :deep(code) {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.chip-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.chip-slide-leave-active {
  transition: all 0.2s ease;
}

.chip-slide-enter-from,
.chip-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ── Animations ──────────────────────────────────────────────────────────── */

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
