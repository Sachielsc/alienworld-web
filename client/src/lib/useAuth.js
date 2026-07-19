import { ref, computed } from 'vue';

const user = ref(null);
const loaded = ref(false);

async function api(path, body) {
  const res = await fetch(path, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function useAuth() {
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function fetchMe() {
    try {
      user.value = (await api('/api/me')).user;
    } finally {
      loaded.value = true;
    }
  }

  async function login(username, password) {
    user.value = (await api('/api/login', { username, password })).user;
  }

  async function register(username, password) {
    user.value = (await api('/api/register', { username, password })).user;
  }

  async function logout() {
    await api('/api/logout', {});
    user.value = null;
  }

  return { user, loaded, isAdmin, fetchMe, login, register, logout };
}
