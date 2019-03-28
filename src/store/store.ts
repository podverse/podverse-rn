import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'
import authReducer from './reducers/authReducer'

const rootReducer = combineReducers({
  auth: authReducer
})

export const configureStore = () => createStore(rootReducer, applyMiddleware(thunk))
