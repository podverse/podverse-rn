import { StyleSheet } from 'react-native'
import React from 'reactn'
import { Divider, DownloadTableCell, FlatList, MessageWithAction, SwipeRowBack, View } from '../components'
import { removeDownloadingEpisode } from '../state/actions/downloads'

type Props = {
  navigation?: any
}

type State = {}

export class DownloadsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Downloads'
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderItem = ({ item }) => {
    return (
      <DownloadTableCell
        key={`downloads_${item.episodeId}`}
        bytesTotal={item.bytesTotal}
        bytesWritten={item.bytesWritten}
        completed={item.completed}
        episodeTitle={item.episodeTitle}
        onPress={() => console.log('pressed!')}
        percent={item.percent}
        podcastImageUrl={item.podcastImageUrl}
        podcastTitle={item.podcastTitle}
        status={item.status} />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack onPress={() => this._handleHiddenItemPress(item.episodeId, rowMap)} />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    rowMap[selectedId].closeRow()
    await removeDownloadingEpisode(selectedId)
  }

  render() {
    const { downloads } = this.global

    return (
      <View style={styles.view}>
        {
          !downloads || downloads.length === 0 &&
            <MessageWithAction message='No downloads in progress' />
        }
        {
          downloads.length > 0 &&
            <FlatList
              data={downloads}
              disableLeftSwipe={false}
              extraData={downloads}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              keyExtractor={(item: any) => item.episodeId}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderItem} />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
