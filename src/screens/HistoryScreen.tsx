import { NowPlayingItem } from 'podverse-shared'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React, { getGlobal } from 'reactn'
import {
  ActivityIndicator,
  FlatList,
  NavHeaderButtonText,
  NavSearchIcon,
  OpaqueBackground,
  QueueTableCell,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { overrideImageUrlWithChapterImageUrl, testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { getHistoryItems, removeHistoryItem } from '../state/actions/userHistoryItem'
import { core, darkTheme } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached?: boolean
  isEditing?: boolean
  isLoading?: boolean
  isLoadingMore?: boolean
  isRemoving?: boolean
  isTransparent?: boolean
  queryPage?: number
  viewType?: string
}

const testIDPrefix = 'history_screen'

export class HistoryScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()
    const isTransparent = !!navigation.getParam('isTransparent')
    const textColor = isTransparent ? globalTheme.text.color : ''

    return {
      ...(!isTransparent
        ? {}
        : {
            headerTransparent: true,
            headerStyle: {},
            headerTintColor: globalTheme.text.color
          }),
      headerTitle: translate('History'),
      headerRight: (
        <RNView style={[core.row]}>
          <RNView>
            {!navigation.getParam('isEditing') ? (
              <RNView style={styles.headerButtonWrapper}>
                <NavHeaderButtonText
                  color={textColor}
                  handlePress={navigation.getParam('_startEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_edit`}
                  text={translate('Edit')}
                />
              </RNView>
            ) : (
              <RNView style={styles.headerButtonWrapper}>
                <NavHeaderButtonText
                  color={textColor}
                  handlePress={navigation.getParam('_stopEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_done`}
                  text={translate('Done')}
                />
              </RNView>
            )}
          </RNView>
          {navigation.getParam('showMoreNavButton') && <NavSearchIcon navigation={navigation} />}
        </RNView>
      )
    }
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      isLoading: true,
      isLoadingMore: false,
      isRemoving: false,
      isTransparent: !!props.navigation.getParam('isTransparent'),
      queryPage: 1,
      viewType: props.navigation.getParam('viewType')
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    navigation.setParams({
      _startEditing: this._startEditing,
      _stopEditing: this._stopEditing
    })

    try {
      await getHistoryItems(1, [])
      this.setState({
        isLoading: false
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }

    trackPageView('/history', 'History Screen')
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () => this.props.navigation.setParams({ isEditing: true }))
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
  }

  _handlePlayItem = async (item: NowPlayingItem) => {
    const isDarkMode = this.global.globalTheme === darkTheme
    try {
      const { navigation } = this.props
      this.setState({ isLoading: true }, async () => {
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
        navigation.navigate(PV.RouteNames.PlayerScreen, { isDarkMode })
      })
    } catch (error) {
      // Error Loading and playing item
    }
  }

  _renderHistoryItem = ({ item = {} as NowPlayingItem, index }) => {
    const { isEditing, isTransparent } = this.state

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (!isEditing) {
            this._handlePlayItem(item)
          }
        }}
        {...testProps(`${testIDPrefix}_history_item_${index}`)}>
        <View transparent={isTransparent}>
          <QueueTableCell
            clipEndTime={item.clipEndTime}
            clipStartTime={item.clipStartTime}
            {...(item.clipTitle ? { clipTitle: item.clipTitle } : {})}
            {...(item.episodePubDate ? { episodePubDate: item.episodePubDate } : {})}
            {...(item.episodeTitle ? { episodeTitle: item.episodeTitle } : {})}
            handleRemovePress={() => this._handleRemoveHistoryItemPress(item)}
            podcastImageUrl={item.podcastImageUrl}
            {...(item.podcastTitle ? { podcastTitle: item.podcastTitle } : {})}
            showRemoveButton={isEditing}
            testID={`${testIDPrefix}_history_item_${index}`}
            transparent={isTransparent}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _handleRemoveHistoryItemPress = async (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, async () => {
      try {
        await removeHistoryItem(item)
      } catch (error) {
        //
      }
      this.setState({ isRemoving: false })
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const nextPage = queryPage + 1
            const newState = await this._queryData(nextPage)
            this.setState(newState)
          }
        )
      }
    }
  }

  render() {
    const { historyItems = [] } = this.global.session.userInfo
    const { currentChapter, nowPlayingItem } = this.global.player
    const { isLoading, isLoadingMore, isRemoving, isTransparent } = this.state

    const view = (
      <View style={styles.view} transparent={isTransparent} {...testProps(`${testIDPrefix}_view`)}>
        {!isLoading && (
          <FlatList
            data={historyItems}
            dataTotalCount={historyItems.length}
            disableLeftSwipe={true}
            extraData={historyItems}
            isLoadingMore={isLoadingMore}
            keyExtractor={(item: any) => item.clipId || item.episodeId}
            noResultsMessage={translate('No history items found')}
            onEndReached={this._onEndReached}
            renderItem={this._renderHistoryItem}
            transparent={isTransparent}
          />
        )}
        {(isLoading || isRemoving) && <ActivityIndicator isOverlay={isRemoving} styles={styles.activityIndicator} />}
      </View>
    )

    const imageUrl = overrideImageUrlWithChapterImageUrl(nowPlayingItem, currentChapter)

    if (isTransparent) {
      return <OpaqueBackground imageUrl={imageUrl}>{view}</OpaqueBackground>
    } else {
      return view
    }
  }

  _queryData = async (page: number = 1) => {
    const { historyItemsCount, historyItems = [] } = this.global.session.userInfo
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    try {
      const newHistoryItems = await getHistoryItems(page || 1, historyItems)
      newState.endOfResultsReached = newHistoryItems.length >= historyItemsCount
      newState.queryPage = page
      return newState
    } catch (error) {
      return newState
    }
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 24
  },
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  headerButtonWrapper: {
    flexDirection: 'row'
  },
  headerNowPlayingItem: {
    marginBottom: 2
  },
  navHeaderSpacer: {
    width: 36
  },
  navHeaderTextButton: {
    fontSize: PV.Fonts.sizes.lg,
    marginRight: 8,
    textAlign: 'center'
  },
  tableCellDivider: {
    marginBottom: 2
  },
  view: {
    flex: 1,
    justifyContent: 'center'
  }
})
