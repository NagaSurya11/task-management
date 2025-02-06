import React, { ReactNode, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkForAuth, initAuth, selectAuthIsLoading, selectUserId } from "src/app/shared/store/auth/auth.slice";
import { AppDispatch } from "src/main";
import styles from './auth.module.css';
import Icon from "src/app/shared/components/icon/icon";
import { Icons } from "src/app/shared/types";
import { Loader } from "src/app/shared/components/loader/loader";

export const AuthProvider: React.FC<{ children: ReactNode }> = (props) => {

    const userId = useSelector(selectUserId);
    const isLoading = useSelector(selectAuthIsLoading);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(checkForAuth());
    }, []);


    const handleGoogleLogin = useCallback(() => {
        dispatch(initAuth());
    }, [])
    if (isLoading) {
        return <Loader showLoader />
    } else {
        return (
            <>
                {!userId ?
                    <div className={styles['auth_container']}>
                        <div className={styles['app_info_container']}>
                            <div className={styles['app_info_sub_container']}>
                                <div className={styles['auth__task_buddy']}>
                                    <Icon icon={Icons.TASK_SHARP} width={33} height={33}></Icon>
                                    <div className={styles['auth__task_buddy__title']}>TaskBuddy</div>
                                </div>
                                <div className={styles['auth__task_buddy__description']}>
                                    Streamline your workflow and track progress effortlessly with our all-in-one task management app.
                                </div>
                                <button onClick={handleGoogleLogin} className={styles['auth__google_login_btn']}>
                                    <Icon icon={Icons.GOOGLE_SHARP} width={21} height={21} />
                                    Continue with Google
                                </button>
                            </div>
                        </div>
                        <div className={styles['task_info_container']}>
                            <div className={styles['task_info_container__circle_1']}>
                                <div className={styles['task_info_container__circle_2']}>
                                    <div className={styles['task_info_container__circle_3']}>
                                    </div>
                                </div>
                            </div>
                            <img className={styles['task_info_container__list_view_image']} src="assets/images/task_list_view.svg" />
                        </div>

                    </div> : props.children}
            </>
        )
    }
}