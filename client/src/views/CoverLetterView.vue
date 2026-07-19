<script setup>
import { ref, watchEffect } from 'vue';
import ProtectedGate from '../components/ProtectedGate.vue';
import { useAuth } from '../lib/useAuth';

const { isAdmin } = useAuth();

const companyname = ref('');
const posistionname = ref('Front-end Developer');
const medium = ref('Seek');
const coverlettertype = ref('');
const prologue = ref('Please select a cover letter type');
const letterBody = ref('');

watchEffect(async () => {
  if (!isAdmin.value || letterBody.value) return;
  const res = await fetch('/api/protected/coverletter');
  if (res.ok) letterBody.value = (await res.json()).html;
});

function radiofunction() {
  const company = companyname.value;
  const position = posistionname.value;
  const via = medium.value;
  if (coverlettertype.value === 'intern') {
    prologue.value = `It is so exciting to see that ${company} is looking for a ${position} on ${via}. Although I am very junior, I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. But more importantly, I am eager for an opportunity to put all my passion and effort into commercial production, even without a payment. If possible, please consider my application as an intern, and I WILL prove my value through hard work and fast improvement.`;
  } else if (coverlettertype.value === 'junior') {
    prologue.value = `It is so exciting to see that ${company} is looking for a ${position} on ${via}. I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. But more importantly, I am eager for an opportunity to put all my passion and effort into commercial production. Please consider my application and I WILL show my capability in this posistion through my hard wrok.`;
  } else if (coverlettertype.value === 'recruitment') {
    prologue.value = `It is so exciting to see that ${company} is looking for a ${position} on ${via}. Although I am a junior developer, I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. I can see that ${company} is doing well in the recruitment domain and you must have your resources. As for me, I have faith in my gift and passion. If possible, please consider my application, or even as an intern, and I WILL prove my value.`;
  } else {
    prologue.value = 'Please select a cover letter type';
  }
}
</script>

<template>
  <div class="container">
    <div class="cv-fullpage card-box white-frame shadow-expand">
      <p>Welcome to Charles' mini app: <span>The cover letter generator</span>!</p>
    </div>

    <ProtectedGate>
      <div class="cv-fullpage card-box green-frame shadow-expand">
        <div class="aw-form">
          <p>This is a cover letter generator created by Charles. Just type in the details and make a photocopy of
            the cover letter below.</p>

          <div class="form-group">
            <label>Company Name:</label>
            <input type="text" class="form-control" v-model="companyname">
          </div>
          <div class="form-group">
            <label>Position Name:</label>
            <input type="text" class="form-control" v-model="posistionname">
          </div>
          <div class="form-group">
            <label>Where did I learn about this job:</label>
            <input type="text" class="form-control" v-model="medium">
          </div>

          <div class="separator"></div>

          <fieldset class="form-group">
            <p>Initiate you Cover Letter type here:</p>
            <div class="form-check">
              <label class="form-check-label">
                <input type="radio" class="form-check-input" v-model="coverlettertype" value="intern"
                       @change="radiofunction()">
                Internship
              </label>
            </div>
            <div class="form-check">
              <label class="form-check-label">
                <input type="radio" class="form-check-input" v-model="coverlettertype" value="junior"
                       @change="radiofunction()">
                Junior Front-end Developer
              </label>
            </div>
            <div class="form-check">
              <label class="form-check-label">
                <input type="radio" class="form-check-input" v-model="coverlettertype" value="recruitment"
                       @change="radiofunction()">
                Recruiment agency
              </label>
            </div>
          </fieldset>

          <div class="separator"></div>

          <div class="form-group">
            <label>Prologue:</label>
            <textarea class="form-control" rows="7" v-model="prologue"></textarea>
          </div>
        </div>
      </div>

      <div class="cv-fullpage">
        <div class="wrapper coverletter-wrapper green-frame">
          <div class="cv-content">
            <div class="row">
              <div class="col-6">
                <div class="cv-name">
                  <h3><span>Charles SHU</span></h3>
                </div>
              </div>
              <div class="col-6">
                <div class="cv-contact">
                  <ul class="list-unstyled">
                    <li><i class="fa fa-linkedin-square fa-fw"></i><a
                        href="https://www.linkedin.com/in/charles-shu/" target="_blank">linkedin.com/in/charles-shu/</a>
                    </li>
                    <li><i class="fa fa-github fa-fw"></i><a href="https://github.com/Sachielsc"
                                                             target="_blank">github.com/Sachielsc</a>
                    </li>
                    <li><i class="fa fa-mobile fa-fw"></i>0210701018</li>
                    <li><i class="fa fa-envelope-o fa-fw"></i>sachielsc@gmail.com</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="separator"></div>

            <div class="coverletter-content">
              <div class="coverletter-header">
                <p>Dear HR Officer of {{ companyname }},<br>Re: {{ posistionname }}</p>
              </div>
              <div class="coverletter-paragraph">
                <p>{{ prologue }}</p>
              </div>

              <div v-html="letterBody"></div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedGate>
  </div>
</template>
