import { Icons } from "../enums/icons.enum";
import { TaskView } from "../enums/task-view.enum";

export const navList = [
    {
        icon: Icons.LIST_OUTLINE,
        name: 'List',
        id: TaskView.LIST
    },
    {
        icon: Icons.BOARD_OUTLINE,
        name: 'Board',
        id: TaskView.BOARD
    },
];