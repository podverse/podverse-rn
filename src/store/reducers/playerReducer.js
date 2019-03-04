import { TOGGLE_PLAYER } from "../actions/types"

const initialState = {
  showPlayer: false
}

const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_PLAYER:
      return {
        ...state,
        showPlayer: action.value
      }
    default:
      break
  }

  return state
}

export default playerReducer