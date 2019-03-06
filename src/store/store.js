import { createStore, combineReducers, applyMiddleware } from "redux"
import playerReducer from "./reducers/playerReducer"
import authReducer from "./reducers/authReducer"
import thunk from "redux-thunk"

const rootReducer = combineReducers({
  player: playerReducer,
  auth: authReducer
})

export const configureStore = () => createStore(rootReducer, applyMiddleware(thunk))