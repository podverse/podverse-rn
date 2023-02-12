/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import { ActivityIndicator, Icon, ScrollView, SwitchWithText, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { setAutoQueueDownloadsOn, updateAutoQueueSettingsPosition } from '../state/actions/autoQueue'
import { setAddCurrentItemNextInQueue } from '../state/actions/settings'
import { core, darkTheme, hidePickerIconOnAndroidTransparent } from '../styles'

type Props = {
  navigation: any
}

type State = {
  addCurrentItemNextInQueue?: boolean
  isLoading?: boolean
}

const testIDPrefix = 'settings_screen_queue'

export class SettingsScreenQueue extends React.Component<Props, State> {
  constructor(props: Props) {
    super()

    this.state = {}

    const options = this.navigationOptions(props)
    props.navigation.setOptions(options)
  }

  navigationOptions = () => ({
    title: translate('Queue')
  })

  async componentDidMount() {
    const addCurrentItemNextInQueue = await AsyncStorage.getItem(PV.Keys.PLAYER_ADD_CURRENT_ITEM_NEXT_IN_QUEUE)

    this.setState({
      addCurrentItemNextInQueue: !!addCurrentItemNextInQueue
    })

    trackPageView('/settings-queue', 'Settings Screen Queue')
  }

  _toggleAddCurrentItemNextInQueue = async () => {
    const { addCurrentItemNextInQueue } = this.global
    const newValue = !addCurrentItemNextInQueue
    await setAddCurrentItemNextInQueue(newValue)
  }

  _setAutoQueuePosition = (value: string) => {
    const autoQueuePositionOptions = PV.Queue.autoQueuePositionOptions
    const autoQueuePositionOptionSelected =
      autoQueuePositionOptions.find((x: any) => x.value === value) || placeholderItem

    if (autoQueuePositionOptionSelected?.value) {
      updateAutoQueueSettingsPosition(autoQueuePositionOptionSelected.value)
    }
  }

  _toggleAutoQueueDownloadsOn = () => {
    const { autoQueueDownloadsOn } = this.global
    setAutoQueueDownloadsOn(!autoQueueDownloadsOn)
  }

  render() {
    const { isLoading } = this.state
    const { addCurrentItemNextInQueue, autoQueueSettingsPosition, autoQueueDownloadsOn, globalTheme } = this.global
    const isDarkMode = globalTheme === darkTheme

    const autoQueueOptionSelected = PV.Queue.autoQueuePositionOptions.find((option: any) => {
      return option.value === autoQueueSettingsPosition
    })

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <>
            <View style={core.itemWrapper}>
              <SwitchWithText
                onValueChange={this._toggleAddCurrentItemNextInQueue}
                accessibilityLabel={translate('Add current item next in queue when playing a new item')}
                testID={`${testIDPrefix}_add_current_item_next_in_queue`}
                text={translate('Add current item next in queue when playing a new item')}
                value={!!addCurrentItemNextInQueue}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                onValueChange={this._toggleAutoQueueDownloadsOn}
                accessibilityLabel={translate('Auto-enqueue downloaded episodes')}
                testID={`${testIDPrefix}_auto_queue_downloaded_episodes`}
                text={translate('Auto-enqueue downloaded episodes')}
                value={!!autoQueueDownloadsOn}
              />
            </View>
            <View style={[core.itemWrapperReducedHeight, styles.extraMarginBottom]}>
              <RNPickerSelect
                fixAndroidTouchableBug
                items={PV.Queue.autoQueuePositionOptions}
                onValueChange={this._setAutoQueuePosition}
                placeholder={placeholderItem}
                style={hidePickerIconOnAndroidTransparent(isDarkMode)}
                useNativeAndroidPickerStyle={false}
                value={autoQueueSettingsPosition}>
                <View
                  accessible
                  accessibilityHint={`${translate('ARIA HINT - auto queue new episodes position')}`}
                  accessibilityLabel={`${translate('Auto queue new episodes position')} ${
                    autoQueueOptionSelected?.label
                  }`}
                  importantForAccessibility='yes'
                  style={core.selectorWrapper}>
                  <View
                    accessible={false}
                    importantForAccessibility='no-hide-descendants'
                    style={[core.selectorWrapperLeft, { minWidth: null }]}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[core.pickerSelect, globalTheme.text]}>
                      {autoQueueOptionSelected?.label}
                    </Text>
                    <Icon name='angle-down' size={14} style={[core.pickerSelectIcon, globalTheme.text]} />
                  </View>
                  <View
                    accessible={false}
                    importantForAccessibility='no-hide-descendants'
                    style={core.selectorWrapperRight}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[core.pickerSelect, globalTheme.text]}>
                      {translate('Auto queue new episodes position')}
                    </Text>
                  </View>
                </View>
              </RNPickerSelect>
            </View>
          </>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  extraMarginBottom: {
    marginBottom: 32
  },
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})

const placeholderItem = {
  label: translate('Select'),
  value: null
}
