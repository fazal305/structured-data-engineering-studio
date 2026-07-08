const STORAGE_KEY = "structuredDataEngineeringWorkspace";

const defaultWorkspace = {
    brand: {
        name: "Structured Data Engineering Studio",
        tagline:
            "APIs, JSON, schemas, workflows, validation, and analytics in one browser workspace."
    },
    settings: {
        compactSidebar: false,
        transitionSpeedMs: 320,
        loaderDelayMs: 180,
        defaultPageSize: 25
    },
    theme: {
        bg: "#040712",
        bgSoft: "#07111f",
        card: "rgba(10, 18, 36, 0.9)",
        text: "#f7fbff",
        muted: "#9aabc7",
        primary: "#22d3ee",
        secondary: "#a855f7",
        success: "#4ade80",
        warning: "#facc15",
        danger: "#fb7185",
        radius: 18,
        fontFamily: "Inter, sans-serif"
    },
    graphqlHistory: [],
    apiHistory: [],
    apiPresets: [],
    datasets: [],
    workflows: [],
    savedQueries: [],
    generatedDocs: [],
    validationRules: [],
    activityLog: []
};

const moduleConfig = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: "🏠",
        page: "index.html",
        group: "Workspace",
        description: "Overview, learning track, activity, and quick actions."
    },
    {
        id: "graphql-explorer",
        title: "GraphQL Explorer",
        icon: "🔷",
        page: "graphql-explorer.html",
        group: "API Tools",
        description: "Run GraphQL queries, variables, headers, and history."
    },
    {
        id: "json-analytics",
        title: "JSON Analytics",
        icon: "📊",
        page: "json-analytics.html",
        group: "JSON Tools",
        description: "Upload JSON and generate charts, tables, filters, and CSV exports."
    },
    {
        id: "api-playground",
        title: "API Playground",
        icon: "🌐",
        page: "api-playground.html",
        group: "API Tools",
        description: "Explore public APIs with dynamic request forms and parsed results."
    },
    {
        id: "schema-form-generator",
        title: "Schema Form Generator",
        icon: "🧩",
        page: "schema-form-generator.html",
        group: "Schema Tools",
        description: "Generate working forms from JSON Schema."
    },
    {
        id: "workflow-builder",
        title: "Workflow Builder",
        icon: "🕸️",
        page: "workflow-builder.html",
        group: "Workflow Tools",
        description: "Build visual API/data workflows using configurable nodes."
    },
    {
        id: "json-query-language",
        title: "JSON Query Language",
        icon: "🔎",
        page: "json-query-language.html",
        group: "Query Tools",
        description: "Tokenize, parse, and execute mini JSON queries."
    },
    {
        id: "api-doc-generator",
        title: "API Docs Generator",
        icon: "📚",
        page: "api-doc-generator.html",
        group: "Docs Tools",
        description: "Convert JSON responses into field documentation and Markdown."
    },
    {
        id: "validation-playground",
        title: "Validation Playground",
        icon: "✅",
        page: "validation-playground.html",
        group: "Validation Tools",
        description: "Define rules, validate JSON, and export reports."
    },
    {
        id: "browser-apis-lab",
        title: "Browser APIs Lab",
        icon: "🧪",
        page: "browser-apis-lab.html",
        group: "Browser APIs",
        description: "IndexedDB, Web Workers, notifications, and browser API learning."
    },
    {
        id: "settings",
        title: "Settings",
        icon: "⚙️",
        page: "settings.html",
        group: "Workspace",
        description: "Theme, transitions, import/export, and workspace management."
    }
];

const apiPresetConfig = [
    {
        id: "jsonplaceholder",
        name: "JSONPlaceholder",
        description: "Fake REST API for posts, users, comments, and todos.",
        endpoint: "https://jsonplaceholder.typicode.com/posts",
        method: "GET",
        fields: [
            {
                name: "resource",
                label: "Resource",
                type: "select",
                options: ["posts", "users", "comments", "todos"],
                value: "posts"
            },
            {
                name: "limit",
                label: "Limit",
                type: "number",
                value: 10
            }
        ]
    },
    {
        id: "github",
        name: "GitHub API",
        description: "Fetch public GitHub profile data.",
        endpoint: "https://api.github.com/users/fazal305",
        method: "GET",
        fields: [
            {
                name: "username",
                label: "Username",
                type: "text",
                value: "fazal305"
            }
        ]
    },
    {
        id: "countries",
        name: "Countries API",
        description: "Search countries by name.",
        endpoint: "https://restcountries.com/v3.1/name/pakistan",
        method: "GET",
        fields: [
            {
                name: "country",
                label: "Country",
                type: "text",
                value: "pakistan"
            }
        ]
    },
    {
        id: "pokemon",
        name: "Pokémon API",
        description: "Fetch Pokémon information.",
        endpoint: "https://pokeapi.co/api/v2/pokemon/pikachu",
        method: "GET",
        fields: [
            {
                name: "pokemon",
                label: "Pokémon",
                type: "text",
                value: "pikachu"
            }
        ]
    },
    {
        id: "openlibrary",
        name: "OpenLibrary API",
        description: "Search books by title.",
        endpoint: "https://openlibrary.org/search.json?title=javascript",
        method: "GET",
        fields: [
            {
                name: "title",
                label: "Book Title",
                type: "text",
                value: "javascript"
            }
        ]
    },
    {
        id: "openweather",
        name: "OpenWeather",
        description: "Weather API preset placeholder requiring your own key.",
        endpoint: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        fields: [
            {
                name: "city",
                label: "City",
                type: "text",
                value: "Karachi"
            },
            {
                name: "apiKey",
                label: "API Key",
                type: "text",
                value: ""
            }
        ]
    },
    {
        id: "nasa",
        name: "NASA API",
        description: "NASA APOD API preset using DEMO_KEY.",
        endpoint: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
        method: "GET",
        fields: [
            {
                name: "apiKey",
                label: "API Key",
                type: "text",
                value: "DEMO_KEY"
            }
        ]
    }
];

const workflowNodeConfig = [
    {
        type: "get",
        label: "GET Request",
        icon: "🌐",
        description: "Fetch JSON from a URL."
    },
    {
        type: "filter",
        label: "Filter",
        icon: "🔎",
        description: "Filter rows by field and value."
    },
    {
        type: "transform",
        label: "Transform",
        icon: "🧬",
        description: "Pick or rename fields."
    },
    {
        type: "sort",
        label: "Sort",
        icon: "↕️",
        description: "Sort rows by field."
    },
    {
        type: "map",
        label: "Map",
        icon: "🗺️",
        description: "Map each row into a new shape."
    },
    {
        type: "limit",
        label: "Limit",
        icon: "✂️",
        description: "Limit number of rows."
    },
    {
        type: "display",
        label: "Display",
        icon: "🖥️",
        description: "Display final output."
    },
    {
        type: "export",
        label: "Export JSON",
        icon: "⬇️",
        description: "Prepare JSON export."
    }
];

const validationRuleTypes = [
    "required",
    "type",
    "minLength",
    "maxLength",
    "min",
    "max",
    "regex"
];

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function generateId(prefix = "id") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTimestamp(dateString) {
    const date = dateString ? new Date(dateString) : new Date();

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString();
}

function formatBytes(bytes) {
    const size = Number(bytes) || 0;
    const units = ["B", "KB", "MB", "GB"];
    let value = size;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function safeClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadWorkspace() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }

    try {
        const parsed = JSON.parse(stored);
        return mergeWorkspace(defaultWorkspace, parsed);
    } catch (error) {
        console.error(error);
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }
}

function mergeWorkspace(base, saved) {
    const merged = safeClone(base);

    Object.keys(saved || {}).forEach((key) => {
        if (
            saved[key] &&
            typeof saved[key] === "object" &&
            !Array.isArray(saved[key]) &&
            merged[key]
        ) {
            merged[key] = { ...merged[key], ...saved[key] };
        } else {
            merged[key] = saved[key];
        }
    });

    return merged;
}

function saveWorkspace(workspace) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function resetWorkspace() {
    const workspace = seedDemoData();
    saveWorkspace(workspace);
    applyThemeSettings();
    return workspace;
}

function seedDemoData() {
    const workspace = safeClone(defaultWorkspace);

    workspace.apiPresets = safeClone(apiPresetConfig);

    workspace.graphqlHistory = [
        {
            id: generateId("gql"),
            endpoint: "https://countries.trevorblades.com/",
            query: "{ countries { code name emoji capital } }",
            variables: "{}",
            createdAt: new Date().toISOString(),
            favorite: true
        }
    ];

    workspace.datasets = [
        {
            id: generateId("dataset"),
            name: "Sample Sales Dataset",
            createdAt: new Date().toISOString(),
            rows: [
                {
                    orderId: "ORD-1001",
                    product: "API Dashboard",
                    category: "Developer Tools",
                    city: "Karachi",
                    month: "2026-01",
                    revenue: 12000,
                    quantity: 3
                },
                {
                    orderId: "ORD-1002",
                    product: "Schema Builder",
                    category: "Data Tools",
                    city: "Lahore",
                    month: "2026-02",
                    revenue: 18000,
                    quantity: 2
                },
                {
                    orderId: "ORD-1003",
                    product: "JSON Analytics",
                    category: "Analytics",
                    city: "Karachi",
                    month: "2026-02",
                    revenue: 22000,
                    quantity: 4
                },
                {
                    orderId: "ORD-1004",
                    product: "Workflow Engine",
                    category: "Automation",
                    city: "Islamabad",
                    month: "2026-03",
                    revenue: 30000,
                    quantity: 1
                }
            ]
        }
    ];

    workspace.workflows = [
        {
            id: generateId("workflow"),
            name: "Sample API Workflow",
            nodes: [
                {
                    id: generateId("node"),
                    type: "get",
                    label: "GET Users",
                    x: 60,
                    y: 80,
                    config: {
                        url: "https://jsonplaceholder.typicode.com/users"
                    }
                },
                {
                    id: generateId("node"),
                    type: "limit",
                    label: "Limit",
                    x: 330,
                    y: 80,
                    config: {
                        count: 5
                    }
                },
                {
                    id: generateId("node"),
                    type: "display",
                    label: "Display",
                    x: 600,
                    y: 80,
                    config: {}
                }
            ],
            connections: []
        }
    ];

    workspace.savedQueries = [
        {
            id: generateId("query"),
            name: "Karachi adults",
            query: "age > 20 AND city == Karachi",
            createdAt: new Date().toISOString()
        }
    ];

    workspace.generatedDocs = [
        {
            id: generateId("docs"),
            name: "Sample User API Docs",
            createdAt: new Date().toISOString()
        }
    ];

    workspace.validationRules = [
        {
            id: generateId("rule"),
            field: "name",
            type: "required",
            value: "",
            message: "Name is required."
        },
        {
            id: generateId("rule"),
            field: "email",
            type: "regex",
            value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "Email must be valid."
        }
    ];

    workspace.activityLog = [
        {
            id: generateId("activity"),
            module: "Workspace",
            action: "Demo data seeded",
            detail: "Initial localStorage workspace was created.",
            createdAt: new Date().toISOString()
        }
    ];

    return workspace;
}

function addActivityLog(module, action, detail) {
    const workspace = loadWorkspace();

    workspace.activityLog.unshift({
        id: generateId("activity"),
        module,
        action,
        detail,
        createdAt: new Date().toISOString()
    });

    workspace.activityLog = workspace.activityLog.slice(0, 50);
    saveWorkspace(workspace);
}

function applyThemeSettings() {
    const workspace = loadWorkspace();
    const theme = workspace.theme;
    const root = document.documentElement;

    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--bg-soft", theme.bgSoft);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--danger", theme.danger);
    root.style.setProperty("--radius", `${theme.radius}px`);
    root.style.setProperty("--font-family", theme.fontFamily);

    document.title = workspace.brand.name;
}

function renderSidebar(activePage = "dashboard") {
    const workspace = loadWorkspace();
    const sidebarTarget = document.querySelector("[data-sidebar]");

    if (!sidebarTarget) {
        return;
    }

    const links = moduleConfig
        .map(
            (item) => `
        <a class="nav-link ${item.id === activePage ? "active" : ""}" href="${item.page}" data-nav-link data-page="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${escapeHtml(item.title)}</span>
        </a>
      `
        )
        .join("");

    sidebarTarget.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <h1>${escapeHtml(workspace.brand.name)}</h1>
        <p>${escapeHtml(workspace.brand.tagline)}</p>
      </div>

      <nav class="nav-list">
        ${links}
      </nav>
    </aside>
  `;
}

function setActiveNav() {
    const current = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("[data-nav-link]").forEach((link) => {
        const href = link.getAttribute("href");
        link.classList.toggle("active", href === current);
    });
}

function showStatus(message, type = "info") {
    const oldStatus = document.querySelector(".status-message");

    if (oldStatus) {
        oldStatus.remove();
    }

    const status = document.createElement("div");
    status.className = `status-message ${type}`;
    status.textContent = message;
    document.body.appendChild(status);

    setTimeout(() => {
        status.remove();
    }, 3200);
}

function renderEmptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function downloadJson(filename, data) {
    downloadTextFile(filename, JSON.stringify(data, null, 2));
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

async function copyText(text, message = "Copied to clipboard.") {
    try {
        await navigator.clipboard.writeText(text);
        showStatus(message, "success");
    } catch (error) {
        console.error(error);
        showStatus("Clipboard access failed.", "danger");
    }
}

function parseJson(text) {
    try {
        return {
            ok: true,
            data: JSON.parse(text)
        };
    } catch (error) {
        return {
            ok: false,
            error: error.message
        };
    }
}

function formatJson(value) {
    return JSON.stringify(value, null, 2);
}

function flattenJson(value, path = "", rows = []) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            flattenJson(item, `${path}[${index}]`, rows);
        });
        return rows;
    }

    if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, childValue]) => {
            const nextPath = path ? `${path}.${key}` : key;
            flattenJson(childValue, nextPath, rows);
        });
        return rows;
    }

    rows.push({
        path,
        value,
        type: getValueType(value)
    });

    return rows;
}

function getValueType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
}

function jsonToCsv(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return "";
    }

    const fields = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((key) => set.add(key));
            return set;
        }, new Set())
    );

    const escapeCsv = (value) => {
        const output =
            typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");

        return `"${output.replaceAll('"', '""')}"`;
    };

    return [
        fields.map(escapeCsv).join(","),
        ...rows.map((row) => fields.map((field) => escapeCsv(row[field])).join(","))
    ].join("\n");
}

function createJsonTree(value) {
    if (Array.isArray(value)) {
        return `
      <div class="json-tree">
        <span>[</span>
        ${value
                .map(
                    (item, index) => `
              <div style="padding-left: 1rem;">
                <span class="json-key">${index}</span>: ${createJsonTree(item)}
              </div>
            `
                )
                .join("")}
        <span>]</span>
      </div>
    `;
    }

    if (value && typeof value === "object") {
        return `
      <div class="json-tree">
        <span>{</span>
        ${Object.entries(value)
                .map(
                    ([key, childValue]) => `
              <div style="padding-left: 1rem;">
                <span class="json-key">${escapeHtml(key)}</span>: ${createJsonTree(childValue)}
              </div>
            `
                )
                .join("")}
        <span>}</span>
      </div>
    `;
    }

    const type = getValueType(value);
    const className =
        type === "string"
            ? "json-string"
            : type === "number"
                ? "json-number"
                : type === "boolean"
                    ? "json-bool"
                    : "json-null";

    return `<span class="${className}">${escapeHtml(JSON.stringify(value))}</span>`;
}

function initPageTransitions() {
    ensureTransitionOverlay();

    const workspace = loadWorkspace();

    document.querySelectorAll('a[href$=".html"], a[href="./"], a[href="/"]').forEach((link) => {
        if (link.dataset.transitionBound === "true") {
            return;
        }

        link.dataset.transitionBound = "true";

        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href.startsWith("http") || href.startsWith("#")) {
                return;
            }

            event.preventDefault();
            navigateWithTransition(href);
        });
    });

    setTimeout(() => {
        hideTransitionOverlay();
    }, workspace.settings.loaderDelayMs);
}

function ensureTransitionOverlay() {
    if (document.querySelector(".transition-overlay")) {
        return;
    }

    const workspace = loadWorkspace();
    const overlay = document.createElement("div");

    overlay.className = "transition-overlay";
    overlay.innerHTML = `
    <div class="transition-loader">
      <div class="loader-ring"></div>
      <div class="loader-text">${escapeHtml(workspace.brand.name)} loading...</div>
    </div>
  `;

    document.body.appendChild(overlay);
}

function showTransitionOverlay(withLoader = false) {
    ensureTransitionOverlay();

    const overlay = document.querySelector(".transition-overlay");
    const loader = document.querySelector(".transition-loader");

    overlay.classList.remove("hidden");

    if (withLoader && loader) {
        loader.classList.add("show");
    }
}

function hideTransitionOverlay() {
    const workspace = loadWorkspace();
    const overlay = document.querySelector(".transition-overlay");
    const loader = document.querySelector(".transition-loader");

    if (!overlay) {
        return;
    }

    overlay.style.transitionDuration = `${workspace.settings.transitionSpeedMs}ms`;
    overlay.classList.add("hidden");

    setTimeout(() => {
        if (loader) {
            loader.classList.remove("show");
        }
    }, workspace.settings.transitionSpeedMs);
}

function navigateWithTransition(url) {
    const workspace = loadWorkspace();

    showTransitionOverlay(false);

    setTimeout(() => {
        const loader = document.querySelector(".transition-loader");

        if (loader) {
            loader.classList.add("show");
        }
    }, workspace.settings.loaderDelayMs);

    setTimeout(() => {
        window.location.href = url;
    }, workspace.settings.transitionSpeedMs);
}

function initSharedPage(activePage) {
    applyThemeSettings();
    renderSidebar(activePage);
    setActiveNav();

    document.addEventListener("DOMContentLoaded", () => {
        initPageTransitions();
    });
}

window.StructuredStudio = {
    STORAGE_KEY,
    defaultWorkspace,
    moduleConfig,
    apiPresetConfig,
    workflowNodeConfig,
    validationRuleTypes,
    escapeHtml,
    generateId,
    formatTimestamp,
    formatBytes,
    loadWorkspace,
    saveWorkspace,
    resetWorkspace,
    seedDemoData,
    addActivityLog,
    applyThemeSettings,
    renderSidebar,
    setActiveNav,
    showStatus,
    renderEmptyState,
    downloadJson,
    downloadTextFile,
    copyText,
    parseJson,
    formatJson,
    flattenJson,
    getValueType,
    safeClone,
    jsonToCsv,
    createJsonTree,
    initPageTransitions,
    showTransitionOverlay,
    hideTransitionOverlay,
    navigateWithTransition,
    initSharedPage
};