<script setup>
// ── Auth check ──────────────────────────────────────────────────────────────
// All routing logic lives here. The template branches on `isAuthenticated`
// so the chat interface is never rendered — not even in the DOM — when
// the user is logged out.

const user = useSupabaseUser();
const isAuthenticated = computed(() => !!user.value);
</script>

<template>
  <div class="page-root">

    <!-- ── Ambient background (always visible) ────────────────────────── -->
    <div class="bg-layer" aria-hidden="true">
      <div class="bg-blob bg-blob--top"></div>
      <div class="bg-blob bg-blob--bottom"></div>
      <div class="bg-noise"></div>
    </div>

    <!-- ── Navbar (always visible) ───────────────────────────────────── -->
    <AppNavbar />

    <!-- ── AUTHENTICATED: render the chat app ────────────────────────── -->
    <template v-if="isAuthenticated">
      <div class="chat-layer">
        <ChatInterface />
      </div>
    </template>

    <!-- ── NOT AUTHENTICATED: blurred placeholder + login modal ──────── -->
    <template v-else>
      <!-- Blurred decorative background so the page looks full -->
      <div class="locked-layer" aria-hidden="true">
        <div class="locked-placeholder">
          <div class="locked-placeholder-line locked-placeholder-line--wide"></div>
          <div class="locked-placeholder-line locked-placeholder-line--medium"></div>
          <div class="locked-placeholder-line locked-placeholder-line--narrow"></div>
        </div>
      </div>

      <!-- Google login popup (centered modal over the blur) -->
      <AuthModal />
    </template>

  </div>
</template>

<style scoped>
/* ── Page Root ───────────────────────────────────────────────────────────── */

.page-root {
  background-color: #020410;
  color: #cbd5e1;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Inter', sans-serif;
}

/* ── Background ──────────────────────────────────────────────────────────── */

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 9999px;
}

.bg-blob--top {
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 70%;
  background-color: rgba(30, 27, 75, 0.2);
  filter: blur(120px);
  animation: float 20s ease-in-out infinite;
}

.bg-blob--bottom {
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background-color: rgba(46, 16, 101, 0.1);
  filter: blur(100px);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Chat layer (authenticated) ──────────────────────────────────────────── */

.chat-layer {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  z-index: 10;
}

/* ── Locked layer (unauthenticated) ──────────────────────────────────────── */

.locked-layer {
  flex: 1 1 0%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  z-index: 10;
  filter: blur(12px) brightness(0.3);
  pointer-events: none;
  user-select: none;
}

/* Fake shimmer lines to suggest content behind the blur */
.locked-placeholder {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 60%;
  max-width: 36rem;
}

.locked-placeholder-line {
  height: 1rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.08);
}

.locked-placeholder-line--wide   { width: 100%; }
.locked-placeholder-line--medium { width: 70%; }
.locked-placeholder-line--narrow { width: 45%; }

/* ── Blob animation ──────────────────────────────────────────────────────── */

@keyframes float {
  0%   { transform: translateX(-50%) translate(0,    0)     scale(1);   }
  33%  { transform: translateX(-50%) translate(30px, -50px) scale(1.1); }
  66%  { transform: translateX(-50%) translate(-20px, 20px) scale(0.9); }
  100% { transform: translateX(-50%) translate(0,    0)     scale(1);   }
}
</style>
