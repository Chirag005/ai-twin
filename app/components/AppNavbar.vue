<script setup>
import { Settings, LogOut } from 'lucide-vue-next';

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const isSigningOut = ref(false);
const signOutError = ref(null);

const handleSignOut = async () => {
  if (isSigningOut.value) return;

  isSigningOut.value = true;
  signOutError.value = null;

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // No manual redirect needed — useSupabaseUser() reacts to Supabase's
    // onAuthStateChange event and becomes null, which reactively triggers
    // the v-else (AuthModal) branch in index.vue automatically.
  } catch (err) {
    console.error('[Auth] Sign-out failed:', err);
    signOutError.value = err.message ?? 'Sign-out failed. Please try again.';
  } finally {
    isSigningOut.value = false;
  }
};
</script>

<template>
  <div class="navbar-root">

    <header class="navbar">

      <!-- Logo -->
      <div class="navbar-logo-wrap">
        <div class="navbar-logo-box">
          <span class="navbar-logo-text">AI</span>
        </div>
      </div>

      <!-- Right -->
      <div class="navbar-right">

        <!-- Online badge -->
        <div class="online-badge">
          <div class="online-dot"></div>
          <span class="online-label">Online</span>
        </div>

        <!-- User info when signed in -->
        <template v-if="user">
          <div class="user-info">
            <img
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="user.user_metadata?.full_name || 'User'"
              class="user-avatar"
            />
            <div v-else class="user-avatar-fallback">
              <span class="user-avatar-initial">
                {{ (user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase() }}
              </span>
            </div>
            <button
              @click="handleSignOut"
              :disabled="isSigningOut"
              :title="isSigningOut ? 'Signing out…' : 'Sign out'"
              class="icon-btn sign-out-btn"
            >
              <svg v-if="isSigningOut" class="icon-sm sign-out-spinner" fill="none" viewBox="0 0 24 24">
                <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <LogOut v-else class="icon-sm" />
            </button>
          </div>
        </template>

        <!-- Settings when signed out -->
        <template v-else>
          <button class="icon-btn">
            <Settings class="icon-md" />
          </button>
        </template>

      </div>
    </header>

    <!-- Sign-out error toast -->
    <Transition name="toast">
      <div v-if="signOutError" class="sign-out-toast">
        <span class="sign-out-toast-msg">{{ signOutError }}</span>
        <button class="sign-out-toast-dismiss" @click="signOutError = null">✕</button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ── Root wrapper ────────────────────────────────────────────────────────── */
/* Single root element ensures the parent's class (navbar-layer / z-index)   */
/* is correctly inherited by the component.                                   */

.navbar-root {
  position: relative;
  z-index: 30;
  flex-shrink: 0;
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */

.navbar {
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 30;
}

/* ── Logo ──────────────────────────────────────────────────────────────── */

.navbar-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-logo-box {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(12px);
}

.navbar-logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: #ffffff;
  font-size: 0.75rem;
  letter-spacing: -0.05em;
}

/* ── Right Side ────────────────────────────────────────────────────────── */

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.online-badge {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
}

@media (min-width: 640px) {
  .online-badge {
    display: flex;
  }
}

.online-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background-color: #4ade80;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.online-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: #94a3b8;
}

/* ── User ──────────────────────────────────────────────────────────────── */

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  object-fit: cover;
}

.user-avatar-fallback {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: rgba(79, 70, 229, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-initial {
  font-size: 10px;
  font-weight: 600;
  color: #a5b4fc;
}

/* ── Buttons ───────────────────────────────────────────────────────────── */

.icon-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.sign-out-btn:hover {
  color: #f87171;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-md {
  width: 1.25rem;
  height: 1.25rem;
}

/* ── Animation ─────────────────────────────────────────────────────────── */

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Sign-out spinner ──────────────────────────────────────────────────── */

.sign-out-spinner {
  animation: spin 0.8s linear infinite;
  color: #f87171;
}

.sign-out-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Error Toast ───────────────────────────────────────────────────────── */

.sign-out-toast {
  position: fixed;
  top: 4.5rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(30, 10, 10, 0.95);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  max-width: 20rem;
}

.sign-out-toast-msg {
  font-size: 0.8125rem;
  color: #fca5a5;
  line-height: 1.4;
}

.sign-out-toast-dismiss {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.15s ease;
  padding: 0;
  line-height: 1;
}

.sign-out-toast-dismiss:hover {
  opacity: 1;
}

/* Toast transition */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

