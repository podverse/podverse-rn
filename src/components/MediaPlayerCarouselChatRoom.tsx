import { StyleSheet } from 'react-native'
import React from 'reactn'
import { WebView } from 'react-native-webview'
import { translate } from '../lib/i18n'
import { TableSectionSelectors, View } from '.'

type Props = {
  navigation?: any
  width: number
}

const testIDPrefix = 'media_player_carousel_chat'

export class MediaPlayerCarouselChatRoom extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { width } = this.props
    const { player } = this.global
    const liveItem = player?.episode?.liveItem
    const chatIRCURL = liveItem?.chatIRCURL || ''

    return (
      <View style={[styles.wrapper, { width }]} testID={`${testIDPrefix}_view`} transparent>
        <TableSectionSelectors disableFilter includePadding selectedFilterLabel={translate('Chat Room')} />
        {
          !!chatIRCURL && (
            <WebView
              accessible={false}
              containerStyle={styles.wrapper}
              originWhitelist={['*']}
              overScrollMode='never'
              removeClippedSubviews
              source={{ uri: chatIRCURL }}
              style={{ backgroundColor: 'transparent', opacity: 0.99 }}
            />
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
