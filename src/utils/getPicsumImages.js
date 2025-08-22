export const getImages = (count) => {
    return Array.from({ length: count }, (_, i) => `https://picsum.photos/200/300?random=${i}`);
}