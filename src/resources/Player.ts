import AsyncStorage from '@react-native-community/async-storage'
import { PV } from './PV'

const _speedOneHalfKey = 0.5
const _speedThreeQuartersKey = 0.75
const _speedNormalKey = 1.0
const _speedOneAndAQuarterKey = 1.25
const _speedOneAndAHalfKey = 1.5
const _speedDoubleKey = 2
const _speedDoubleAndAHalfKey = 2.5
const _speedTripleKey = 3
const _speedTripleAndAHalfKey = 3.5
const _speedQuadrupleKey = 4
const _speedQuadrupleAndAHalfKey = 4.5
const _speedQuintupleKey = 5

const speeds = async () => {
  const arr = [
    _speedOneHalfKey,
    _speedThreeQuartersKey,
    _speedNormalKey,
    _speedOneAndAQuarterKey,
    _speedOneAndAHalfKey,
    _speedDoubleKey
  ]

  const maximumSpeed = await AsyncStorage.getItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
  const max = Number(maximumSpeed)

  if (max >= _speedDoubleAndAHalfKey) arr.push(_speedDoubleAndAHalfKey)
  if (max >= _speedTripleKey) arr.push(_speedTripleKey)
  if (max >= _speedTripleAndAHalfKey) arr.push(_speedTripleAndAHalfKey)
  if (max >= _speedQuadrupleKey) arr.push(_speedQuadrupleKey)
  if (max >= _speedQuadrupleAndAHalfKey) arr.push(_speedQuadrupleAndAHalfKey)
  if (max >= _speedQuintupleKey) arr.push(_speedQuintupleKey)

  return arr
}

const maximumSpeedSelectOptions = [
  {
    label: '2x',
    value: _speedDoubleKey
  },
  {
    label: '2.5x',
    value: _speedDoubleAndAHalfKey
  },
  {
    label: '3x',
    value: _speedTripleKey
  },
  {
    label: '3.5x',
    value: _speedTripleAndAHalfKey
  },
  {
    label: '4x',
    value: _speedQuadrupleKey
  },
  {
    label: '4.5x',
    value: _speedQuadrupleAndAHalfKey
  },
  {
    label: '5x',
    value: _speedQuintupleKey
  }
]

const errorState = 'error'

export const Player = {
  errorState,
  jumpSeconds: 30,
  maximumSpeedSelectOptions,
  miniJumpSeconds: 1,
  speeds
}
