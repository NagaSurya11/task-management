import React, { useCallback, useState } from "react";
import { DialogContainer } from "src/app/shared/components/dialog-container/dialog-container";
import { TaskDetailsContainer } from "../task-details-container/task-details-container";
import { Category, Task, TaskStatus } from "src/app/shared/types";
import { ValidationError } from "yup";
import { v4 } from 'uuid';
import { useDispatch, useSelector } from "react-redux";
import { createTask, selectCreateTaskDialogState, taskViewActions } from "src/app/shared/store/task-view/task-view.slice";
import { AppDispatch } from "src/main";

export const CreateTaskDialog: React.FC<{ children: React.ReactNode }> = (props) => {

    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [task, setTask] = useState<Task>();
        
    const dialogState = useSelector(selectCreateTaskDialogState);

    const dispatch = useDispatch<AppDispatch>();

    const handleConfirm = useCallback(() => {
        if (!!task) {
            dispatch(createTask({task}));
        } else {
            console.error('Error in creating task', task);
        }
    }, [task])

    const handleCancel = useCallback(() => {
        dispatch(taskViewActions.closeCreateTaskDialog());
    }, [])

    const handleOpenDialog = useCallback(() => {
        dispatch(taskViewActions.openCreateTaskDialog())
    }, []);

    const onFormValueChange = useCallback((value: Task, errors: ValidationError[]) => {
        setTask(value);
        setErrors(errors);
    }, []);

    return (
        <DialogContainer id="create_task" confirmText="CREATE" errorReason={dialogState?.isLoading ? 'Creating Task...' : errors?.length > 0 ? errors[0].errors[0] : undefined} openDialog={handleOpenDialog} trigger={props.children} open={dialogState?.open ?? false} onCancel={handleCancel} onConfirm={handleConfirm} canConfirm={dialogState?.isLoading ?? (!!errors && errors.length > 0)} title="Create Task" key={'create_task_dialog'}>
            <TaskDetailsContainer attachments={[]} onFormValueChange={onFormValueChange} task={{ id: v4(), name: '', category: Category.WORK, status: TaskStatus.TODO, dueOn: '' }} />
        </DialogContainer>
    )
}