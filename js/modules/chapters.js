export async function loadScripture(fileName) {
    try {
        // Construir la ruta correcta según el entorno
        const basePath = window.location.pathname.includes('ULiahona Repository') 
            ? '/ULiahona Repository/data/' 
            : 'data/';
        
        console.log("🔍 Ruta construida:", basePath + fileName);
        
        const response = await fetch(basePath + fileName);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (err) {
        console.error("Error loading scripture JSON:", err);
        return null; // ← Importante: devolver null en caso de error
    }
}