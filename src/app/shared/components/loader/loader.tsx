import styles from './loader.module.css';

export const Loader: React.FC<{ showLoader?: boolean }> = ({ showLoader }) => {
    return (
        <>
            {showLoader && <div className={styles["loader-overlay"]}>

                <div className={styles["spinner"]}></div>

            </div>}
        </>

    )
}