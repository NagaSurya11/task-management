import React, { useCallback, useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  dateToActivityEventDisplayFormat,
  Icons,
  MenuOptions,
  MenuProps,
  Task,
  TaskStatus,
  TaskView,
} from 'src/app/shared/types';
import styles from './task-item.module.css';
import Icon from 'src/app/shared/components/icon/icon';
import Menu from 'src/app/shared/components/menu/menu';
import { clone, cloneDeep, isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, editTask, selectSelectedTasks, taskViewActions } from 'src/app/shared/store/task-view/task-view.slice';
import { AppDispatch } from 'src/main';
import Checkbox from 'src/app/shared/components/checkbox/check-box';
import { TaskStatusMenuOptions } from 'src/app/shared/types/constants/task-status-menu-options';

export interface TaskItemProps {
  task: Task;
  viewType: TaskView;
  placeholder?: boolean;
}

export enum TaskMenuActions {
  EDIT = 'edit',
  DELETE = 'delete'
}

export const TaskContextMenuItems: MenuOptions<TaskMenuActions> = [
  { label: 'Edit', value: TaskMenuActions.EDIT, icon: Icons.EDIT_SHARP },
  { label: 'Delete', value: TaskMenuActions.DELETE, warn: true, icon: Icons.DELETE_SHARP },
];

const CategoryContextMenuComponent: React.FC<Task> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id, status } = props;

  const onMenuAction = (id: string, action: TaskMenuActions) => {
    switch (action) {
      case TaskMenuActions.EDIT:
        dispatch(taskViewActions.openEditTaskDialog(props))
        break;
      case TaskMenuActions.DELETE:
        dispatch(deleteTask({ taskId: id, taskStatus: status }));
        break;
      default:
        break;
    }
  };

  return (
    <Menu
      onClick={(value) => onMenuAction(id, value)}
      options={clone(TaskContextMenuItems)}
      id={id as string}
      key={id as string}
      align="end"
      type='primary'
    >
      <div>
        <Icon
          className={styles['board_task_item__context_menu_icon']}
          icon={Icons.ELLIPSIS_OUTLINE}
          height={16}
          width={16}
        />
      </div>
    </Menu>
  );

}

const BoardTaskItem: React.FC<Task> = (props) => {
  const { name, id, dueOn, status, category } = props;
  return (
    <div className={styles['board_task_item']}>
      <div className={styles['board_task_item__header']}>
        <div
          className={`${styles['board_task_item__name']} ${status === TaskStatus.COMPLETED ? styles['completed'] : ''
            }`}
        >
          {name}
        </div>
        <CategoryContextMenuComponent {...props} />
      </div>
      <div className={styles['board_task_item__footer']}>
        <div className={styles['board_task_item__category']}>{category}</div>
        <div className={styles['board_task_item__date']}>
          {dueOn}
        </div>
      </div>
    </div>
  );
};

const ListTaskItem: React.FC<Task> = (props) => {

  const { category, dueOn, id, name, status, activity } = props;
  const checked = useSelector(selectSelectedTasks).ids[id];

  const dispatch = useDispatch<AppDispatch>();

  const statusIcon = useMemo(() => isEqual(status, TaskStatus.COMPLETED) ? Icons.CHECKED_CIRCLE_SHARP : Icons.UN_CHECKED_CIRCLE_SHARP, [status]);

  const handleTaskStatusChange = useCallback((option: TaskStatus) => {
    if (!isEqual(option, status)) {
      const newActivity = cloneDeep(activity) ?? [];
      newActivity.push({
        date: dateToActivityEventDisplayFormat(new Date()),
        name: `You changed status from ${String(status).toLowerCase().replace('-', ' ')} to ${String(option).toLowerCase().replace('-', ' ')}`
      })
      dispatch(editTask({ isSilentUpdate: true, changeOrder: true, previousStatus: status, task: { ...props, status: option, activity: newActivity } }));
    }
  }, [status]);

  const isCompleted = useMemo(() => isEqual(status, TaskStatus.COMPLETED) ? 'completed' : '', []);
  const changeChecked = useCallback(() => dispatch(taskViewActions.selectOrDeselectTask(id)), [id]);

  return (
    <div className={styles['task_list_item']}>
      <div className={`${styles['task_list_item__name']} ${styles[isCompleted]}`}>
        <Checkbox id={id} checked={checked} onClick={changeChecked} />
        <Icon icon={Icons.DRAG_OUTLINE} height={15} width={21} />
        <Icon icon={statusIcon} height={20} width={20} />
        {name}
      </div>
      <div className={styles["task_list_item__dueOn"]}>{dueOn}</div>
      <div className={styles["task_list_item__status"]}>
        <Menu id='task_list_item__status' align='center' options={clone(TaskStatusMenuOptions)} onClick={handleTaskStatusChange} type='primary'>
          <div className={styles['task_list_item__status__btn']}>{status}</div>
        </Menu>
      </div>

      <div className={styles["task_list_item__category"]}>
        {category}
        <CategoryContextMenuComponent {...props} />
      </div>
    </div>
  )
}

const TaskItem: React.FC<TaskItemProps> = (props) => {
  const { task, viewType } = props;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    margin: viewType === TaskView.BOARD ? '10px' : '0 8px 8px 0',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {viewType === TaskView.BOARD ? <BoardTaskItem {...task} /> :

        <ListTaskItem {...task} />}
    </div>
  );
};

export default TaskItem;
