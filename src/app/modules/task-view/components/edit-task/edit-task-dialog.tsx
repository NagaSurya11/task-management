import React, { useCallback, useEffect, useState } from "react";
import { DialogContainer } from "src/app/shared/components/dialog-container/dialog-container";
import { TaskDetailsContainer } from "../task-details-container/task-details-container";
import { Attachment, base64ToFile, Category, dateToActivityEventDisplayFormat, Task, TaskStatus } from "src/app/shared/types";
import { ValidationError } from "yup";
import { useDispatch, useSelector } from "react-redux";
import { editTask, fetchAttachments, selectEditTaskDialogState, taskViewActions } from "src/app/shared/store/task-view/task-view.slice";
import styles from './edit-task-dialog.module.css';
import { cloneDeep, isEqual } from "lodash";
import { AppDispatch } from "src/main";

export const EditTaskDialog: React.FC = () => {

    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [task, setTask] = useState<Task>();

    const dialogState = useSelector(selectEditTaskDialogState);

    const dispatch = useDispatch<AppDispatch>();

    const [attachments, setAttachments] = useState<Attachment[]>();

    useEffect(() => {
        if (dialogState?.attachments) {
            setAttachments(dialogState.attachments.map(base64ToFile));
        }
    }, [dialogState?.attachments]);

    const handleConfirm = useCallback(() => {
        if (!!task) {
            const previousTask = cloneDeep(dialogState?.task);
            const currentTask = cloneDeep(task);

            const activity = previousTask?.activity ?? [];

            if (!isEqual(previousTask?.name, currentTask.name)) {
                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: 'You have updated the title'
                });
            }

            if (!isEqual(previousTask?.description, currentTask.description)) {
                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: 'You have updated the description'
                });
            }

            if (!isEqual(previousTask?.category, currentTask.category)) {
                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: 'You have updated the category'
                });
            }

            if (!isEqual(previousTask?.dueOn, currentTask.dueOn)) {
                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: 'You have updated the due date'
                });
            }

            if (!isEqual(previousTask?.status, currentTask.status)) {
                const previousStatus = previousTask?.status;
                const currentStatus = currentTask.status;
                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: `You changed status from ${String(previousStatus).toLowerCase().replace('-', ' ')} to ${String(currentStatus).toLowerCase().replace('-', ' ')}`
                });
            }

            if (!isEqual(previousTask?.attachments, currentTask.attachments)) {

                activity.push({
                    date: dateToActivityEventDisplayFormat(new Date()),
                    name: 'You have added or removed attachment'
                });
            }

            const modifiedTask = cloneDeep(task);
            modifiedTask.activity = activity;

            dispatch(editTask({ task: modifiedTask, previousStatus: dialogState?.task.status }))

        } else {
            // console.error('Error in creating task', task);
        }
    }, [task])

    const handleCancel = useCallback(() => {
        dispatch(taskViewActions.closeEditTaskDialog());
    }, [])

    const onFormValueChange = useCallback((value: Task, errors: ValidationError[]) => {
        setTask(value);
        setErrors(errors);
    }, []);

    useEffect(() => {
        const task = dialogState?.task;
        if (task) {
            dispatch(fetchAttachments({ taskId: task.id }))
        }
    }, [dialogState?.task])

    return (
        <DialogContainer id="edit_task" confirmText="UPDATE" errorReason={errors?.length > 0 ? errors[0].errors[0] : undefined} open={dialogState?.open ?? false} onCancel={handleCancel} onConfirm={handleConfirm} canConfirm={dialogState?.isLoading ?? (!!errors && errors.length > 0)} title="" key={'edit_task_dialog'}>
            {!!dialogState?.task ?
                <div className={styles['edit_dialog_container']}>
                    <TaskDetailsContainer onFormValueChange={onFormValueChange} task={dialogState.task} attachments={attachments} />
                    <div className={styles['edit_dialog_container___activity_section']}>
                        <div className={styles['edit_dialog_container___activity_section__title']}>Activity</div>
                        <div className={styles['edit_dialog_container___activity_section__list']}>
                            {dialogState?.task?.activity?.map(activity => (
                                <div className={styles['edit_dialog_container___activity_section__list__item']}>
                                    <div className={styles['edit_dialog_container___activity_section__list__item__name']}>{activity.name}</div>
                                    <div className={styles['edit_dialog_container___activity_section__list__item__date']}>{activity.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                :
                <>Error!</>
            }
        </DialogContainer>
    )
}