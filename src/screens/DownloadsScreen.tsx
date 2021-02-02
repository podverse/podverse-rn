import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActionSheet, Divider, DownloadTableCell, FlatList, SwipeRowBack, View } from '../components'
import { cancelDownloadTask, DownloadStatus } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import {
  DownloadTaskState,
  pauseDownloadingEpisode,
  removeDownloadingEpisode,
  resumeDownloadingEpisode
} from '../state/actions/downloads'

type Props = {
  navigation?: any
}

type State = {
  selectedItem: any
  showActionSheet: boolean
}

const testIDPrefix = 'downloads_screen'

export class DownloadsScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Downloads')
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
    trackPageView('/downloads', 'Downloads Screen')
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handleItemPress = (downloadTaskState: DownloadTaskState) => {
    if (downloadTaskState.status === DownloadStatus.FINISHED) {
      this.setState({
        selectedItem: downloadTaskState,
        showActionSheet: true
      })
      return
    } else if (downloadTaskState.status === DownloadStatus.PAUSED) {
      resumeDownloadingEpisode(downloadTaskState)
    } else {
      pauseDownloadingEpisode(downloadTaskState)
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
        {...(item.episodeTitle ? { episodeTitle: item.episodeTitle } : {})}
        onPress={() => this._handleItemPress(item)}
        percent={item.percent}
        podcastImageUrl={item.podcastImageUrl}
        {...(item.podcastTitle ? { podcastTitle: item.podcastTitle } : {})}
        status={item.status}
        testID={`${testIDPrefix}_download_item_${index}`}
      />
    )
  }

  _renderHiddenItem = ({ item, index }, rowMap) => (
    <SwipeRowBack
      onPress={() => this._handleHiddenItemPress(item.episodeId, rowMap)}
      testID={`${testIDPrefix}_download_item_${index}`}
      text='Remove'
      styles={{ paddingVertical: 6 }}
    />
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
      <View style={styles.view} {...testProps('downloads_screen_view')}>
        <FlatList
          data={downloadsArray}
          dataTotalCount={downloadsArray.length}
          disableLeftSwipe={false}
          extraData={downloadsArray}
          keyExtractor={(item: any) => item.episodeId}
          ItemSeparatorComponent={this._ItemSeparatorComponent}
          noResultsMessage={translate('No downloads in progress')}
          renderHiddenItem={this._renderHiddenItem}
          renderItem={this._renderItem}
        />
        {selectedItem && (
          <ActionSheet
            handleCancelPress={this._handleCancelPress}
            items={() =>
              PV.ActionSheet.media.moreButtons(selectedItem, navigation, { handleDismiss: this._handleCancelPress })
            }
            showModal={showActionSheet}
            testID={testIDPrefix}
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
