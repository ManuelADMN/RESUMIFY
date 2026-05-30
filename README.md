# Resumify

**Open-source resume builder — ATS-friendly, bilingual, and fully offline.**

Create professional CVs with a live A4 preview, drag-and-drop section reordering, export preview with paginated pages, and one-click PDF export. No account. No backend. No tracking.

---

## Features

| Feature | Details |
|---|---|
| **Live preview** | Real-time A4 canvas that mirrors edits instantly, with a page-break indicator line |
| **Export Preview** | Paginated page-by-page view that exactly replicates how the PDF will look |
| **PDF export** | High-quality PDF with proper page margins (12mm top/bottom) and intelligent page-break avoidance |
| **JSON portability** | Full export/import of resume data as clean JSON |
| **Drag & drop** | Reorder both sections and individual entries freely |
| **Section visibility** | Show or hide sections without losing data |
| **Browser storage** | Save and manage multiple resume versions locally |
| **Bilingual** | Full Spanish and English support, auto-detected from browser locale |
| **ATS-friendly** | Structured, semantic output that parses correctly in applicant tracking systems |
| **Testing panel** | Built-in suite that validates data structure, PDF readiness, and content completeness |
| **Offline-ready** | Runs entirely in the browser — no server required |

---

## Sections

| Section | Key | Description |
|---|---|---|
| Summary | _(header area)_ | Professional summary, always shown first |
| Technical Skills | `technicalSkills` | Programming languages, tools, frameworks — displayed as bold category + items |
| Education | `education` | Degrees, institutions, GPA, honors |
| Experience | `experience` | Roles with bullet-point achievements and optional company link |
| Projects | `projects` | Personal / professional projects with tech stack and link |
| Certifications | `certifications` | Credentials with issuer and verification link |
| Skills | `skills` | Soft skills and other categories |
| Languages | `languages` | Human languages with proficiency levels |
| Workshops | `workshops` | Conferences, workshops, speaking engagements |
| Links | `links` | Portfolio, LinkedIn, GitHub, and custom links |

All sections are **drag-and-droppable** and individually **hideable** from the sidebar.

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

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder is a fully static site — deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Usage

1. **Fill in personal information** in the left panel accordion
2. **Add entries** for each section using the + buttons
3. **Drag sections** using the grip handle to reorder them
4. **Toggle the eye icon** on any section header to hide it in the export
5. **Preview export** via the **Vista / Preview** button in the toolbar to see exact paginated output
6. **Run tests** via the **Tests** button to validate your data before exporting
7. **Download as PDF** — consistent margins with 12mm breathing room on every page break
8. **Save versions** locally in the browser via the ⋯ menu

### Page-break preview

The live canvas shows a subtle **blue line** at every page-break boundary (every 273mm of content, shifted by the 12mm preview spacer). This line is never captured in the PDF — it is a layout guide only.

---

## Import / Export

### JSON round-trip

```bash
# Export
Menu (⋯) → Save JSON → saves <name>_data.json

# Import
Menu (⋯) → Import → select a .json file
```

### PDF round-trip

```bash
# Export PDF
Download PDF button

# Re-import from PDF
Menu (⋯) → Import → select the exported .pdf
# Resumify embeds the JSON data inside the PDF for recovery
```

---

## Data Format

```json
{
  "sectionOrder": ["technicalSkills", "education", "experience", "projects", "certifications", "skills", "languages", "workshops", "links"],
  "hiddenSections": [],
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
  "technicalSkills": [
    { "id": "1", "category": "Languages", "items": "Python, JavaScript, TypeScript" },
    { "id": "2", "category": "Tools", "items": "Git, Docker, AWS" }
  ],
  "languages": [
    { "id": "1", "category": "", "items": "Spanish [Native], English [Professional]" }
  ],
  "education": [
    {
      "id": "1",
      "institution": "University Name",
      "degree": "Degree Title",
      "location": "City, Country",
      "startDate": "Jan 2020",
      "endDate": "Dec 2024",
      "gpaOrHonors": "GPA 3.9/4.0",
      "bullets": [],
      "subtitles": []
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
      "link": "company.com",
      "subtitles": []
    }
  ],
  "projects": [
    {
      "id": "1",
      "name": "Project Name",
      "technologies": "React, TypeScript",
      "description": ["What you built and why it matters"],
      "link": "github.com/you/project",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "subtitles": []
    }
  ],
  "skills": [
    { "id": "1", "category": "Soft Skills", "items": "Communication, Teamwork" }
  ],
  "certifications": [
    {
      "id": "1",
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "startDate": "Aug 2023",
      "link": "aws.amazon.com/verification"
    }
  ],
  "workshops": [],
  "links": [],
  "font": "Arial"
}
```

> **Backward-compatible import**: If you import a JSON that has `languages` in the old `{name, proficiency}` format, or `skills` where `technicalSkills` is expected by the section order, Resumify will automatically migrate the data on import.

---

## PDF page mechanics

| Parameter | Value | Reason |
|---|---|---|
| PDF format | A4 (210 × 297mm) | Standard professional |
| PDF margin | 12mm top, 12mm bottom | Breathing room at every page break |
| Content per page | 273mm | 297 − 12 − 12 |
| Canvas top padding | 0mm in PDF capture | A `data-html2canvas-ignore` spacer provides visual spacing in the HTML preview; the PDF margin supplies it in the export |
| Page-break avoidance | `.section-header-group`, `.break-inside-avoid`, `li` | Headers never orphan; whole entries move to next page rather than splitting |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vitejs.dev) | 6 | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | CDN | Styling |
| [Lucide React](https://lucide.dev) | latest | Icons |
| [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) | CDN | PDF generation via html2canvas + jsPDF |

---

## Project Structure

```
resumify/
├── components/
│   ├── Editor.tsx            # Left panel — all editing forms and modals
│   ├── ResumeCanvas.tsx      # A4 live preview template
│   ├── PrintPreviewModal.tsx # Paginated export preview (exact PDF simulation)
│   ├── TestingPanel.tsx      # Built-in test suite with pass/fail report
│   ├── SortableList.tsx      # Drag-and-drop list primitive
│   └── ui.tsx                # Base UI components (Button, Input, Dialog…)
├── contexts/
│   └── LanguageContext.tsx   # i18n — Spanish / English
├── types.ts                  # TypeScript interfaces
├── constants.ts              # Default sample resume data + empty template
├── App.tsx                   # Root — layout, PDF export, import/export, toolbar
└── index.tsx                 # React entry point
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE)
