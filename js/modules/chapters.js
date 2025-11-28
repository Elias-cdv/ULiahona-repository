export async function loadScripture(fileName) {
    try {
        const response = await fetch(`../data/${fileName}`);
        return await response.json();
    } catch (err) {
        console.error("Error loading scripture JSON:", err);
    }
}
