import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  handleOnPress: any
  nowPlayingItem: NowPlayingItem
}

type State = {}

export class PlayerClipInfoBar extends React.PureComponent<Props, State> {
  render() {
    const { handleOnPress, nowPlayingItem } = this.props
    const { clipEndTime, clipStartTime } = nowPlayingItem
    const { globalTheme } = this.global

    return (
      <TouchableWithoutFeedback onPress={handleOnPress}>
        <View style={[styles.wrapper, globalTheme.player]}>
          <Text
            numberOfLines={1}
            style={[styles.title, globalTheme.playerText]}>
            {nowPlayingItem.clipTitle || 'Untitled clip'}
          </Text>
          {!!clipStartTime && (
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={[styles.time, globalTheme.playerText]}>
              {readableClipTime(clipStartTime, clipEndTime)}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  time: {
    fontSize: PV.Fonts.sizes.lg,
    marginHorizontal: 8,
    marginTop: 3
  },
  title: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginHorizontal: 8
  },
  wrapper: {
    borderTopWidth: 1,
    height: 62,
    justifyContent: 'center'
  }
})
