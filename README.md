# Charles' Alien World Project

## Home page URL
[https://alienworld-web.herokuapp.com/](https://alienworld-web.herokuapp.com/)

## Description
This project is developed solely by **Charles**, an intermediate automation software tester.

## Prerequest
Note: the links are basic on a Windows OS. Try different installation links for Mac OS.
* Install [Git](https://git-scm.com/downloads)
* Install [Node.js](https://nodejs.org/en/)
* Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

## Set up
1. Run these commands in the terminal to check whether prerequests are correctly installed:

   `git --version`
   
   `node -v`
   
   `npm -v`
   
   `heroku --version`
2. Open terminal (command prompt) and navigate to the location where you want to download and setup the project by doing the following steps
3. Run this command to clone the code:

   `git clone https://github.com/Sachielsc/alienworld-web.git`
4. Run this command to install all the libraries in package.json

   `npm install`
5. Run this command to login to Heroku

   `heroku login`
6. Run this command to run this project locally
   `heroku local web`

## Misc
Charles recommends these websites to learn about the syntax of markdown documentations:
1. Markdown syntax guide in [atlassian](https://confluence.atlassian.com/bitbucketserver/markdown-syntax-guide-776639995.html)
2. Markdown syntax guide in [github](https://guides.github.com/features/mastering-markdown/#examples) (recommended)

## Modules

* Workshop
* Contact Me
* Game World
* Movie World
* Work Log
* Other Projects
* Community Hub (needs to include forum/discussion)
* Cover Letter

## What's next
* Community Hub with authentication function.
* Add new code snippet to the page:
* To add an entry to your package.json's dependencies:

  `npm install <package_name> --save`
* To add an entry to your package.json's devDependencies:

  `npm install <package_name> --save-dev`

## About upgrading heroku-16 to heroku-22 (Update on: 2020-7-30)
Use the manual way as per the [official site](https://devcenter.heroku.com/articles/upgrading-to-the-latest-stack#manually-created-test-app)

## Change the default branch from master to main (Update on: 2023-8-25)
[Heroku: How do I switch branches from master to main?](https://help.heroku.com/O0EXQZTA/how-do-i-switch-branches-from-master-to-main)

## Heroku deployment is no longer free (Update on: 2023-8-25)
After checking the heroku log, we can find this error message: "No web processes running" with an H14 error code,. This typically occurs on Heroku when your application's dynos (containers that run your app) are not responding to incoming requests.

Here are the steps you can take to diagnose and resolve this issue:

1. **Check Procfile:**
   Make sure your application's root directory contains a file named `Procfile` (no file extension) that specifies the command to run your web application. The content of the Procfile should be something like:

   ```
   web: <command to start your web app>
   ```

   For example, if you're using Node.js, it might look like:

   ```
   web: node server.js
   ```

2. **Check Dyno Formation:**
   Verify that you have at least one web dyno running for your application. You can scale your dynos using the Heroku CLI:

   ```bash
   heroku ps:scale web=1
   ```

From the second step, we will know that web dyno is no longer free now and I need to subscribe their Eco Dynos Plan to keep my Heroku services.

Remember to cancel this service when I don't need it.