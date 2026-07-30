<script setup>
const startYear = 2017;
const currentYear = new Date().getFullYear();
const years = currentYear > startYear ? `${startYear}–${currentYear}` : `${startYear}`;
const version = __APP_VERSION__;
</script>

<template>
  <footer class="aw-footer container">
    <p>&copy; {{ years }} Charles' Alien World. All rights reserved.<span class="aw-footer-version">v{{ version }}</span></p>
  </footer>
</template>
