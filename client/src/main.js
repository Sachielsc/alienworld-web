import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/theme.css';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
