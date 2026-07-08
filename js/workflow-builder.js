const studio = window.StructuredStudio;

studio.initSharedPage("workflow-builder");

let activeWorkflow = {
    id: studio.generateId("workflow"),
    name: "Untitled Workflow",
    nodes: [],
    connections: []
};

let dragState = null;

document.addEventListener("DOMContentLoaded", () => {
    renderNodePalette();
    loadSampleWorkflow();
    renderWorkflowCanvas();

    document.querySelector("#executeWorkflowBtn").addEventListener("click", executeWorkflow);
    document.querySelector("#saveWorkflowBtn").addEventListener("click", saveWorkflow);
    document.querySelector("#exportWorkflowBtn").addEventListener("click", exportWorkflow);
    document.querySelector("#loadSampleWorkflowBtn").addEventListener("click", loadSampleWorkflow);
});

function renderNodePalette() {
    const target = document.querySelector("#nodePalette");

    target.innerHTML = studio.workflowNodeConfig
        .map(
            (node) => `
        <button class="node-button" data-node-type="${node.type}">
          <strong>${node.icon} ${studio.escapeHtml(node.label)}</strong>
          <p class="mb-0">${studio.escapeHtml(node.description)}</p>
        </button>
      `
        )
        .join("");

    target.querySelectorAll("[data-node-type]").forEach((button) => {
        button.addEventListener("click", () => {
            createWorkflowNode(button.dataset.nodeType);
        });
    });
}

function renderWorkflowCanvas() {
    const canvas = document.querySelector("#workflowCanvas");

    canvas.innerHTML = activeWorkflow.nodes
        .map(
            (node) => `
        <div class="workflow-node" data-node-id="${node.id}" style="left:${node.x}px; top:${node.y}px;">
          <div class="node-title">${studio.escapeHtml(node.label)}</div>
          <small>${studio.escapeHtml(node.type)}</small>

          <div class="mt-2">
            ${renderNodeConfig(node)}
          </div>

          <pre class="node-output mt-2" id="output-${node.id}">${studio.escapeHtml(studio.formatJson(node.output || {}))}</pre>
        </div>
      `
        )
        .join("");

    canvas.querySelectorAll(".workflow-node").forEach((nodeEl) => {
        nodeEl.addEventListener("mousedown", startDragNode);
    });

    canvas.addEventListener("mousemove", dragNode);
    canvas.addEventListener("mouseup", stopDragNode);
    canvas.addEventListener("mouseleave", stopDragNode);

    canvas.querySelectorAll("[data-node-config]").forEach((input) => {
        input.addEventListener("input", () => {
            const node = activeWorkflow.nodes.find((item) => item.id === input.dataset.nodeId);

            if (!node) return;

            node.config[input.dataset.nodeConfig] = input.value;
        });
    });
}

function renderNodeConfig(node) {
    if (node.type === "get") {
        return `
      <input class="form-control form-control-sm" data-node-id="${node.id}" data-node-config="url" value="${studio.escapeHtml(node.config.url || "")}" placeholder="GET URL">
    `;
    }

    if (node.type === "filter") {
        return `
      <input class="form-control form-control-sm mb-1" data-node-id="${node.id}" data-node-config="field" value="${studio.escapeHtml(node.config.field || "city")}" placeholder="Field">
      <input class="form-control form-control-sm" data-node-id="${node.id}" data-node-config="value" value="${studio.escapeHtml(node.config.value || "Karachi")}" placeholder="Value">
    `;
    }

    if (node.type === "sort") {
        return `
      <input class="form-control form-control-sm" data-node-id="${node.id}" data-node-config="field" value="${studio.escapeHtml(node.config.field || "name")}" placeholder="Sort field">
    `;
    }

    if (node.type === "limit") {
        return `
      <input class="form-control form-control-sm" data-node-id="${node.id}" data-node-config="count" value="${studio.escapeHtml(node.config.count || 5)}" placeholder="Count">
    `;
    }

    if (node.type === "transform" || node.type === "map") {
        return `
      <input class="form-control form-control-sm" data-node-id="${node.id}" data-node-config="fields" value="${studio.escapeHtml(node.config.fields || "name,email,city")}" placeholder="Fields comma separated">
    `;
    }

    return `<small class="text-secondary">No config required.</small>`;
}

function createWorkflowNode(type) {
    const definition = studio.workflowNodeConfig.find((item) => item.type === type);

    const node = {
        id: studio.generateId("node"),
        type,
        label: definition?.label || type,
        x: 80 + activeWorkflow.nodes.length * 30,
        y: 80 + activeWorkflow.nodes.length * 60,
        config: getDefaultNodeConfig(type),
        output: {}
    };

    activeWorkflow.nodes.push(node);
    renderWorkflowCanvas();

    studio.showStatus(`${node.label} node added.`, "success");
}

function getDefaultNodeConfig(type) {
    const configs = {
        get: {
            url: "https://jsonplaceholder.typicode.com/users"
        },
        filter: {
            field: "city",
            value: "Karachi"
        },
        transform: {
            fields: "name,email,company"
        },
        sort: {
            field: "name"
        },
        map: {
            fields: "name,email"
        },
        limit: {
            count: 5
        },
        display: {},
        export: {}
    };

    return configs[type] || {};
}

function moveWorkflowNode(id, x, y) {
    const node = activeWorkflow.nodes.find((item) => item.id === id);

    if (!node) return;

    node.x = x;
    node.y = y;
}

function connectWorkflowNodes(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) {
        return;
    }

    activeWorkflow.connections.push({
        id: studio.generateId("connection"),
        sourceId,
        targetId
    });
}

async function executeWorkflow() {
    let data = null;

    for (const node of activeWorkflow.nodes) {
        data = await executeWorkflowNode(node, data);
        node.output = data;

        const outputTarget = document.querySelector(`#output-${node.id}`);
        if (outputTarget) {
            outputTarget.textContent = studio.formatJson(data);
        }
    }

    renderWorkflowOutput(data);
    studio.addActivityLog("Workflow Builder", "Workflow executed", `${activeWorkflow.nodes.length} nodes executed.`);
}

async function executeWorkflowNode(node, inputData) {
    if (node.type === "get") {
        const response = await fetch(node.config.url);
        return response.json();
    }

    const rows = Array.isArray(inputData) ? inputData : inputData ? [inputData] : [];

    if (node.type === "filter") {
        return rows.filter((row) =>
            String(row[node.config.field] ?? "")
                .toLowerCase()
                .includes(String(node.config.value ?? "").toLowerCase())
        );
    }

    if (node.type === "transform" || node.type === "map") {
        const fields = String(node.config.fields || "")
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean);

        return rows.map((row) =>
            fields.reduce((output, field) => {
                output[field] = row[field];
                return output;
            }, {})
        );
    }

    if (node.type === "sort") {
        return [...rows].sort((a, b) =>
            String(a[node.config.field] ?? "").localeCompare(String(b[node.config.field] ?? ""))
        );
    }

    if (node.type === "limit") {
        return rows.slice(0, Number(node.config.count) || 5);
    }

    if (node.type === "display" || node.type === "export") {
        return inputData;
    }

    return inputData;
}

function renderWorkflowOutput(result) {
    document.querySelector("#workflowOutput").textContent = studio.formatJson(result || {});
    studio.showStatus("Workflow executed successfully.", "success");
}

function saveWorkflow() {
    const workspace = studio.loadWorkspace();
    const existingIndex = workspace.workflows.findIndex((workflow) => workflow.id === activeWorkflow.id);

    if (existingIndex >= 0) {
        workspace.workflows[existingIndex] = activeWorkflow;
    } else {
        workspace.workflows.unshift(activeWorkflow);
    }

    studio.saveWorkspace(workspace);
    studio.showStatus("Workflow saved to localStorage.", "success");
}

function exportWorkflow() {
    studio.downloadJson("workflow.json", activeWorkflow);
}

function loadSampleWorkflow() {
    activeWorkflow = {
        id: studio.generateId("workflow"),
        name: "Sample API Workflow",
        connections: [],
        nodes: [
            {
                id: studio.generateId("node"),
                type: "get",
                label: "GET Users",
                x: 60,
                y: 80,
                config: {
                    url: "https://jsonplaceholder.typicode.com/users"
                },
                output: {}
            },
            {
                id: studio.generateId("node"),
                type: "limit",
                label: "Limit",
                x: 310,
                y: 80,
                config: {
                    count: 5
                },
                output: {}
            },
            {
                id: studio.generateId("node"),
                type: "transform",
                label: "Transform",
                x: 560,
                y: 80,
                config: {
                    fields: "name,email,company"
                },
                output: {}
            },
            {
                id: studio.generateId("node"),
                type: "display",
                label: "Display",
                x: 810,
                y: 80,
                config: {},
                output: {}
            }
        ]
    };

    renderWorkflowCanvas();
    studio.showStatus("Sample workflow loaded.", "success");
}

function startDragNode(event) {
    if (event.target.matches("input, textarea, select, button")) {
        return;
    }

    const nodeEl = event.currentTarget;
    const rect = nodeEl.getBoundingClientRect();

    dragState = {
        id: nodeEl.dataset.nodeId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    };
}

function dragNode(event) {
    if (!dragState) return;

    const canvas = document.querySelector("#workflowCanvas");
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left + canvas.scrollLeft - dragState.offsetX;
    const y = event.clientY - rect.top + canvas.scrollTop - dragState.offsetY;

    const nodeEl = document.querySelector(`[data-node-id="${dragState.id}"]`);

    if (nodeEl) {
        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
    }

    moveWorkflowNode(dragState.id, x, y);
}

function stopDragNode() {
    dragState = null;
}