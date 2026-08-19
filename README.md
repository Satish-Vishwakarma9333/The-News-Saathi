# 📰 The News Saathi

### Five Sources. One News Desk.

The News Saathi is a multi-source news dashboard that brings the latest headlines from multiple news publishers into one clean and responsive interface.

Instead of visiting different news websites separately, users can view headlines from **NDTV, India Today, Hindustan Times, The Hindu, and BBC News** in one place.

The project is built using **HTML, CSS, JavaScript, Node.js, Express.js, and RSS feeds**.

---

## ✨ Features

- 📰 **Multi-Source News Dashboard**
  - NDTV
  - India Today
  - Hindustan Times
  - The Hindu
  - BBC News

- 🔄 **Refresh News**
  - Fetches fresh headlines from the configured news sources.

- 📄 **News Summary Popup**
  - Opens a detailed summary when a headline is selected.

- 🔗 **Original Article Access**
  - Provides a direct link to the original publisher.

- 🌙 **Dark Mode**
  - Allows users to switch between light and dark themes.

- 📝 **Personal Notes**
  - Lets users write and save notes directly in the browser.

- 📸 **Screenshot**
  - Allows users to capture the news summary popup.

- 📱 **Responsive Interface**
  - Designed to work across desktop and smaller screen sizes.

- ⚡ **Loading & Error Handling**
  - Handles loading states and temporary news-source failures.

---

## 🎯 Project Objective

The main objective of The News Saathi is to provide a simple way to monitor news from multiple publishers without opening several websites separately.

The dashboard focuses on:

- Bringing multiple news sources into one interface.
- Displaying the latest available headlines.
- Providing quick summaries for selected stories.
- Keeping access to the original publisher.
- Providing useful features such as refresh, dark mode, notes, and screenshots.
- Creating a responsive and user-friendly news reading experience.

---

# 📸 Screenshots

## 🏠 Home Dashboard

- The main dashboard displays headlines from all five configured news sources in separate sections.

<img width="1919" height="915" alt="Screenshot 2026-08-19 170229" src="https://github.com/user-attachments/assets/29ef8829-0ac3-4a7d-b995-6ff537feed02" />


---

## 📄 News Summary Popup

- Selecting a headline opens a popup containing the source, publication date, headline, summary, screenshot option, and original article link.

<img width="1919" height="903" alt="Screenshot 2026-08-19 171002" src="https://github.com/user-attachments/assets/3679e8b3-0cb6-4a4c-b0de-104294b6c9dc" />


---

## 🌙 Dark Mode

- The dashboard also supports a dark theme for comfortable viewing in low-light environments.

<img width="1919" height="903" alt="Screenshot 2026-08-19 171025" src="https://github.com/user-attachments/assets/1d753902-e4c3-4edc-afc9-7aea59f0fca8" />


---

# 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Google Fonts
- LocalStorage
- HTML2Canvas

### Backend

- Node.js
- Express.js
- RSS Parser
- Fetch API

### Data Sources

- NDTV
- India Today
- Hindustan Times
- The Hindu
- BBC News

---

# ⚙️ How It Works

The application uses a Node.js backend to collect and process news before sending it to the frontend.

1. The frontend requests news from the backend through `/api/news`.
2. Express.js receives the request and starts fetching the configured RSS feeds.
3. `rss-parser` processes the RSS responses.
4. The latest available articles are selected from each source.
5. The server attempts to retrieve the original article content.
6. Unnecessary HTML elements are removed and the content is converted into readable text.
7. A short article summary is generated from the available content.
8. The processed news is returned to the frontend as JSON.
9. JavaScript dynamically creates the news columns and cards.
10. Selecting a headline opens the summary popup with an option to read the original article.

---

# 🔥 Key Development Highlights

## Multi-Source RSS Integration

One of the main requirements was to bring news from different publishers into a single dashboard.

The backend maintains a list of configured sources containing:

- Source name
- Short identifier
- RSS feed URL
- Publisher website

This makes it easier to process different publishers using the same backend logic.

---

## News Fetching & Refresh

The application provides a dedicated refresh function for retrieving updated headlines.

The refresh process works through:

```text
Refresh Button
      ↓
GET /api/news
      ↓
Express Server
      ↓
RSS Feed Requests
      ↓
Process News
      ↓
Updated JSON
      ↓
Update Dashboard
