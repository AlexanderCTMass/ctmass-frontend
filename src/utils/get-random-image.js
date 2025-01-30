export const getRandomImages = async (category, count) => {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${category}&per_page=${count}`, {
            headers: {
                Authorization: "Io25Sfxd1WVO5qUvsRMgdnreiK2x2Q5DNucf2kF9x1VH6UsuMBevnLyq" // API-ключ
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.photos.map((photo) => photo.src.medium);
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};
