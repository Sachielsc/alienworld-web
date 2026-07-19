<script setup>
import { reactive } from 'vue';
import { useRoute } from 'vue-router';
import AboutPanel from '../components/AboutPanel.vue';
import { noteKeys, snippetKeys } from '../router';

const open = reactive({ reports: false, notes: false, snippets: false });
const route = useRoute();

const reportLabels = {
  3: ' (About the installation of Ubuntu)',
  11: ' (Some useful Git commands)',
  12: ' (Important report: more use of Git, deploying a project by Heroku)',
  13: ' (My own important notes about CSS)',
  19: ' (My procedure to create a preloader page)',
};
const reports = Array.from({ length: 19 }, (_, i) => ({
  key: `report${i + 1}`,
  label: `Report ${i + 1}${reportLabels[i + 1] ?? ''}`,
}));

const noteLabels = {
  nodeJS: 'Node.js', angularJS: 'AngularJS', html: 'HTML', bootstrap: 'Bootstrap',
  generalCoding: 'General-coding', generalIT: 'General-IT', vocabulary: 'Vocabulary',
  java: 'Java', vim: 'Vim', jira: 'JIRA', reactJS: 'ReactJS', linux: 'Linux',
  gulp: 'Gulp', sublime: 'Sublime', git: 'Git', heroku: 'Heroku', aspnet: 'ASP.NET',
  IntelliJIDEA: 'IntelliJ IDEA', javascript: 'JavaScript', 'ISTQB-foundation': 'ISTQB (foundation)',
  selenium: 'Selenium',
};
const notes = [...noteKeys].sort((a, b) => noteLabels[a].localeCompare(noteLabels[b]));

const snippetLabels = {
  arraySum: 'My javascript Array Sum Prototype',
  CSharpGitIgnoreExample: 'My .gitignore templates',
};
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        <AboutPanel active="workreport" />
      </div>
      <div class="col-8">
        <div class="card-box white-frame shadow-expand">
          <p>Dear colonist officer,<br>
            Select a work report from the list below</p>
        </div>
        <div class="card-box white-frame shadow-expand report-list">
          <div>
            <a class="fa fa-folder-open" @click.prevent="open.reports = !open.reports">My work reports in practical
              projects and internships</a>
            <div class="collapse" :class="{ show: open.reports }">
              <li v-for="r in reports" :key="r.key">
                <router-link :to="`/about/workreport/${r.key}`">{{ r.label }}</router-link>
              </li>
            </div>
          </div>
          <div>
            <a class="fa fa-folder-open" @click.prevent="open.notes = !open.notes">My Study Note (Chinese
              &amp; English mixed)</a>
            <div class="collapse" :class="{ show: open.notes }">
              <li v-for="k in notes" :key="k">
                <router-link :to="`/about/workreport/${k}`">{{ noteLabels[k] }}</router-link>
              </li>
            </div>
          </div>
          <div>
            <a class="fa fa-folder-open" @click.prevent="open.snippets = !open.snippets">My Code Snippets</a>
            <div class="collapse" :class="{ show: open.snippets }">
              <li v-for="k in snippetKeys" :key="k">
                <router-link :to="`/about/workreport/${k}`">{{ snippetLabels[k] }}</router-link>
              </li>
            </div>
          </div>
        </div>
        <div class="aw-community green-frame shadow-expand">
          <router-view v-if="route.path !== '/about/workreport'" />
          <p v-else>Select a report from above~</p>
        </div>
      </div>
    </div>
  </div>
</template>
