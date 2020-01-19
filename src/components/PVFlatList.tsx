import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, MessageWithAction, Text, TextLink, View } from './'

type Props = {
  data?: any
  dataTotalCount: number | null
  disableLeftSwipe: boolean
  extraData?: any
  handleAddPodcastByRSSURLNavigation?: any
  handleFilterInputChangeText?: any
  handleFilterInputClear?: any
  handleRequestPodcast?: any
  handleSearchNavigation?: any
  hideEndOfResults?: boolean
  initialScrollIndex?: number
  isLoadingMore?: boolean
  isRefreshing?: boolean
  ItemSeparatorComponent?: any
  keyExtractor: any
  ListHeaderComponent?: any
  noSubscribedPodcasts?: boolean
  onEndReached?: any
  onEndReachedThreshold?: number
  onRefresh?: any
  renderHiddenItem?: any
  renderItem: any
  resultsText?: string
  showAddPodcastByRSS?: boolean
  showNoInternetConnectionMessage?: boolean
  showRequestPodcast?: boolean
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = () => <View />

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const {
    data,
    dataTotalCount,
    disableLeftSwipe = true,
    extraData,
    handleAddPodcastByRSSURLNavigation,
    handleSearchNavigation,
    handleRequestPodcast,
    hideEndOfResults,
    isLoadingMore,
    isRefreshing = false,
    ItemSeparatorComponent,
    keyExtractor,
    ListHeaderComponent,
    noSubscribedPodcasts,
    onEndReached,
    onEndReachedThreshold = 0.9,
    onRefresh,
    renderHiddenItem,
    renderItem,
    resultsText = 'results',
    showAddPodcastByRSS,
    showNoInternetConnectionMessage,
    showRequestPodcast
  } = props

  let noResultsFound = false
  let endOfResults = false

  if (dataTotalCount === 0 || dataTotalCount === null) {
    noResultsFound = true
  }

  if (
    !isLoadingMore &&
    data &&
    dataTotalCount &&
    dataTotalCount > 0 &&
    data.length >= dataTotalCount
  ) {
    endOfResults = true
  }

  const requestPodcastTextLink = (
    <TextLink onPress={handleRequestPodcast} style={[styles.textLink]}>
      Request Podcast
    </TextLink>
  )

  const addPodcastByRSSTextLink = (
    <TextLink onPress={handleAddPodcastByRSSURLNavigation} style={[styles.textLink]}>
      Add Podcast by RSS URL
    </TextLink>
  )

  return (
    <View style={styles.view}>
      {!noSubscribedPodcasts && ListHeaderComponent && <ListHeaderComponent />}
      {noSubscribedPodcasts && !isLoadingMore && (
        <MessageWithAction
          topActionHandler={handleSearchNavigation}
          topActionText='Search'
          message='You have no subscribed podcasts'
        />
      )}
      {showNoInternetConnectionMessage && !isLoadingMore && (
        <View style={styles.msgView}>
          <Text style={[styles.noResultsFoundText]}>{`No internet connection found.`}</Text>
        </View>
      )}
      {noResultsFound && !noSubscribedPodcasts && !isLoadingMore && !showNoInternetConnectionMessage && (
        <View style={styles.msgView}>
          <Text style={[styles.noResultsFoundText]}>{`No ${resultsText} found`}</Text>
          {showRequestPodcast && requestPodcastTextLink}
          {showAddPodcastByRSS && addPodcastByRSSTextLink}
        </View>
      )}
      {((!noSubscribedPodcasts && !noResultsFound) || isLoadingMore) && (
        <SwipeListView
          useFlatList={true}
          closeOnRowPress={true}
          data={data}
          disableLeftSwipe={disableLeftSwipe}
          disableRightSwipe={true}
          extraData={extraData}
          ItemSeparatorComponent={ItemSeparatorComponent}
          keyExtractor={keyExtractor ? keyExtractor : (item: any) => item.id}
          ListFooterComponent={() => {
            if (isLoadingMore) {
              return (
                <View
                  style={[
                    styles.isLoadingMoreCell,
                    globalTheme.tableCellBorder
                  ]}>
                  <ActivityIndicator />
                </View>
              )
            } else if (endOfResults && !hideEndOfResults) {
              return (
                <View style={[styles.lastCell, globalTheme.tableCellBorder]}>
                  <Text
                    style={[
                      styles.lastCellText
                    ]}>{`End of ${resultsText}`}</Text>
                  {showRequestPodcast && requestPodcastTextLink}
                </View>
              )
            }
            return null
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          {...(onRefresh ? {
            refreshControl: (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            )
          } : {})}
          renderHiddenItem={renderHiddenItem || _renderHiddenItem}
          renderItem={renderItem}
          rightOpenValue={-100}
          style={[globalTheme.flatList]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  isLoadingMoreCell: {
    borderTopWidth: 0,
    justifyContent: 'center',
    padding: 24
  },
  lastCell: {
    borderTopWidth: 1,
    justifyContent: 'center',
    padding: 24
  },
  lastCellText: {
    fontSize: PV.Fonts.sizes.lg,
    textAlign: 'center'
  },
  msgView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  noResultsFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    marginVertical: 12,
    paddingVertical: 12,
    textAlign: 'center'
  },
  textLink: {
    fontSize: PV.Fonts.sizes.lg,
    marginVertical: 12,
    paddingVertical: 12,
    textAlign: 'center'
  },
  view: {
    flex: 1
  },
  viewWithListHeaderComponent: {
    flex: 1,
    paddingTop: PV.FlatList.searchBar.height,
    position: 'relative'
  }
})
