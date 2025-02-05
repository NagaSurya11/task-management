import {
  fetchTaskView,
  taskViewAdapter,
  taskViewReducer,
} from './task-view.slice';

describe('taskView reducer', () => {
  it('should handle initial state', () => {
    const expected = taskViewAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(taskViewReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchTaskView', () => {
    let state = taskViewReducer(undefined, fetchTaskView.pending(''));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
        ids: [],
      })
    );

    state = taskViewReducer(state, fetchTaskView.fulfilled([{ id: 1 }], ''));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
        ids: [1],
      })
    );

    state = taskViewReducer(
      state,
      fetchTaskView.rejected(new Error('Uh oh'), '')
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
        ids: [1],
      })
    );
  });
});
