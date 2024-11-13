import React, { useEffect, useState } from 'react';

export default function ScrollConsistencyLayout({ children }: { children: React.ReactNode }) {
    const [scrollbarWidth, setScrollbarWidth] = useState(0);

    useEffect(() => {
        // Calculate scrollbar width
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        setScrollbarWidth(scrollbarWidth);

        document.body.removeChild(outer);

        // Apply padding to body
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflowY = 'scroll';

        return () => {
            // Cleanup
            document.body.style.paddingRight = '';
            document.body.style.overflowY = '';
        };
    }, []);

    return (
        <div style={{
            maxWidth: `calc(100vw - ${scrollbarWidth}px)`,
            margin: '0 auto',
        }}>
            {children}
        </div>
    );
}