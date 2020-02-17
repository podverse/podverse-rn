import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { Slider } from 'react-native-elements'
import SystemSetting from 'react-native-system-setting'
import React from 'reactn'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { actionSheetStyles, sliderStyles } from '../styles'
import { ActionSheet, Icon, Text } from './'

type Props = {
  handleCancelPress: any
  initialVolume?: number
  showModal?: boolean
}

type State = {
  volume?: number
}

let volumeListener = null as any

export class PlayerMoreActionSheet extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  async componentDidMount() {
    const initialVolume = await SystemSetting.getVolume()
    this.setState({ volume: initialVolume })

    volumeListener = SystemSetting.addVolumeListener((data: any) => {
      const volume = data.value
      this.setState({ volume })
    })
  }

  componentWillUnmount() {
    SystemSetting.removeVolumeListener(volumeListener)
  }

  _updateVolume = (volume: number) => {
    SystemSetting.setVolume(volume)
    this.setState({ volume })
  }

  render() {
    const { handleCancelPress, showModal } = this.props
    const { volume } = this.state
    const { globalTheme } = this.global

    return (
      <ActionSheet
        showModal={showModal}
        title='Player Settings'>
        <View
          key='volume'
          style={[
            actionSheetStyles.button,
            actionSheetStyles.buttonBottom,
            globalTheme.actionSheetButton
          ]}>
          <View style={styles.volumeSliderWrapper}>
            <Icon
              name='volume-down'
              size={28}
              style={styles.volumeSliderIcon} />
            <Slider
              minimumValue={0}
              maximumValue={1}
              onSlidingComplete={(value) => this._updateVolume(value)}
              onValueChange={(value) => this._updateVolume(value)}
              style={styles.volumeSlider}
              thumbStyle={sliderStyles.thumbStyle}
              thumbTintColor={PV.Colors.brandColor}
              value={volume} />
            <Icon
              name='volume-up'
              size={28} />
          </View>
        </View>
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
      </ActionSheet>
    )
  }
}

const styles = StyleSheet.create({
  volumeSliderIcon: {},
  volumeSlider: {
    flex: 1,
    marginHorizontal: 20
  },
  volumeSliderWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 16
  }
})
