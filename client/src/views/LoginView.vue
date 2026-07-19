<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../lib/useAuth';

const { user, login, register, logout } = useAuth();
const route = useRoute();
const router = useRouter();

const mode = ref('login');
const username = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    if (mode.value === 'login') await login(username.value, password.value);
    else await register(username.value, password.value);
    router.push(route.query.redirect ?? '/');
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function doLogout() {
  await logout();
  username.value = '';
  password.value = '';
}
</script>

<template>
  <div class="container">
    <div class="card-box white-frame shadow-expand aw-auth-card" v-if="user">
      <p>Dear colonist,<br><br>
        You are signed in as <span class="theme-color">{{ user.username }}</span>
        <span v-if="user.role === 'admin'"> (colony administrator)</span>.</p>
      <button @click="doLogout">Sign Out</button>
    </div>

    <div class="card-box white-frame shadow-expand aw-auth-card" v-else>
      <p>Dear colonist,<br><br>
        {{ mode === 'login' ? 'Identify yourself to access classified areas.' : 'Register as a new colonist.' }}</p>
      <form class="aw-form" @submit.prevent="submit">
        <div class="form-group">
          <label>Username:</label>
          <input type="text" class="form-control" v-model="username" autocomplete="username">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" class="form-control" v-model="password"
                 :autocomplete="mode === 'login' ? 'current-password' : 'new-password'">
        </div>
        <p class="aw-error" v-if="error">{{ error }}</p>
        <button type="submit" :disabled="busy">{{ mode === 'login' ? 'Sign In' : 'Register' }}</button>
        <button type="button" @click="mode = mode === 'login' ? 'register' : 'login'; error = ''">
          {{ mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>
