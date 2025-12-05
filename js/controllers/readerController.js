//===========================
//   READER CONTROLLER (VERSIÓN MÍNIMA)
//===========================

import { loadScripture } from "../modules/chapters.js";

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

        // PRUEBA: Agregar listener solo a book of mormon
        if (scr.file === "book-of-mormon.json"){
            item.addEventListener("click", () => {
                item.addEventListener("click", () => {

                console.log("Click en book of mormon")});//prueba exitosa, la consola en devtools mostró el mensaje
                loadBookOfMormon(); //se agregó esta linea para conectar listener con la función de abajo
            });
        }

        container.appendChild(item);
    });

    console.log("✅ Scripture images rendered");
}

async function loadBookOfMormon() {
    console.log("🔄 Iniciando carga de Book of Mormon...");
    
    try {
        // ===== 1. OBTENER LOS ELEMENTOS DEL DOM =====
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");
        const readingWelcome = document.getElementById("reading-welcome");
        
        // Verificar que existen
        if (!scriptureTitle || !booksContainer) {
            console.error(" No se encontraron los elementos del DOM");
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
        
        console.log("✅ Contenedores visibles");
        
        // ===== 4. CARGAR EL JSON =====
        console.log("Llamando a loadScripture('book-of-mormon.json')...");
        
        const data = await loadScripture("book-of-mormon.json");
        
        console.log("JSON recibido:");
        console.log(data);
        
        // ===== 5. VERIFICAR QUE LLEGÓ ALGO =====
        if (!data) {
            console.error("No se recibió data");
            scriptureTitle.innerHTML = "<h2>Error al cargar</h2>";
            booksContainer.innerHTML = "<p>No se pudo cargar el Book of Mormon</p>";
            return;
        }
        
        console.log("Data recibida correctamente");
        
        // ===== 6. VERIFICAR ESTRUCTURA =====
        if (!data.books || !Array.isArray(data.books)) {
            console.error("El JSON no tiene 'books' o no es un array");
            return;
        }
        
        console.log("El JSON tiene", data.books.length, "libros");
        
        // ===== 7. MOSTRAR EL TÍTULO =====
        scriptureTitle.innerHTML = "<h2>📖 Book of Mormon</h2>";
        console.log("Título mostrado");
        
        // ===== 8. LIMPIAR EL CONTENEDOR DE LIBROS =====
        booksContainer.innerHTML = "";
        console.log("Contenedor limpiado");
        
        // ===== 9. CREAR Y MOSTRAR CADA LIBRO =====
        console.log("Creando elementos para", data.books.length, "libros...");
        
        data.books.forEach((bookData, index) => {
            // Crear el elemento div para cada libro
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
            
            // Agregar el contenido (nombre del libro)
            bookItem.innerHTML = `
                <span class="book-name">${bookData.book}</span>
                <span class="book-chapters">${bookData.chapters.length} chapters</span>
            `;
            
            // Por ahora solo mostramos, después agregaremos el click
            console.log(`  ${index + 1}. ${bookData.book} (${bookData.chapters.length} capítulos)`);
            
            // Agregar al contenedor
            booksContainer.appendChild(bookItem);
        });
        
        console.log("✅ Todos los libros mostrados en pantalla");
        
    } catch (error) {
        console.error("ERROR al cargar:", error);
        console.error("Stack trace:", error.stack);
    }
}


/*  Fue una función de prueba para cargar datos json en el reader container
    Usaré solamente book of mormon por ahora
    Si la prueba es exitosa, diseñare un algoritmo para que funcione 
    con todas las escrituras 

async function loadBookOfMormon() {
    console.log("Iniciando la carga de Book of Mormon");

    try {
        // Cargar el json
        console.log("Llamando a loadScripture('book-of-mormon.json')...");

        const data = await loadScripture("book-of-mormon.json");

        console.log("Json recibido!");
        console.log(data);

        if (!data){
            console.error("No se recibio data");
            return;
        }

        console.log("Data recibida correctamente");

        //Está sentencia if verifica que datos tiene el JSON,
          desconocia el "Object.keys", la IA me la mostró, es 
          util para obtener datos de un json, incluso de una API
          
          nota: La usaré en otras prácticas
        if (!data.books){
            console.error("El json no tiene la propiedad books");
            console.log("Propiedades que si tiene: ", Object.keys(data));
            return;
        }

        console.log("El json tiene 'books'");
        console.log("Total de libros: ", data.books.length);

        /*Estamos verificando que todo funcione, para ello mostraremos
          los primeros 5 libros, debería mostrarse 1 Nephi, 2 Nephi, Jacob, 
          Jarom y Omni
        console.log("Primeros cinco libros: ");
        data.books.slice(0, 5).forEach((book, index) => {
            console.log(`${index + 1}. ${book.book}`);
        });
    } catch (error){
        console.error("Error al cargar: ", error);
        console.error("Stack trace: ", error.stack);
    }
}*/


