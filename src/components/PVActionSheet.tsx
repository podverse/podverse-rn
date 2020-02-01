import { Animated, Modal, Text, TouchableHighlight, View } from 'react-native'
import React from 'reactn'
import { ActivityIndicator } from '.'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources/PV'

type Props = {
  handleCancelPress?: any
  items: any
  message?: string
  omitCancel?: boolean
  showModal?: boolean
  title?: string
}

type State = {
  isLoadingQueueLast?: boolean
  isLoadingQueueNext?: boolean
  yValue: any
}

export class PVActionSheet extends React.Component<Props, State> {
  constructor(props: Props) {
    super()

    this.state = {}
  }
  componentDidMount() {
    // Animated.timing(_yValueHide, { toValue: _yValueShow }).start()
  }

  componentWillUnmount() {
    // Animated.timing(_yValueShow, { toValue: _yValueHide }).start()
  }

  generateButtons = (items: any[]) => {
    const { handleCancelPress, message, title } = this.props
    const { isLoadingQueueLast, isLoadingQueueNext } = this.state
    const { globalTheme } = this.global
    const buttons = []

    if (items && items.length > 0) {
      items.forEach((item, index) => {
        const buttonStyle = [styles.button]

        if (item.key === 'edit') {
          buttonStyle.push(styles.buttonTop)
        } else if (index === 0 && !message && !title) {
          buttonStyle.push(styles.buttonTop)
        } else if (index === items.length - 1) {
          buttonStyle.push(styles.buttonBottom)
        }

        if (item.key === 'delete') {
          buttonStyle.push(globalTheme.actionSheetButtonDelete)
        } else {
          buttonStyle.push(globalTheme.actionSheetButton)
        }

        let buttonTextStyle = globalTheme.actionSheetButtonText
        if (item.key === 'delete') {
          buttonTextStyle = globalTheme.actionSheetButtonTextDelete
        } else if (item.key === 'edit') {
          buttonTextStyle = globalTheme.actionSheetButtonTextEdit
        }

        const isQueueButton = item.key === 'queueNext' || item.key === 'queueLast'
        const queueOnPress = () => {
          this.setState({
            ...(item.key === 'queueNext' ?
            {
              isLoadingQueueNext: true,
              isLoadingQueueLast: false
            } : {
              isLoadingQueueNext: false,
              isLoadingQueueLast: true
            })
          }, async () => {
            await item.onPress()
            this.setState({
              isLoadingQueueLast: false,
              isLoadingQueueNext: false
            })
          })
        }

        buttons.push(
          <TouchableHighlight
            key={item.key}
            onPress={isQueueButton ? queueOnPress : item.onPress}
            style={buttonStyle}
            underlayColor={
              globalTheme.actionSheetButtonUnderlay.backgroundColor
            }>
            <View style={styles.buttonRow}>
              <Text style={[styles.buttonText, buttonTextStyle]}>
                {item.text}
              </Text>
              <ActivityIndicator
                size='small'
                styles={styles.activityIndicator}
              />
              {item.isDownloading && (
                <ActivityIndicator
                  size='small'
                  styles={styles.activityIndicator}
                />
              )}
              {((item.key === 'queueNext' && isLoadingQueueNext)
                || (item.key === 'queueLast' && isLoadingQueueLast)) && (
                  <ActivityIndicator
                    size='small'
                    styles={styles.activityIndicator}
                  />
              )}
            </View>
          </TouchableHighlight>
        )
      })

      if (handleCancelPress) {
        buttons.push(
          <TouchableHighlight
            key='cancel'
            onPress={handleCancelPress}
            style={[styles.buttonCancel, globalTheme.actionSheetButtonCancel]}
            underlayColor={
              safelyUnwrapNestedVariable(() => globalTheme.actionSheetButtonCancelUnderlay.backgroundColor, '')
            }>
            <Text
              style={[
                styles.buttonText,
                globalTheme.actionSheetButtonTextCancel
              ]}>
              Cancel
            </Text>
          </TouchableHighlight>
        )
      }
    }

    return buttons
  }

  render() {
    const { items, message, showModal, title } = this.props
    const { globalTheme } = this.global
    const finalItems = typeof items === 'function' ? items() : items
    const buttons = this.generateButtons(finalItems)

    return (
      <Modal transparent={true} visible={showModal}>
        <View style={[styles.backdrop, globalTheme.modalBackdrop]}>
          <Animated.View
            style={[
              styles.animatedView,
              {
                transform: [
                  { translateY: showModal ? _yValueShow : _yValueHide }
                ]
              }
            ]}>
            {(!!title || !!message) && (
              <View style={[styles.header, globalTheme.actionSheetButton]}>
                {!!title && (
                  <Text
                    style={[
                      styles.headerTitle,
                      globalTheme.actionSheetHeaderText
                    ]}>
                    {title}
                  </Text>
                )}
                {!!message && (
                  <Text
                    style={[
                      styles.headerMessage,
                      globalTheme.actionSheetHeaderText
                    ]}>
                    {message}
                  </Text>
                )}
              </View>
            )}
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
  activityIndicator: {
    flex: 0,
    marginLeft: 12
  },
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
    height: 62,
    justifyContent: 'center'
  },
  buttonBottom: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopWidth: 1
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonTop: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  buttonCancel: {
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    height: 62,
    justifyContent: 'center'
  },
  buttonText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  },
  header: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  headerMessage: {
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 4,
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  }
}
