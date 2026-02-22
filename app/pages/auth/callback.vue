<script setup>
// This page handles the OAuth redirect from Google/GitHub.
// @nuxtjs/supabase automatically exchanges the code for a session.
// We just navigate back to home.
const router = useRouter();

onMounted(() => {
  // Give Supabase a tick to process the auth code before redirecting.
  setTimeout(() => {
    router.replace('/');
  }, 500);
});
</script>

<template>
  <div class="bg-[#020410] h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <svg class="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="text-slate-500 text-sm tracking-wide">Signing you in…</p>
    </div>
  </div>
</template>
