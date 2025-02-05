import { UniqueIdentifier } from "@dnd-kit/core";
import { Category } from "../enums/category.enum";
import { TaskStatus } from "../enums/task-status.enum";
import { Op } from "quill";

export interface Activity {
    name: string;
    date: string; // date-string
}

export interface Attachment {
    id: string;
    file: File;
}

export interface Task {
    id: string;
    name: string;
    description?: Op[] | {
        ops: Op[];
    };
    category: Category; // WORK | PERSONAL
    status: TaskStatus; // TO-DO | IN-PROGRESS | COMPLETED
    dueOn: string;
    attachments?: Attachment[];
    activity?: Activity[]
}