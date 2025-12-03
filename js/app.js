// js/app.js
// Inicialización global ligera para ULiahona
(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        console.log("ULiahona — main initialized");
        const savedTheme = localStorage.getItem("ul_theme");
        if (savedTheme === "dark") document.documentElement.classList.add("dark");
        window.UL = window.UL || {};
        window.UL.log = (...args) => console.log("[ULiahona]", ...args);
    });
})();

import { initHome } from "./controllers/homeController.js";
import { initReader } from "./controllers/readerController.js";  // ← IMPORTAR

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

    // Detectar READER ← AGREGAR ESTO
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
});