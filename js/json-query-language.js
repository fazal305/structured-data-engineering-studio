const studio = window.StructuredStudio;

studio.initSharedPage("json-query-language");

document.addEventListener("DOMContentLoaded", () => {
    loadQuerySample();
    renderSavedQueries();

    document.querySelector("#runJsonQueryBtn").addEventListener("click", runJsonQuery);
    document.querySelector("#saveJsonQueryBtn").addEventListener("click", saveQuery);
    document.querySelector("#loadQuerySampleBtn").addEventListener("click", loadQuerySample);
});

function runJsonQuery() {
    const datasetText = document.querySelector("#queryDatasetInput").value.trim();
    const query = document.querySelector("#jsonQueryInput").value.trim();

    const parsedDataset = studio.parseJson(datasetText);

    if (!parsedDataset.ok) {
        studio.showStatus(`Dataset JSON error: ${parsedDataset.error}`, "danger");
        return;
    }

    try {
        const tokens = tokenizeJsonQuery(query);
        const ast = parseJsonQuery(tokens);
        const rows = executeJsonQuery(parsedDataset.data, ast);

        renderTokens(tokens);
        renderQueryResults(rows);

        studio.addActivityLog("JSON Query Language", "Query executed", query);
        studio.showStatus(`${rows.length} matching rows found.`, "success");
    } catch (error) {
        studio.showStatus(error.message, "danger");
    }
}

function tokenizeJsonQuery(query) {
    if (!query) {
        throw new Error("Query cannot be empty.");
    }

    const pattern = /(>=|<=|==|!=|>|<|\bAND\b|\bOR\b|\bcontains\b|\(|\)|"[^"]*"|'[^']*'|[^\s()]+)/gi;
    const tokens = query.match(pattern) || [];

    return tokens.map((token) => {
        const upper = token.toUpperCase();

        if (["AND", "OR"].includes(upper)) {
            return {
                type: "logical",
                value: upper
            };
        }

        if (token.toLowerCase() === "contains") {
            return {
                type: "operator",
                value: "contains"
            };
        }

        if ([">=", "<=", "==", "!=", ">", "<"].includes(token)) {
            return {
                type: "operator",
                value: token
            };
        }

        if (token === "(" || token === ")") {
            return {
                type: "paren",
                value: token
            };
        }

        return {
            type: "value",
            value: token.replace(/^["']|["']$/g, "")
        };
    });
}

function parseJsonQuery(tokens) {
    const conditions = [];
    const logicals = [];
    let index = 0;

    while (index < tokens.length) {
        const field = tokens[index];
        const operator = tokens[index + 1];
        const value = tokens[index + 2];

        if (!field || !operator || !value) {
            throw new Error("Parse error: expected field operator value.");
        }

        if (field.type !== "value" || operator.type !== "operator") {
            throw new Error("Parse error: invalid condition format.");
        }

        conditions.push({
            field: field.value,
            operator: operator.value,
            value: value.value
        });

        index += 3;

        if (tokens[index]) {
            if (tokens[index].type !== "logical") {
                throw new Error("Parse error: expected AND or OR.");
            }

            logicals.push(tokens[index].value);
            index += 1;
        }
    }

    return {
        type: "query",
        conditions,
        logicals
    };
}

function executeJsonQuery(data, ast) {
    const rows = Array.isArray(data)
        ? data
        : data && typeof data === "object"
            ? Object.values(data).find((value) => Array.isArray(value)) || [data]
            : [];

    return rows.filter((item) => {
        const results = ast.conditions.map((condition) => evaluateCondition(item, condition));

        return results.reduce((finalResult, currentResult, index) => {
            const logical = ast.logicals[index - 1] || "AND";

            if (logical === "OR") {
                return finalResult || currentResult;
            }

            return finalResult && currentResult;
        });
    });
}

function evaluateCondition(item, condition) {
    const actual = getNestedValue(item, condition.field);
    const expectedRaw = condition.value;
    const expectedNumber = Number(expectedRaw);
    const actualNumber = Number(actual);
    const numericCompare = !Number.isNaN(expectedNumber) && !Number.isNaN(actualNumber);

    if (condition.operator === "contains") {
        return String(actual ?? "").toLowerCase().includes(String(expectedRaw).toLowerCase());
    }

    if (condition.operator === "==") {
        return numericCompare ? actualNumber === expectedNumber : String(actual) === String(expectedRaw);
    }

    if (condition.operator === "!=") {
        return numericCompare ? actualNumber !== expectedNumber : String(actual) !== String(expectedRaw);
    }

    if (condition.operator === ">") {
        return numericCompare ? actualNumber > expectedNumber : String(actual) > String(expectedRaw);
    }

    if (condition.operator === "<") {
        return numericCompare ? actualNumber < expectedNumber : String(actual) < String(expectedRaw);
    }

    if (condition.operator === ">=") {
        return numericCompare ? actualNumber >= expectedNumber : String(actual) >= String(expectedRaw);
    }

    if (condition.operator === "<=") {
        return numericCompare ? actualNumber <= expectedNumber : String(actual) <= String(expectedRaw);
    }

    return false;
}

function getNestedValue(item, path) {
    return String(path)
        .split(".")
        .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), item);
}

function renderTokens(tokens) {
    document.querySelector("#tokenOutput").innerHTML = tokens
        .map((token) => `<span class="token-pill">${studio.escapeHtml(token.type)}: ${studio.escapeHtml(token.value)}</span>`)
        .join("");
}

function renderQueryResults(rows) {
    const target = document.querySelector("#queryResults");

    if (!rows.length) {
        target.innerHTML = studio.renderEmptyState("No matching rows found.");
        return;
    }

    const fields = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((key) => set.add(key));
            return set;
        }, new Set())
    );

    target.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>${fields.map((field) => `<th>${studio.escapeHtml(field)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
            .map(
                (row) => `
              <tr>
                ${fields
                        .map((field) => `<td>${studio.escapeHtml(typeof row[field] === "object" ? JSON.stringify(row[field]) : row[field] ?? "")}</td>`)
                        .join("")}
              </tr>
            `
            )
            .join("")}
      </tbody>
    </table>
  `;
}

function saveQuery() {
    const query = document.querySelector("#jsonQueryInput").value.trim();

    if (!query) {
        studio.showStatus("Write a query before saving.", "warning");
        return;
    }

    const workspace = studio.loadWorkspace();

    workspace.savedQueries.unshift({
        id: studio.generateId("query"),
        name: `Query ${workspace.savedQueries.length + 1}`,
        query,
        createdAt: new Date().toISOString()
    });

    studio.saveWorkspace(workspace);
    renderSavedQueries();

    studio.showStatus("Query saved.", "success");
}

function renderSavedQueries() {
    const workspace = studio.loadWorkspace();
    const target = document.querySelector("#savedQueries");

    if (!workspace.savedQueries.length) {
        target.innerHTML = studio.renderEmptyState("No saved queries yet.");
        return;
    }

    target.innerHTML = workspace.savedQueries
        .slice(0, 8)
        .map(
            (item) => `
        <div class="saved-query" data-query="${studio.escapeHtml(item.query)}">
          <strong>${studio.escapeHtml(item.name)}</strong>
          <p class="mb-1">${studio.escapeHtml(item.query)}</p>
          <small>${studio.formatTimestamp(item.createdAt)}</small>
        </div>
      `
        )
        .join("");

    target.querySelectorAll(".saved-query").forEach((card) => {
        card.addEventListener("click", () => {
            document.querySelector("#jsonQueryInput").value = card.dataset.query;
            studio.showStatus("Saved query loaded.", "success");
        });
    });
}

function loadQuerySample() {
    const sampleRows = [
        {
            name: "Ali",
            age: 24,
            city: "Karachi",
            role: "Frontend Developer"
        },
        {
            name: "Sana",
            age: 19,
            city: "Lahore",
            role: "UI Designer"
        },
        {
            name: "Hamza",
            age: 28,
            city: "Karachi",
            role: "API Developer"
        },
        {
            name: "Ayesha",
            age: 31,
            city: "Islamabad",
            role: "Data Engineer"
        }
    ];

    document.querySelector("#queryDatasetInput").value = studio.formatJson(sampleRows);
    document.querySelector("#jsonQueryInput").value = "age > 20 AND city == Karachi";

    runJsonQuery();
}