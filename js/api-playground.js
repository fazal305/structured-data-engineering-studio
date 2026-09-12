const studio = window.StructuredStudio;

studio.initSharedPage("api-playground");

let selectedApiId = "jsonplaceholder";
let latestApiData = null;

document.addEventListener("DOMContentLoaded", () => {
    renderApiSelector();
    renderApiRequestForm(selectedApiId);
    renderApiHistory();

    document.querySelector("#runApiBtn").addEventListener("click", runSelectedApiRequest);
    document.querySelector("#copyRawBtn").addEventListener("click", () => {
        studio.copyText(studio.formatJson(latestApiData || {}), "Raw API JSON copied.");
    });
});

function renderApiSelector() {
    const workspace = studio.loadWorkspace();
    const presets = workspace.apiPresets.length ? workspace.apiPresets : studio.apiPresetConfig;
    const target = document.querySelector("#apiSelector");

    target.innerHTML = presets
        .map(
            (api) => `
        <button class="api-option ${api.id === selectedApiId ? "active" : ""}" data-api-id="${api.id}">
          <strong>${studio.escapeHtml(api.name)}</strong>
          <p class="mb-0">${studio.escapeHtml(api.description)}</p>
        </button>
      `
        )
        .join("");

    target.querySelectorAll("[data-api-id]").forEach((button) => {
        button.addEventListener("click", () => {
            selectedApiId = button.dataset.apiId;
            renderApiSelector();
            renderApiRequestForm(selectedApiId);
        });
    });
}

function renderApiRequestForm(apiId) {
    const api = getApiPreset(apiId);
    const target = document.querySelector("#apiRequestForm");

    document.querySelector("#selectedApiTitle").textContent = api.name;

    target.innerHTML = `
    <div>
      <label class="form-label">Method</label>
      <input class="form-control" id="apiMethod" value="${studio.escapeHtml(api.method)}">
    </div>

    <div>
      <label class="form-label">Endpoint</label>
      <input class="form-control" id="apiEndpoint" value="${studio.escapeHtml(api.endpoint)}">
    </div>

    ${api.fields
            .map((field) => {
                if (field.type === "select") {
                    return `
            <div>
              <label class="form-label">${studio.escapeHtml(field.label)}</label>
              <select class="form-select" data-api-field="${studio.escapeHtml(field.name)}">
                ${field.options
                            .map(
                                (option) => `
                      <option value="${studio.escapeHtml(option)}" ${option === field.value ? "selected" : ""}>
                        ${studio.escapeHtml(option)}
                      </option>
                    `
                            )
                            .join("")}
              </select>
            </div>
          `;
                }

                return `
          <div>
            <label class="form-label">${studio.escapeHtml(field.label)}</label>
            <input class="form-control" type="${studio.escapeHtml(field.type)}" value="${studio.escapeHtml(field.value)}" data-api-field="${studio.escapeHtml(field.name)}">
          </div>
        `;
            })
            .join("")}
  `;
}

async function runSelectedApiRequest() {
    const api = getApiPreset(selectedApiId);
    let endpoint = document.querySelector("#apiEndpoint").value.trim();
    const method = document.querySelector("#apiMethod").value.trim() || "GET";
    const fieldValues = getFieldValues();

    endpoint = buildEndpoint(api.id, endpoint, fieldValues);

    const startedAt = performance.now();

    studio.showStatus("Sending request...", "info");

    try {
        const response = await fetch(endpoint, { method });
        const data = await response.json();
        const finishedAt = performance.now();

        latestApiData = data;

        renderRawJson(data);
        renderParsedCards(api.id, data);
        renderJsonTree(data);

        document.querySelector("#apiMeta").innerHTML = `
      <span class="badge-soft">Status: ${response.status}</span>
      <span class="badge-soft">Timing: ${Math.round(finishedAt - startedAt)}ms</span>
      <span class="badge-soft">Endpoint: ${studio.escapeHtml(endpoint)}</span>
    `;

        saveApiHistory({
            id: studio.generateId("api"),
            apiId: api.id,
            name: api.name,
            endpoint,
            method,
            status: response.status,
            timing: Math.round(finishedAt - startedAt),
            createdAt: new Date().toISOString()
        });

        studio.addActivityLog("API Playground", "Request executed", endpoint);
        renderApiHistory();
        studio.showStatus("Request completed.", "success");
    } catch (error) {
        latestApiData = { error: error.message };
        renderRawJson(latestApiData);
        renderParsedCards(api.id, latestApiData);
        renderJsonTree(latestApiData);
        studio.showStatus("API request failed.", "danger");
    }
}

function getApiPreset(apiId) {
    const workspace = studio.loadWorkspace();
    const presets = workspace.apiPresets.length ? workspace.apiPresets : studio.apiPresetConfig;

    return presets.find((api) => api.id === apiId) || presets[0];
}

function getFieldValues() {
    const values = {};

    document.querySelectorAll("[data-api-field]").forEach((input) => {
        values[input.dataset.apiField] = input.value.trim();
    });

    return values;
}

function buildEndpoint(apiId, endpoint, values) {
    if (apiId === "jsonplaceholder") {
        return `https://jsonplaceholder.typicode.com/${values.resource}?_limit=${values.limit || 10}`;
    }

    if (apiId === "github") {
        return `https://api.github.com/users/${encodeURIComponent(values.username || "fazal305")}`;
    }

    if (apiId === "countries") {
        return `https://restcountries.com/v3.1/name/${encodeURIComponent(values.country || "pakistan")}`;
    }

    if (apiId === "pokemon") {
        return `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent((values.pokemon || "pikachu").toLowerCase())}`;
    }

    if (apiId === "openlibrary") {
        return `https://openlibrary.org/search.json?title=${encodeURIComponent(values.title || "javascript")}`;
    }

    if (apiId === "openweather") {
        return `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(values.city || "Karachi")}&appid=${encodeURIComponent(values.apiKey || "")}`;
    }

    if (apiId === "nasa") {
        return `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(values.apiKey || "DEMO_KEY")}`;
    }

    return endpoint;
}

function renderRawJson(data) {
    document.querySelector("#rawJsonOutput").textContent = studio.formatJson(data);
}

function renderParsedCards(apiId, data) {
    const target = document.querySelector("#parsedCards");
    const items = Array.isArray(data) ? data.slice(0, 9) : Array.isArray(data.docs) ? data.docs.slice(0, 9) : [data];

    target.innerHTML = items
        .map((item) => {
            const title =
                item.name ||
                item.title ||
                item.username ||
                item.commonName ||
                item.orderId ||
                item.id ||
                "Record";

            const details = Object.entries(item || {})
                .slice(0, 5)
                .map(
                    ([key, value]) => `
            <p class="mb-1">
              <strong>${studio.escapeHtml(key)}:</strong>
              ${studio.escapeHtml(typeof value === "object" ? JSON.stringify(value).slice(0, 80) : value)}
            </p>
          `
                )
                .join("");

            return `
        <div class="parsed-card">
          <h3>${studio.escapeHtml(title)}</h3>
          ${details}
        </div>
      `;
        })
        .join("");
}

function renderJsonTree(data) {
    document.querySelector("#jsonTreeOutput").innerHTML = studio.createJsonTree(data);
}

function saveApiHistory(entry) {
    const workspace = studio.loadWorkspace();

    workspace.apiHistory.unshift(entry);
    workspace.apiHistory = workspace.apiHistory.slice(0, 25);

    studio.saveWorkspace(workspace);
}

function renderApiHistory() {
    const workspace = studio.loadWorkspace();
    const target = document.querySelector("#apiHistory");

    if (!workspace.apiHistory.length) {
        target.innerHTML = studio.renderEmptyState("No API requests yet.");
        return;
    }

    target.innerHTML = workspace.apiHistory
        .slice(0, 12)
        .map(
            (entry) => `
        <div class="parsed-card">
          <strong>${studio.escapeHtml(entry.name)}</strong>
          <p class="mb-1">${studio.escapeHtml(entry.method)} — ${studio.escapeHtml(entry.endpoint)}</p>
          <small>Status ${studio.escapeHtml(entry.status)} • ${studio.escapeHtml(entry.timing)}ms • ${studio.formatTimestamp(entry.createdAt)}</small>
        </div>
      `
        )
        .join("");
}