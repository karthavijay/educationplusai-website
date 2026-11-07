# educationplusai.com

Website for Education Plus AI. Plain HTML and CSS, no build step.

- `index.html`: page content
- `styles.css`: styling

Hosted on Vercel. Every push to `main` redeploys the live site.

## Chat assistant

- `chat.js`: the "Ask us anything" chat button and panel (loaded on every page).
- `api/chat.js`: a Vercel serverless function that sends the conversation to Claude and returns the reply. The assistant's knowledge of the services and packages lives in the `SYSTEM_PROMPT` there, so update it when the services change.
- Needs the `ANTHROPIC_API_KEY` environment variable in Vercel. Until it is set, the chat button stays hidden.
- Optional: set `CHAT_MODEL` in Vercel to use a different Claude model (default `claude-opus-5-5`).
