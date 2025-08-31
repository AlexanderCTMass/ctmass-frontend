import { useCallback, useState } from "react";
import { useWindowScroll } from "src/hooks/use-window-scroll";


const useElevateComponent = (offset, delay) => {
    const [elevate, setElevate] = useState(false);

    const handleWindowScroll = useCallback(() => {
        if (window.scrollY > offset) {
            setElevate(true);
        } else {
            setElevate(false);
        }
    }, []);

    useWindowScroll({
        handler: handleWindowScroll,
        delay
    });

    return elevate;
}

export default useElevateComponent;
