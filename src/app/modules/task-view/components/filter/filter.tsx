import styles from './filter.module.css';
import { Categories, Category, Icons } from 'src/app/shared/types';
import Icon from 'src/app/shared/components/icon/icon';
import Menu from 'src/app/shared/components/menu/menu';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSearchTerm, selectTaskCategory, selectTaskDueDate, taskViewActions } from 'src/app/shared/store/task-view/task-view.slice';
import CustomDatePicker from 'src/app/shared/components/date-picker/date-picker';
import Button from 'src/app/shared/components/button/button';
import { debounce } from 'lodash';
import { CreateTaskDialog } from '../create-task/create-task-dialog';

export function Filter() {
  const category = useSelector(selectTaskCategory);
  const dueDate = useSelector(selectTaskDueDate);
  const [searchTerm, setSetSearchTerm] = useState(useSelector(selectSearchTerm));
  const dispatch = useDispatch();
  const [datePickerState, changeDatePickerState] = useState(false);

  // Debounced function to dispatch the search term
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      dispatch(taskViewActions.setSearchTerm(term));
    }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value;
      setSetSearchTerm(term)
      debouncedSearch(term); // Call the debounced function
    },
    [debouncedSearch]
  );

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);


  function updateCategory(category: Category) {
    dispatch(taskViewActions.setCategory(category));
  }

  function updateDatePickerState(state: boolean) {
    changeDatePickerState(state);
  }

  function updateDueDate(date: Date | null) {
    if (!!date) {
      updateDatePickerState(false);
      dispatch(taskViewActions.setDueDate(date.toDateString()));
    }
  }

  return (
    <div className={styles['filter_container']}>
      <div className={styles['filter_container_cd_root']}>
        <div className={styles['filter_container_cd']}>
          Filter by :
          <Menu id='category-filter' key={'category-filter'} align='center' onClick={(value: Category) => updateCategory(value)} options={Categories}>
            <div className={`${styles['filter_container_select_btn']} ${!!category ? styles['active'] : ''}`}>
              {!!category ? category : 'Category'}
              <Icon icon={Icons.CHEVRON_DOWN_OUTLINE} height={18} width={18} />
            </div>
          </Menu>
          <CustomDatePicker selected={dueDate ?? new Date().toDateString()} onChange={(date) => updateDueDate(date)} open={datePickerState} container={<div className={`${styles['filter_container_select_btn']} ${!!dueDate ? styles['active'] : ''}`}
            onClick={() => changeDatePickerState(true)}>
            {!!dueDate ? dueDate.substring(4) : 'Due Date'}
            <Icon icon={Icons.CHEVRON_DOWN_OUTLINE} height={18} width={18} />
          </div>} />
        </div>
      </div>
      <div className={styles['filter_container_sa']}>
        <div className={styles['filter_container__search_container']}>
          <Icon key={'search_icon'} height={18} width={18} icon={Icons.SEARCH_OUTLINE} />
          <input type="text" name="search" id="search" placeholder='Search' onChange={handleSearch} value={searchTerm} />
        </div>
        <CreateTaskDialog>
          <Button text='ADD TASK' type='filled' key={'filter_container_sa__add_task'} noTopPadding />
        </CreateTaskDialog>
      </div>
    </div>
  );
}

export default Filter;
