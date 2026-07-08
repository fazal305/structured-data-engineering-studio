const studio = window.StructuredStudio;

studio.initSharedPage("settings");

document.addEventListener("DOMContentLoaded", () => {
    renderSettingsForm();
    renderThemeCustomizer();

    document.querySelector("#exportWorkspaceBtn").addEventListener("click", exportWorkspace);
    document.querySelector("#importWorkspaceInput").addEventListener("change", importWorkspace);
    document.querySelector("#resetDemoBtn").addEventListener("click", resetDemoWorkspace);
    document.querySelector("#clearWorkspaceBtn").addEventListener("click", clearWorkspace);
});

function renderSettingsForm() {
    const workspace = studio.loadWorkspace();

    document.querySelector("#settingsForm").innerHTML = `
    <div class="settings-section">
      <div class="page-kicker">Brand</div>
      <h2>Workspace Identity</h2>

      <label class="form-label mt-3">App Name</label>
      <input id="brandName" class="form-control" value="${studio.escapeHtml(workspace.brand.name)}">

      <label class="form-label mt-3">Tagline</label>
      <textarea id="brandTagline" class="form-control">${studio.escapeHtml(workspace.brand.tagline)}</textarea>

      <button class="btn-app mt-3" id="saveBrandBtn">Save Brand Settings</button>
    </div>

    <div class="settings-section">
      <div class="page-kicker">Behavior</div>
      <h2>Workspace Timing</h2>

      <label class="form-label mt-3">
        Transition Speed:
        <span class="range-value" id="transitionSpeedValue">${workspace.settings.transitionSpeedMs}ms</span>
      </label>
      <input id="transitionSpeed" type="range" min="120" max="1200" step="20" class="form-range" value="${workspace.settings.transitionSpeedMs}">

      <label class="form-label mt-3">
        Loader Delay:
        <span class="range-value" id="loaderDelayValue">${workspace.settings.loaderDelayMs}ms</span>
      </label>
      <input id="loaderDelay" type="range" min="0" max="1000" step="20" class="form-range" value="${workspace.settings.loaderDelayMs}">

      <label class="form-label mt-3">Default Page Size</label>
      <input id="defaultPageSize" type="number" class="form-control" value="${workspace.settings.defaultPageSize}">
    </div>
  `;

    document.querySelector("#saveBrandBtn").addEventListener("click", saveBrandSettings);

    document.querySelector("#transitionSpeed").addEventListener("input", (event) => {
        setTransitionSpeed(Number(event.target.value));
    });

    document.querySelector("#loaderDelay").addEventListener("input", (event) => {
        setLoaderDelay(Number(event.target.value));
    });

    document.querySelector("#defaultPageSize").addEventListener("input", (event) => {
        const workspace = studio.loadWorkspace();
        workspace.settings.defaultPageSize = Number(event.target.value) || 25;
        studio.saveWorkspace(workspace);
    });
}

function saveBrandSettings() {
    const workspace = studio.loadWorkspace();

    workspace.brand.name = document.querySelector("#brandName").value.trim() || studio.defaultWorkspace.brand.name;
    workspace.brand.tagline = document.querySelector("#brandTagline").value.trim() || studio.defaultWorkspace.brand.tagline;

    studio.saveWorkspace(workspace);
    studio.applyThemeSettings();
    studio.renderSidebar("settings");
    studio.showStatus("Brand settings saved.", "success");
}

function renderThemeCustomizer() {
    const workspace = studio.loadWorkspace();
    const theme = workspace.theme;

    const colorTokens = [
        "bg",
        "bgSoft",
        "text",
        "muted",
        "primary",
        "secondary",
        "success",
        "warning",
        "danger"
    ];

    document.querySelector("#themeCustomizer").innerHTML = `
    <div class="settings-section">
      <div class="page-kicker">Theme</div>
      <h2>Dynamic Theme Tokens</h2>

      <div class="color-grid mt-3">
        ${colorTokens
            .map(
                (token) => `
              <div>
                <label class="form-label">${studio.escapeHtml(token)}</label>
                <input type="color" class="form-control form-control-color w-100" value="${studio.escapeHtml(theme[token])}" data-theme-token="${studio.escapeHtml(token)}">
              </div>
            `
            )
            .join("")}
      </div>

      <label class="form-label mt-3">Card Background</label>
      <input class="form-control" value="${studio.escapeHtml(theme.card)}" data-theme-token="card">

      <label class="form-label mt-3">Font Family</label>
      <select class="form-select" data-theme-token="fontFamily">
        ${["Inter, sans-serif", "Arial, sans-serif", "Georgia, serif", "Consolas, monospace"]
            .map(
                (font) => `
              <option value="${studio.escapeHtml(font)}" ${font === theme.fontFamily ? "selected" : ""}>
                ${studio.escapeHtml(font)}
              </option>
            `
            )
            .join("")}
      </select>

      <label class="form-label mt-3">
        Border Radius:
        <span class="range-value" id="radiusValue">${theme.radius}px</span>
      </label>
      <input type="range" min="4" max="40" step="1" class="form-range" value="${theme.radius}" data-theme-token="radius">

      <button class="btn-ghost mt-3" id="resetThemeBtn">Reset Theme</button>
    </div>
  `;

    document.querySelectorAll("[data-theme-token]").forEach((input) => {
        input.addEventListener("input", () => {
            updateThemeToken(input.dataset.themeToken, input.value);
        });

        input.addEventListener("change", () => {
            updateThemeToken(input.dataset.themeToken, input.value);
        });
    });

    document.querySelector("#resetThemeBtn").addEventListener("click", resetThemeToDefault);
}

function updateThemeToken(name, value) {
    const workspace = studio.loadWorkspace();

    workspace.theme[name] = name === "radius" ? Number(value) : value;

    studio.saveWorkspace(workspace);
    studio.applyThemeSettings();

    const radiusValue = document.querySelector("#radiusValue");
    if (radiusValue && name === "radius") {
        radiusValue.textContent = `${value}px`;
    }
}

function resetThemeToDefault() {
    const workspace = studio.loadWorkspace();

    workspace.theme = studio.safeClone(studio.defaultWorkspace.theme);

    studio.saveWorkspace(workspace);
    studio.applyThemeSettings();
    renderThemeCustomizer();

    studio.showStatus("Theme reset to default.", "success");
}

function setTransitionSpeed(ms) {
    const workspace = studio.loadWorkspace();

    workspace.settings.transitionSpeedMs = ms;
    studio.saveWorkspace(workspace);

    document.querySelector("#transitionSpeedValue").textContent = `${ms}ms`;
}

function setLoaderDelay(ms) {
    const workspace = studio.loadWorkspace();

    workspace.settings.loaderDelayMs = ms;
    studio.saveWorkspace(workspace);

    document.querySelector("#loaderDelayValue").textContent = `${ms}ms`;
}

function exportWorkspace() {
    const workspace = studio.loadWorkspace();

    studio.downloadJson("structured-data-engineering-workspace.json", workspace);
    studio.showStatus("Workspace exported.", "success");
}

async function importWorkspace(event) {
    const file = event.target.files[0];

    if (!file) return;

    const text = await file.text();
    const parsed = studio.parseJson(text);

    if (!parsed.ok) {
        studio.showStatus(`Import failed: ${parsed.error}`, "danger");
        return;
    }

    studio.saveWorkspace(parsed.data);
    studio.applyThemeSettings();
    renderSettingsForm();
    renderThemeCustomizer();
    studio.renderSidebar("settings");

    studio.showStatus("Workspace imported successfully.", "success");
}

function resetDemoWorkspace() {
    studio.resetWorkspace();
    renderSettingsForm();
    renderThemeCustomizer();
    studio.renderSidebar("settings");

    studio.showStatus("Demo workspace restored.", "success");
}

function clearWorkspace() {
    localStorage.removeItem(studio.STORAGE_KEY);

    const workspace = studio.seedDemoData();
    studio.saveWorkspace(workspace);

    studio.applyThemeSettings();
    renderSettingsForm();
    renderThemeCustomizer();
    studio.renderSidebar("settings");

    studio.showStatus("LocalStorage cleared and demo data restored.", "success");
}