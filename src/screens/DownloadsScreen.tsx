import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActionSheet,
  Divider,
  DownloadTableCell,
  FlatList,
  MessageWithAction,
  NavQueueIcon,
  SwipeRowBack,
  View
} from '../components'
import { cancelDownloadTask, DownloadStatus } from '../lib/downloader'
import { isOdd } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { pauseDownloadingEpisode, removeDownloadingEpisode, resumeDownloadingEpisode } from '../state/actions/downloads'

type Props = {
  navigation?: any
}

type State = {
  selectedItem: any
  showActionSheet: boolean
}

export class DownloadsScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Downloads',
      headerRight: <NavQueueIcon navigation={navigation} useThemeTextColor={true} showBackButton={true} />
    }
  }

  constructor() {
    super()
    this.state = {
      selectedItem: null,
      showActionSheet: false
    }
  }

  componentDidMount() {
    gaTrackPageView('/downloads', 'Downloads Screen')
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handleItemPress = (downloadTask: any) => {
    if (downloadTask.status === DownloadStatus.FINISHED) {
      this.setState({
        selectedItem: downloadTask,
        showActionSheet: true
      })
      return
    } else if (downloadTask.status === DownloadStatus.PAUSED) {
      resumeDownloadingEpisode(downloadTask.episodeId)
    } else {
      pauseDownloadingEpisode(downloadTask.episodeId)
    }
  }

  _handleCancelPress = () => {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          selectedItem: null,
          showActionSheet: false
        },
        resolve
      )
    })
  }

  _renderItem = ({ item, index }) => {
    return (
      <DownloadTableCell
        bytesTotal={item.bytesTotal}
        bytesWritten={item.bytesWritten}
        completed={item.completed}
        episodeTitle={item.episodeTitle}
        hasZebraStripe={isOdd(index)}
        onPress={() => this._handleItemPress(item)}
        percent={item.percent}
        podcastImageUrl={item.podcastImageUrl}
        podcastTitle={item.podcastTitle}
        status={item.status}
      />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack onPress={() => this._handleHiddenItemPress(item.episodeId, rowMap)} text='Remove' />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    rowMap[selectedId].closeRow()
    await removeDownloadingEpisode(selectedId)
    cancelDownloadTask(selectedId)
  }

  render() {
    const { navigation } = this.props
    const { downloadsArray } = this.global
    const { selectedItem, showActionSheet } = this.state

    return (
      <View style={styles.view}>
        {!downloadsArray || (downloadsArray.length === 0 && <MessageWithAction message='No downloads in progress' />)}
        {downloadsArray.length > 0 && (
          <FlatList
            data={downloadsArray}
            dataTotalCount={downloadsArray.length}
            disableLeftSwipe={false}
            extraData={downloadsArray}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderItem}
          />
        )}
        {selectedItem && (
          <ActionSheet
            handleCancelPress={this._handleCancelPress}
            items={() => PV.ActionSheet.media.moreButtons(selectedItem, navigation, this._handleCancelPress, null)}
            showModal={showActionSheet}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
