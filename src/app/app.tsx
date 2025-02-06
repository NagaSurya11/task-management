// Uncomment this line to use CSS modules
import { useSelector } from 'react-redux';
import styles from './app.module.css';
import { AuthProvider } from './modules/auth/auth.provider';
import Header from './modules/header/header';
import TaskView from './modules/task-view/task-view';
import { Loader } from './shared/components/loader/loader';
import { selectCanShowLoader } from './shared/store/task-view/task-view.slice';

export function App() {
  const showLoader = useSelector(selectCanShowLoader);
  return (
    <AuthProvider>
      <div className={styles['main']}>
        <Header />
        <TaskView />
      </div>
      <Loader showLoader={showLoader} />
    </AuthProvider>
  );
}

export default App;
