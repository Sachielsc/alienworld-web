<script setup>
import AboutPanel from '../components/AboutPanel.vue';
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        <AboutPanel active="cv" />
      </div>
      <div class="col-8">
        <div class="card-box white-frame shadow-expand">
          <p>Dear colonist officer,<br>Click <router-link to="/about/cv/expanded">HERE</router-link> to expand
            Charles' digital CV below.<br>Or you can click <router-link to="/about/cv-fullpage">HERE</router-link>
            to watch it in full-scale.</p>
        </div>
        <div class="cv-page">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
