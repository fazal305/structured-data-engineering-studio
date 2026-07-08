const studio = window.StructuredStudio;

studio.initSharedPage("validation-playground");

let latestValidationErrors = [];

document.addEventListener("DOMContentLoaded", () => {
    loadValidationSample();
    renderValidationRules();

    document.querySelector("#addRuleBtn").addEventListener("click", addValidationRule);
    document.querySelector("#validateDataBtn").addEventListener("click", validateDataAgainstRules);
    document.querySelector("#autoFixBtn").addEventListener("click", autoFixFormatting);
    document.querySelector("#exportReportBtn").addEventListener("click", exportValidationReport);
    document.querySelector("#loadValidationSampleBtn").addEventListener("click", loadValidationSample);
});

function renderValidationRules() {
    const workspace = studio.loadWorkspace();
    const target = document.querySelector("#validationRules");

    if (!workspace.validationRules.length) {
        target.innerHTML = studio.renderEmptyState("No validation rules yet.");
        return;
    }

    target.innerHTML = workspace.validationRules
        .map(
            (rule) => `
        <div class="rule-card" data-rule-id="${rule.id}">
          <div class="rule-grid">
            <div>
              <label class="form-label">Field</label>
              <input class="form-control" value="${studio.escapeHtml(rule.field)}" data-rule-input="field">
            </div>

            <div>
              <label class="form-label">Rule Type</label>
              <select class="form-select" data-rule-input="type">
                ${studio.validationRuleTypes
                    .map(
                        (type) => `
                      <option value="${studio.escapeHtml(type)}" ${type === rule.type ? "selected" : ""}>
                        ${studio.escapeHtml(type)}
                      </option>
                    `
                    )
                    .join("")}
              </select>
            </div>

            <div>
              <label class="form-label">Value</label>
              <input class="form-control" value="${studio.escapeHtml(rule.value)}" data-rule-input="value">
            </div>

            <div>
              <label class="form-label">Message</label>
              <input class="form-control" value="${studio.escapeHtml(rule.message)}" data-rule-input="message">
            </div>
          </div>

          <button class="btn-ghost mt-2" data-delete-rule="${rule.id}">Delete Rule</button>
        </div>
      `
        )
        .join("");

    target.querySelectorAll("[data-rule-input]").forEach((input) => {
        input.addEventListener("input", persistRuleEdits);
        input.addEventListener("change", persistRuleEdits);
    });

    target.querySelectorAll("[data-delete-rule]").forEach((button) => {
        button.addEventListener("click", () => deleteValidationRule(button.dataset.deleteRule));
    });
}

function persistRuleEdits() {
    const workspace = studio.loadWorkspace();

    document.querySelectorAll("[data-rule-id]").forEach((card) => {
        const rule = workspace.validationRules.find((item) => item.id === card.dataset.ruleId);

        if (!rule) return;

        card.querySelectorAll("[data-rule-input]").forEach((input) => {
            rule[input.dataset.ruleInput] = input.value;
        });
    });

    studio.saveWorkspace(workspace);
}

function addValidationRule() {
    const workspace = studio.loadWorkspace();

    workspace.validationRules.push({
        id: studio.generateId("rule"),
        field: "name",
        type: "required",
        value: "",
        message: "This field is required."
    });

    studio.saveWorkspace(workspace);
    renderValidationRules();
    studio.showStatus("Validation rule added.", "success");
}

function deleteValidationRule(id) {
    const workspace = studio.loadWorkspace();

    workspace.validationRules = workspace.validationRules.filter((rule) => rule.id !== id);

    studio.saveWorkspace(workspace);
    renderValidationRules();
    studio.showStatus("Validation rule deleted.", "success");
}

function validateDataAgainstRules() {
    persistRuleEdits();

    const workspace = studio.loadWorkspace();
    const text = document.querySelector("#validationJsonInput").value.trim();
    const parsed = studio.parseJson(text);

    if (!parsed.ok) {
        latestValidationErrors = [
            {
                field: "JSON",
                message: parsed.error,
                rule: "parse"
            }
        ];
        renderValidationErrors(latestValidationErrors);
        return;
    }

    const rows = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const errors = [];

    rows.forEach((row, rowIndex) => {
        workspace.validationRules.forEach((rule) => {
            const value = getNestedValue(row, rule.field);
            const label = rows.length > 1 ? `Row ${rowIndex + 1}: ${rule.field}` : rule.field;

            if (!isRulePassing(value, rule)) {
                errors.push({
                    field: label,
                    rule: rule.type,
                    message: rule.message || `${rule.field} failed ${rule.type} validation.`
                });
            }
        });
    });

    latestValidationErrors = errors;
    renderValidationErrors(errors);

    studio.addActivityLog("Validation Playground", "Validation executed", `${errors.length} error(s) found.`);
}

function isRulePassing(value, rule) {
    if (rule.type === "required") {
        return value !== undefined && value !== null && value !== "";
    }

    if (rule.type === "type") {
        return studio.getValueType(value) === rule.value;
    }

    if (rule.type === "minLength") {
        return String(value ?? "").length >= Number(rule.value);
    }

    if (rule.type === "maxLength") {
        return String(value ?? "").length <= Number(rule.value);
    }

    if (rule.type === "min") {
        return Number(value) >= Number(rule.value);
    }

    if (rule.type === "max") {
        return Number(value) <= Number(rule.value);
    }

    if (rule.type === "regex") {
        try {
            return new RegExp(rule.value).test(String(value ?? ""));
        } catch (error) {
            return false;
        }
    }

    return true;
}

function renderValidationErrors(errors) {
    const target = document.querySelector("#validationErrors");

    if (!errors.length) {
        target.innerHTML = `
      <div class="error-card success-card">
        <strong>No validation errors found.</strong>
        <p class="mb-0">Your data passed all active validation rules.</p>
      </div>
    `;
        studio.showStatus("Validation passed.", "success");
        return;
    }

    target.innerHTML = errors
        .map(
            (error) => `
        <div class="error-card">
          <strong>${studio.escapeHtml(error.field)}</strong>
          <p class="mb-1">${studio.escapeHtml(error.message)}</p>
          <small>Rule: ${studio.escapeHtml(error.rule)}</small>
        </div>
      `
        )
        .join("");

    studio.showStatus(`${errors.length} validation error(s) found.`, "danger");
}

function autoFixFormatting() {
    const text = document.querySelector("#validationJsonInput").value.trim();
    const parsed = studio.parseJson(text);

    if (!parsed.ok) {
        studio.showStatus(`Cannot format invalid JSON: ${parsed.error}`, "danger");
        return;
    }

    document.querySelector("#validationJsonInput").value = studio.formatJson(parsed.data);
    studio.showStatus("JSON formatting fixed.", "success");
}

function exportValidationReport() {
    const report = {
        generatedAt: new Date().toISOString(),
        errorCount: latestValidationErrors.length,
        errors: latestValidationErrors
    };

    studio.downloadJson("validation-report.json", report);
}

function loadValidationSample() {
    const sample = {
        name: "Fazal Abbas",
        email: "fazal@example.com",
        age: 24,
        role: "Frontend Developer"
    };

    document.querySelector("#validationJsonInput").value = studio.formatJson(sample);

    const workspace = studio.loadWorkspace();

    if (!workspace.validationRules.length) {
        workspace.validationRules = [
            {
                id: studio.generateId("rule"),
                field: "name",
                type: "required",
                value: "",
                message: "Name is required."
            },
            {
                id: studio.generateId("rule"),
                field: "email",
                type: "regex",
                value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                message: "Email must be valid."
            },
            {
                id: studio.generateId("rule"),
                field: "age",
                type: "min",
                value: "18",
                message: "Age must be at least 18."
            }
        ];

        studio.saveWorkspace(workspace);
    }

    renderValidationRules();
    validateDataAgainstRules();
}

function getNestedValue(item, path) {
    return String(path)
        .split(".")
        .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), item);
}