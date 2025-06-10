import {forwardRef} from 'react';
import {Link} from 'react-router-dom';

/**
 * This is an adapted for `react-router-dom/link` component.
 * We use this to help us maintain consistency between CRA and Next.js
 */
export const RouterLink = forwardRef((props, ref) => {
    const {href, scrollUp = false, ...other} = props;
    const handleClick = () => {
        if (scrollUp) {
            window.scrollTo(0, 0);
        }
    };
    return (
        <Link
            ref={ref}
            to={href}
            onClick={handleClick}
            {...other} />
    );
});
