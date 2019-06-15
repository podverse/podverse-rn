import { StyleSheet } from 'react-native'
import React from 'reactn'
import { Divider, DownloadTableCell, FlatList, MessageWithAction, SwipeRowBack, View } from '../components'

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
    <SwipeRowBack onPress={() => this._handleHiddenItemPress(item.id, rowMap)} />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    // const wasAlerted = await alertIfNoNetworkConnection('unsubscribe from podcast')
    // if (wasAlerted) return
    // this.setState({ isUnsubscribing: true }, async () => {
    //   try {
    //     const { flatListData } = this.state
    //     await toggleSubscribeToPodcast(selectedId, this.global)
    //     const newFlatListData = flatListData.filter((x) => x.id !== selectedId)
    //     rowMap[selectedId].closeRow()
    //     this.setState({
    //       flatListData: newFlatListData,
    //       isUnsubscribing: true
    //     })
    //   } catch (error) {
    //     this.setState({ isUnsubscribing: true })
    //   }
    // })
  }

  render() {
    const { downloads } = this.global
    const flatListData = downloads

    return (
      <View style={styles.view}>
        {
          !flatListData &&
            <MessageWithAction message='No downloads in progress' />
        }
        {
          flatListData.length > 0 &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={false}
              extraData={flatListData}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
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
