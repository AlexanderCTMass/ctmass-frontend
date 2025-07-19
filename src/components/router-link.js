import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export const RouterLink = forwardRef((props, ref) => {
    const {
        href,
        scrollUp = true, // Делаем true по умолчанию для единообразия
        onClick,
        ...other
    } = props;

    const handleClick = (e) => {
        if (scrollUp) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Добавляем плавный скролл
            });
        }
        onClick?.(e);
    };

    return (
        <Link
            ref={ref}
            to={href}
            onClick={handleClick}
            {...other}
        />
    );
});