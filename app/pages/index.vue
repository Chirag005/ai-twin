<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { marked } from 'marked'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! 👋 I'm Chirag's AI assistant. Feel free to ask me anything about his experience, projects, tech stack, or background!",
  },
])

const input = ref('')
const isLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const handleSubmit = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: input.value,
  }

  messages.value.push(userMessage)
  const question = input.value
  input.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) throw new Error('Failed to get response')

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    }
    messages.value.push(assistantMessage)

    // Read the text stream
    const text = await response.text()
    assistantMessage.content = text
    scrollToBottom()
    
  } catch (error) {
    console.error('Error:', error)
    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-5xl mx-auto mb-8 text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        AI Twin
      </h1>
      <p class="text-gray-300 text-lg">Ask me anything about Chirag Nagendra</p>
    </div>

    <!-- Chat Container -->
    <div class="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      <!-- Messages -->
      <div 
        ref="chatContainer"
        class="h-[60vh] md:h-[65vh] overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        <div
          v-for="m in messages"
          :key="m.id"
          :class="[
            'flex gap-3 animate-fade-in',
            m.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <!-- Avatar -->
          <div 
            v-if="m.role === 'assistant'"
            class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"
          >
            AI
          </div>

          <!-- Message Bubble -->
          <div 
            :class="[
              'max-w-[80%] md:max-w-[70%] rounded-2xl p-5 shadow-lg transition-all duration-300 hover:scale-[1.02]',
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
                : 'bg-white/10 backdrop-blur-md text-gray-100 border border-white/20'
            ]"
          >
            <div 
              class="prose prose-invert max-w-none"
              v-html="marked.parse(m.content)"
            />
          </div>

          <!-- User Avatar -->
          <div 
            v-if="m.role === 'user'"
            class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg"
          >
            U
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex gap-3 animate-fade-in">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            AI
          </div>
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div class="flex gap-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Form -->
      <div class="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <form @submit.prevent="handleSubmit" class="flex gap-3">
          <input
            v-model="input"
            type="text"
            placeholder="Ask about experience, projects, skills..."
            class="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-md transition-all duration-300"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-xl"
            :disabled="isLoading || !input.trim()"
          >
            <span v-if="!isLoading">Send</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending
            </span>
          </button>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <div class="max-w-5xl mx-auto mt-6 text-center text-gray-400 text-sm">
      <p>Powered by Groq AI • Built with Nuxt 4 & Vue 3</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.prose :deep(h1), .prose :deep(h2), .prose :deep(h3) {
  color: inherit;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.prose :deep(ul), .prose :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}

.prose :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.prose :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose :deep(pre code) {
  background: none;
  padding: 0;
}

.prose :deep(strong) {
  font-weight: 600;
  color: inherit;
}

.prose :deep(a) {
  color: #60a5fa;
  text-decoration: underline;
}

/* Custom scrollbar */
:deep(::-webkit-scrollbar) {
  width: 8px;
}

:deep(::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.3);
}
</style>
