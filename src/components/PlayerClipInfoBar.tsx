import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'

type Props = {
  nowPlayingItem: NowPlayingItem
}

type State = {}

export class PlayerClipInfoBar extends React.PureComponent<Props, State> {

  render() {
    const { nowPlayingItem } = this.props
    const { clipEndTime, clipStartTime } = nowPlayingItem
    const { globalTheme } = this.global

    return (
      <TouchableWithoutFeedback
        onPress={() => console.log('show full clip info')}>
        <View style={[styles.wrapper, globalTheme.playerText]}>
          <Text
            numberOfLines={1}
            style={[styles.title, globalTheme.playerText]}>
            {nowPlayingItem.podcastTitle}
          </Text>
          {
            !!clipStartTime &&
              <Text
                numberOfLines={1}
                style={[styles.time, globalTheme.playerText]}>
                {readableClipTime(clipStartTime, clipEndTime)}
              </Text>
          }
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  time: {
    fontSize: PV.Fonts.sizes.md
  },
  title: {
    fontSize: PV.Fonts.sizes.md
  },
  wrapper: {
    borderTopWidth: 1,
    height: 48
  }
})
