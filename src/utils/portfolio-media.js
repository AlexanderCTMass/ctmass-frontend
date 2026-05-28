const isHttp = (url) => typeof url === 'string' && url.startsWith('http');

/**
 * Resolves the images to render for a portfolio project.
 *
 * Older records stored temporary blob URLs in `beforeImage`/`afterImage`
 * (these die after the browser session). The actual uploaded files still
 * live in the `images` array as permanent Firebase Storage URLs, so we
 * fall back to those when the top-level fields are not usable.
 */
export const resolvePortfolioMedia = (project = {}) => {
    const imageUrls = Array.isArray(project.images)
        ? project.images.map((img) => img?.url).filter(isHttp)
        : [];

    const before = isHttp(project.beforeImage) ? project.beforeImage : null;

    let after = isHttp(project.afterImage) ? project.afterImage : null;
    if (!after) {
        after = imageUrls.length
            ? imageUrls[imageUrls.length - 1]
            : (isHttp(project.thumbnail) ? project.thumbnail : null);
    }

    const single = after || (isHttp(project.thumbnail) ? project.thumbnail : imageUrls[0]) || null;
    const hasBeforeAfter = Boolean(before && after);

    return { before, after, single, hasBeforeAfter };
};
