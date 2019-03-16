import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'
import authReducer from './reducers/authReducer'
import playerReducer from './reducers/playerReducer'

const rootReducer = combineReducers({
  player: playerReducer,
  auth: authReducer
})

export const configureStore = () => createStore(rootReducer, applyMiddleware(thunk))
