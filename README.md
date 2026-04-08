# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces or GitHub Pages

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## 🌐 GitHub Pages setup

This project is set up so GitHub Pages can receive the public Worker URL from repository secrets during deployment.

1. Add `WORKER_URL` as a repository secret in GitHub.
2. Keep `OPENAI_API_KEY` only in Cloudflare Workers, not in the browser.
3. Enable GitHub Actions for Pages and deploy from the `main` branch.
4. The workflow writes `config.js` at deploy time so the site can use your secret Worker URL without committing it.

## ☁️ Cloudflare Note

When deploying through Cloudflare, make sure your API request body (in `script.js`) includes a `messages` array and handle the response by extracting `data.choices[0].message.content`.

Enjoy building your L’Oréal beauty assistant! 💄
