import React from 'react'
import { Animated, Modal, Text, TouchableHighlight } from 'react-native'
import { PV } from '../resources/PV'

type Props = {
  items: any[]
  omitCancel?: boolean
  showModal?: boolean
}

type State = {}

export class PVActionSheet extends React.Component<Props, State> {

  componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps) {
      if (nextProps.showModal) {
        Animated.timing(_yValueHide, { toValue: _yValueShow }).start()
      } else {
        Animated.timing(_yValueShow, { toValue: _yValueHide }).start()
      }
    }
  }

  generateButtons = (items: any[]) => {
    const buttons = []

    for (const item of items) {
      buttons.push(
        <TouchableHighlight
          onPress={item.onPress}
          style={styles.button}>
          {/* <Text style={styles.actionSheetButtonText}>
            {item.text}
          </Text> */}
        </TouchableHighlight>
      )
    }

    return buttons
  }

  render () {
    const { items, showModal } = this.props
    const buttons = this.generateButtons(items)
    const yValue = showModal ? _yValueHide : _yValueShow

    return (
      <Modal>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ translateY: yValue }]
            }
          ]}>
          {buttons}
        </Animated.View>
      </Modal>
    )
  }
}

const _yValueShow = 300
const _yValueHide = -300

const styles = {
  actionSheetButtonText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  animatedView: {
    marginHorizontal: 15
  },
  button: {
    flex: 1,
    height: 60,
    lineHeight: 60,
    margin: 10
  },
  modal: {
    backgroundColor: '#00000022',
    justifyContent: 'flex-end'
  }
}
