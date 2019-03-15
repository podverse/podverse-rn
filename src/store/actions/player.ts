import { TOGGLE_PLAYER } from './types'

export const togglePlayer = (toggle: boolean) => {
  return {
    type: TOGGLE_PLAYER,
    value: toggle
  }
}
