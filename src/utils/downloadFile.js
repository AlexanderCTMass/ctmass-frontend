export async function downloadFile(url, filename = 'file') {
    try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(res.statusText);

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(blobUrl);
        a.remove();
    } catch (e) {
        console.error('Download failed', e);
        alert('Cannot download file');
    }
}