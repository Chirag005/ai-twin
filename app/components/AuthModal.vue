<script setup>
import { Sparkles } from 'lucide-vue-next';

const supabase = useSupabaseClient();
const isLoading = ref(false);
const error = ref(null);

const signInWithGoogle = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) throw err;
  } catch (e) {
    error.value = 'Sign-in failed. Please try again.';
    isLoading.value = false;
  }
};
</script>

<template>
  <Transition name="auth-fade">
    <div class="auth-overlay">

      <!-- Blurred backdrop -->
      <div class="auth-backdrop"></div>

      <!-- Login Card -->
      <div class="auth-card-wrap">
        <div class="auth-glow-ring"></div>

        <div class="auth-card">

          <!-- Icon -->
          <div class="auth-icon-wrap">
            <div class="auth-icon-glow"></div>
            <Sparkles class="auth-icon" />
          </div>

          <!-- Title -->
          <div class="auth-title-section">
            <h1 class="auth-title">
              Welcome to <span class="auth-title-gradient">AI Twin</span>
            </h1>
            <p class="auth-subtitle">
              Sign in to chat with Chirag's AI Twin — your interactive guide to his work, skills &amp; projects.
            </p>
          </div>

          <!-- Google Button -->
          <button
            @click="signInWithGoogle"
            :disabled="isLoading"
            class="google-btn"
          >
            <svg v-if="!isLoading" class="google-logo" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <svg v-else class="google-spinner" fill="none" viewBox="0 0 24 24">
              <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{ isLoading ? 'Redirecting...' : 'Continue with Google' }}</span>
          </button>

          <!-- Error -->
          <p v-if="error" class="auth-error">{{ error }}</p>

          <!-- Footer -->
          <p class="auth-footer">
            By signing in you agree to our&nbsp;
            <span class="auth-footer-link">Terms of Service</span>
            &nbsp;&amp;&nbsp;
            <span class="auth-footer-link">Privacy Policy</span>.
          </p>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */

.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-backdrop {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(24px);
  background-color: rgba(2, 4, 16, 0.7);
}

/* ── Card ────────────────────────────────────────────────────────────────── */

.auth-card-wrap {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
}

.auth-glow-ring {
  position: absolute;
  inset: -0.25rem;
  background: linear-gradient(
    to bottom right,
    rgba(99, 102, 241, 0.3),
    rgba(139, 92, 246, 0.2),
    rgba(217, 70, 239, 0.3)
  );
  border-radius: 1.5rem;
  filter: blur(24px);
  opacity: 0.6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.auth-card {
  position: relative;
  background-color: rgba(12, 14, 26, 0.95);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* ── Icon ────────────────────────────────────────────────────────────────── */

.auth-icon-wrap {
  margin: 0 auto 1.5rem;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: linear-gradient(
    to bottom right,
    rgba(79, 70, 229, 0.2),
    rgba(124, 58, 237, 0.2)
  );
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.auth-icon-glow {
  position: absolute;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(
    to top right,
    rgba(139, 92, 246, 0.2),
    rgba(217, 70, 239, 0.2)
  );
  filter: blur(24px);
  border-radius: 1rem;
}

.auth-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #a5b4fc;
  position: relative;
  z-index: 10;
}

/* ── Title ───────────────────────────────────────────────────────────────── */

.auth-title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem;
}

.auth-title-gradient {
  background: linear-gradient(to right, #a78bfa, #e879f9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.625;
  margin: 0;
}

/* ── Google Button ───────────────────────────────────────────────────────── */

.google-btn {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 9999px;
  background-color: #ffffff;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.google-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  transform: scale(1.02);
}

.google-btn:active {
  transform: scale(0.98);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.google-logo {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.google-spinner {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  animation: spin 1s linear infinite;
}

/* ── Error & Footer ──────────────────────────────────────────────────────── */

.auth-error {
  margin-top: 1rem;
  text-align: center;
  color: #f87171;
  font-size: 0.75rem;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 11px;
  color: #475569;
  line-height: 1.625;
}

.auth-footer-link {
  color: #64748b;
}

/* ── Transition ──────────────────────────────────────────────────────────── */

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.4s ease, backdrop-filter 0.4s ease;
}

.auth-fade-enter-from,
.auth-fade-leave-to {
  opacity: 0;
}

/* ── Animations ──────────────────────────────────────────────────────────── */

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
