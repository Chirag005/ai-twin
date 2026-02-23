<script setup>
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <NuxtPage />
  <Analytics />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom Fonts */
.font-display {
  font-family: 'Outfit', sans-serif;
}

/* Base Typography */
body {
  font-family: 'Inter', sans-serif;
}

/* Custom Scrollbar removed - Tailwind handles it */
</style>
