# BeActive Clinic - Physiotherapy & Chiropractic Next.js Architecture

A production-ready, highly scalable, and SEO-optimized website architecture for physical therapy and chiropractic clinics. Built with Next.js, TypeScript, and a decoupled Vanilla CSS design system.

The codebase is prepared for direct deployment on **Cloudflare** and version-controlled on **GitHub**.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Project Structure](#project-structure)
3. [Installation & Local Running](#installation--local-running)
4. [Environment Variables](#environment-variables)
5. [Content Schema & Data Layer](#content-schema--data-layer)
6. [Connecting the Headless API](#connecting-the-headless-api)
7. [Adding New Content (Services, Team, Blog, etc.)](#adding-new-content-services-team-blog-etc)
8. [Adding a New Page (Screenshot Workflow)](#adding-a-new-page-screenshot-workflow)
9. [SEO & Structured Schema Data](#seo--structured-schema-data)
10. [Cloudflare Deployment Considerations](#cloudflare-deployment-considerations)

---

## Core Features

- **Decoupled Data Layer**: Separates page UI from mock JSON data, allowing zero-rebuild API integrations later.
- **Dynamic SEO**: Implements Next.js dynamic metadata for titles, descriptions, OpenGraph tags, sitemap.xml, and robots.txt.
- **JSON-LD Schema Automation**: Injects semantic structured data schemas (`MedicalBusiness`, `Person`, `Article`, `FAQPage`, `BreadcrumbList`) automatically from content.
- **Popup Maker Integration**: Houses a global modal dialog manager linked to hash routing (`#booking` / `#request-appointment`) that captures user requests.
- **Vanilla CSS Tokens**: Uses zero-Tailwind, pure HSL/hex CSS custom property tokens mapping to the clinic's brand style sheet.

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router Pages
│   ├── about/            # About Page
│   ├── blog/             # Blog list & Dynamic slug details
│   ├── conditions/       # Conditions catalog & dynamic slug details
│   ├── contact/          # Contact Page (Form + map)
│   ├── locations/        # Clinic branches directory & dynamic slug details
│   ├── services/         # Services directory & dynamic slug details
│   ├── team/             # Team practitioners directory & dynamic slug details
│   ├── globals.css       # Core design system tokens, resets & utility classes
│   ├── layout.tsx        # Root HTML shell, global nav header & footer
│   ├── not-found.tsx     # Customized brand-compliant 404 page
│   ├── page.tsx          # Homepage matching visual JSON spec
│   ├── robots.ts         # Robots.txt generator
│   └── sitemap.ts        # Sitemap.xml crawler
├── components/           # Reusable Components
│   ├── forms/            # Accessible form components (AppointmentForm)
│   ├── layout/           # Sticky Header & Footer
│   ├── seo/              # Structured JSON-LD schemas
│   └── ui/               # Modular parts (Modal, Breadcrumbs, ReviewWidget)
├── data/                 # Mock JSON Databases (Interchangeable with API)
│   ├── settings.json     # Contact information, opening hours, social profiles
│   ├── services.json
│   ├── team.json
│   ├── locations.json
│   ├── conditions.json
│   ├── blog.json
│   └── testimonials.json
├── lib/                  # Utilities and API fetchers
│   └── api.ts            # Decoupled mock database fetches
└── types/                # TypeScript models
    └── content.ts        # Definitions for clinic schemas
```

---

## Installation & Local Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

3. **Build optimized production assets**:
   ```bash
   npm run build
   ```

4. **Verify production server**:
   ```bash
   npm run start
   ```

---

## Environment Variables

Configure these settings inside `.env.local` for development and configure them in Cloudflare dashboard settings for production.

```bash
# Public URL of the deployed website (used for canonical URLs)
NEXT_PUBLIC_SITE_URL=https://beactiveclinic.ca

# External Content CMS Settings (to connect later)
CONTENT_API_URL=
CONTENT_API_TOKEN=
```

---

## Content Schema & Data Layer

TypeScript interfaces are centralized in [`src/types/content.ts`](file:///d:/patient%20click/nosecreek/src/types/content.ts). Core models:
- **`SiteSettings`**: Universal phone, hours, address, social tags.
- **`Service`**: Titles, benefits, symptoms, treatment procedures, FAQs.
- **`TeamMember`**: Bios, credentials, specialties, languages.
- **`BlogPost`**: Excerpts, authors, category tags, markdown contents.
- **`Condition`**: Descriptions, warning signs, physical therapy procedures.

---

## Connecting the Headless API

Data is requested through client-agnostic functions inside [`src/lib/api.ts`](file:///d:/patient%20click/nosecreek/src/lib/api.ts). 

To connect an external API (e.g. Strapi, Contentful, Sanity):
1. Update `src/lib/api.ts`.
2. Replace local JSON reads with `fetch()` calls. Example:
   ```typescript
   export async function getServices(): Promise<Service[]> {
     if (process.env.CONTENT_API_URL) {
       const res = await fetch(`${process.env.CONTENT_API_URL}/services`, {
         headers: { Authorization: `Bearer ${process.env.CONTENT_API_TOKEN}` }
       });
       return res.json();
     }
     return servicesList; // fallback
   }
   ```

---

## Adding New Content (Services, Team, Blog, etc.)

During mock development mode:
- **Service**: Add a JSON entry to `src/data/services.json`.
- **Team Member**: Add a JSON entry to `src/data/team.json`.
- **Blog Post**: Add a JSON entry to `src/data/blog.json`.
- **Condition**: Add a JSON entry to `src/data/conditions.json`.
- **Location**: Add a JSON entry to `src/data/locations.json`.

Dynamic routing files (e.g., `src/app/services/[slug]/page.tsx`) will detect new slugs automatically and render the page details.

---

## Adding a New Page (Screenshot Workflow)

To implement a new page from a visual screenshot reference:
1. **Analyze layout**: Note if it represents a dynamic instance (e.g. a specific team member bio layout) or a static page.
2. **Review design tokens**: Reuse variables in `globals.css` (primary, secondary, border radii, card shadows).
3. **Reuse UI blocks**: Incorporate `<Breadcrumbs />`, `<Modal />`, `<AppointmentForm />`, or buttons.
4. **Create specific page styling**: Create page-specific modules (`NewPage.module.css`) to target custom layouts without mutating global settings.
5. **Set up dynamic paths**: If creating a service layout, adjust files inside `src/app/services/[slug]/page.tsx` keeping header, footer, and brand consistency.

---

## SEO & Structured Schema Data

- **Dynamic Metadata**: Every subpage features customized dynamic metadata compiled at build-time using `generateMetadata`.
- **Structured Data**:
  - Homepage injects `MedicalBusiness` schema.
  - Services inject `FAQPage` schema.
  - Team profiles inject `Person` schema.
  - Articles inject `BlogPosting` schema.
  - Subpaths automatically inject `BreadcrumbList` schema.

---

## Cloudflare Deployment Considerations

- **Next.js Runtime**: Set Cloudflare's runtime node configuration. Cloudflare Pages supports Next.js via the `@cloudflare/next-on-pages` plugin.
- **Image Optimization**: Cloudflare Pages does not support default Vercel-specific image optimization. Set `unoptimized: true` inside `next.config.ts` if deploying without Cloudflare's native Image Resizing add-on:
  ```typescript
  const nextConfig = {
    images: {
      unoptimized: true
    }
  };
  ```
- **Static Optimization**: The application build outputs static static routes (`○`) for listing directory catalogs and dynamic on-demand routes (`ƒ`) for database listings, providing high loading speed.
