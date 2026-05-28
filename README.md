# Resumify

**Open-source resume builder — ATS-friendly, bilingual, and fully offline.**

Create professional CVs with a live A4 preview, drag-and-drop section reordering, and one-click PDF export. No account. No backend. No tracking.

---

## Features

| Feature | Details |
|---|---|
| **Live preview** | Real-time A4 canvas that mirrors your edits instantly |
| **PDF export** | High-quality PDF with embedded data for round-trip re-import |
| **JSON portability** | Full export/import of resume data as clean JSON |
| **Drag & drop** | Reorder both sections and individual entries freely |
| **Section visibility** | Show or hide sections without losing data |
| **Browser storage** | Save and manage multiple resume versions locally |
| **Bilingual** | Full Spanish and English support, auto-detected |
| **ATS-friendly** | Structured, semantic output that parses correctly in applicant tracking systems |
| **Offline-ready** | Runs entirely in the browser — no server required |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/ManuelADMN/resumify.git
cd resumify
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder is a fully static site — deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Usage

1. **Fill in your personal information** in the left panel
2. **Add entries** for Education, Experience, Projects, Skills, and Certifications
3. **Drag sections** to reorder them in the preview
4. **Toggle the eye icon** to hide a section temporarily
5. **Download as PDF** — your data is embedded in the file for later re-import
6. **Save versions** locally in the browser via the menu

---

## Data Format

Resumify uses a simple JSON structure. You can import/export this directly:

```json
{
  "personalInfo": {
    "fullName": "Your Name",
    "email": "you@email.com",
    "phone": "+1 234 567 890",
    "linkedin": "linkedin.com/in/you",
    "github": "github.com/you",
    "location": "City, Country",
    "website": "yoursite.com",
    "summary": "Brief professional summary."
  },
  "education": [
    {
      "id": "1",
      "institution": "University Name",
      "degree": "Degree Title",
      "location": "City, Country",
      "startDate": "Jan 2020",
      "endDate": "Dec 2024",
      "gpaOrHonors": "GPA 3.9/4.0"
    }
  ],
  "experience": [
    {
      "id": "1",
      "company": "Company Name",
      "role": "Your Role",
      "location": "City, Country",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "bullets": ["Key achievement or responsibility"],
      "link": "company.com"
    }
  ],
  "projects": [
    {
      "id": "1",
      "name": "Project Name",
      "technologies": "React, TypeScript",
      "description": ["What you built and why it matters"],
      "link": "github.com/you/project",
      "date": "Jun 2023"
    }
  ],
  "skills": [
    {
      "id": "1",
      "category": "Languages",
      "items": "JavaScript, TypeScript, Python"
    }
  ],
  "certifications": [
    {
      "id": "1",
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "Aug 2023",
      "link": "aws.amazon.com/verification"
    }
  ]
}
```

> **Tip:** Export your resume as PDF, then re-import that same PDF to recover all your data. The JSON is embedded invisibly in the file.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vitejs.dev) | 6 | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | CDN | Styling |
| [Lucide React](https://lucide.dev) | 0.556 | Icons |
| Native browser print | Built-in | ATS-friendly PDF export using selectable real text |

---

## Project Structure

```
resumify/
├── components/
│   ├── Editor.tsx          # Left panel — all editing forms and modals
│   ├── ResumeCanvas.tsx    # A4 live preview template
│   ├── SortableList.tsx    # Drag-and-drop list primitive
│   └── ui.tsx              # Base UI components (Button, Input, Dialog…)
├── contexts/
│   └── LanguageContext.tsx # i18n — Spanish / English
├── types.ts                # TypeScript interfaces
├── constants.ts            # Default sample resume data
├── App.tsx                 # Root — layout, PDF export, import/export logic
└── index.tsx               # React entry point
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE)
