<script setup>
defineProps({ active: { type: String, default: '' } });
</script>

<template>
  <div class="sc-mechanical-frame-outer">
    <div class="sc-mechanical-frame-inner">
      <div class="button-panel">
        <router-link to="/about/statepanel">
          <button type="button" :class="{ active: active === 'statepanel' }">State Panel</button>
        </router-link><br>
        <router-link to="/about/skillpanel">
          <button type="button" :class="{ active: active === 'skillpanel' }">Skill Tree</button>
        </router-link><br>
        <router-link to="/about/workreport">
          <button type="button" :class="{ active: active === 'workreport' }">Reports</button>
        </router-link><br>
        <router-link to="/about/cv">
          <button type="button" :class="{ active: active === 'cv' }">CV Page</button>
        </router-link>
      </div>
    </div>
  </div>
</template>
