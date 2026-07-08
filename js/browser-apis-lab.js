const studio = window.StructuredStudio;

studio.initSharedPage("browser-apis-lab");

document.addEventListener("DOMContentLoaded", () => {
    renderBrowserApiCards();
    renderNextLearningRoadmap();

    document.querySelector("#runIndexedDbBtn").addEventListener("click", runIndexedDbDemo);
    document.querySelector("#runWorkerBtn").addEventListener("click", runWebWorkerDemo);
    document.querySelector("#fileSystemBtn").addEventListener("click", checkFileSystemAccessSupport);
    document.querySelector("#notificationBtn").addEventListener("click", requestNotificationPermission);
});

function renderBrowserApiCards() {
    const cards = [
        {
            title: "IndexedDB",
            icon: "🗄️",
            support: "Supported in modern browsers",
            description: "Client-side database for storing large structured datasets."
        },
        {
            title: "Service Workers",
            icon: "📦",
            support: "Requires HTTPS or localhost",
            description: "Enable offline caching, background sync, and PWA behavior."
        },
        {
            title: "File System Access API",
            icon: "📁",
            support: "Best support in Chromium browsers",
            description: "Read and write local files with user permission."
        },
        {
            title: "Web Workers",
            icon: "⚙️",
            support: "Supported in modern browsers",
            description: "Move heavy calculations off the main UI thread."
        },
        {
            title: "Notifications",
            icon: "🔔",
            support: "Requires user permission",
            description: "Show system notifications after permission is granted."
        },
        {
            title: "WebRTC",
            icon: "📡",
            support: "Supported in modern browsers",
            description: "Realtime audio, video, and peer-to-peer data channels."
        }
    ];

    document.querySelector("#browserApiCards").innerHTML = cards
        .map(
            (card) => `
        <div class="capability-card">
          <span class="badge-soft">${card.icon} ${studio.escapeHtml(card.support)}</span>
          <h3 class="mt-3">${studio.escapeHtml(card.title)}</h3>
          <p>${studio.escapeHtml(card.description)}</p>
        </div>
      `
        )
        .join("");
}

function runIndexedDbDemo() {
    const target = document.querySelector("#indexedDbOutput");

    if (!("indexedDB" in window)) {
        target.textContent = "IndexedDB is not supported in this browser.";
        return;
    }

    const request = indexedDB.open("StructuredStudioLab", 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("records")) {
            db.createObjectStore("records", {
                keyPath: "id"
            });
        }
    };

    request.onerror = () => {
        target.textContent = "IndexedDB demo failed.";
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("records", "readwrite");
        const store = transaction.objectStore("records");

        const record = {
            id: "demo-record",
            name: "Structured Data Engineering Studio",
            savedAt: new Date().toISOString()
        };

        store.put(record);

        transaction.oncomplete = () => {
            const readTransaction = db.transaction("records", "readonly");
            const readStore = readTransaction.objectStore("records");
            const readRequest = readStore.get("demo-record");

            readRequest.onsuccess = () => {
                target.textContent = studio.formatJson(readRequest.result);
                studio.addActivityLog("Browser APIs Lab", "IndexedDB demo", "Saved and read a record.");
            };
        };
    };
}

function runWebWorkerDemo() {
    const target = document.querySelector("#workerOutput");

    if (!window.Worker) {
        target.textContent = "Web Workers are not supported in this browser.";
        return;
    }

    const workerCode = `
    self.onmessage = function(event) {
      const limit = event.data.limit;
      let total = 0;

      for (let index = 0; index <= limit; index += 1) {
        total += index;
      }

      self.postMessage({
        limit,
        total,
        completedAt: new Date().toISOString()
      });
    };
  `;

    const blob = new Blob([workerCode], {
        type: "application/javascript"
    });

    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (event) => {
        target.textContent = studio.formatJson(event.data);
        worker.terminate();
        studio.addActivityLog("Browser APIs Lab", "Web Worker demo", "Background calculation completed.");
    };

    worker.postMessage({
        limit: 1000000
    });
}

function checkFileSystemAccessSupport() {
    const supported = "showOpenFilePicker" in window;

    document.querySelector("#fileSystemOutput").textContent = supported
        ? "File System Access API is available in this browser."
        : "File System Access API is not available in this browser.";

    studio.addActivityLog("Browser APIs Lab", "File System support checked", supported ? "Supported" : "Not supported");
}

async function requestNotificationPermission() {
    const target = document.querySelector("#notificationOutput");

    if (!("Notification" in window)) {
        target.textContent = "Notifications are not supported in this browser.";
        return;
    }

    const permission = await Notification.requestPermission();
    target.textContent = `Notification permission: ${permission}`;

    if (permission === "granted") {
        new Notification("Structured Data Engineering Studio", {
            body: "Notifications are enabled for this browser session."
        });
    }

    studio.addActivityLog("Browser APIs Lab", "Notification permission requested", permission);
}

function renderNextLearningRoadmap() {
    const roadmap = [
        "Persist large datasets in IndexedDB instead of only localStorage.",
        "Add Service Worker caching for offline developer tools.",
        "Move heavy JSON analytics to Web Workers.",
        "Use File System Access API for local project imports and exports.",
        "Explore WebRTC for collaborative schema and workflow editing.",
        "Package the workspace as a Progressive Web App."
    ];

    document.querySelector("#nextLearningRoadmap").innerHTML = roadmap
        .map(
            (item, index) => `
        <div class="roadmap-step">
          <strong>${index + 1}. ${studio.escapeHtml(item)}</strong>
        </div>
      `
        )
        .join("");
}