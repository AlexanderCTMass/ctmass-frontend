import toast from 'react-hot-toast';

// Called by the service worker registration when a new version is installed and
// waiting. Shows a persistent toast; on accept we activate the new SW and reload.
export function promptUserToUpdate(registration) {
    const waiting = registration.waiting;
    if (!waiting) {
        return;
    }

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) {
            return;
        }
        reloaded = true;
        window.location.reload();
    });

    toast(
        (t) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                A new version is available.
                <button
                    type="button"
                    onClick={() => {
                        waiting.postMessage({ type: 'SKIP_WAITING' });
                        toast.dismiss(t.id);
                    }}
                    style={{
                        border: 0,
                        borderRadius: 8,
                        padding: '6px 14px',
                        background: '#16B364',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </span>
        ),
        { duration: Infinity, id: 'pwa-update' }
    );
}
