import React from 'react';
import styles from './LoadingSpinner.module.css'; // Стили для спиннера

const LoadingSpinner = () => {
    return (
        <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;