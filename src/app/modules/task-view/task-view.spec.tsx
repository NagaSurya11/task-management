import { render } from '@testing-library/react';

import TaskView from './task-view';

describe('TaskView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TaskView />);
    expect(baseElement).toBeTruthy();
  });
});
