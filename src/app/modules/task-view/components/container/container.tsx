import React, { useCallback } from "react";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import TaskItem from "../task-item/task-item";
import { Task, TaskStatus, TaskView } from "src/app/shared/types";
import styles from "./container.module.css";
import { useSelector } from "react-redux";
import { selectTaskViewIsLoading } from "src/app/shared/store/task-view/task-view.slice";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

export interface TaskContainerProps {
    id: string;
    tasks: Task[];
    viewtype: TaskView;
}

export const TaskContainer: React.FC<TaskContainerProps> = (props) => {
    const isLoading = useSelector(selectTaskViewIsLoading);
    const { id, tasks, viewtype } = props;

    const { setNodeRef } = useDroppable({
        id
    });

    const getStatusMessage = useCallback((taskStatus: TaskStatus) => {
        switch (taskStatus) {
            case TaskStatus.TODO:
                return 'No Tasks in To-Do';
            case TaskStatus.IN_PROGRESS:
                return 'No Tasks In Progress';
            case TaskStatus.COMPLETED:
                return 'No Completed Tasks';
        }
    }, [])

    return (
        <div ref={setNodeRef} className={styles["task_container"]}>
            <div className={`${styles["task_container_title"]} ${styles[id]}`}>{id}</div>
            <div className={styles["task_container_list"]}>
                <SortableContext
                    id={id}
                    items={tasks.map((task) => task.id)}
                    strategy={viewtype === TaskView.BOARD ? verticalListSortingStrategy : horizontalListSortingStrategy}
                >
                    {isLoading && <Skeleton className={`${styles['task_loader']} ${styles[TaskView.BOARD]}`} count={3} />}
                    {!isLoading && (!tasks || tasks.length === 0) && <div className={styles['no_task_message']}>{getStatusMessage(id as TaskStatus)}</div>}
                    {tasks.map((task) => (
                        <TaskItem key={task.id} task={task} viewType={viewtype} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
