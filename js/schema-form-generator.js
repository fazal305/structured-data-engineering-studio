const studio = window.StructuredStudio;

studio.initSharedPage("schema-form-generator");

let activeSchema = null;

document.addEventListener("DOMContentLoaded", () => {
    loadSampleSchema();

    document.querySelector("#loadSampleSchemaBtn").addEventListener("click", loadSampleSchema);
    document.querySelector("#generateFormBtn").addEventListener("click", parseJsonSchema);

    document.querySelector("#copyFormDataBtn").addEventListener("click", () => {
        studio.copyText(document.querySelector("#formDataPreview").textContent, "Form data copied.");
    });

    document.querySelector("#downloadFormDataBtn").addEventListener("click", () => {
        studio.downloadTextFile("generated-form-data.json", document.querySelector("#formDataPreview").textContent);
    });
});

function parseJsonSchema() {
    const text = document.querySelector("#schemaInput").value.trim();
    const parsed = studio.parseJson(text);

    if (!parsed.ok) {
        studio.showStatus(`Schema JSON error: ${parsed.error}`, "danger");
        return;
    }

    activeSchema = parsed.data;
    generateFormFromSchema(activeSchema);
    studio.addActivityLog("Schema Form Generator", "Form generated", activeSchema.title || "Untitled schema");
}

function generateFormFromSchema(schema) {
    const target = document.querySelector("#generatedForm");
    const properties = schema.properties || {};
    const required = schema.required || [];

    if (!Object.keys(properties).length) {
        target.innerHTML = studio.renderEmptyState("This schema has no properties.");
        return;
    }

    target.innerHTML = Object.entries(properties)
        .map(([name, schemaField]) => createFormField(name, schemaField, required.includes(name)))
        .join("");

    target.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="btn-app" id="validateGeneratedFormBtn">Validate Form</button>`
    );

    target.querySelectorAll("[data-schema-field]").forEach((input) => {
        input.addEventListener("input", renderFormDataPreview);
        input.addEventListener("change", renderFormDataPreview);
    });

    document.querySelector("#validateGeneratedFormBtn").addEventListener("click", validateGeneratedForm);

    renderFormDataPreview();
    studio.showStatus("Form generated from schema.", "success");
}

function createFormField(name, schemaField, required) {
    const type = schemaField.type || "string";
    const label = schemaField.title || name;
    const description = schemaField.description || "";
    const inputType =
        type === "number" || type === "integer"
            ? "number"
            : type === "boolean"
                ? "checkbox"
                : type === "string" && schemaField.format === "email"
                    ? "email"
                    : "text";

    if (schemaField.enum) {
        return `
      <div class="generated-field">
        <label class="form-label">
          ${studio.escapeHtml(label)}
          ${required ? `<span class="required-mark">*</span>` : ""}
        </label>
        <select class="form-select" data-schema-field="${studio.escapeHtml(name)}" data-schema-type="${studio.escapeHtml(type)}" ${required ? "required" : ""}>
          <option value="">Select...</option>
          ${schemaField.enum
                .map((item) => `<option value="${studio.escapeHtml(item)}">${studio.escapeHtml(item)}</option>`)
                .join("")}
        </select>
        <small class="text-secondary">${studio.escapeHtml(description)}</small>
        <div class="validation-note" data-error-for="${studio.escapeHtml(name)}"></div>
      </div>
    `;
    }

    if (type === "boolean") {
        return `
      <div class="generated-field">
        <label class="form-check-label">
          <input class="form-check-input me-2" type="checkbox" data-schema-field="${studio.escapeHtml(name)}" data-schema-type="${studio.escapeHtml(type)}">
          ${studio.escapeHtml(label)}
          ${required ? `<span class="required-mark">*</span>` : ""}
        </label>
        <div><small class="text-secondary">${studio.escapeHtml(description)}</small></div>
        <div class="validation-note" data-error-for="${studio.escapeHtml(name)}"></div>
      </div>
    `;
    }

    return `
    <div class="generated-field">
      <label class="form-label">
        ${studio.escapeHtml(label)}
        ${required ? `<span class="required-mark">*</span>` : ""}
      </label>
      <input
        class="form-control"
        type="${inputType}"
        data-schema-field="${studio.escapeHtml(name)}"
        data-schema-type="${studio.escapeHtml(type)}"
        placeholder="${studio.escapeHtml(description)}"
        ${required ? "required" : ""}
      >
      <small class="text-secondary">${studio.escapeHtml(description)}</small>
      <div class="validation-note" data-error-for="${studio.escapeHtml(name)}"></div>
    </div>
  `;
}

function validateGeneratedForm() {
    if (!activeSchema) {
        studio.showStatus("Generate a form first.", "warning");
        return;
    }

    const required = activeSchema.required || [];
    let valid = true;

    document.querySelectorAll("[data-error-for]").forEach((error) => {
        error.textContent = "";
    });

    document.querySelectorAll("[data-schema-field]").forEach((input) => {
        const name = input.dataset.schemaField;
        const type = input.dataset.schemaType;
        const errorTarget = document.querySelector(`[data-error-for="${name}"]`);
        const value = input.type === "checkbox" ? input.checked : input.value.trim();

        if (required.includes(name) && !value) {
            valid = false;
            errorTarget.textContent = `${name} is required.`;
            return;
        }

        if (type === "number" || type === "integer") {
            if (value !== "" && Number.isNaN(Number(value))) {
                valid = false;
                errorTarget.textContent = `${name} must be a number.`;
            }
        }
    });

    studio.showStatus(valid ? "Form validation passed." : "Please fix validation errors.", valid ? "success" : "danger");
    renderFormDataPreview();
}

function renderFormDataPreview() {
    const data = {};

    document.querySelectorAll("[data-schema-field]").forEach((input) => {
        const name = input.dataset.schemaField;
        const type = input.dataset.schemaType;

        if (input.type === "checkbox") {
            data[name] = input.checked;
        } else if (type === "number" || type === "integer") {
            data[name] = input.value === "" ? null : Number(input.value);
        } else {
            data[name] = input.value;
        }
    });

    document.querySelector("#formDataPreview").textContent = studio.formatJson(data);
}

function loadSampleSchema() {
    const sample = {
        title: "Developer Profile",
        type: "object",
        required: ["fullName", "email", "role"],
        properties: {
            fullName: {
                type: "string",
                title: "Full Name",
                description: "Enter your full name"
            },
            email: {
                type: "string",
                format: "email",
                title: "Email Address",
                description: "Enter a valid email"
            },
            role: {
                type: "string",
                title: "Role",
                enum: ["Frontend Developer", "Full Stack Developer", "Data Engineer", "API Developer"]
            },
            experience: {
                type: "number",
                title: "Experience Years",
                description: "Years of experience"
            },
            portfolioReady: {
                type: "boolean",
                title: "Portfolio Ready"
            }
        }
    };

    document.querySelector("#schemaInput").value = studio.formatJson(sample);
    parseJsonSchema();
}