<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// All migrated legacy pages, loaded lazily as raw HTML fragments.
const modules = import.meta.glob('../content/**/*.html', { query: '?raw', import: 'default' });

const route = useRoute();
const router = useRouter();
const root = ref(null);
const html = ref('');

watch(
  () => route.meta.content,
  async (key) => {
    if (!key) return;
    const loader = modules[`../content/${key}.html`];
    html.value = loader ? await loader() : '<div class="container"><p>Content not found.</p></div>';
  },
  { immediate: true },
);

function onClick(e) {
  // legacy Bootstrap collapse toggles
  const toggle = e.target.closest('[data-toggle="collapse"]');
  if (toggle && root.value?.contains(toggle)) {
    e.preventDefault();
    const sel = toggle.getAttribute('data-target') || toggle.getAttribute('href');
    const target = sel ? root.value.querySelector(sel) : null;
    if (target) target.classList.toggle('show');
    return;
  }
  // internal links navigate via the SPA router
  const a = e.target.closest('a[href]');
  if (a && root.value?.contains(a)) {
    const href = a.getAttribute('href');
    if (href?.startsWith('/') && !a.getAttribute('target')) {
      e.preventDefault();
      router.push(href);
    }
  }
}
</script>

<template>
  <div ref="root" class="aw-content" v-html="html" @click="onClick"></div>
</template>
