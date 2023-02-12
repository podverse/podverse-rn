import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActionSheet,
  Divider,
  DownloadTableCell,
  FlatList,
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { cancelDownloadTask, DownloadStatus } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import {
  DownloadTaskState,
  pauseDownloadingEpisode,
  removeDownloadingEpisode,
  resumeDownloadingEpisode
} from '../state/actions/downloads'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  selectedItem: any
  showActionSheet: boolean
}

const testIDPrefix = 'downloads_screen'

export class DownloadsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super()
    this.state = {
      selectedItem: null,
      showActionSheet: false
    }

    props.navigation.setOptions({
      headerTitle: translate('Downloads')
    })
  }

  componentDidMount() {
    trackPageView('/downloads', 'Downloads Screen')
  }

  _ItemSeparatorComponent = () => <Divider />

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

  _handleCancelPress = () =>
    new Promise((resolve) => {
      this.setState(
        {
          selectedItem: null,
          showActionSheet: false
        },
        resolve
      )
    })

  _renderItem = ({ item, index }) => (
    <DownloadTableCell
      bytesTotal={item.bytesTotal}
      bytesWritten={item.bytesWritten}
      completed={item.completed}
      {...(item.episodeTitle ? { episodeTitle: item.episodeTitle } : {})}
      onPress={() => this._handleItemPress(item)}
      percent={item.percent}
      podcastImageUrl={item.podcastImageUrl}
      {...(item?.podcastTitle ? { podcastTitle: item.podcastTitle } : {})}
      status={item.status}
      testID={`${testIDPrefix}_download_item_${index}`}
    />
  )

  _renderHiddenItem = ({ item, index }, rowMap) => (
    <SwipeRowBack
      onPress={() => this._handleHiddenItemPress(item.episodeId, rowMap)}
      testID={`${testIDPrefix}_download_item_${index}`}
      text='Remove'
      styles={{ paddingVertical: 6 }}
    />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const ignoreIndex = -1
    const rowId = safeKeyExtractor(testIDPrefix, ignoreIndex, selectedId)

    rowMap[rowId]?.closeRow()
    await removeDownloadingEpisode(selectedId)
    cancelDownloadTask(selectedId)
  }

  render() {
    const { navigation } = this.props
    const { downloadsArrayFinished, downloadsArrayInProgress, globalTheme } = this.global
    const { selectedItem, showActionSheet } = this.state

    return (
      <View style={styles.view} testID='downloads_screen_view'>
        <FlatList
          disableLeftSwipe={false}
          keyExtractor={(item: any, index: number) => {
            return safeKeyExtractor(testIDPrefix, index, item?.episodeId)
          }}
          ItemSeparatorComponent={this._ItemSeparatorComponent}
          renderHiddenItem={this._renderHiddenItem}
          renderItem={this._renderItem}
          renderSectionHeader={({ section }) => (
            <TableSectionSelectors
              disableFilter
              includePadding
              selectedFilterLabel={section.title}
              textStyle={[globalTheme.headerText, core.sectionHeaderText]}
            />
          )}
          sections={[
            { title: translate('In progress'), data: downloadsArrayInProgress },
            { title: translate('Finished'), data: downloadsArrayFinished }
          ]}
        />
        {selectedItem && (
          <ActionSheet
            handleCancelPress={this._handleCancelPress}
            items={() =>
              PV.ActionSheet.media.moreButtons(
                selectedItem,
                navigation,
                { handleDismiss: this._handleCancelPress },
                'episode'
              )
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
