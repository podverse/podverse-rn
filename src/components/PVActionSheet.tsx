import React from 'react'
import { Animated, Modal, Text, TouchableHighlight, View } from 'react-native'
import { PV } from '../resources/PV'

type Props = {
  globalTheme: any
  handleCancelPress?: any
  items: any[]
  omitCancel?: boolean
  showModal?: boolean
}

type State = {
  yValue: any
}

export class PVActionSheet extends React.Component<Props, State> {

  componentDidMount() {
    // Animated.timing(_yValueHide, { toValue: _yValueShow }).start()
  }

  componentWillUnmount() {
    // Animated.timing(_yValueShow, { toValue: _yValueHide }).start()
  }

  generateButtons = (items: any[]) => {
    const { globalTheme, handleCancelPress } = this.props
    const buttons = []

    items.forEach((item, index) => {
      const buttonStyle = [styles.button]
      if (index === 0) {
        buttonStyle.push(styles.buttonTop)
      } else if (index === items.length - 1) {
        buttonStyle.push(styles.buttonBottom)
      }

      buttons.push(
        <TouchableHighlight
          key={item.key}
          onPress={item.onPress}
          style={[...buttonStyle, globalTheme.actionSheetButton]}
          underlayColor={globalTheme.actionSheetButtonUnderlay.backgroundColor}>
          <Text style={[styles.buttonText, globalTheme.actionSheetButtonText]}>
            {item.text}
          </Text>
        </TouchableHighlight>
      )
    })

    if (handleCancelPress) {
      buttons.push(
        <TouchableHighlight
          key='cancel'
          onPress={handleCancelPress}
          style={[styles.buttonCancel, globalTheme.actionSheetButtonCancel]}
          underlayColor={globalTheme.actionSheetButtonCancelUnderlay.backgroundColor}>
          <Text style={[styles.buttonText, globalTheme.actionSheetButtonTextCancel]}>
            Cancel
          </Text>
        </TouchableHighlight>
      )
    }

    return buttons
  }

  render() {
    const { globalTheme, items, showModal } = this.props
    const buttons = this.generateButtons(items)

    return (
      <Modal
        transparent={true}
        visible={showModal}>
        <View style={[styles.backdrop, globalTheme.modalBackdrop]}>
          <Animated.View
            style={[
              styles.animatedView,
              {
                transform: [{ translateY: showModal ? _yValueShow : _yValueHide }]
              }
            ]}>
            {buttons}
          </Animated.View>
        </View>
      </Modal>
    )
  }
}

const _yValueShow = new Animated.Value(0)
const _yValueHide = new Animated.Value(400)

const styles = {
  animatedView: {
    marginBottom: 24,
    marginHorizontal: 15
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  button: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 58,
    justifyContent: 'center'
  },
  buttonBottom: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopWidth: 1
  },
  buttonTop: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  buttonCancel: {
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    height: 58,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  }
}
