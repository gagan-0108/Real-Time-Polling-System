import { useRef, useState, useEffect } from "react";

export default function useReveal(threshold = 0.1) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVis(true);
                    obs.disconnect();
                }
            },
            { threshold },
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);

    return [ref, vis];
}
// scroll-reveal hook


