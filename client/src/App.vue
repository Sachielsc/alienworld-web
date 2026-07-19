<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from './lib/useAuth';

const preloaderDone = ref(false);
const preloaderGone = ref(false);
const picDisplayToggle = ref(false);
const navDisplayToggle = ref(true);
const contactDisplayToggle = ref(false);
const headerVisible = ref(true);

const { fetchMe } = useAuth();

function onScroll() {
  headerVisible.value = Math.round(window.scrollY) <= 200;
}

onMounted(() => {
  fetchMe();
  window.addEventListener('scroll', onScroll, { passive: true });
  preloaderDone.value = true;
  setTimeout(() => { preloaderGone.value = true; }, 2000);
});

onUnmounted(() => window.removeEventListener('scroll', onScroll));

function toggleNav() {
  navDisplayToggle.value = !navDisplayToggle.value;
  contactDisplayToggle.value = false;
}

function toggleContact() {
  contactDisplayToggle.value = !contactDisplayToggle.value;
  navDisplayToggle.value = false;
}
</script>

<template>
  <div id="preloader" v-if="!preloaderGone" :class="{ done: preloaderDone }"></div>

  <header
    class="aw-header container"
    :class="{ 'aw-hidden': !headerVisible }"
    @mouseover="picDisplayToggle = true"
    @mouseleave="picDisplayToggle = false"
  >
    <div class="row aw-header-content">
      <div class="col-2">
        <img src="/images/egg.jpeg" alt="menu icon" class="menu-icon" title="Menu" @click="toggleNav">
      </div>
      <div class="col-8 aw-title">
        <div class="title-pic" :class="{ 'menu-hidden': !picDisplayToggle }"></div>
        <router-link to="/" title="Home Page" class="title-text">Charles' Alien World</router-link>
      </div>
      <div class="col-2">
        <img src="/images/head.jpg" alt="Contact Me" class="contact-icon" title="the Secret Icon" @click="toggleContact">
      </div>
    </div>

    <nav class="aw-nav" :class="{ 'menu-hidden': !navDisplayToggle }">
      <ul class="row nav aw-nav-bar">
        <li class="col-2"></li>
        <li class="col-2"><router-link to="/about/statepanel" class="hover-white">Workshop</router-link></li>
        <li class="col-2"><router-link to="/community" class="hover-white">Community Hub</router-link></li>
        <li class="col-2"><router-link to="/movies" class="hover-white">Alien Movies</router-link></li>
        <li class="col-2"><router-link to="/games" class="hover-white">Alien Games</router-link></li>
        <li class="col-2"></li>
      </ul>
    </nav>

    <div class="aw-contact" :class="{ 'menu-hidden': !contactDisplayToggle }">
      <ul class="row nav">
        <li class="col-2"><router-link to="/login" class="hover-purple">Sign In</router-link></li>
        <li class="col-2"><router-link to="/about/contactme" class="hover-purple">Contact Me</router-link></li>
        <li class="col-2"><router-link to="/about/worklog" class="hover-purple">Work Log</router-link></li>
        <li class="col-2"><router-link to="/about/otherprojects" class="hover-purple">Other Projects</router-link></li>
        <li class="col-2"><router-link to="/about/coverletter" class="hover-purple">Cover Letter</router-link></li>
        <li class="col-2"></li>
      </ul>
    </div>
  </header>

  <div class="aw-main">
    <router-view />
  </div>
</template>
