<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from './lib/useAuth';
import AppFooter from './components/AppFooter.vue';

const preloaderDone = ref(false);
const preloaderGone = ref(false);
const picDisplayToggle = ref(false);

// Which menu is selected, and whether it is showing, are two separate things. Holding
// them as one flag each made the buttons interfere: the egg would silently change the
// selection, and the secret icon could leave both menus hidden.
const activeMenu = ref('nav');   // 'nav' | 'contact'
const menuVisible = ref(true);

const navDisplayToggle = computed(() => menuVisible.value && activeMenu.value === 'nav');
const contactDisplayToggle = computed(() => menuVisible.value && activeMenu.value === 'contact');
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

// The egg only shows and hides. Whichever menu is selected stays selected, so hiding
// and showing again brings back the same one.
function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

// The secret icon only switches. It reveals the menu it switches to, so a click always
// has a visible effect even when the egg has hidden everything.
function switchMenu() {
  activeMenu.value = activeMenu.value === 'nav' ? 'contact' : 'nav';
  menuVisible.value = true;
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
        <img src="/images/egg.jpeg" alt="menu icon" class="menu-icon" title="Display/Hide the menu" @click="toggleMenu">
      </div>
      <div class="col-8 aw-title">
        <div class="title-pic" :class="{ 'menu-hidden': !picDisplayToggle }"></div>
        <router-link to="/" title="Home Page" class="title-text">Charles' Alien World</router-link>
      </div>
      <div class="col-2">
        <img src="/images/head.jpg" alt="Contact Me" class="contact-icon" title="Know about the author" @click="switchMenu">
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

  <AppFooter />
</template>
