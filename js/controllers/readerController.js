//===========================
//   READER CONTROLLER
//===========================

import { loadProgress, saveProgress } from "../modules/storage.js";
import { loadScripture } from "../modules/chapters.js";

// Estado global del reader
let currentState = {
    scriptureData: null,      // JSON completo cargado
    selectedScripture: null,  // "book-of-mormon.json"
    selectedBook: null,       // "1 Nephi"
    selectedChapter: null,    // 3
    scriptureName: ""         // "Book of Mormon"
};

export function initReader() {
    console.log("Reader controller loaded");

    const scriptureList = document.querySelector(".scripture-list");
    const readingWelcome = document.getElementById("reading-welcome");
    const scriptureTitle = document.getElementById("scripture-title");
    const booksContainer = document.getElementById("books-container");
    const chaptersContainer = document.getElementById("chapters-container");
    const chapterContent = document.getElementById("chapter-content");

    if (!scriptureList) {
        console.warn("scripture-list not found in DOM — aborting initReader");
        return;
    }

    // 1. Renderizar lista de escrituras en el panel izquierdo
    renderScriptureList(scriptureList);

    // 2. Cargar progreso si existe
    const progress = loadProgress();
    if (progress && progress.book) {
        // Auto-cargar la última escritura leída
        console.log("Progress found, auto-loading:", progress.book);
        // TODO: implementar auto-load basado en progress
    }
}

function renderScriptureList(container) {
    const scriptures = [
        { file: "old-testament.json", name: "", img: "assets/images/ot.png" },
        { file: "new-testament.json", name: "", img: "assets/images/nt.png" },
        { file: "book-of-mormon.json", name: "", img: "assets/images/bom.png" },
        { file: "doctrine-and-covenants.json", name: "", img: "assets/images/dyc.png" },
        { file: "pearl-of-great-price.json", name: "", img: "assets/images/pgp.png" }
    ];

    container.innerHTML = ""; // Limpiar

    scriptures.forEach(scr => {
        const item = document.createElement("div");
        item.classList.add("scripture-item");
        item.innerHTML = `
            <img src="${scr.img}" alt="${scr.name}" class="scripture-thumb">
            <span class="scripture-name">${scr.name}</span>
        `;

        item.addEventListener("click", () => loadScriptureData(scr));
        container.appendChild(item);
    });
}

async function loadScriptureData(scripture) {
    console.log("Loading scripture:", scripture.name);
    
    try {
        // Mostrar loading
        showLoading();

        const data = await loadScripture(scripture.file);
        
        if (!data) {
            console.error("Failed to load scripture data");
            return;
        }

        // Actualizar estado
        currentState.scriptureData = data;
        currentState.selectedScripture = scripture.file;
        currentState.scriptureName = scripture.name;
        currentState.selectedBook = null;
        currentState.selectedChapter = null;

        // Mostrar lista de libros
        showBooks(data);

    } catch (err) {
        console.error("Error loading scripture:", err);
    }
}

function showBooks(data) {
    const readingWelcome = document.getElementById("reading-welcome");
    const scriptureTitle = document.getElementById("scripture-title");
    const booksContainer = document.getElementById("books-container");
    const chaptersContainer = document.getElementById("chapters-container");
    const chapterContent = document.getElementById("chapter-content");

    // Ocultar welcome
    readingWelcome?.classList.add("hidden");

    // Mostrar título de la escritura
    scriptureTitle.classList.remove("hidden");
    scriptureTitle.innerHTML = `<h2>${currentState.scriptureName}</h2>`;

    // Ocultar otros contenedores
    chaptersContainer.classList.add("hidden");
    chapterContent.classList.add("hidden");

    // Mostrar lista de libros
    booksContainer.classList.remove("hidden");
    booksContainer.innerHTML = "<h3>Books</h3>";

    // AQUÍ NECESITO SABER CÓMO ESTÁ ESTRUCTURADO TU JSON
    // Ejemplo si tu JSON es así: { books: [ { name: "1 Nephi", chapters: [...] } ] }
    
    // Temporal - ajustar según tu estructura real:
    const books = data.books || Object.keys(data); 
    
    const booksList = document.createElement("div");
    booksList.classList.add("books-list");

    books.forEach((book, index) => {
        const bookName = typeof book === "string" ? book : book.name;
        
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");
        bookItem.textContent = bookName;
        bookItem.addEventListener("click", () => showChapters(bookName, index));
        
        booksList.appendChild(bookItem);
    });

    booksContainer.appendChild(booksList);
}

function showChapters(bookName, bookIndex) {
    // Similar structure...
    console.log("Showing chapters for:", bookName);
    // TODO: implementar según estructura JSON
}

function showChapterContent(chapterNumber) {
    // TODO: implementar
}

function showLoading() {
    const content = document.querySelector(".reading-content");
    if (content) {
        content.innerHTML = '<div class="loading">Loading...</div>';
    }
}