const studio = window.StructuredStudio;

studio.initSharedPage("json-analytics");

let currentRows = [];
let filteredRows = [];
let currentFields = [];
let monthlyChart = null;
let categoryChart = null;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#parseDatasetBtn").addEventListener("click", parseDataset);
    document.querySelector("#exportCsvBtn").addEventListener("click", exportFilteredCsv);
    document.querySelector("#loadDemoDatasetBtn").addEventListener("click", loadDemoDataset);
    document.querySelector("#tableSearch").addEventListener("input", applyAnalyticsFilters);

    document.querySelector("#jsonFileInput").addEventListener("change", async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const text = await file.text();
        document.querySelector("#jsonInput").value = text;
        parseDataset();
    });

    loadDemoDataset();
});

function parseDataset() {
    const text = document.querySelector("#jsonInput").value.trim();
    const parsed = studio.parseJson(text);

    if (!parsed.ok) {
        studio.showStatus(`JSON parse error: ${parsed.error}`, "danger");
        return;
    }

    currentRows = normalizeDataset(parsed.data);
    filteredRows = [...currentRows];
    currentFields = inferFields(currentRows);

    if (!currentRows.length) {
        studio.showStatus("No rows detected in this JSON.", "warning");
        return;
    }

    renderFilters(currentFields);
    calculateStatistics(filteredRows);
    renderDataTable(filteredRows);
    renderCharts(filteredRows);

    const workspace = studio.loadWorkspace();
    workspace.datasets.unshift({
        id: studio.generateId("dataset"),
        name: `Dataset ${workspace.datasets.length + 1}`,
        createdAt: new Date().toISOString(),
        rows: currentRows
    });
    workspace.datasets = workspace.datasets.slice(0, 10);
    studio.saveWorkspace(workspace);

    studio.addActivityLog("JSON Analytics", "Dataset parsed", `${currentRows.length} rows detected.`);
    studio.showStatus("Dataset parsed successfully.", "success");
}

function normalizeDataset(data) {
    if (Array.isArray(data)) {
        return data.map((item) => normalizeRow(item));
    }

    if (data && typeof data === "object") {
        const arrayEntry = Object.values(data).find((value) => Array.isArray(value));

        if (arrayEntry) {
            return arrayEntry.map((item) => normalizeRow(item));
        }

        return [normalizeRow(data)];
    }

    return [];
}

function normalizeRow(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        return {
            value: item
        };
    }

    const row = {};

    Object.entries(item).forEach(([key, value]) => {
        row[key] = value && typeof value === "object" ? JSON.stringify(value) : value;
    });

    return row;
}

function inferFields(rows) {
    return Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((key) => set.add(key));
            return set;
        }, new Set())
    );
}

function renderDataTable(rows) {
    const target = document.querySelector("#dataTablePanel");

    if (!rows.length) {
        target.innerHTML = studio.renderEmptyState("No rows match your current filters.");
        return;
    }

    const fields = inferFields(rows);

    target.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          ${fields.map((field) => `<th>${studio.escapeHtml(field)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows
            .map(
                (row) => `
              <tr>
                ${fields
                        .map((field) => `<td>${studio.escapeHtml(row[field] ?? "")}</td>`)
                        .join("")}
              </tr>
            `
            )
            .join("")}
      </tbody>
    </table>
  `;
}

function renderFilters(fields) {
    const target = document.querySelector("#filtersPanel");

    const numericFields = fields.filter((field) =>
        currentRows.some((row) => typeof row[field] === "number")
    );

    const groupableFields = fields.filter((field) =>
        currentRows.some((row) => typeof row[field] === "string")
    );

    target.innerHTML = `
    <label class="form-label">Search All Fields</label>
    <input id="filterSearch" class="form-control" placeholder="Search dataset...">

    <div class="filter-row">
      <div>
        <label class="form-label">Group By</label>
        <select id="groupField" class="form-select">
          <option value="">No grouping</option>
          ${groupableFields
            .map((field) => `<option value="${studio.escapeHtml(field)}">${studio.escapeHtml(field)}</option>`)
            .join("")}
        </select>
      </div>

      <div>
        <label class="form-label">Numeric Field</label>
        <select id="numericField" class="form-select">
          <option value="">Auto detect</option>
          ${numericFields
            .map((field) => `<option value="${studio.escapeHtml(field)}">${studio.escapeHtml(field)}</option>`)
            .join("")}
        </select>
      </div>

      <button class="btn-app" id="applyFiltersBtn">Apply</button>
    </div>
  `;

    document.querySelector("#filterSearch").addEventListener("input", applyAnalyticsFilters);
    document.querySelector("#groupField").addEventListener("change", applyAnalyticsFilters);
    document.querySelector("#numericField").addEventListener("change", applyAnalyticsFilters);
    document.querySelector("#applyFiltersBtn").addEventListener("click", applyAnalyticsFilters);
}

function applyAnalyticsFilters() {
    const filterSearch = document.querySelector("#filterSearch")?.value.toLowerCase() || "";
    const tableSearch = document.querySelector("#tableSearch")?.value.toLowerCase() || "";
    const search = `${filterSearch} ${tableSearch}`.trim();

    filteredRows = currentRows.filter((row) =>
        Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search))
    );

    calculateStatistics(filteredRows);
    renderDataTable(filteredRows);
    renderCharts(filteredRows);
}

function groupByField(rows, field) {
    return rows.reduce((groups, row) => {
        const key = row[field] || "Unknown";

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(row);
        return groups;
    }, {});
}

function calculateStatistics(rows) {
    const numericField =
        document.querySelector("#numericField")?.value ||
        currentFields.find((field) => rows.some((row) => typeof row[field] === "number")) ||
        "";

    const values = rows
        .map((row) => Number(row[numericField]))
        .filter((value) => !Number.isNaN(value));

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = values.length ? total / values.length : 0;
    const max = values.length ? Math.max(...values) : 0;

    document.querySelector("#summaryPanel").innerHTML = [
        { label: "Rows", value: rows.length },
        { label: "Total", value: total.toLocaleString() },
        { label: "Average", value: average.toFixed(2) },
        { label: "Max", value: max.toLocaleString() }
    ]
        .map(
            (item) => `
        <div class="metric-card">
          <div class="metric-value">${studio.escapeHtml(item.value)}</div>
          <div class="metric-label">${studio.escapeHtml(item.label)}</div>
        </div>
      `
        )
        .join("");
}

function renderCharts(rows) {
    const monthField =
        currentFields.find((field) => field.toLowerCase().includes("month")) ||
        currentFields.find((field) => field.toLowerCase().includes("date"));

    const revenueField =
        document.querySelector("#numericField")?.value ||
        currentFields.find((field) => ["revenue", "sales", "amount", "price", "total"].includes(field.toLowerCase())) ||
        currentFields.find((field) => rows.some((row) => typeof row[field] === "number"));

    const groupField =
        document.querySelector("#groupField")?.value ||
        currentFields.find((field) => ["category", "product", "city"].includes(field.toLowerCase()));

    const monthlyGroups = groupByField(rows, monthField || "month");
    const categoryGroups = groupByField(rows, groupField || currentFields[0]);

    const monthlyLabels = Object.keys(monthlyGroups);
    const monthlyValues = monthlyLabels.map((label) =>
        monthlyGroups[label].reduce((sum, row) => sum + Number(row[revenueField] || 0), 0)
    );

    const categoryLabels = Object.keys(categoryGroups);
    const categoryValues = categoryLabels.map((label) => categoryGroups[label].length);

    if (monthlyChart) monthlyChart.destroy();
    if (categoryChart) categoryChart.destroy();

    monthlyChart = new Chart(document.querySelector("#monthlyChart"), {
        type: "bar",
        data: {
            labels: monthlyLabels,
            datasets: [
                {
                    label: "Revenue",
                    data: monthlyValues
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text")
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--muted")
                    }
                },
                y: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--muted")
                    }
                }
            }
        }
    });

    categoryChart = new Chart(document.querySelector("#categoryChart"), {
        type: "pie",
        data: {
            labels: categoryLabels,
            datasets: [
                {
                    label: "Rows",
                    data: categoryValues
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text")
                    }
                }
            }
        }
    });
}

function exportFilteredCsv() {
    if (!filteredRows.length) {
        studio.showStatus("No filtered rows to export.", "warning");
        return;
    }

    const csv = studio.jsonToCsv(filteredRows);
    studio.downloadTextFile("filtered-json-analytics.csv", csv);
    studio.showStatus("Filtered CSV exported.", "success");
}

function loadDemoDataset() {
    const workspace = studio.loadWorkspace();
    const demo = workspace.datasets[0]?.rows || [];

    document.querySelector("#jsonInput").value = studio.formatJson(demo);
    parseDataset();
}