import styles from './header.module.css';
import { Icons, navList, TaskView } from '../../shared/types';
import Icon from '../../shared/components/icon/icon';
import Button from 'src/app/shared/components/button/button';
import { useDispatch, useSelector } from 'react-redux';
import { selectTaskViewType, taskViewActions } from 'src/app/shared/store/task-view/task-view.slice';
import { logoutUser, selectProfilePic, selectUserName } from 'src/app/shared/store/auth/auth.slice';
import { useCallback } from 'react';
import { AppDispatch } from 'src/main';

export function Header() {
  const displayName = useSelector(selectUserName);
  const profilePic = useSelector(selectProfilePic);
  const dispatch = useDispatch<AppDispatch>();
  const taskViewType = useSelector(selectTaskViewType);


  const updateViewType = useCallback((viewType: TaskView) => {
    // dispatch(taskViewActions.setViewType(viewType));
  }, [])

  const logout = useCallback(() => {
    dispatch(logoutUser())
  }, [])



  return (
    <div className={styles['header']}>
      <div className={styles['header__sub1']}>
        <div className={styles['header__task_buddy']}>
          <Icon icon={Icons.TASK_OUTLINE} width={29} height={29}></Icon>
          <div className={styles['header__taskbuddy__title']}>TaskBuddy</div>
        </div>
        <div className={styles['header__profile']}>
          <div className={styles['header__profile__avator']}>
            <img className={styles['header__profile__pic']} src={profilePic} alt="profile-pic" />
          </div>
          <div className={styles['header__profile__name']}>{displayName}</div>
        </div>
      </div>
      <div className={styles['header__sub2']}>
        <div className={styles['header__sub2__nav_container']}>
          <div className={styles['header__sub2__nav_list']}>
            {navList.map(listItem => (
              <div key={listItem.id} className={`${styles['header__sub2__nav_list__item']} ${taskViewType === listItem.id ? styles['header__sub2__nav_list__item__active'] : ''}`}
                onClick={() => updateViewType(listItem.id)}
              >
                <Icon icon={listItem.icon} width={16} height={16}></Icon>
                <div className={styles['header__sub2__nav_list__item__name']}>{listItem.name}</div>
              </div>
            ))}
          </div>
        </div>
        <Button icon={Icons.LOGOUT_OUTLINE} text={'logout'} type={'primary'} onClick={logout} />
      </div>
    </div>
  );
}

export default Header;
