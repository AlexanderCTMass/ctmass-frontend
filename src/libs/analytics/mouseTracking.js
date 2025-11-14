let throttleTimeout = null;

export const enableMouseTracking = (cb, throttle = 200) => {
    const handler = (e) => {
        if (throttleTimeout) return;

        throttleTimeout = setTimeout(() => {
            cb({
                x: e.clientX,
                y: e.clientY,
                t: performance.now()
            });
            throttleTimeout = null;
        }, throttle);
    };

    document.addEventListener('mousemove', handler, { passive: true });

    return () => document.removeEventListener('mousemove', handler, { passive: true });
};

// export const enableMouseTracking = (cb) => {
//     document.addEventListener("mousemove", (e) => {
//         if (throttleTimeout) return;

//         throttleTimeout = setTimeout(() => {
//             cb({
//                 x: e.clientX,
//                 y: e.clientY,
//                 t: performance.now(),
//             });
//             throttleTimeout = null;
//         }, 200);
//     });
// };