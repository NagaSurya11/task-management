// Uncomment this line to use CSS modules
import styles from './app.module.css';
import { AuthProvider } from './modules/auth/auth.provider';
import Header from './modules/header/header';
import TaskView from './modules/task-view/task-view';

export function App() {
  return (
    <AuthProvider>
      <div className={styles['main']}>
        <Header />
        <TaskView />
      </div>
    </AuthProvider>
  );
}

export default App;
