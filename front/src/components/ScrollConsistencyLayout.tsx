import React, { useEffect } from 'react';

/**
 * Keeps the horizontal layout stable between pages by always reserving the
 * scrollbar gutter, so navigating from a short page to a long one doesn't
 * shift content sideways.
 *
 * This used to also pad the body by the measured scrollbar width and cap the
 * wrapper at `100vw - scrollbarWidth`. With `overflow-y: scroll` the gutter is
 * already reserved, so that padding was double-counting - and it left a strip
 * of page background down the right edge of any full-bleed section.
 */
export default function ScrollConsistencyLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const previousOverflowY = document.body.style.overflowY;
        document.body.style.overflowY = 'scroll';

        return () => {
            document.body.style.overflowY = previousOverflowY;
        };
    }, []);

    return <>{children}</>;
}
