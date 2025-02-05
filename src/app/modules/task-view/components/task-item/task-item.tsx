import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
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
import { clone } from 'lodash';
import { useDispatch } from 'react-redux';
import { deleteTask, taskViewActions } from 'src/app/shared/store/task-view/task-view.slice';
import { AppDispatch } from 'src/main';

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

const BoardTaskItem: React.FC<Task> = (props) => {
  const { name, id, dueOn, status, category } = props;

  const dispatch = useDispatch<AppDispatch>();

  const onMenuAction = (id: string, action: TaskMenuActions) => {
    switch (action) {
      case TaskMenuActions.EDIT:
        dispatch(taskViewActions.openEditTaskDialog(props))
        break;
      case TaskMenuActions.DELETE:
        dispatch(deleteTask({taskId: id, taskStatus: status}));
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles['board_task_item']}>
      <div className={styles['board_task_item__header']}>
        <div
          className={`${styles['board_task_item__name']} ${
            status === TaskStatus.COMPLETED ? styles['completed'] : ''
          }`}
        >
          {name}
        </div>
        <Menu
          onClick={(value) => onMenuAction(id, value)}
          options={clone(TaskContextMenuItems)}
          id={id as string}
          key={id as string}
          align="end"
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
      {viewType === TaskView.BOARD ? <BoardTaskItem {...task} /> : null}
    </div>
  );
};

export default TaskItem;
