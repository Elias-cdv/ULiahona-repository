// js/app.js
// Inicialización global ligera para ULiahona
(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        console.log("ULiahona — main initialized");
        
        // ===== APLICAR TEMA GUARDADO =====
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
            console.log("🌙 Dark theme applied");
        } else {
            document.body.classList.remove("dark");
            console.log("☀️ Light theme applied");
        }
        
        window.UL = window.UL || {};
        window.UL.log = (...args) => console.log("[ULiahona]", ...args);
    });
})();

import { initHome } from "./controllers/homeController.js";
import { initReader } from "./controllers/readerController.js";
import { initSettings } from "./controllers/settingsController.js";
import { initSearch } from "./controllers/searchingController.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired — checking page for init...");
    
    // Detectar HOME
    const hasProgress = !!document.getElementById("progress-section");
    console.log("progress-section found:", hasProgress);
    if (hasProgress) {
        try {
            initHome();
            console.log("initHome() invoked");
        } catch (err) {
            console.error("Error running initHome:", err);
        }
    }

    // Detectar READER
    const hasReaderContent = !!document.querySelector(".reading-content");
    console.log("reading-content found:", hasReaderContent);
    if (hasReaderContent) {
        try {
            initReader();
            console.log("initReader() invoked");
        } catch (err) {
            console.error("Error running initReader:", err);
        }
    }
    // Detectar SEARCH
    const hasSearch = !!document.querySelector(".search-content");
    if (hasSearch) {
        try {
            initSearch();
            console.log("initSearch() invoked");
        } catch (err) {
            console.error("Error running initSearch:", err);
        }
    }
    // Detectar SETTINGS
    const hasSettings = !!document.querySelector(".settings-content");
    if (hasSettings) {
        try {
            initSettings();
            console.log("initSettings() invoked");
        } catch (err) {
            console.error("Error running initSettings:", err);
        }
    }
});

