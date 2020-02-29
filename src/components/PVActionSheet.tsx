import { Animated, Modal, Text, TouchableHighlight, View } from 'react-native'
import React from 'reactn'
import { ActivityIndicator } from '.'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { actionSheetStyles } from '../styles'

type Props = {
  handleCancelPress?: any
  items?: any
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
        const buttonStyle = [actionSheetStyles.button]

        if (item.key === 'editClip') {
          buttonStyle.push(actionSheetStyles.buttonTop)
        } else if (index === 0 && !message && !title) {
          buttonStyle.push(actionSheetStyles.buttonTop)
        } else if (index === items.length - 1) {
          buttonStyle.push(actionSheetStyles.buttonBottom)
        }

        if (item.key === 'deleteEpisode' || item.key === 'deleteClip') {
          buttonStyle.push(globalTheme.actionSheetButtonDelete)
        } else {
          buttonStyle.push(globalTheme.actionSheetButton)
        }

        let buttonTextStyle = globalTheme.actionSheetButtonText
        if (item.key === 'deleteEpisode' || item.key === 'deleteClip') {
          buttonTextStyle = globalTheme.actionSheetButtonTextDelete
        } else if (item.key === 'editClip') {
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

        let onPress = item.onPress
        if (isQueueButton) onPress = queueOnPress

        buttons.push(
          <TouchableHighlight
            key={item.key}
            onPress={onPress}
            style={buttonStyle}
            underlayColor={
              globalTheme.actionSheetButtonUnderlay.backgroundColor
            }>
            <View style={actionSheetStyles.buttonRow}>
              <Text
                numberOfLines={1}
                style={[actionSheetStyles.buttonText, buttonTextStyle]}>
                {item.text}
              </Text>
              {item.isDownloading && (
                <ActivityIndicator
                  size='small'
                  styles={actionSheetStyles.activityIndicator}
                />
              )}
              {((item.key === 'queueNext' && isLoadingQueueNext)
                || (item.key === 'queueLast' && isLoadingQueueLast)) && (
                  <ActivityIndicator
                    size='small'
                    styles={actionSheetStyles.activityIndicator}
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
            style={[actionSheetStyles.buttonCancel, globalTheme.actionSheetButtonCancel]}
            underlayColor={
              safelyUnwrapNestedVariable(() => globalTheme.actionSheetButtonCancelUnderlay.backgroundColor, '')
            }>
            <Text
              style={[
                actionSheetStyles.buttonText,
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
    const { children, items, message, showModal, title } = this.props
    const { globalTheme } = this.global
    const finalItems = typeof items === 'function' ? items() : items
    const buttons = children ? children : this.generateButtons(finalItems)

    return (
      <Modal transparent={true} visible={showModal}>
        <View style={[actionSheetStyles.backdrop, globalTheme.modalBackdrop]}>
          <Animated.View
            style={[
              actionSheetStyles.animatedView,
              {
                transform: [
                  { translateY: showModal ? _yValueShow : _yValueHide }
                ]
              }
            ]}>
            {(!!title || !!message) && (
              <View style={[actionSheetStyles.header, globalTheme.actionSheetButton]}>
                {!!title && (
                  <Text
                    style={[
                      actionSheetStyles.headerTitle,
                      globalTheme.actionSheetHeaderText
                    ]}>
                    {title}
                  </Text>
                )}
                {!!message && (
                  <Text
                    style={[
                      actionSheetStyles.headerMessage,
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
