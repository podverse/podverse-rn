import { createStore, combineReducers } from "redux"
import playerReducer from "./reducers/playerReducer"

const rootReducer = combineReducers({
  player: playerReducer
})

export const configureStore = () => createStore(rootReducer)