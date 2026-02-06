# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal academic portfolio site for Max Henry, hosted via GitHub Pages at `maxsolomonhenry.github.io`. Uses Jekyll (GitHub Pages native) for templating and blog support. Research focus: HCI, audio machine learning, computer-assisted creativity.

## Development

Install dependencies (requires Ruby):
```
bundle install
```

Preview locally:
```
bundle exec jekyll serve
```
Site at `http://localhost:4000`. Auto-rebuilds on file changes.

**Deployment:** Push to `main` branch. GitHub Pages auto-builds and publishes.

## Architecture

- **`_config.yml`** — Jekyll config: site metadata, pagination settings, excluded files.
- **`_layouts/default.html`** — Base HTML template with all CSS (LaTeX.css CDN + embedded styles), nav bar, and `{{ content }}` slot.
- **`_layouts/post.html`** — Blog post template (extends `default`). Renders title, date, and post content.
- **`index.html`** — Portfolio homepage. Uses `default` layout. Contains all portfolio content (bio, theses, projects, publications).
- **`blog/index.html`** — Blog listing page with pagination via `jekyll-paginate`.
- **`_posts/`** — Blog entries as Markdown files, named `YYYY-MM-DD-title.md`.
- **`gifs/`** — Demo animations for the sound design assistant project.
- **`photo.jpg`**, **`*.png`**, **`*.pdf`** — Static assets (profile photo, figures, CV).

## Writing a Blog Post

Create a file in `_posts/` named `YYYY-MM-DD-your-title.md` with front matter:
```yaml
---
layout: post
title: "Your Post Title"
---
```
Write content in Markdown below the front matter.

## Style Conventions

- No JavaScript framework — plain HTML/CSS with Jekyll templating.
- All CSS lives in `_layouts/default.html` in the embedded `<style>` tag (plus LaTeX.css CDN).
- Social icons are inline SVGs with brand-accurate colors and hover opacity effects.
- Navigation is a minimal "Home | Blog" bar at the top of every page.
