# Audiofool.net

> *"Die-hard Pink Floyd fan. Developer. Exploring the intersection of Logic and Sound."*

A minimalist personal website built with Astro, featuring a strict black & white design aesthetic with subtle Pink Floyd thematic elements.

🌐 **Live**: [audiofool.net](http://audiofool.net)

---

## ✨ Features

### Design
- **Black & White Aesthetic** – Strict B&W palette with 1px line borders
- **Dark/Light Mode** – Toggle between "Dark Side of the Moon" and light mode
- **Minimalist Typography** – Inter for UI, JetBrains Mono for code
- **Responsive Layout** – Sidebar navigation on desktop, stacked on mobile

### Content Sections
| Section       | Description                  | Pink Floyd Reference         |
| ------------- | ---------------------------- | ---------------------------- |
| **Projects**  | Portfolio of completed works | *"Welcome to the Machine"*   |
| **Log**       | Chronological blog stream    | *"The Endless River"*        |
| **Wiki**      | Structured knowledge base    | *"Any Colour You Like"*      |
| **AudioShow** | Music & audio episodes       | *"The Great Gig in the Sky"* |
| **Gallery**   | Photography showcase         | *"Obscured by Clouds"*       |

### Technical Highlights
- **Custom Audio Player** – Bypasses Apple Music iframe, fetches preview URLs via iTunes API
- **View Transitions** – Seamless page-to-page animations with persistent audio playback
- **Content Collections** – Type-safe Markdown/YAML content with Zod schemas
- **LaTeX Support** – Math rendering via remark-math + rehype-katex

---

## 🛠 Tech Stack

| Category      | Technology                                  |
| ------------- | ------------------------------------------- |
| Framework     | [Astro](https://astro.build) 4.x            |
| Styling       | [Tailwind CSS](https://tailwindcss.com) 3.x |
| UI Components | [Preact](https://preactjs.com)              |
| Content       | Astro Content Collections                   |
| Fonts         | Inter, JetBrains Mono (Google Fonts)        |
| Hosting       | GitHub Pages                                |

---

## 📁 Project Structure

```
src/
├── components/
│   └── AudioPlayer.astro    # Custom music player
├── content/
│   ├── projects/            # Portfolio items
│   ├── log/                 # Blog posts
│   ├── wiki/                # Knowledge base
│   ├── audioshow/           # Audio episodes
│   ├── gallery/             # Photo metadata
│   └── config.ts            # Collection schemas
├── layouts/
│   └── MinimalLayout.astro  # Main site layout
├── pages/
│   ├── index.astro          # Homepage
│   ├── 404.astro            # "Is There Anybody Out There?"
│   ├── projects/            # Projects section
│   ├── log/                 # Log section
│   ├── wiki/                # Wiki section
│   ├── audioshow/           # AudioShow section
│   └── gallery/             # Gallery section
└── style/
    ├── global.css           # Design system & CSS vars
    └── post.css             # Markdown content styles
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Adding Content

### Projects
Create a new `.md` file in `src/content/projects/`:
```yaml
---
title: "My Project"
pubDate: 2024-01-01
description: "Brief description"
stack: ["Astro", "TypeScript"]
type: "Product"  # Product | Lib | Art | Other
url: "https://example.com"  # Optional external link
---

Your project details in Markdown...
```

### AudioShow Episodes
Add to `src/content/audioshow/`:
```yaml
---
title: "Episode Title"
episode: "1"
pubDate: 2024-01-01
audioUrl: "https://embed.music.apple.com/..."  # Apple Music embed URL
featured: false
---

Episode content with album images using onclick handlers...
```

### Wiki Entries
Add to `src/content/wiki/`:
```yaml
---
title: "Topic Name"
tags: ["category", "subtopic"]
---

Knowledge content in Markdown...
```

---

## 🎨 Customization

### Social Links
Edit `/src/layouts/MinimalLayout.astro` to update:
- GitHub URL
- Instagram URL
- Xiaohongshu URL

### Theme Colors
Modify CSS variables in `/src/style/global.css`:
```css
:root {
  --bg-body: #ffffff;
  --text-main: #000000;
  --text-muted: #525252;
  --border-main: #000000;
}

html.dark {
  --bg-body: #000000;
  --text-main: #ffffff;
  /* ... */
}
```

---

## 📄 License

MIT License - Feel free to use this as a template for your own site.

---

*"Shine on you crazy diamond."* 💎
