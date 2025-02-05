import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attachment, base64ToFile, Category, dateToActivityEventDisplayFormat, EncodedFile, fileToBase64, IResponse, ResponseMessage, Task, TaskStatus, TaskView } from '../../types';
import { TaskData } from 'src/app/modules/task-view/task-view';
import { UniqueIdentifier } from '@dnd-kit/core';
import { cloneDeep, isEqual } from 'lodash';
import { auth, db } from 'src/app/modules/auth/auth.config';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDocs, deleteDoc, writeBatch } from "firebase/firestore";

export const TASK_VIEW_FEATURE_KEY = 'taskView';

export interface TaskViewState {
  viewType: TaskView;
  category?: Category;
  date?: string;
  taskData: TaskData;
  errors?: string;
  isLoading?: boolean;
  searchTerm?: string;
  createTaskDialogState?: {
    open: boolean;
    isLoading?: boolean;
    error?: string;
  };
  editTaskDialogState?: {
    open: boolean;
    isLoading?: boolean;
    error?: string;
    task: Task;
    attachments?: EncodedFile[];
    isFetchingAttachments?: boolean;
  }
}

export const initialTaskViewState: TaskViewState = {
  viewType: TaskView.BOARD, // Default view type
  taskData: [
    { id: TaskStatus.TODO, tasks: [] },
    { id: TaskStatus.IN_PROGRESS, tasks: [] },
    { id: TaskStatus.COMPLETED, tasks: [] }
  ],
  isLoading: true
};

export const fetchTasks = createAsyncThunk(`${TASK_VIEW_FEATURE_KEY}/fetchTasks`, () => {
  return new Promise<IResponse<TaskData>>(async resolve => {
    const tasksMap: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.COMPLETED]: []
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        resolve({ status: false, value: [], error: ResponseMessage.NOT_AUTHENTICATED });
        return;
      }

      const taskDataQuery = collection(db, 'users', user.uid, 'tasks');
      const querySnapShot = await getDocs(taskDataQuery);
      querySnapShot.docs.forEach(doc => {
        const task = doc.data() as Task;
        tasksMap[task.status].push(task);
      })
      resolve({
        status: true, value: [
          {
            id: TaskStatus.TODO,
            tasks: tasksMap[TaskStatus.TODO]
          },
          {
            id: TaskStatus.IN_PROGRESS,
            tasks: tasksMap[TaskStatus.IN_PROGRESS]
          },
          {
            id: TaskStatus.COMPLETED,
            tasks: tasksMap[TaskStatus.COMPLETED]
          }
        ]
      });
    } catch (error) {
      console.error(error);
      resolve({ status: false, value: [], error: ResponseMessage.INTERNAL_SERVER_ERROR });
    }
  })
});

export const deleteTask = createAsyncThunk(`${TASK_VIEW_FEATURE_KEY}/deleteTask`, ({ taskId, taskStatus }: { taskId: string, taskStatus: TaskStatus }) => {
  return new Promise<IResponse>(async resolve => {
    try {
      const user = auth.currentUser;
      if (!user) {
        resolve({ status: false, error: ResponseMessage.NOT_AUTHENTICATED });
        return;
      }
      const queryRef = collection(db, 'users', user.uid, 'tasks');
      const taskDocument = doc(queryRef, taskId);
      await deleteDoc(taskDocument);
      resolve({ status: true });
    } catch (error) {
      console.error(error);
      resolve({ status: false, error: ResponseMessage.INTERNAL_SERVER_ERROR });
    }
  })
});

export const createTask = createAsyncThunk(`${TASK_VIEW_FEATURE_KEY}/addTask`, ({ task }: { task: Task }) => {
  return new Promise<IResponse>(async resolve => {
    try {
      const user = auth.currentUser;
      if (!user) {
        resolve({ status: false, error: ResponseMessage.NOT_AUTHENTICATED });
        return
      }

      const userRef = doc(db, "users", user.uid);
      const tasksCollectionRef = collection(userRef, "tasks");

      try {
        const newTaskRef = doc(tasksCollectionRef, task.id); // Creates a new document ID in the tasks subcollection
        if (!!task.attachments && task.attachments.length > 0) {
          const attachmentsCollectionRef = collection(newTaskRef, "attachments");
          for (const attachment of task.attachments) {
            const attachmentRef = doc(attachmentsCollectionRef, attachment.id);
            await setDoc(attachmentRef, await fileToBase64(attachment));
          }
        }
        delete task.attachments;
        await setDoc(newTaskRef, task);
        resolve({ status: true });
      } catch (error) {
        console.error(error);
        resolve({ status: false, error: ResponseMessage.INTERNAL_SERVER_ERROR });
      }

      resolve({ status: true });
    } catch (error) {
      resolve({ status: false });
      console.error(error);
    }
  })
});

export const editTask = createAsyncThunk(`${TASK_VIEW_FEATURE_KEY}/editTask`, (editTaskInput: { task: Task, isSilentUpdate?: boolean, previousStatus?: TaskStatus }) => {
  return new Promise<IResponse>(async resolve => {
    try {
      const user = auth.currentUser;
      if (!user) {
        resolve({ status: false, error: ResponseMessage.NOT_AUTHENTICATED });
        return;
      }
      const { task } = editTaskInput;

      const attachments: EncodedFile[] = [];
      if (!!task.attachments && task.attachments.length > 0) {
        for (const attachment of task.attachments) {
          attachments.push(await fileToBase64(attachment));
        }
      }
      delete task.attachments;

      const queryRef = collection(db, 'users', user.uid, 'tasks');
      const taskDocument = doc(queryRef, task.id);

      const batch = writeBatch(db);
      batch.set(taskDocument, task);

      if (!editTaskInput.isSilentUpdate) {
        const attachmentsCollectionRef = collection(taskDocument, "attachments");
        const existingAttachments = (await getDocs(attachmentsCollectionRef)).docs;
        const currentAttachmentIds = new Set(attachments.map(attachment => attachment.fileId));
        const existingAttachmentIds = new Set(existingAttachments.map(document => document.id));

        existingAttachments
          .filter(document => !currentAttachmentIds.has(document.id))
          .forEach(document => {
            batch.delete(doc(attachmentsCollectionRef, document.id));
          })


        attachments
          .filter(attachment => !existingAttachmentIds.has(attachment.fileId))
          .forEach(attachment => {
            batch.set(doc(attachmentsCollectionRef, attachment.fileId), attachment);
          });

      }

      await batch.commit();
      resolve({ status: true });
    } catch (error) {
      console.error(error);
      resolve({ status: false, error: ResponseMessage.INTERNAL_SERVER_ERROR });
    }
  })
});


export const fetchAttachments = createAsyncThunk(`${TASK_VIEW_FEATURE_KEY}/fetchAttachments`, ({ taskId }: { taskId: string }) => {
  return new Promise<IResponse<EncodedFile[]>>(async resolve => {
    try {
      const user = auth.currentUser;
      if (!user) {
        resolve({ status: false, error: ResponseMessage.NOT_AUTHENTICATED });
        return
      }
      const attachmentsRef = collection(db, 'users', user.uid, 'tasks', taskId, 'attachments');
      const value = (await getDocs(attachmentsRef)).docs.map(document => document.data() as EncodedFile);
      resolve({ status: true, value });
    } catch (error) {
      resolve({ status: false, value: [], error: ResponseMessage.INTERNAL_SERVER_ERROR });
    }
  });
})



export const taskViewSlice = createSlice({
  name: TASK_VIEW_FEATURE_KEY,
  initialState: initialTaskViewState,
  reducers: {
    setViewType: (state, action: PayloadAction<TaskView>) => {
      state.viewType = action.payload;
    },
    setCategory: (state, action: PayloadAction<Category>) => {
      state.category = action.payload;
    },
    setDueDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload
    },
    setTaskData: (state, action: PayloadAction<TaskData>) => {
      state.taskData = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    resetTaskViewState: () => initialTaskViewState,
    closeCreateTaskDialog: (state) => {
      state.createTaskDialogState = undefined;
    },
    openCreateTaskDialog: (state) => {
      state.createTaskDialogState = {
        open: true,
        isLoading: false
      };

    },
    openEditTaskDialog: (state, action: PayloadAction<Task>) => {
      state.editTaskDialogState = {
        open: true,
        task: action.payload
      };
    },
    closeEditTaskDialog: (state) => {
      state.editTaskDialogState = undefined;
    }
  },
  extraReducers: (builder) => {
    // Add extra reducers here
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.status && action.payload.value) {
        state.taskData = action.payload.value;
      }
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.error.message ?? 'An error occurred';
    });

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      const { taskId, taskStatus } = action.meta.arg;
      if (action.payload.status) {
        const taskData = cloneDeep(state.taskData);
        const overIndex = taskData.findIndex(container => container.id === taskStatus);
        const taskIndex = taskData[overIndex].tasks.findIndex(task => task.id === taskId);
        taskData[overIndex].tasks.splice(taskIndex, 1);
        state.taskData = taskData;
      }
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      if (action.payload.status) {
        const task = cloneDeep(action.meta.arg.task);
        task.activity = [{
          date: dateToActivityEventDisplayFormat(new Date()),
          name: 'You created this task'
        }];
        const status = task.status;
        const taskData = cloneDeep(state.taskData);
        const overIdx = taskData.findIndex(value => value.id === status);
        taskData[overIdx].tasks.push(task);
        state.taskData = taskData;
        state.createTaskDialogState = undefined;
      } else {
        state.createTaskDialogState = {
          open: true,
          error: 'Error Creating Task',
          isLoading: false
        };
      }
    });
    builder.addCase(createTask.pending, (state) => {
      state.createTaskDialogState = {
        open: true,
        isLoading: true
      };
    });
    builder.addCase(editTask.fulfilled, (state, action) => {
      const { previousStatus, task, isSilentUpdate } = action.meta.arg;
      if (isSilentUpdate) {
        return;
      }
      if (action.payload.status) {
        const currentStatus = task.status;
        const taskData = cloneDeep(state.taskData);
        const prevoverIdx = taskData.findIndex(container => isEqual(container.id, previousStatus));
        if (prevoverIdx === -1) {
          console.error('Internal Error');
          return;
        }
        const prevInnerIdx = taskData[prevoverIdx].tasks.findIndex(value => isEqual(value.id, task.id));
        if (isEqual(currentStatus, previousStatus)) {
          taskData[prevoverIdx].tasks[prevInnerIdx] = task;
        } else {
          taskData[prevoverIdx].tasks.splice(prevInnerIdx, 1);
          const currentOverIdx = taskData.findIndex(container => isEqual(container.id, currentStatus));
          taskData[currentOverIdx].tasks.push(task);
        }
        state.taskData = taskData;
        state.editTaskDialogState = undefined;
      } else {
        if (state.editTaskDialogState) {
          if (state.editTaskDialogState) {
            state.editTaskDialogState.isLoading = false;
            state.editTaskDialogState.error = 'Error Updating task';
          }
        }
      }
    });
    builder.addCase(editTask.pending, (state) => {
      if (state.editTaskDialogState) {
        state.editTaskDialogState.isLoading = true;
      }
    });
    builder.addCase(fetchAttachments.pending, (state) => {
      if (state.editTaskDialogState) {
        state.editTaskDialogState.isFetchingAttachments = true;
      }
    })
    builder.addCase(fetchAttachments.fulfilled, (state, action) => {
      const { status, value } = action.payload;
      if (status) {
        if (state.editTaskDialogState) {
          state.editTaskDialogState.attachments = value;
          state.editTaskDialogState.isFetchingAttachments = false;
        }
      }
    });
  }
});

export const taskViewReducer = taskViewSlice.reducer;
export const taskViewActions = taskViewSlice.actions;

// Selector
export const selectTaskViewType = (state: { taskView: TaskViewState }) =>
  state.taskView.viewType;

export const selectTaskCategory = (state: { taskView: TaskViewState }) =>
  state.taskView.category;


export const selectTaskDueDate = (state: { taskView: TaskViewState }) =>
  state.taskView.date;

export const selectFilteredTaskData = (state: { taskView: TaskViewState }) => {
  const { taskData, searchTerm, category, date } = state.taskView;

  return taskData.map(container => ({
    ...container,
    tasks: container.tasks.filter(task =>
      (!searchTerm || task.name.toLowerCase().includes(searchTerm.toLowerCase()))
      && (!category || isEqual(task.category, category))
      && (!date || isEqual(task.dueOn, date))
    )
  }));
}

export const selectTaskData = (state: { taskView: TaskViewState }) =>
  state.taskView.taskData;

export const selectSearchTerm = (state: { taskView: TaskViewState }) =>
  state.taskView.searchTerm ?? '';

export const selectTaskViewIsLoading = (state: { taskView: TaskViewState }) =>
  state.taskView.isLoading;

export const selectCreateTaskDialogState = (state: { taskView: TaskViewState }) =>
  state.taskView.createTaskDialogState;

export const selectEditTaskDialogState = (state: { taskView: TaskViewState }) =>
  state.taskView.editTaskDialogState;