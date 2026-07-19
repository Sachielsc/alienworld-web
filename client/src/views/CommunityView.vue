<script setup>
import { reactive } from 'vue';
import { useRoute } from 'vue-router';

const now = new Date();
const currentDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
const open = reactive({ english: true, chinese: true });
const route = useRoute();

const articles = [
  { key: 'carticle1', label: 'Chicken Soup for the Soul -- The people who torture you' },
  { key: 'carticle2', label: 'Philosophy of Life -- Emotion and Career' },
  { key: 'carticle3', label: 'Philosophy of Life -- How to avoid distraction' },
  { key: 'carticle4', label: 'Philosophy of Life -- How to wait someone' },
];
</script>

<template>
  <div class="container">
    <div class="aw-community white-frame shadow-expand">
      <p>Dear colonist,<br>
        <br>This Page is still under construction!<br>
        Charles plans to build this as a forum, with functionality like <span>posting</span>,
        <span>commenting</span> and <span>logging</span>. But for now it is only for <span>article display</span>.
      </p>
      <footer>----{{ currentDate }}</footer>
    </div>

    <div class="aw-community card-box white-frame shadow-expand forum-list">
      <a class="fa fa-book" @click.prevent="open.english = !open.english">English Forum</a>
      <div class="collapse" :class="{ show: open.english }">
        <li><a>Empty</a></li>
      </div>
      <br>
      <a class="fa fa-book" @click.prevent="open.chinese = !open.chinese">Chinese Forum</a>
      <div class="collapse" :class="{ show: open.chinese }">
        <li v-for="a in articles" :key="a.key">
          <router-link :to="`/community/${a.key}`">{{ a.label }}</router-link>
        </li>
      </div>
    </div>

    <div class="aw-community green-frame shadow-expand">
      <router-view v-if="route.path !== '/community'" />
      <p v-else>Select an article from above~</p>
    </div>
  </div>
</template>
