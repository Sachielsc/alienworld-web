<script setup>
import { ref, watchEffect } from 'vue';
import ProtectedGate from '../components/ProtectedGate.vue';
import { useAuth } from '../lib/useAuth';

const { isAdmin } = useAuth();
const html = ref('');

watchEffect(async () => {
  if (!isAdmin.value || html.value) return;
  const res = await fetch('/api/protected/worklog');
  if (res.ok) html.value = (await res.json()).html;
});
</script>

<template>
  <div class="container">
    <div class="cv-fullpage card-box white-frame shadow-expand">
      <p>Welcome to Charles' <span>Improvement Plan of Official Websites!</span></p>
    </div>

    <ProtectedGate>
      <div v-html="html"></div>
    </ProtectedGate>
  </div>
</template>
