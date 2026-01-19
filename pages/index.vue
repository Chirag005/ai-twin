<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'
import { marked } from 'marked'

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  initialMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Chirag's AI assistant. Feel free to ask me anything about his experience, projects, tech stack, or background.",
    },
  ],
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 min-h-screen">
    <h1 class="text-4xl font-bold text-center mb-10">Ask me anything about Chirag</h1>

    <div class="bg-gray-50 border rounded-lg p-6 mb-8 h-96 overflow-y-auto space-y-4">
      <div
        v-for="m in messages"
        :key="m.id"
        :class="[
          'p-4 rounded-lg max-w-3xl',
          m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white shadow',
        ]"
      >
        <div class="prose" v-html="marked.parse(m.content)" />
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="flex gap-4">
      <input
        v-model="input"
        type="text"
        placeholder="e.g., What is Chirag's experience with Vue and Nuxt?"
        class="flex-1 px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="isLoading"
      />
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Thinking...' : 'Send' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.prose :deep(pre) {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>
