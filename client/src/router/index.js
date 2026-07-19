import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ContentPage from '../components/ContentPage.vue';

const content = (path, key, extra = {}) => ({ path, component: ContentPage, meta: { content: key }, ...extra });

// note keys match the old report.routes.js study-note URLs
export const noteKeys = ['nodeJS', 'angularJS', 'html', 'bootstrap', 'generalCoding', 'generalIT', 'vocabulary', 'java', 'vim', 'jira', 'reactJS', 'linux', 'gulp', 'sublime', 'git', 'heroku', 'aspnet', 'IntelliJIDEA', 'javascript', 'ISTQB-foundation', 'selenium'];
export const snippetKeys = ['arraySum', 'CSharpGitIgnoreExample'];

// Route paths mirror the old AngularJS ui-router URLs so existing links keep working.
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },

  content('/about/statepanel', 'about/statepanel'),
  content('/about/skillpanel', 'about/skillpanel'),
  content('/about/contactme', 'about/contactme'),
  content('/about/otherprojects', 'about/otherprojects'),
  content('/about/cv-fullpage', 'about/cvbody'),

  {
    path: '/about/cv',
    component: () => import('../views/CvView.vue'),
    children: [content('expanded', 'about/cvbody')],
  },

  {
    path: '/about/workreport',
    component: () => import('../views/WorkReportView.vue'),
    children: [
      ...Array.from({ length: 19 }, (_, i) => content(`report${i + 1}`, `workreport/report${i + 1}`)),
      ...noteKeys.map((k) => content(k, `workreport/${k}`)),
      ...snippetKeys.map((k) => content(k, `workreport/${k}`)),
    ],
  },

  {
    path: '/community',
    component: () => import('../views/CommunityView.vue'),
    children: [1, 2, 3, 4].map((i) => content(`carticle${i}`, `community/carticle${i}`)),
  },

  content('/movies', 'movies'),
  content('/games', 'games'),

  { path: '/about/coverletter', component: () => import('../views/CoverLetterView.vue') },
  { path: '/about/worklog', component: () => import('../views/WorkLogView.vue') },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

export default router;
