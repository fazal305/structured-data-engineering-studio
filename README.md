# Structured Data Engineering Studio

A browser-based structured data workspace for GraphQL exploration,
JSON analytics, API integrations, schema-generated forms, visual API
workflows, JSON query language parsing, API documentation generation,
data validation, and advanced browser API learning.

## Live Links

- GitHub Repository: [fazal305/structured-data-engineering-studio](https://github.com/fazal305/structured-data-engineering-studio)
- Live Demo: [https://fazal305.github.io/structured-data-engineering-studio/](https://fazal305.github.io/structured-data-engineering-studio/)

## Overview

Structured Data Engineering Studio is a professional multi-page frontend application focused on structured data workflows. It combines API exploration, JSON analytics, schema-driven form generation, workflow building, validation, documentation, and browser API learning into one unified workspace.

The project is built as a no-build browser application using HTML, CSS, Bootstrap, jQuery, Vanilla JavaScript, Chart.js, Fetch API, localStorage, IndexedDB, Web Workers, and dynamic CSS custom properties.

## Modules

- Dashboard
- GraphQL Explorer
- JSON Data Analytics Dashboard
- API Integration Playground
- Schema Form Generator
- API Workflow Builder
- JSON Query Language
- API Documentation Generator
- Data Validation Playground
- Advanced Browser APIs Lab
- Settings

## Features

- Multi-page frontend architecture
- Sticky sidebar navigation
- Smooth page transitions with loader fallback
- Dynamic localStorage-powered workspace
- Runtime theme customization
- GraphQL endpoint testing
- JSON upload, parsing, filtering, grouping, charting, and CSV export
- Public API integration playground
- JSON Schema to form generation
- Visual workflow node builder
- Mini JSON query language tokenizer, parser, and executor
- API documentation generator from JSON responses
- Rule-based data validation playground
- IndexedDB, Web Worker, Notification, and File System Access API demos
- Workspace export and import

## Technologies Used

- HTML5
- CSS3 dynamic custom properties
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- Chart.js
- Fetch API
- GraphQL requests
- LocalStorage
- IndexedDB
- Web Workers
- Blob API
- Clipboard API

## Learning Outcomes

- Building a large no-build frontend application
- Organizing a multi-page project with shared and page-specific files
- Managing localStorage as a client-side data source
- Designing dynamic theme systems using CSS variables
- Working with REST APIs and GraphQL requests
- Parsing, validating, transforming, and documenting JSON
- Creating schema-driven interfaces
- Building basic visual workflow execution logic
- Implementing tokenizer/parser style query tools
- Exploring advanced browser APIs safely

## Architecture Notes

The application uses a multi-page frontend architecture where every module has its own HTML file, CSS file, and JavaScript file. Shared utilities, state helpers, navigation rendering, transition logic, JSON helpers, download helpers, and theme application logic are centralized in `js/shared.js`.

The styling system uses one global stylesheet, `styles.css`, plus page-specific styles inside the `css/` folder. Colors, radius, and typography are controlled through dynamic CSS variables. Runtime values are loaded from the workspace object in localStorage and applied to `:root`.

The smooth transition system injects a full-screen overlay on every page, fades it out on load, intercepts internal navigation links, and fades the overlay back in before changing pages. Loader timing, transition speed, and theme colors come from workspace settings.

Structured data workflows are handled through separate modules. JSON analytics parses uploaded data into rows, infers fields, creates filters, renders tables, and generates charts. The query language module tokenizes and parses simple expressions. The validation playground checks data against rule objects from state. The workflow builder passes JSON through configurable visual nodes.

The project uses a no-build browser architecture. It can run locally by opening `index.html`, and it can be hosted directly on GitHub Pages.

## Folder Structure

```text
structured-data-engineering-studio/
  index.html
  graphql-explorer.html
  json-analytics.html
  api-playground.html
  schema-form-generator.html
  workflow-builder.html
  json-query-language.html
  api-doc-generator.html
  validation-playground.html
  browser-apis-lab.html
  settings.html

  styles.css

  css/
    dashboard.css
    graphql-explorer.css
    json-analytics.css
    api-playground.css
    schema-form-generator.css
    workflow-builder.css
    json-query-language.css
    api-doc-generator.css
    validation-playground.css
    browser-apis-lab.css
    settings.css

  js/
    shared.js
    dashboard.js
    graphql-explorer.js
    json-analytics.js
    api-playground.js
    schema-form-generator.js
    workflow-builder.js
    json-query-language.js
    api-doc-generator.js
    validation-playground.js
    browser-apis-lab.js
    settings.js

  README.md
  LICENSE
  .gitignore
```

How To Run Locally
git clone https://github.com/fazal305/structured-data-engineering-studio.git
cd structured-data-engineering-studio

Open:

index.html

You can also use VS Code Live Server for smoother local testing.

Sample Workflow
Open the GraphQL Explorer and run the sample countries query.
Open JSON Analytics and load the demo sales dataset.
View generated statistics, charts, filters, and table output.
Switch to the API Playground and test public API presets.
Generate a live form from a JSON Schema.
Build and execute a visual API workflow.
Query JSON using the custom JSON Query Language.
Generate API documentation from a JSON response.
Validate JSON using custom rules.
Explore IndexedDB, Web Workers, Notifications, and browser API capability checks.
Customize the workspace from Settings.
Export or import workspace JSON.
Agentic Engineering Process

This project was planned specification-first. The application was broken into clear modules, with each module receiving its own HTML, CSS, and JavaScript file. Shared concerns such as state, navigation, theme application, transitions, JSON utilities, download helpers, and activity logs were isolated inside js/shared.js.

The build process followed a step-by-step implementation flow with verification gates after each major module. Each page was designed to run independently while still using the shared workspace model.

Sandboxing and isolation were handled by keeping all persistence inside browser localStorage and avoiding backend dependencies. Each module has clear exit criteria: page loads, sidebar works, module logic runs, theme variables apply, and no build step is required.

The feedback and iteration loop is simple: test locally, adjust the specific module file, verify in browser, then commit improvements to GitHub.

Future Improvements
Real GraphQL schema introspection
Workflow branching
More query language features
IndexedDB dataset persistence
Service Worker offline mode
WebRTC collaboration
Export dashboards as PDF
Plugin system
License

MIT License
