import { Close, Content, Overlay, Portal, Root, Title, Trigger } from "@radix-ui/react-dialog";
import React, { useCallback } from "react";
import Icon from "src/app/shared/components/icon/icon";
import { Icons } from "src/app/shared/types";
import styles from './dialog-container.module.css';
import Button from "src/app/shared/components/button/button";



interface DialogConainerProps {
    title: string;
    children: React.ReactNode;
    id: string;
    onConfirm: () => void;
    canConfirm?: boolean;
    errorReason?: string;
    onCancel: () => void;
    open: boolean;
    trigger?: React.ReactNode;
    openDialog?: () => void;
    confirmText: string;
}

export const DialogContainer: React.FC<DialogConainerProps> = (props) => {


    const handleInteractOutside = useCallback((event: Event) => {
        event.preventDefault();
    }, []);

    const handleEscapeKeyDown = useCallback((event: Event) => {
        event.preventDefault();
    }, []);

    return (
        <Root open={props.open}>
            {props.openDialog && props.trigger &&
                <Trigger asChild onClick={props.openDialog} children={props.trigger} />
            }
            <Portal>
                <Overlay className={styles['dialog_overlay']} />
                <Title hidden />
                <Content className={styles['dialog_container']} onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleEscapeKeyDown} >
                    <div className={styles['dialog_container__header']}>
                        <div className={styles['dialog_container__header__title']}>{props.title}</div>
                        <Close onClick={props.onCancel} className={styles['dialog_container__header__close']}>
                            <Icon key={'create_task_dialog_close'} height={24} width={24} icon={Icons.CLOSE_OUTLINE} />
                        </Close>
                    </div>
                    <div className={styles['dialog_container___body']}>{props.children}</div>
                    <div className={styles['dialog_container___footer']}>
                        <Button toolTip={props.errorReason} disabled={props.canConfirm} text={props.confirmText} type="filled" key={'dialog_confirm_' + props.id} onClick={props.onConfirm} />
                        <Close onClick={props.onCancel} asChild>
                            <Button text="CANCEL" type="outlined" key={'dialog_cancel_' + props.id} />
                        </Close>
                    </div>
                </Content>
            </Portal>
        </Root>
    )
}