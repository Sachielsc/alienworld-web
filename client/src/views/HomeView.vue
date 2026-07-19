<script setup>
const now = new Date();
const currentDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
</script>

<template>
  <div class="container">
    <div class="intro bg-lab green-frame">
      <p>Dear colonist,<br>
        <br>Welcome to the planet LV 426.<br>Here you can find classified information about
        <router-link to="/movies">Alien Movies</router-link> and <router-link to="/games">Alien Games</router-link>.<br>
        You can also find author's <router-link to="/about/skillpanel">skill tree</router-link> and
        <router-link to="/about/workreport">work reports</router-link>.<br>
        <br>Click <span>"The Egg"</span> on the title bar to <span>display / hide</span> the navigation menu.<br>
        To contact the author, click <router-link to="/about/contactme">HERE</router-link> or click
        <span>"The Secret Icon"</span> on the title bar.
      </p>
      <div class="separator"></div>
      <p>Today's New Feature:</p>
      <p>The module <span>Community</span> is going to have a new column:
        <span>Charle's project exhibition</span>!<br>
        This column demonstrates every project Charles has done in his leisure time. Click
        <router-link to="/community">HERE</router-link> to have a look.</p>
      <br>
      <p>Also, two <span>PROLOGUEs</span> are added into the movie archieve, click
        <router-link to="/movies">HERE</router-link> to have a look.</p>
      <footer>----{{ currentDate }}</footer>
    </div>

    <div class="intro bg-planet-1 green-frame">
      <p>New Feature:<br>Alien: Covenant Trailer (From Youtube)</p>
      <div class="sc-frame-outer standard">
        <div class="sc-frame-middle standard">
          <div class="sc-frame-inner standard">
            <iframe class="standard" src="https://www.youtube.com/embed/svnAD0TApb8" frameborder="0"
                    allowfullscreen></iframe>
          </div>
        </div>
      </div>
      <footer>----28/06/2017</footer>
    </div>

    <div class="intro bg-normal-1 green-frame">
      <p>New Feature:<br>Charles' <span>newest CV</span> is complete! (Edition: 6.27beta)</p>
      <div class="sc-frame-outer standard">
        <div class="sc-frame-middle standard">
          <div class="sc-frame-inner standard">
            <router-link to="/about/cv-fullpage" title="to Charles' CV">
              <img class="cv-pic standard" src="/images/cv.jpg" alt="Charles' CV">
            </router-link>
          </div>
        </div>
      </div>
      <footer>----27/06/2017</footer>
    </div>

    <div class="intro bg-normal-2 green-frame">
      <p>New Feature:<br>Alien Isolation ---- <span>The best Alien game EVER!</span></p>
      <div class="sc-frame-outer standard">
        <div class="sc-frame-middle standard">
          <div class="sc-frame-inner standard">
            <a href="http://www.alienisolation.com/age-gate" target="_blank" title="to the game website">
              <img src="/images/alien-isolation.jpg" class="standard" alt="Alien Isolation">
            </a>
          </div>
        </div>
      </div>
      <footer>----20/06/2017</footer>
    </div>
  </div>
</template>
