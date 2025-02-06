import { TaskColumn } from "../enums/task-column.enum";

export enum SortType {
    ASC = 'ASC',
    DESC = 'DESC'
}

export interface Sort {
    column: TaskColumn;
    type: SortType;
}
