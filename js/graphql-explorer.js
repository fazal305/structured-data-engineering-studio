const studio = window.StructuredStudio;

studio.initSharedPage("graphql-explorer");

let latestGraphqlResponse = null;

document.addEventListener("DOMContentLoaded", () => {
    renderGraphqlHistory();

    document.querySelector("#runGraphqlBtn").addEventListener("click", runGraphqlQuery);
    document.querySelector("#loadSampleBtn").addEventListener("click", loadGraphqlSample);
    document.querySelector("#copyResponseBtn").addEventListener("click", () => {
        studio.copyText(studio.formatJson(latestGraphqlResponse || {}), "GraphQL response copied.");
    });

    document.querySelector("#clearHistoryBtn").addEventListener("click", () => {
        const workspace = studio.loadWorkspace();
        workspace.graphqlHistory = [];
        studio.saveWorkspace(workspace);
        renderGraphqlHistory();
        studio.showStatus("GraphQL history cleared.", "success");
    });
});

async function runGraphqlQuery() {
    const endpoint = document.querySelector("#graphqlEndpoint").value.trim();
    const query = document.querySelector("#graphqlQuery").value.trim();
    const variablesText = document.querySelector("#graphqlVariables").value.trim();

    if (!endpoint || !query) {
        studio.showStatus("Endpoint and query are required.", "warning");
        return;
    }

    const variablesResult = validateVariablesJson();

    if (!variablesResult.ok) {
        studio.showStatus(variablesResult.error, "danger");
        return;
    }

    const startedAt = performance.now();

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: buildGraphqlHeaders(),
            body: JSON.stringify({
                query,
                variables: variablesResult.data
            })
        });

        const data = await response.json();
        const finishedAt = performance.now();

        latestGraphqlResponse = data;

        renderGraphqlResponse(data, {
            status: response.status,
            timing: Math.round(finishedAt - startedAt),
            endpoint
        });

        saveGraphqlHistory({
            id: studio.generateId("gql"),
            endpoint,
            query,
            variables: variablesText || "{}",
            headers: document.querySelector("#graphqlHeaders").value.trim() || "{}",
            status: response.status,
            timing: Math.round(finishedAt - startedAt),
            createdAt: new Date().toISOString(),
            favorite: false
        });

        studio.addActivityLog("GraphQL Explorer", "Query executed", endpoint);
        renderGraphqlHistory();
    } catch (error) {
        latestGraphqlResponse = {
            error: error.message
        };

        renderGraphqlResponse(latestGraphqlResponse, {
            status: "Network error",
            timing: "-",
            endpoint
        });

        studio.showStatus("GraphQL request failed.", "danger");
    }
}

function buildGraphqlHeaders() {
    const headersText = document.querySelector("#graphqlHeaders").value.trim();
    const parsed = studio.parseJson(headersText || "{}");

    const headers = {
        "Content-Type": "application/json"
    };

    if (parsed.ok && parsed.data && typeof parsed.data === "object") {
        Object.entries(parsed.data).forEach(([key, value]) => {
            headers[key] = value;
        });
    }

    return headers;
}

function validateVariablesJson() {
    const variablesText = document.querySelector("#graphqlVariables").value.trim();
    const parsed = studio.parseJson(variablesText || "{}");

    if (!parsed.ok) {
        return {
            ok: false,
            error: `Variables JSON error: ${parsed.error}`
        };
    }

    return parsed;
}

function renderGraphqlResponse(data, meta = {}) {
    document.querySelector("#graphqlResponse").textContent = studio.formatJson(data);

    document.querySelector("#responseMeta").innerHTML = `
    <span class="badge-soft">Status: ${studio.escapeHtml(meta.status)}</span>
    <span class="badge-soft">Timing: ${studio.escapeHtml(meta.timing)}ms</span>
    <span class="badge-soft">Endpoint: ${studio.escapeHtml(meta.endpoint || "-")}</span>
  `;
}

function saveGraphqlHistory(entry) {
    const workspace = studio.loadWorkspace();

    workspace.graphqlHistory.unshift(entry);
    workspace.graphqlHistory = workspace.graphqlHistory.slice(0, 20);

    studio.saveWorkspace(workspace);
}

function renderGraphqlHistory() {
    const workspace = studio.loadWorkspace();
    const target = document.querySelector("#graphqlHistory");

    if (!workspace.graphqlHistory.length) {
        target.innerHTML = studio.renderEmptyState("No GraphQL queries saved yet.");
        return;
    }

    target.innerHTML = workspace.graphqlHistory
        .map(
            (entry) => `
        <div class="history-item" data-history-id="${entry.id}">
          <strong>${studio.escapeHtml(entry.endpoint)}</strong>
          <p class="mb-1">${studio.escapeHtml(entry.query.slice(0, 110))}${entry.query.length > 110 ? "..." : ""}</p>
          <small>${studio.formatTimestamp(entry.createdAt)}</small>
        </div>
      `
        )
        .join("");

    target.querySelectorAll("[data-history-id]").forEach((item) => {
        item.addEventListener("click", () => {
            const selected = workspace.graphqlHistory.find(
                (entry) => entry.id === item.dataset.historyId
            );

            if (!selected) return;

            document.querySelector("#graphqlEndpoint").value = selected.endpoint;
            document.querySelector("#graphqlQuery").value = selected.query;
            document.querySelector("#graphqlVariables").value = selected.variables || "{}";
            document.querySelector("#graphqlHeaders").value = selected.headers || "{}";

            studio.showStatus("GraphQL history item loaded.", "success");
        });
    });
}

function loadGraphqlSample() {
    document.querySelector("#graphqlEndpoint").value = "https://countries.trevorblades.com/";
    document.querySelector("#graphqlQuery").value = `query CountriesDemo {
  countries {
    code
    name
    emoji
    capital
    continent {
      name
    }
  }
}`;
    document.querySelector("#graphqlVariables").value = "{}";
    document.querySelector("#graphqlHeaders").value = "{}";

    studio.showStatus("Sample GraphQL query loaded.", "success");
}