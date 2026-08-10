# Global Claude Instructions

## General Rules
- Always prioritize minimal changes
- Avoid reading archived folders unless explicitly asked, archived folders' path: `docs\Archived`
- If asked to perform/build a large feature, i.e. roughly >=50 lines of code change, discuss with me about the overall plan before you write any code

## Testing Rules
- After a frontend code change, ask me whether we need to use mcp__playwright to test it in a browser.

## About deployment
- After a backend code change, make sure we deploy it locally in dev. Don't worry about deployment in the CVM. But you can remind me the CLI commands to deploy the latest change in the CVM, so i can do it myself
- Leave the procedures like `git add`, `git commit` and `git push` to me, unless i ask your help. I will deal with the version control system