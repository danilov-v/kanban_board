import { channel } from 'redux-saga';
import { take, put, call, takeLatest, delay } from 'redux-saga/effects';
// import { delay } from 'redux-saga';
import * as api from '../api';
import * as actions from '../actions';

function* fetchTasks() {
  try {
    const { data } = yield call(api.fetchTasks);

    yield put({
      type: 'FETCH_TASKS_SUCCEEDED',
      payload: { tasks: data },
    });
  } catch (e) {
    yield put({
      type: 'FETCH_TASKS_FAILED',
      payload: { error: e.message },
    });
  }
}

export function* handleProgressTimer({ type, payload }) {
  if (type === 'TIMER_STARTED') {
    while (true) {
      yield delay(1000);
      yield put({
        type: 'TIMER_INCREMENT',
        payload: { taskId: payload.taskId },
      });
    }
  }
}

export function* handleFilterTasks({ payload }) {
  yield delay(1000);
  yield put(actions.changeSearchTerm(payload));
}

function* takeLatestById(actionType, saga) {
  const channelsMap = {};

  while (true) {
    const action = yield take(actionType);
    const { taskId } = action.payload;

    if (!channelsMap[taskId]) {
      channelsMap[taskId] = channel();
      yield takeLatest(channelsMap[taskId], saga);
    }

    yield put(channelsMap[taskId], action);
  }
}

export default function* rootSaga() {
  yield takeLatest('FETCH_TASKS_STARTED', fetchTasks);
  yield takeLatest('FILTER_TASKS', handleFilterTasks);
  yield takeLatestById(['TIMER_STARTED', 'TIMER_STOPPED'], handleProgressTimer);
}
