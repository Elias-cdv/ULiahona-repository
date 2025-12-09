import { loadScripture } from "../modules/chapters.js";
// YouTube API requires a global callback
window.onYouTubeIframeAPIReady = function() {
    console.log("✅ YouTube IFrame API is ready!");
    window.youtubeAPIReady = true;
};

let currentScripture = {
    file: null, 
    name: null, 
    data: null,
    structureType: null, 
    currentBookIndex: null, // indice del libro actual
    currentChapterIndex: null //indice del capitulo actual
};

export function initReader() {
    console.log("✅ Reader controller loaded");

    const scriptureList = document.querySelector(".scripture-list");

    if (!scriptureList) {
        console.warn("❌ scripture-list not found in DOM");
        return;
    }

    console.log("✅ scripture-list found");

    // Renderizar lista de escrituras (SOLO IMÁGENES)
    renderScriptureList(scriptureList);

    initToolbar();
}

// Función que renderiza escrituras del json y las muestra con las imagenes designadas
function renderScriptureList(container) {
    const scriptures = [
        { file: "old-testament.json", name: "Old Testament", img: "assets/images/ot.png" },
        { file: "new-testament.json", name: "New Testament", img: "assets/images/nt.png" },
        { file: "book-of-mormon.json", name: "Book of Mormon", img: "assets/images/bom.png" },
        { file: "doctrine-and-covenants.json", name: "Doctrine & Covenants", img: "assets/images/dyc.png" },
        { file: "pearl-of-great-price.json", name: "Pearl of Great Price", img: "assets/images/pgp.png" }
    ];

    console.log("📋 Rendering", scriptures.length, "scripture images");

    container.innerHTML = ""; // Limpiar

    scriptures.forEach(scr => {
        const item = document.createElement("div");
        item.classList.add("scripture-item");
        item.innerHTML = `
            <img src="${scr.img}" alt="${scr.name}" class="scripture-thumb">
            <span class="scripture-name">${scr.name}</span>
        `;

        // Ahora funciona con todas las escrituras, no uso if
        item.addEventListener ("click", () => {
            loadScriptureBooks(scr.file, scr.name);
        });
        container.appendChild(item);
    });

    console.log("✅ Scripture images rendered");
}

async function loadScriptureBooks(file, name) {
    console.log("🔄 Iniciando carga de:", name);
    
    try {
        // ===== 1. OBTENER LOS ELEMENTOS DEL DOM =====
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");
        const readingWelcome = document.getElementById("reading-welcome");
        
        if (!scriptureTitle || !booksContainer) {
            console.error("No se encontraron los elementos del DOM");
            return;
        }
        
        console.log("Elementos del DOM encontrados");
        
        // ===== 2. OCULTAR EL MENSAJE DE BIENVENIDA =====
        if (readingWelcome) {
            readingWelcome.classList.add("hidden");
        }
        
        // ===== 3. MOSTRAR LOS CONTENEDORES =====
        scriptureTitle.classList.remove("hidden");
        booksContainer.classList.remove("hidden");

        // ===== 3.5 OCULTAR Y LIMPIAR CONTENIDO ANTERIOR =====
        const chaptersContainer = document.getElementById("chapters-container");
        const scriptureContent = document.getElementById("scripture-content");

        if (chaptersContainer){
            chaptersContainer.classList.add("hidden");
            chaptersContainer.innerHTML = "";
        }
        if (scriptureContent){
            scriptureContent.classList.add("hidden");
            scriptureContent.innerHTML = "";
        }
        
        console.log("Contenido anterior limpiado");
        console.log("Contenedores visibles");
        
        // ===== 4. CARGAR EL JSON =====
        console.log("Llamando a loadScripture con:", file);
        
        const data = await loadScripture(file);
        
        console.log("JSON recibido:", data);
        
        // ===== 5. VERIFICAR QUE LLEGÓ ALGO =====
        if (!data) {
            console.error("No se recibió data");
            scriptureTitle.innerHTML = "<h2>Error al cargar</h2>";
            booksContainer.innerHTML = `<p>No se pudo cargar ${name}</p>`;
            return;
        }
        
        console.log("Data recibida correctamente");
        
        // ===== 6. DETECTAR ESTRUCTURA (books vs sections) =====
        let itemsToShow = [];
        let structureType = "";
        
        if (data.books && Array.isArray(data.books)) {
            // Estructura normal: books → chapters
            itemsToShow = data.books;
            structureType = "books";
            console.log("✅ Estructura detectada: BOOKS (con chapters)");
        } else if (data.sections && Array.isArray(data.sections)) {
            // Estructura de D&C: sections directas
            itemsToShow = data.sections;
            structureType = "sections";
            console.log("✅ Estructura detectada: SECTIONS (sin chapters intermedios)");
        } else {
            console.error("❌ Estructura desconocida. No tiene 'books' ni 'sections'");
            console.log("🔍 Propiedades disponibles:", Object.keys(data));
            return;
        }
        
        console.log(`📚 Total de ${structureType}:`, itemsToShow.length);
        
        // ===== 7. GUARDAR EN ESTADO GLOBAL =====
        currentScripture.file = file;
        currentScripture.name = name;
        currentScripture.data = data;
        currentScripture.structureType = structureType; // ← Nuevo: guardar el tipo
        console.log("Estado guardado:", currentScripture);
        
        // ===== 8. MOSTRAR EL TÍTULO =====
        scriptureTitle.innerHTML = `<h2>📖 ${name}</h2>`;
        console.log("Título mostrado:", name);
        
        // ===== 9. LIMPIAR EL CONTENEDOR =====
        booksContainer.innerHTML = "";
        console.log("Contenedor limpiado");
        
        // ===== 10. CREAR Y MOSTRAR CADA ITEM =====
        console.log("Creando elementos para", itemsToShow.length, "items...");
        
        itemsToShow.forEach((itemData, index) => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
            
            // Adaptar según la estructura
            if (structureType === "books") {
                // Books tienen chapters
                bookItem.innerHTML = `
                    <span class="book-name">${itemData.book}</span>
                    <span class="book-chapters">${itemData.chapters.length} chapters</span>
                `;
                
                bookItem.addEventListener("click", () => {
                    console.log("Click en libro:", itemData.book);
                    showChapters(itemData);
                });
                
                console.log(`  ${index + 1}. ${itemData.book} (${itemData.chapters.length} chapters)`);
                
            } else if (structureType === "sections") {
                // Sections NO tienen chapters, van directo a verses
                bookItem.innerHTML = `
                    <span class="book-name">${itemData.reference}</span>
                    <span class="book-chapters">${itemData.verses.length} verses</span>
                `;
                
                bookItem.addEventListener("click", () => {
                    console.log("Click en section:", itemData.reference);
                    // Llamar directamente a showChapterContent (saltamos showChapters)
                    showChapterContent(name, itemData);
                });
                
                console.log(`  ${index + 1}. ${itemData.reference} (${itemData.verses.length} verses)`);
            }
            
            booksContainer.appendChild(bookItem);
        });
        
        console.log("✅ Todos los items mostrados");
        
    } catch (error) {
        console.error("ERROR al cargar:", error);
        console.error("Stack trace:", error.stack);
    }
}

//Nueva función para mostrar los capitulos. Utiliza una lógica parecida a loadBookOfMormon
function showChapters(bookData) {
    console.log("Mostrando capitulos de: ", bookData.book);

    try {
        //obtener elementos de DOM
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");        // ← YA LO TIENES
        const chaptersContainer = document.getElementById("chapters-container");

        //guardar indice del libro actual
        const bookIndex = currentScripture.data.books.findIndex(b => b.book === bookData.book);
        currentScripture.currentBookIndex = bookIndex;
        currentScripture.currentChapterIndex = null; // Resetear capítulo
        console.log("📍 Libro guardado en índice:", bookIndex);
        
        //ver si existen o no
        if (!scriptureTitle || !booksContainer || !chaptersContainer){
            console.error("No se encontraron los elementos del DOM");
            return;
        }

        console.log("Elementos del DOM encontrados");

        //ocultar lista de libros
        booksContainer.classList.add("hidden");                                    // ← YA LO TIENES
        console.log("Lista de libros ocultada");

        //mostrar los capitulos, usando "remove"
        chaptersContainer.classList.remove("hidden");
        console.log("Contenedor de capitulos visible");
        
        //Cambiar titulo al nombre del libro
        scriptureTitle.innerHTML = `<h2>${bookData.book}</h2>`;
        console.log("Titulo cambiado a: ", bookData.book);

        //limpiar los capitulos
        chaptersContainer.innerHTML = "";
        console.log("Contenedor de capitulos limpiado");

        if (!bookData.chapters || bookData.chapters.length === 0){
            console.error("Este libro no tiene capitulos");
            chaptersContainer.innerHTML = "<p>No chapters available</p>";
            return;
        }
        
        console.log("Creando", bookData.chapters.length, "botones de capitulos...");

        // Crear el HTML de todos los botones
        let chaptersHTML = "";

        bookData.chapters.forEach((chapterData) => {
            chaptersHTML += `<button class="chapter-button" data-chapter="${chapterData.chapter}">${chapterData.chapter}</button>`;
        });

        // Insertar todos los botones de una vez
        chaptersContainer.innerHTML = chaptersHTML;
        console.log("Botones insertados con innerHTML");

        // Buscar todos los botones que acabamos de crear
        const chapterButtons = chaptersContainer.querySelectorAll(".chapter-button");
        console.log("Botones encontrados:", chapterButtons.length);

        // Agregar listener a cada botón
        chapterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const chapterNumber = parseInt(button.getAttribute("data-chapter"));
                console.log("Click en capitulo:", chapterNumber);
                
                // Buscar los datos del capítulo
                const chapterData = bookData.chapters.find(ch => ch.chapter === chapterNumber);
                
                if (chapterData) {
                    showChapterContent(bookData.book, chapterData);
                } else {
                    console.error("No se encontraron datos para el capitulo", chapterNumber);
                }
            });
        });

        console.log("Listeners agregados a los botones");

    } catch (error){
        console.error("ERROR al mostrar capitulos: ", error);
        console.error("Stack trace:", error.stack);
    }
}

function showChapterContent(bookName, chapterData) {
    console.log("Mostrando contenido de:", bookName, "- Chapter/Section", chapterData.chapter || chapterData.section);
    
    try {
        // ===== 1. OBTENER LOS ELEMENTOS DEL DOM =====
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");
        const chaptersContainer = document.getElementById("chapters-container");
        const scriptureContent = document.getElementById("scripture-content");
        
        if (!scriptureTitle || !booksContainer || !chaptersContainer || !scriptureContent) {
            console.error("No se encontraron los elementos del DOM");
            return;
        }
        
        console.log("Elementos del DOM encontrados");
        
        // ===== 2. GUARDAR ÍNDICE DEL CAPÍTULO ACTUAL =====
        if (currentScripture.structureType === "books") {
            // Para books normales
            const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
            const chapterIndex = currentBook.chapters.findIndex(ch => ch.chapter === chapterData.chapter);
            currentScripture.currentChapterIndex = chapterIndex;
            console.log("📍 Capítulo guardado en índice:", chapterIndex);
        } else if (currentScripture.structureType === "sections") {
            // Para sections de D&C
            const sectionIndex = currentScripture.data.sections.findIndex(s => s.section === chapterData.section);
            currentScripture.currentBookIndex = sectionIndex; // En D&C, el section ES el book
            currentScripture.currentChapterIndex = 0; // Las sections no tienen chapters
            console.log("📍 Section guardada en índice:", sectionIndex);
        }
        
        // ===== 3. OCULTAR TODO LO ANTERIOR =====
        booksContainer.classList.add("hidden");
        chaptersContainer.classList.add("hidden");
        console.log("Lista de libros/secciones y capítulos ocultados");
        
        // ===== 4. MOSTRAR EL CONTENEDOR DE CONTENIDO =====
        scriptureContent.classList.remove("hidden");
        console.log("Contenedor de contenido visible");
        
        // ===== 5. CAMBIAR EL TÍTULO =====
        const chapterNumber = chapterData.chapter || chapterData.section;
        const label = chapterData.chapter ? "Chapter" : "Section";
        
        scriptureTitle.innerHTML = `<h2>${bookName} - ${label} ${chapterNumber}</h2>`;
        console.log("Titulo cambiado");
        
        // ===== 6. LIMPIAR EL CONTENEDOR =====
        scriptureContent.innerHTML = "";
        console.log("Contenedor limpiado");
        
        // ===== 7. VERIFICAR QUE TIENE VERSÍCULOS =====
        if (!chapterData.verses || chapterData.verses.length === 0) {
            console.error("Este capitulo/section no tiene versiculos");
            scriptureContent.innerHTML = "<p>No verses available</p>";
            return;
        }
        
        console.log("Mostrando", chapterData.verses.length, "versiculos...");
        
        // ===== 8. CREAR BOTONES DE NAVEGACIÓN =====
        const navigationHTML = `
            <div class="navigation-buttons">
                <button id="back-to-books" class="nav-btn">Back to Books</button>
                <button id="prev-chapter" class="nav-btn">Previous</button>
                <button id="next-chapter" class="nav-btn">Next</button>
                <button id="mark-complete-btn" class="nav-btn complete-btn">Mark as complete</button>
            </div>
        `;

        // Agregar funcionalidad a los botones
        setupNavigationButtons();
        
        //restaurar highlights
        setTimeout(() => {
            restoreHighlights();
        }, 0);
        // ===== 9. CREAR EL HTML DE TODOS LOS VERSÍCULOS =====
        let versesHTML = navigationHTML; // Botones arriba
        
        chapterData.verses.forEach((verseData) => {
            versesHTML += `
                <p class="verse">
                    <strong>${verseData.verse}</strong> ${verseData.text}
                </p>
            `;
        });
        
        versesHTML += navigationHTML; // Botones abajo también
        
        // Insertar todo el contenido
        scriptureContent.innerHTML = versesHTML;
        
        console.log("Todos los versiculos y botones mostrados");
        
        // ===== 10. AGREGAR FUNCIONALIDAD A LOS BOTONES =====
        setupNavigationButtons();
        
    } catch (error) {
        console.error("ERROR al mostrar contenido:", error);
        console.error("Stack trace:", error.stack);
    }
}
// función para navegación  de botones
function setupNavigationButtons() {
    // Obtener los botones
    const backtoBooks = document.querySelectorAll("#back-to-books");
    const prevButtons = document.querySelectorAll("#prev-chapter");
    const nextButtons = document.querySelectorAll("#next-chapter");
    const markCompleteButtons = document.querySelectorAll("#mark-complete-btn");    

    console.log("🎮 Configurando botones de navegación...");
    console.log("  - Botones 'Back':", backtoBooks.length);
    console.log("  - Botones 'Previous':", prevButtons.length);
    console.log("  - Botones 'Next':", nextButtons.length);
    
    // ===== BOTÓN: BACK TO BOOKS =====
    backtoBooks.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("🏠 Volver a la lista de libros/secciones");
            
            const scriptureTitle = document.getElementById("scripture-title");
            const booksContainer = document.getElementById("books-container");
            const chaptersContainer = document.getElementById("chapters-container");
            const scriptureContent = document.getElementById("scripture-content");
            
            // Ocultar contenido y capítulos
            scriptureContent.classList.add("hidden");
            chaptersContainer.classList.add("hidden");
            
            // Mostrar libros/secciones
            booksContainer.classList.remove("hidden");
            
            // Cambiar título
            scriptureTitle.innerHTML = `<h2>📖 ${currentScripture.name}</h2>`;
            
            // Resetear índice de capítulo
            currentScripture.currentChapterIndex = null;
        });
    });
    
    // ===== BOTÓN: PREVIOUS =====
    prevButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("⬅️ Ir al capítulo/sección anterior");
            navigateToPrevious();
        });
    });
    
    // ===== BOTÓN: NEXT =====
    nextButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("➡️ Ir al capítulo/sección siguiente");
            navigateToNext();
        });
    });

    // ===== BOTÓN: MARK AS COMPLETE =====
    console.log("🔍 Mark Complete buttons found:", markCompleteButtons.length);
    
    markCompleteButtons.forEach(btn => {
        // Verificar si ya está completado
        if (checkIfChapterCompleted()) {
            btn.textContent = "✓ Completed";
            btn.classList.add("completed");
            btn.disabled = true;
        }
        
        btn.addEventListener("click", () => {
            console.log("🖱️ Click en Mark as Complete");
            markChapterComplete(); // ← Ahora sí llamará a la función
        });
    });

    console.log("✅ Botones configurados");

}

//función de navegación de previous prevoius
function navigateToPrevious() {
    if (currentScripture.structureType === "books") {
        // Navegación para books con chapters
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapterIndex = currentScripture.currentChapterIndex;
        
        if (currentChapterIndex > 0) {
            // Hay capítulo anterior en el mismo libro
            const prevChapter = currentBook.chapters[currentChapterIndex - 1];
            showChapterContent(currentBook.book, prevChapter);
        } else {
            // Ir al último capítulo del libro anterior
            if (currentScripture.currentBookIndex > 0) {
                const prevBook = currentScripture.data.books[currentScripture.currentBookIndex - 1];
                currentScripture.currentBookIndex--;
                const lastChapter = prevBook.chapters[prevBook.chapters.length - 1];
                showChapterContent(prevBook.book, lastChapter);
            } else {
                console.log("❌ Ya estás en el primer capítulo");
                alert("You're at the beginning!");
            }
        }
    } else if (currentScripture.structureType === "sections") {
        // Navegación para sections de D&C
        const currentSectionIndex = currentScripture.currentBookIndex;
        
        if (currentSectionIndex > 0) {
            const prevSection = currentScripture.data.sections[currentSectionIndex - 1];
            showChapterContent(currentScripture.name, prevSection);
        } else {
            console.log("❌ Ya estás en la primera sección");
            alert("You're at the beginning!");
        }
    }
}

function navigateToNext() {
    if (currentScripture.structureType === "books") {
        // Navegación para books con chapters
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapterIndex = currentScripture.currentChapterIndex;
        
        if (currentChapterIndex < currentBook.chapters.length - 1) {
            // Hay capítulo siguiente en el mismo libro
            const nextChapter = currentBook.chapters[currentChapterIndex + 1];
            showChapterContent(currentBook.book, nextChapter);
        } else {
            // Ir al primer capítulo del siguiente libro
            if (currentScripture.currentBookIndex < currentScripture.data.books.length - 1) {
                const nextBook = currentScripture.data.books[currentScripture.currentBookIndex + 1];
                currentScripture.currentBookIndex++;
                const firstChapter = nextBook.chapters[0];
                showChapterContent(nextBook.book, firstChapter);
            } else {
                console.log("❌ Ya estás en el último capítulo");
                alert("You've reached the end!");
            }
        }
    } else if (currentScripture.structureType === "sections") {
        // Navegación para sections de D&C
        const currentSectionIndex = currentScripture.currentBookIndex;
        
        if (currentSectionIndex < currentScripture.data.sections.length - 1) {
            const nextSection = currentScripture.data.sections[currentSectionIndex + 1];
            showChapterContent(currentScripture.name, nextSection);
        } else {
            console.log("❌ Ya estás en la última sección");
            alert("You've reached the end!");
        }
    }
}
//===========================
//   TOOLBAR FUNCTIONALITY
//===========================

let currentPanel = null; // Track which panel is open

export function initToolbar() {
    console.log("📝 Initializing toolbar...");
    
    const toolbar = document.querySelector(".toolbar");
    
    if (!toolbar) {
        console.warn("❌ Toolbar not found");
        return;
    }
    
    // ===== REEMPLAZO: TOOLBAR HTML (MUSIC panel simplificado: URL + file upload + audio fallback) =====
    toolbar.innerHTML = `
        <h3>🛠️ Toolbar</h3>
        <div class="toolbar-buttons">
            <button class="toolbar-btn" data-panel="notes" title="Notes">📝 Notes</button>
            <button class="toolbar-btn" data-panel="highlighter" title="Highlighter">🖍️ Highlight</button>
            <button class="toolbar-btn" data-panel="progress" title="Progress">📊 Progress</button>
            <button class="toolbar-btn" data-panel="music" title="Music">🎵 Music</button>
            <button class="toolbar-btn" data-panel="themes" title="Themes">🎨 Themes</button>
        </div>

        <div id="control-panel" class="control-panel hidden">
            <div class="panel-content" data-content="notes">
                <h4>📝 My Notes</h4>
                <textarea id="reader-notes" class="notes-textarea" placeholder="Write your thoughts..."></textarea>
                <p class="panel-info">💾 Auto-saved to your browser</p>
                <button id="toolbar-export-btn" class="panel-action-btn">📥 Export Notes</button>
            </div>

            <div class="panel-content hidden" data-content="highlighter">
                <h4>🖍️ Highlighter</h4>
                <p class="panel-info">Select text, then choose a color:</p>
                <div class="color-palette">
                    <button class="color-btn" data-color="yellow" style="background:#ffeb3b;">Yellow</button>
                    <button class="color-btn" data-color="orange" style="background:#ff9800;">Orange</button>
                    <button class="color-btn" data-color="green" style="background:#4caf50;">Green</button>
                    <button class="color-btn" data-color="pink" style="background:#e91e63;">Pink</button>
                </div>
                <button id="clear-highlights-btn" class="panel-action-btn danger">🗑️ Clear All Highlights</button>
            </div>

            <div class="panel-content hidden" data-content="progress">
                <h4>📊 Reading Progress</h4>
                <div id="progress-display">
                    <p class="panel-info">No scripture selected yet.</p>
                </div>
            </div>

            <!-- MUSIC: URL or local file, simple audio fallback -->
            <div class="panel-content hidden" data-content="music">
                <h4>🎵 Background Audio</h4>
                <p class="panel-info">Paste an audio URL (mp3/ogg) or upload a file.</p>

                <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.6rem;">
                    <input id="music-url" class="music-input" type="text" placeholder="https://example.com/file.mp3" style="flex:1;padding:.4rem" />
                    <button id="music-load" class="panel-action-btn">Load</button>
                </div>

                <div style="margin-bottom:.6rem;">
                    <input id="music-file" type="file" accept="audio/*" />
                </div>

                <div id="audio-player-container" class="hidden" style="margin-top:.6rem;">
                    <!-- audio element will be injected here -->
                </div>

                <div class="music-controls hidden" id="music-controls" style="margin-top:.6rem;">
                    <button id="music-play" class="music-btn">▶️ Play</button>
                    <button id="music-pause" class="music-btn">⏸️ Pause</button>
                    <button id="music-stop" class="music-btn">⏹️ Stop</button>
                </div>
            </div>

            <div class="panel-content hidden" data-content="themes">
                <h4>🎨 Scripture Themes</h4>
                <p class="panel-info">Go to the Search page to explore scriptures by theme</p>
                <a href="searching.html" class="panel-action-btn">🔍 Go to Search</a>
            </div>
        </div>
    `;
    
    // ===== SETUP FUNCTIONALITY =====
    setupToolbarButtons();
    loadNotes();
    setupNotesAutosave();
    setupHighlighter();
    setupProgress();
    
    console.log("✅ Toolbar initialized with all panels");
}

// ===== TOGGLE PANELS =====
function setupToolbarButtons() {
    const buttons = document.querySelectorAll(".toolbar-btn");
    const controlPanel = document.getElementById("control-panel");
    const panels = document.querySelectorAll(".panel-content");
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const panelName = btn.dataset.panel;
            
            // Si es el mismo panel, toggle visibility
            if (currentPanel === panelName && !controlPanel.classList.contains("hidden")) {
                controlPanel.classList.add("hidden");
                currentPanel = null;
                btn.classList.remove("active");
                return;
            }
            
            // Mostrar panel seleccionado
            currentPanel = panelName;
            controlPanel.classList.remove("hidden");
            
            // Ocultar todos los paneles
            panels.forEach(p => p.classList.add("hidden"));
            
            // Mostrar panel activo
            const activePanel = document.querySelector(`[data-content="${panelName}"]`);
            if (activePanel) {
                activePanel.classList.remove("hidden");
            }
            
            // Highlight active button
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            console.log(`📂 Panel opened: ${panelName}`);
        });
    });
}

// ===== NOTES FUNCTIONALITY =====
function loadNotes() {
    const textarea = document.getElementById("reader-notes");
    if (!textarea) return;
    
    const savedNotes = localStorage.getItem("reader-notes") || "";
    textarea.value = savedNotes;
    console.log("📖 Notes loaded");
}

function setupNotesAutosave() {
    const textarea = document.getElementById("reader-notes");
    if (textarea) {
        textarea.addEventListener("input", () => {
            localStorage.setItem("reader-notes", textarea.value);
            console.log("💾 Notes saved");
        });
    }
    
    const exportBtn = document.getElementById("toolbar-export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const notes = localStorage.getItem("reader-notes") || "No notes available.";
            const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `uliahona-notes-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("✅ Notes exported");
        });
    }
}
//===========================
//   HIGHLIGHTER FUNCTIONALITY
//===========================

let selectedColor = null;

function setupHighlighter() {
    console.log("🖍️ Highlighter initialized");

    // Setup color buttons
    const colorButtons = document.querySelectorAll(".color-btn"); // ← CORREGIDO: "document"
    
    colorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedColor = btn.dataset.color;

            // Visual feedback - border around selected color
            colorButtons.forEach(b => b.style.border = "3px solid transparent");
            btn.style.border = "3px solid var(--deep-blue)";

            console.log("✅ Color selected:", selectedColor);
            alert(`🖍️ ${selectedColor.toUpperCase()} highlighter activated! Now select text in the scripture.`);
        });
    });

    // Setup clear button
    const clearBtn = document.getElementById("clear-highlights-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearAllHighlights);
    }

    // Setup text selection listener
    setupTextSelectionListener();
    
    console.log("✅ Highlighter fully configured");
}

function setupTextSelectionListener() {
    document.addEventListener("mouseup", () => {
        // Check if a color is selected
        if (!selectedColor) return;

        // Get selection
        const selection = window.getSelection(); // ← CORREGIDO
        
        // Check if there's actual text selected
        if (!selection || selection.toString().trim() === "") return;
        
        // Verify selection is within scripture content
        const scriptureContent = document.getElementById("scripture-content");
        if (!scriptureContent) return;

        // Get range
        const range = selection.getRangeAt(0); // ← CORREGIDO
        const container = range.commonAncestorContainer;

        // Find parent verse element
        let verseElement = container.nodeType === 3 ? container.parentElement : container;
        
        while (verseElement && !verseElement.classList.contains("verse")) {
            verseElement = verseElement.parentElement;
            if (verseElement === scriptureContent || !verseElement) break;
        }

        if (!verseElement || !verseElement.classList.contains("verse")) {
            console.log("⚠️ Selection not in a verse");
            return;
        }

        // Apply highlight
        applyHighlight(range, verseElement);

        // Clear selection
        selection.removeAllRanges(); // ← CORREGIDO: "Ranges" con R mayúscula
    });
}

function applyHighlight(range, verseElement) {
    try {
        // Create highlight span
        const highlight = document.createElement("span");
        highlight.className = `highlight highlight-${selectedColor}`;
        highlight.dataset.color = selectedColor;

        // Wrap selected text
        range.surroundContents(highlight);

        console.log("✅ Highlight applied:", selectedColor);

        // Save highlight
        saveHighlight(verseElement, selectedColor); // ← CORREGIDO: sin mayúscula
        
    } catch (error) {
        console.error("❌ Error applying highlight:", error);
        alert("⚠️ Cannot highlight this selection. Try selecting text within a single verse only.");
    }
}

function saveHighlight(verseElement, color) {
    if (!currentScripture.name || currentScripture.currentBookIndex === null) {
        console.warn("⚠️ Cannot save highlight - no chapter selected");
        return;
    }
    
    // Create unique ID for this chapter
    let chapterId;
    if (currentScripture.structureType === "books") {
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    // Get verse number
    const verseNum = verseElement.querySelector("strong")?.textContent || "unknown";
    
    // Get highlights storage
    const highlights = JSON.parse(localStorage.getItem("scripture-highlights") || "{}");
    
    // Initialize if needed
    if (!highlights[currentScripture.name]) {
        highlights[currentScripture.name] = {};
    }
    if (!highlights[currentScripture.name][chapterId]) {
        highlights[currentScripture.name][chapterId] = {};
    }
    
    // Save current HTML of verse (preserves all highlights)
    highlights[currentScripture.name][chapterId][verseNum] = verseElement.innerHTML;
    
    // Save to localStorage
    localStorage.setItem("scripture-highlights", JSON.stringify(highlights));
    
    console.log("💾 Highlight saved for", chapterId, "verse", verseNum);
}

function restoreHighlights() {
    if (!currentScripture.name || currentScripture.currentBookIndex === null) {
        console.log("⚠️ No scripture loaded, skipping highlights restore");
        return;
    }
    
    // Create chapter ID
    let chapterId;
    if (currentScripture.structureType === "books") {
        if (currentScripture.currentChapterIndex === null) return;
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    // Get highlights
    const highlights = JSON.parse(localStorage.getItem("scripture-highlights") || "{}");
    
    if (!highlights[currentScripture.name] || !highlights[currentScripture.name][chapterId]) {
        console.log("📝 No highlights to restore for this chapter");
        return;
    }
    
    const chapterHighlights = highlights[currentScripture.name][chapterId];
    
    // Apply highlights
    Object.keys(chapterHighlights).forEach(verseNum => {
        const verseElements = document.querySelectorAll(".verse");
        verseElements.forEach(verse => {
            const verseNumber = verse.querySelector("strong")?.textContent;
            if (verseNumber === verseNum) {
                verse.innerHTML = chapterHighlights[verseNum];
                console.log("✅ Restored highlight for verse", verseNum);
            }
        });
    });
    
    console.log("✅ All highlights restored for this chapter");
}

function clearAllHighlights() {
    if (!confirm("🗑️ Are you sure you want to clear ALL highlights from ALL scriptures?")) {
        return;
    }
    
    localStorage.removeItem("scripture-highlights");
    
    // Remove highlights from current page
    document.querySelectorAll(".highlight").forEach(el => {
        const text = el.textContent;
        const textNode = document.createTextNode(text);
        el.replaceWith(textNode);
    });
    
    console.log("✅ All highlights cleared");
    alert("✅ All highlights have been cleared!");
}

// ===== PROGRESS TRACKING =====
function setupProgress() {
    console.log("📊 Progress tracking initialized");
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const progressDisplay = document.getElementById("progress-display");
    if (!progressDisplay) return;
    
    // Obtener progreso guardado
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    if (Object.keys(progress).length === 0) {
        progressDisplay.innerHTML = `<p class="panel-info">Start reading and mark chapters as complete to track your progress!</p>`;
        return;
    }
    
    // Generar HTML de progreso
    let html = "";
    
    for (const [scripture, data] of Object.entries(progress)) {
        const percentage = Math.round((data.completed / data.total) * 100);
        
        html += `
            <div class="progress-item">
                <h5>📖 ${scripture}</h5>
                <p class="panel-info">${data.completed} / ${data.total} chapters completed</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p style="text-align: right; margin-top: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--gold);">
                    ${percentage}%
                </p>
            </div>
        `;
    }
    
    progressDisplay.innerHTML = html;
}

function markChapterComplete() {
    console.log("🔍 Checking current scripture state:", currentScripture);
    
    if (!currentScripture.name) {
        alert("❌ No scripture selected");
        return;
    }
    
    if (currentScripture.currentBookIndex === null) {
        alert("❌ No book selected");
        return;
    }
    
    if (currentScripture.currentChapterIndex === null && currentScripture.structureType === "books") {
        alert("❌ No chapter selected");
        return;
    }
    
    // Obtener progreso actual
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    // Inicializar si no existe
    if (!progress[currentScripture.name]) {
        let totalChapters = 0;
        
        if (currentScripture.structureType === "books") {
            // Contar todos los capítulos de todos los libros
            currentScripture.data.books.forEach(book => {
                totalChapters += book.chapters.length;
            });
        } else if (currentScripture.structureType === "sections") {
            // Para D&C, cada section es un "capítulo"
            totalChapters = currentScripture.data.sections.length;
        }
        
        progress[currentScripture.name] = {
            total: totalChapters,
            completed: 0,
            chapters: {}
        };
    }
    
    // Crear ID único del capítulo
    let chapterId;
    if (currentScripture.structureType === "books") {
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    console.log("📝 Chapter ID:", chapterId);
    
    // Marcar como completado si no lo está ya
    if (!progress[currentScripture.name].chapters[chapterId]) {
        progress[currentScripture.name].chapters[chapterId] = true;
        progress[currentScripture.name].completed++;
        
        // Guardar
        localStorage.setItem("reading-progress", JSON.stringify(progress));
        
        console.log("✅ Chapter marked as complete:", chapterId);
        
        // Actualizar display
        updateProgressDisplay();
        
        // Actualizar botón
        const btn = document.getElementById("mark-complete-btn");
        if (btn) {
            btn.textContent = "✓ Completed";
            btn.classList.add("completed");
            btn.disabled = true;
        }
        
        // Mostrar mensaje
        alert("✅ Chapter marked as complete!");
    } else {
        alert("ℹ️ This chapter is already completed");
    }
}

function checkIfChapterCompleted() {
    if (!currentScripture.name || currentScripture.currentBookIndex === null) {
        return false;
    }
    
    if (currentScripture.structureType === "books" && currentScripture.currentChapterIndex === null) {
        return false;
    }
    
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    if (!progress[currentScripture.name]) return false;
    
    let chapterId;
    if (currentScripture.structureType === "books") {
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    return !!progress[currentScripture.name].chapters[chapterId];
}
// --- YouTube player global y handlers ---
let youtubePlayer = null;

function onPlayerReady(event) {
    const controls = document.getElementById("music-controls");
    if (controls) controls.classList.remove("hidden");
    console.log("YouTube player ready");
}

function onPlayerStateChange(event) {
    // puedes manejar estados si quieres (event.data)
    // 1 = playing, 2 = paused, 0 = ended
}

function onPlayerError(event) {
    console.error("YouTube player error:", event);
    alert("YouTube player error. Check console for details.");
}

/* helpers para validar/parsear YouTube */
function isValidVideoId(id) {
    return typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id);
}

function parseYouTubeUrl(url) {
    // acepta: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, playlist?list=ID, o directamente el ID
    try {
        // si ya es un id posible, devolverlo
        if (isValidVideoId(url.trim())) return { type: "video", id: url.trim() };

        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, "").toLowerCase();

        // youtu.be/VIDEOID
        if (host === "youtu.be") {
            const id = u.pathname.slice(1).split(/[/?#]/)[0];
            if (isValidVideoId(id)) return { type: "video", id };
        }

        // youtube.com
        if (host.endsWith("youtube.com")) {
            // playlist
            const list = u.searchParams.get("list");
            if (list) return { type: "playlist", id: list };

            // watch?v=
            const v = u.searchParams.get("v");
            if (v && isValidVideoId(v)) return { type: "video", id: v };

            // /embed/ID or /v/ID
            const m = u.pathname.match(/\/(?:embed|v)\/([^/?#]+)/);
            if (m && isValidVideoId(m[1])) return { type: "video", id: m[1] };
        }

        return null;
    } catch (e) {
        return null;
    }
}

// safe wrapper que valida antes de instanciar YT.Player
function createYouTubePlayer(opts = {}) {
    if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
        console.error("createYouTubePlayer: YT not ready");
        return;
    }

    // destruir anterior
    if (youtubePlayer && typeof youtubePlayer.destroy === "function") {
        try { youtubePlayer.destroy(); } catch (e) {}
        youtubePlayer = null;
    }

    const playerVars = {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0
    };

    // validaciones
    if (opts.videoId) {
        if (!isValidVideoId(opts.videoId)) {
            alert("Invalid YouTube video ID. Please paste a valid YouTube URL or ID.");
            return;
        }
    } else if (opts.list) {
        if (!opts.list || typeof opts.list !== "string") {
            alert("Invalid playlist id.");
            return;
        }
        playerVars.listType = opts.listType || "playlist";
        playerVars.list = opts.list;
    } else {
        alert("No videoId or playlist provided.");
        return;
    }

    try {
        youtubePlayer = new YT.Player("youtube-player", {
            height: "180",
            width: "100%",
            videoId: opts.videoId || undefined,
            playerVars,
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: (e) => {
                    onPlayerError(e);
                    const code = e && e.data;
                    // 101/150 -> embedding blocked
                    if (code === 101 || code === 150) {
                        alert("This video/playlist does not allow embedding. It will open in YouTube.");
                        window.open(opts.videoId ? `https://youtu.be/${opts.videoId}` : `https://www.youtube.com/playlist?list=${opts.list}`, "_blank");
                    }
                }
            }
        });
        console.log("✅ YouTube player created successfully");
    } catch (err) {
        console.error("Error creating YouTube player:", err);
        alert("Error creating YouTube player. Check console.");
    }
}