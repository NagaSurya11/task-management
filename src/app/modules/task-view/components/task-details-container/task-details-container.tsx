import React, { useCallback, useRef, useState, useEffect } from "react";
import * as Yup from 'yup';
import { Attachment, base64ToFile, Categories, Icons, TaskStatus } from "src/app/shared/types";
import styles from './task-details-container.module.css';
import Icon from "src/app/shared/components/icon/icon";
import Editor from "src/app/shared/components/text-editor/text-editor";
import Quill, { Delta } from "quill";
import { cloneDeep, isEqual, result } from "lodash";
import Button from "src/app/shared/components/button/button";
import CustomDatePicker from "src/app/shared/components/date-picker/date-picker";
import Menu from "src/app/shared/components/menu/menu";
import { useDropzone } from "react-dropzone";
import { FileIcon, defaultStyles } from "react-file-icon";
import { taskValidationSchema } from "./task-details.validator";
import { TaskDetailsProps } from "../../types";
import { v4 } from "uuid";
import { useSelector } from "react-redux";
import { selectEditTaskDialogState } from "src/app/shared/store/task-view/task-view.slice";

export const TaskDetailsContainer: React.FC<TaskDetailsProps> = (props) => {
    const [title, setTitle] = useState(props.task.name);
    const [description, setDescription] = useState<Delta>(new Delta(props.task.description) ?? new Delta());
    const [category, setCategory] = useState(props.task.category);
    const [dueDate, setDueDate] = useState<Date | null>(props.task.dueOn.length > 0 ? new Date(props.task.dueOn) : null);
    const [datePickerState, changeDatePickerState] = useState(false);
    const [taskStatus, setTaskStatus] = useState<TaskStatus>(props.task.status);

    const dialogState = useSelector(selectEditTaskDialogState);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    useEffect(() => {
        if (dialogState?.attachments) {
          setAttachments(dialogState.attachments.map(base64ToFile));
        }
      }, [dialogState?.attachments]);

    const quillRef = useRef<Quill>(null);

    const validateForm = useCallback(async () => {
        let isValid = false;
        let validationErrors: Yup.ValidationError[] = [];
        try {
            await taskValidationSchema.validate({
                title,
                description: quillRef.current?.getText().trim() || '',
                category,
                dueDate,
                taskStatus,
                attachments,
            }, {abortEarly: false});
            isValid = true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                validationErrors = err.inner;
            }
        }
        props.onFormValueChange({
            category: category,
            dueOn: dueDate?.toDateString() ?? '',
            id: props.task.id,
            name: title,
            status: taskStatus,
            attachments: attachments,
            description: description.ops
        }, validationErrors);
        return isValid;
    }, [title, description, category, dueDate, taskStatus, attachments]);

    useEffect(() => {
        validateForm();
    }, [title, description, category, dueDate, taskStatus, attachments, validateForm]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setAttachments((prevFiles) => [...prevFiles, ...(acceptedFiles.map(file => ({id: v4(), file})))]);
    }, []);

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        maxSize: 500 * 1024, // 500 KB in bytes
    });

    const taskStatusMenuOptions = Object.values(TaskStatus).map((value => ({ label: String(value), value })));

    const onRemoveAttachment = useCallback((value: Attachment) => {
        setAttachments((attachments) => {
            return attachments.filter(attachment => !isEqual(attachment.id, value.id));
        });
    }, [attachments]);

    return (
        <div className={styles['task_details_container']}>
            <input
                className={styles['task_details_container__title']}
                type="text"
                name="task_details_container__title"
                placeholder="Task title"
                id="task_details_container__title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div className={styles['task_details_container__description']}>
                <div className={styles['task_details_container__description__placeholder']}>
                    <Icon height={16} width={16} icon={Icons.TASK_LIST_OUTLINE} />
                    Description
                </div>
                <Editor
                    ref={quillRef}
                    defaultValue={description}
                    onTextChange={setDescription}
                />
                <div className={styles['task_details_container__description__characters_length']}>
                    {quillRef.current?.getText().trim().length ?? 0} / 300 characters
                </div>
            </div>

            <div className={styles['task_details_container__cds']}>
                <div className={styles['task_details_container__cds__task_category']}>
                    <div className={styles['task_details_container__cds__task_category__label']}>
                        Task Category*
                    </div>
                    <div className={styles['task_details_container__cds__task_category__btn_container']}>
                        {cloneDeep(Categories).map(({ label, value }) => (
                            <Button key={value} xs onClick={() => setCategory(value)} text={label} type={category === value ? 'filled' : 'outlined'} />
                        ))}
                    </div>
                </div>
                <div className={styles['task_details_container__cds__due_on']}>
                    <div className={styles['task_details_container__cds__due_on__label']}>
                        Due On*
                    </div>
                    <CustomDatePicker selected={dueDate ? dueDate.toDateString() : new Date().toDateString()} onChange={setDueDate} open={datePickerState} container={<div className={`${styles['task_details_container__cds__due_on_date_btn']} ${!!dueDate ? styles['active'] : ''}`}
                        onClick={() => changeDatePickerState(true)}>
                        {!!dueDate ? dueDate.toDateString().substring(4) : 'MMM DD YYYY'}
                        <Icon icon={Icons.CALENDER_SHARP} height={18} width={18} />
                    </div>} />
                </div>

                <div className={styles['task_details_container__cds__status']}>
                    <div className={styles['task_details_container__cds__status__label']}>
                        Task Status*
                    </div>
                    <Menu id='task_details_container__cds__status__menu' key={'task_details_container__cds__status__menu'} align='center' onClick={setTaskStatus} options={taskStatusMenuOptions}>
                        <div className={`${styles['task_details_container__cds__status_btn']} ${!!taskStatus ? styles['active'] : ''}`}>
                            {!!taskStatus ? taskStatus : 'Choose'}
                            <Icon icon={Icons.CHEVRON_DOWN_OUTLINE} height={18} width={18} />
                        </div>
                    </Menu>
                </div>
            </div>

            <div className={styles["task_details_container__attachment_container"]}>
                <div className={styles['task_details_container__attachment__label']}>
                    Attachment
                </div>
                <div className={styles["task_details_container__attachment_container__drag_drop_container"]}
                    {...getRootProps()}
                >
                    <input {...getInputProps()} />
                    <div className={styles["task_details_container__attachment_container__drag_drop_container__text"]}>
                    Drop your files here or
                        <button
                            type="button"
                            onClick={open}
                            className={styles["task_details_container__attachment_container__drag_drop_container__upload_btn"]}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles['task_details_container__attachments_list']}>
                {attachments.map(attachment => {
                    const extension = attachment.file.name.split('.').pop() ?? '.png';
                    return (
                        <div key={attachment.file.name + attachment.file.size} className={styles['task_details_container__attachments_list__item']}>
                            <a
                                href={URL.createObjectURL(attachment.file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                <FileIcon {...defaultStyles[extension as keyof typeof defaultStyles]} extension={extension} />
                                <div className={styles['task_details_container__attachments_list__item__file_name']}>{attachment.file.name}</div>
                            </a>
                            <Icon onClick={() => onRemoveAttachment(attachment)} className={styles['close_outline']} width={24} height={24} icon={Icons.CLOSE_OUTLINE} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}