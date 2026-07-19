<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../lib/useAuth';

const { user, loaded, isAdmin, fetchMe } = useAuth();
const route = useRoute();

onMounted(() => { if (!loaded.value) fetchMe(); });

defineExpose({ isAdmin });
</script>

<template>
  <div v-if="!loaded" class="cv-fullpage card-box white-frame shadow-expand">
    <p>Verifying clearance...</p>
  </div>
  <div v-else-if="!isAdmin" class="cv-fullpage card-box white-frame shadow-expand">
    <p>Due to copyright issue, the following content cannot be displayed without authorization.</p>
    <p v-if="user">Your account <span class="theme-color">{{ user.username }}</span> does not have the required
      clearance (administrator only).</p>
    <p v-else>
      <router-link :to="{ path: '/login', query: { redirect: route.fullPath } }">Sign in</router-link>
      with an administrator account to view it.
    </p>
  </div>
  <slot v-else />
</template>
