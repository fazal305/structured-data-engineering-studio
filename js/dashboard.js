const studio = window.StructuredStudio;

studio.initSharedPage("dashboard");

document.addEventListener("DOMContentLoaded", () => {
    renderDashboardHero();
    renderDashboardStats();
    renderModuleCards();
    renderLearningTrack();
    renderRecentActivity();
});

function renderDashboardHero() {
    const workspace = studio.loadWorkspace();
    const target = document.querySelector("#dashboardHero");

    target.innerHTML = `
    <div class="hero-panel card-panel">
      <span class="badge-soft">Structured Data Engineering Workspace</span>
      <h1 class="page-title">${studio.escapeHtml(workspace.brand.name)}</h1>
      <p class="page-subtitle">${studio.escapeHtml(workspace.brand.tagline)}</p>

      <div class="hero-actions">
        <a href="graphql-explorer.html" class="btn-app">Start GraphQL Explorer</a>
        <a href="json-analytics.html" class="btn-ghost">Analyze JSON Dataset</a>
        <a href="settings.html" class="btn-ghost">Customize Workspace</a>
      </div>
    </div>
  `;
}

function renderDashboardStats() {
    const stats = [
        { label: "API Tools", value: 3 },
        { label: "JSON Tools", value: 3 },
        { label: "Validation Tools", value: 2 },
        { label: "Browser API Labs", value: 6 }
    ];

    document.querySelector("#dashboardStats").innerHTML = stats
        .map(
            (item) => `
        <div class="metric-card">
          <div class="metric-value">${item.value}</div>
          <div class="metric-label">${studio.escapeHtml(item.label)}</div>
        </div>
      `
        )
        .join("");
}

function renderModuleCards() {
    const cards = studio.moduleConfig
        .filter((item) => item.id !== "dashboard")
        .map(
            (item) => `
        <a href="${item.page}" class="module-card tool-card">
          <span class="badge-soft">${item.icon} ${studio.escapeHtml(item.group)}</span>
          <h3>${studio.escapeHtml(item.title)}</h3>
          <p>${studio.escapeHtml(item.description)}</p>
        </a>
      `
        )
        .join("");

    document.querySelector("#moduleCards").innerHTML = cards;
}

function renderLearningTrack() {
    const track = [
        "XML fundamentals",
        "JSON parsing and serialization",
        "Validation and schema thinking",
        "REST and GraphQL APIs",
        "Developer tooling",
        "Business workflows",
        "Structured data engineering"
    ];

    document.querySelector("#learningTrack").innerHTML = track
        .map(
            (item, index) => `
        <div class="track-item">
          <strong>${index + 1}. ${studio.escapeHtml(item)}</strong>
        </div>
      `
        )
        .join("");
}

function renderRecentActivity() {
    const workspace = studio.loadWorkspace();
    const activity = workspace.activityLog.slice(0, 6);

    if (!activity.length) {
        document.querySelector("#recentActivity").innerHTML = studio.renderEmptyState(
            "No activity yet. Start using the tools to build your workspace history."
        );
        return;
    }

    document.querySelector("#recentActivity").innerHTML = activity
        .map(
            (item) => `
        <div class="activity-item">
          <strong>${studio.escapeHtml(item.module)} — ${studio.escapeHtml(item.action)}</strong>
          <p class="mb-1 text-secondary">${studio.escapeHtml(item.detail)}</p>
          <small>${studio.formatTimestamp(item.createdAt)}</small>
        </div>
      `
        )
        .join("");
}