import { performance } from 'src/libs/firebase'
import { trace } from 'firebase/performance'

export const startTrace = (name) => {
    const t = trace(performance, name);
    t.start();
    return t;
};