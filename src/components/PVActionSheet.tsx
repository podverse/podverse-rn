import { Animated, Modal, Text, TouchableHighlight, View, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { actionSheetStyles } from '../styles'
import { ActivityIndicator } from '.'

type Props = {
  handleCancelPress?: any
  items?: any
  message?: string
  omitCancel?: boolean
  showModal?: boolean
  testID: string
  title?: string
}

type State = {
  isLoadingQueueLast?: boolean
  isLoadingQueueNext?: boolean
  yValue: any
}

export class PVActionSheet extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {}
  }
  componentDidMount() {
    // Animated.timing(_yValueHide, { toValue: _yValueShow }).start()
  }

  componentWillUnmount() {
    // Animated.timing(_yValueShow, { toValue: _yValueHide }).start()
  }

  generateButtons = (items: any[]) => {
    const { handleCancelPress, message, testID, title } = this.props
    const { isLoadingQueueLast, isLoadingQueueNext } = this.state
    const { fontScaleMode, globalTheme } = this.global
    const buttons = []

    if (items && items.length >= 0) {
      items.forEach((item, index) => {
        const buttonStyle = [actionSheetStyles.button]

        if (item.key === PV.Keys.edit_clip) {
          buttonStyle.push(actionSheetStyles.buttonTop)
        } else if (index === 0 && !message && !title) {
          buttonStyle.push(actionSheetStyles.buttonTop)
        } else if (index === items.length - 1) {
          buttonStyle.push(actionSheetStyles.buttonBottom)
        }

        if (item.key === PV.Keys.delete_episode || item.key === PV.Keys.delete_clip) {
          buttonStyle.push(globalTheme.actionSheetButtonDelete)
        } else {
          buttonStyle.push(globalTheme.actionSheetButton)
        }

        let buttonTextStyle = globalTheme.actionSheetButtonText
        if (item.key === PV.Keys.delete_episode || item.key === PV.Keys.delete_clip) {
          buttonTextStyle = globalTheme.actionSheetButtonTextDelete
        } else if (item.key === PV.Keys.edit_clip) {
          buttonTextStyle = globalTheme.actionSheetButtonTextEdit
        }

        if (fontScaleMode === PV.Fonts.fontScale.largest) {
          buttonTextStyle = [buttonTextStyle]
          buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.md })
        }

        const isQueueButton = item.key === PV.Keys.queue_next || item.key === PV.Keys.queue_last
        const queueOnPress = () => {
          this.setState(
            {
              ...(item.key === PV.Keys.queue_next
                ? {
                    isLoadingQueueNext: true,
                    isLoadingQueueLast: false
                  }
                : {
                    isLoadingQueueNext: false,
                    isLoadingQueueLast: true
                  })
            },
            () => {
              (async () => {
                await item.onPress()
                this.setState({
                  isLoadingQueueLast: false,
                  isLoadingQueueNext: false
                })
              })()
            }
          )
        }

        let onPress = item.onPress
        if (isQueueButton) onPress = queueOnPress

        buttons.push(
          <TouchableHighlight
            accessible
            accessibilityHint={item.accessibilityHint}
            accessibilityLabel={item.accessibilityLabel}
            accessibilityRole='menuitem'
            key={item.key}
            onPress={onPress}
            style={buttonStyle}
            {...(testID ? { testID: `${testID}_action_sheet_${item.key}_button`.prependTestId() } : {})}
            underlayColor={globalTheme.actionSheetButtonUnderlay?.backgroundColor}>
            <View style={actionSheetStyles.buttonRow}>
              <Text
                importantForAccessibility='no'
                numberOfLines={1}
                style={[actionSheetStyles.buttonText, buttonTextStyle]}
                {...(testID ? { testID: `${testID}_action_sheet_${item.key}_text`.prependTestId() } : {})}>
                {item.text}
              </Text>
              {item.isDownloading && <ActivityIndicator size='small' styles={actionSheetStyles.activityIndicator} />}
              {((item.key === PV.Keys.queue_next && isLoadingQueueNext) ||
                (item.key === PV.Keys.queue_last && isLoadingQueueLast)) && (
                <ActivityIndicator size='small' styles={actionSheetStyles.activityIndicator} testID={testID} />
              )}
            </View>
          </TouchableHighlight>
        )
      })

      if (handleCancelPress) {
        const buttonTextCancelStyle = [actionSheetStyles.buttonText, globalTheme.actionSheetButtonTextCancel]
        if (fontScaleMode === PV.Fonts.fontScale.largest) {
          buttonTextCancelStyle.push({ fontSize: PV.Fonts.largeSizes.md })
        }

        buttons.push(
          <TouchableHighlight
            accessible
            accessibilityHint={translate('ARIA HINT - dismiss this menu')}
            accessibilityLabel={translate('Cancel')}
            accessibilityRole='menuitem'
            key={PV.Keys.cancel}
            onPress={handleCancelPress}
            style={[actionSheetStyles.buttonCancel, globalTheme.actionSheetButtonCancel]}
            {...(testID ? { testID: `${testID}_action_sheet_${PV.Keys.cancel}_button`.prependTestId() } : {})}
            underlayColor={safelyUnwrapNestedVariable(
              () => globalTheme.actionSheetButtonCancelUnderlay.backgroundColor,
              ''
            )}>
            <Text
              importantForAccessibility='no'
              numberOfLines={1}
              style={buttonTextCancelStyle}>
              {translate('Cancel')}
            </Text>
          </TouchableHighlight>
        )
      }
    }

    return buttons
  }

  attemptClose = () => {
    if (this.props.handleCancelPress) {
      this.props.handleCancelPress()
    }
  }

  render() {
    const { children, items, message, showModal, title } = this.props
    const { fontScaleMode, globalTheme } = this.global
    const finalItems = typeof items === 'function' ? items() : items
    const buttons = children ? children : this.generateButtons(finalItems)

    const headerTitleStyle = [actionSheetStyles.headerTitle, globalTheme.actionSheetHeaderText]
    if (fontScaleMode === PV.Fonts.fontScale.largest) {
      headerTitleStyle.push({ fontSize: PV.Fonts.largeSizes.sm })
    }
    const headerMessageStyle = [actionSheetStyles.headerMessage, globalTheme.actionSheetHeaderText]
    if (fontScaleMode === PV.Fonts.fontScale.largest) {
      headerMessageStyle.push({ fontSize: PV.Fonts.largeSizes.sm })
    }

    return (
      <Modal transparent visible={showModal} onRequestClose={this.attemptClose}>
        <TouchableOpacity
          accessible={false}
          activeOpacity={1}
          onPress={this.attemptClose}
          style={[actionSheetStyles.backdrop, globalTheme.modalBackdrop]}>
          <Animated.View
            style={[
              actionSheetStyles.animatedView,
              {
                transform: [{ translateY: showModal ? _yValueShow : _yValueHide }]
              }
            ]}>
            {(!!title || !!message) && (
              <View style={[actionSheetStyles.header, globalTheme.actionSheetButton]}>
                {!!title && (
                  <Text accessibilityRole='header' numberOfLines={1} style={headerTitleStyle}>
                    {title}
                  </Text>
                )}
                {!!message && <Text style={headerMessageStyle}>{message}</Text>}
              </View>
            )}
            {buttons}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }
}

const _yValueShow = new Animated.Value(0)
const _yValueHide = new Animated.Value(400)
