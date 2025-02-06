import { TaskStatus } from "../enums/task-status.enum";
import { MenuOptions } from "../interfaces/menu.props";

export const TaskStatusMenuOptions: MenuOptions<TaskStatus> = [
  {
    label: TaskStatus.TODO,
    value: TaskStatus.TODO
  },
  {
    label: TaskStatus.IN_PROGRESS,
    value: TaskStatus.IN_PROGRESS
  },
  {
    label: TaskStatus.COMPLETED,
    value: TaskStatus.COMPLETED
  }
];
