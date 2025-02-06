import styles from './task-view.module.css';
import Filter from './components/filter/filter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, selectFilteredTaskData, selectTaskViewIsLoading, selectSearchTerm, selectTaskData, selectTaskViewType, taskViewActions, editTask, selectTaskCategory, selectSort, selectSelectedTasks, deleteMultipleTasks, updateMultipleTaskStatus } from 'src/app/shared/store/task-view/task-view.slice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Category, dateToActivityEventDisplayFormat, Task, TaskStatus, TaskView as ETaskView, TaskColumn, SortType, Icons } from 'src/app/shared/types';
import { closestCenter, closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, getFirstCollision, PointerSensor, pointerWithin, rectIntersection, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskContainer } from './components/container/container';
import TaskItem from './components/task-item/task-item';
import { AppDispatch } from 'src/main';
import { clone, cloneDeep, isEqual } from 'lodash';
import { EditTaskDialog } from './components/edit-task/edit-task-dialog';
import Icon from 'src/app/shared/components/icon/icon';
import { motion } from "framer-motion";
import Menu from 'src/app/shared/components/menu/menu';
import { TaskStatusMenuOptions } from 'src/app/shared/types/constants/task-status-menu-options';

export type TaskData = {
  id: TaskStatus;
  tasks: Task[];
}[];

export function TaskView() {

  const taskViewType = useSelector(selectTaskViewType);
  const taskData = useSelector(selectTaskData);
  const filteredTaskData = useSelector(selectFilteredTaskData);
  const dispatch = useDispatch<AppDispatch>();
  const searchTerm = useSelector(selectSearchTerm);
  const isLoading = useSelector(selectTaskViewIsLoading);
  const sort = useSelector(selectSort);
  const selectedTasks = useSelector(selectSelectedTasks);

  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const recentlyMovedToNewContainer = useRef(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5
      }
    })
  );

  useEffect(() => {
  }, [taskViewType]);

  const findContainer = (id: UniqueIdentifier) => {
    if (taskData.some(({ id: containerId }) => containerId === id)) {
      return id;
    }

    return taskData.find((container) => container.tasks.some(task => task.id === id))?.id;
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, [taskData]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    const items = cloneDeep(taskData);

    if (overId == null || items.some(({ id }) => id === active.id)) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      const activeItems = items.find(container => container.id === activeContainer)?.tasks || [];
      const overItems = items.find(container => container.id === overContainer)?.tasks || [];
      const overIndex = overItems.findIndex(task => task.id === overId);
      const activeIndex = activeItems.findIndex(task => task.id === active.id);

      let newIndex: number;

      if (items.some(({ id }) => id === overId)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
          over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex =
          overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      recentlyMovedToNewContainer.current = true;

      dispatch(taskViewActions.setTaskData(
        items.map(container => {
          if (container.id === activeContainer) {
            return {
              ...container,
              tasks: container.tasks.filter(item => item.id !== active.id)
            };
          } else if (container.id === overContainer) {
            const activeTask = items.find(c => c.id === activeContainer)?.tasks[activeIndex];
            const updatedTasks = [
              ...container.tasks.slice(0, newIndex),
              ...(activeTask ? [activeTask] : []),
              ...container.tasks.slice(newIndex)
            ];
            return {
              ...container,
              tasks: updatedTasks
            };
          }
          return container;
        })
      ));
    }
  }, [taskData]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const items = cloneDeep(taskData);

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(undefined);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(undefined);
      return;
    }

    const overContainer = findContainer(overId);

    if (overContainer) {
      const activeContainerIndex = items.findIndex(container => container.id === activeContainer);
      const activeIndex = items[activeContainerIndex].tasks.findIndex(task => task.id === active.id);
      let overIndex = items.find(container => container.id === overContainer)?.tasks.findIndex(task => task.id === overId);


      if (overIndex !== undefined) {
        const updatedItems = cloneDeep(items);
        const overContainerIndex = items.findIndex(container => container.id === overContainer);
        if (activeIndex !== overIndex) {
          updatedItems[overContainerIndex].tasks = arrayMove(
            updatedItems[overContainerIndex].tasks,
            activeIndex,
            overIndex
          );
        }

        if (overIndex === -1) {
          overIndex = items[overContainerIndex].tasks.findIndex(task => task.id === active.id);
        }
        // update status and set
        const previousStatus = updatedItems[overContainerIndex].tasks[overIndex].status;
        const currentStatus = overContainer as TaskStatus;
        const task = cloneDeep(updatedItems[overContainerIndex].tasks[overIndex]);
        task.status = currentStatus;
        task.activity = updatedItems[overContainerIndex].tasks[overIndex]?.activity ?? [];
        updatedItems[overContainerIndex].tasks[overIndex] = cloneDeep(task);
        dispatch(taskViewActions.setTaskData(updatedItems));

        if (!isEqual(previousStatus, currentStatus)) {
          task.activity.push({
            date: dateToActivityEventDisplayFormat(new Date()),
            name: `You changed status from ${String(previousStatus).toLowerCase().replace('-', ' ')} to ${String(currentStatus).toLowerCase().replace('-', ' ')}`
          });
          dispatch(editTask({ task, previousStatus, isSilentUpdate: true }));
        }
      }
    }

    setActiveId(undefined);
  }, [taskData]);


  const findTaskById = useCallback((id?: UniqueIdentifier) => {
    const errorTask: Task = {
      id: 'error', name: 'error', status: TaskStatus.TODO,
      category: Category.WORK,
      dueOn: new Date().toDateString(),
    }
    if (!id) {
      return errorTask;
    }

    return taskData
      .map(container => container.tasks)
      .flat()
      .find(task => task.id === id) ?? errorTask;
  }, [taskData]);

  const isFilteredTaskItemsAvailable = useMemo(() => {
    if (isLoading) {
      return true;
    }
    return (!!searchTerm && searchTerm.length === 0) || filteredTaskData.filter(data => data.tasks.length > 0).length > 0;
  }, [isLoading, searchTerm, filteredTaskData])

  const handleSortChange = useCallback((column: TaskColumn) => {
    dispatch(taskViewActions.setSort({
      column,
      type: isEqual(sort, { column, type: SortType.ASC }) ? SortType.DESC : SortType.ASC
    }))
  }, [sort]);


  const isSortActive = useCallback((column: TaskColumn) => isEqual(column, sort?.column) ? 'active' : '', [sort?.column]);
  const ascending = useCallback((column: TaskColumn) => isEqual(column, sort?.column) && isEqual(sort?.type, SortType.ASC) ? 'active' : '', [sort]);
  const descending = useCallback((column: TaskColumn) => isEqual(column, sort?.column) && isEqual(sort?.type, SortType.DESC) ? 'active' : '', [sort]);

  const collisionStratergy = useMemo(() => isEqual(taskViewType, ETaskView.LIST) ? closestCorners : closestCenter, [taskViewType]);

  const TaskContainerList = () => {
    return (
      <>
        {
          filteredTaskData.map((container) => (
            <TaskContainer
              key={container.id}
              id={container.id}
              tasks={container.tasks}
              viewtype={taskViewType}
            />
          ))
        }
      </>
    )
  };

  const handleSelectAll = useCallback(() => dispatch(taskViewActions.selectAllTask()), [taskData]);
  const handleDeSelectAll = useCallback(() => dispatch(taskViewActions.deSelectAllTask()), [taskData]);
  const handleDeleteSelected = useCallback(() => dispatch(deleteMultipleTasks()), [taskData]);
  const handleUpdateSelected = useCallback((status: TaskStatus) => dispatch(updateMultipleTaskStatus({status})), [taskData]);

  return (
    <div className={styles['task-view']}>
      <Filter />
      {isFilteredTaskItemsAvailable ?
        <div className={`${styles['task-view-container']} ${styles[taskViewType]}`}>
          {taskViewType === ETaskView.LIST &&
            <div className='task-header-row'>
              <div className={styles['divider']}></div>
              <div className={styles['sort_header']}>
                {Object.values(TaskColumn).map(value => (
                  <div className={styles['sort_header__column']} key={value} onClick={() => handleSortChange(value)}>
                    <div className={styles['sort_header__column__name']}>{value}</div>
                    <div className={`${styles['sort_header__column__icon_container']} ${styles[isSortActive(value)]}`}>
                      <Icon icon={Icons.POLYGON_SHARP} width={8} height={4} className={`${styles['sort_header__column__icon_container__polygon_a']} ${styles[ascending(value)]}`}></Icon>
                      <Icon icon={Icons.POLYGON_SHARP} width={8} height={4} className={`${styles['sort_header__column__icon_container__polygon_b']} ${styles[descending(value)]}`}></Icon>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          <DndContext
            sensors={sensors}
            collisionDetection={collisionStratergy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {isEqual(taskViewType, ETaskView.LIST) ?
              <div className={styles["task_container_list_view"]}>
                <TaskContainerList />
              </div>
              :
              <TaskContainerList />}
            <DragOverlay><TaskItem task={findTaskById(activeId)} viewType={taskViewType} /></DragOverlay>
          </DndContext>
        </div>
        :
        <div className={styles['no_task_image_container']}>
          <img src='assets/images/no_task_found.svg'></img>
        </div>
      }
      <EditTaskDialog />
      {selectedTasks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={styles['motion_div']}
        >
          <div className={styles["motion_div_sub1"]}>
          <div className={styles["selected_container"]}>
            {selectedTasks.size} Tasks Selected
            <Icon onClick={handleDeSelectAll} icon={Icons.CLOSE_SHARP} width={15} height={15}></Icon>
          </div>
          <Icon onClick={handleSelectAll} className={styles['select_all']} icon={Icons.SELECT_ALL_OUTLINE} width={16} height={16}></Icon>
          </div>
          <div className={styles["motion_div_sub2"]}>
            <Menu id='motion_div_sub2__status' onClick={handleUpdateSelected} options={cloneDeep(TaskStatusMenuOptions)} align='center' type='tertiary'>
            <div className={styles["motion_div_sub2__status"]}>Status</div>
            </Menu>
            <div onClick={handleDeleteSelected} className={styles["motion_div_sub2__delete"]}>Delete</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TaskView;
