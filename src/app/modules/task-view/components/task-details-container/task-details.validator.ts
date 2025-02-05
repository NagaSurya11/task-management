import { Category, TaskStatus } from 'src/app/shared/types';
import * as Yup from 'yup';

export const taskValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3),
  description: Yup.string()
    .optional()
    .max(300, 'Description must be at most 300 characters'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(Object.values(Category), 'Invalid category'),
  dueDate: Yup.date()
    .required('Due date is required'),
  taskStatus: Yup.string()
    .required('Task status is required')
    .oneOf(Object.values(TaskStatus), 'Invalid task status'),
  attachments: Yup.array()
    .optional()
});
