import React from 'react'
import { Animated, Easing, Platform, StyleSheet } from 'react-native'

type Props = {
  active: any
  cell: any
}

export class PVSortableListRow extends React.Component<Props> {
  constructor(props: Props) {
    super()

    this._active = new Animated.Value(0)

    this._style = {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1]
              })
            }
          ],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10]
          })
        },

        android: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07]
              })
            }
          ],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6]
          })
        }
      })
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active)
      }).start()
    }
  }

  render() {
    const { cell } = this.props
    return <Animated.View style={[styles.row, this._style]}>{cell}</Animated.View>
  }
}

const styles = StyleSheet.create({
  row: {
    flex: 1
  }
})
