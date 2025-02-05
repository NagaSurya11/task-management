import { Attachment, Task } from "src/app/shared/types";
import { ValidationError } from "yup";

export type TaskDetailsChangeFunction = (value: Task, errors: ValidationError[]) => void;

export interface TaskDetailsProps {
    task: Task;
    onFormValueChange: TaskDetailsChangeFunction;
    attachments?: Attachment[]
}