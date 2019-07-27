import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, Text, TextLink, View } from './'

type Props = {
  data?: any
  dataTotalCount: number | null
  disableLeftSwipe: boolean
  extraData?: any
  handleFilterInputChangeText?: any
  handleFilterInputClear?: any
  handleRequestPodcast?: any
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
  showRequestPodcast?: boolean
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = () => <View />

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const { data, dataTotalCount, disableLeftSwipe = true, extraData, handleRequestPodcast, isLoadingMore, isRefreshing = false,
    ItemSeparatorComponent, keyExtractor, ListHeaderComponent, noSubscribedPodcasts, onEndReached, onEndReachedThreshold = 0.9,
    onRefresh, renderHiddenItem, renderItem, resultsText = 'results', showRequestPodcast } = props

  let noResultsFound = false
  let endOfResults = false

  if (dataTotalCount === 0) {
    noResultsFound = true
  }

  if (!isLoadingMore && data && dataTotalCount && dataTotalCount > 0 && data.length >= dataTotalCount) {
    endOfResults = true
  }

  const requestPodcastTextLink = (
    <TextLink
      onPress={handleRequestPodcast}
      style={[styles.textLink]}>
      Request a podcast
    </TextLink>
  )

  return (
    <View style={styles.view}>
      {
        noSubscribedPodcasts &&
          <View style={styles.msgView}>
            <Text style={[styles.lastCellText]}>{`You have no subscribed podcasts`}</Text>
          </View>
      }
      {
        noResultsFound && !noSubscribedPodcasts && ListHeaderComponent &&
          <ListHeaderComponent />
      }
      {
        noResultsFound && !noSubscribedPodcasts &&
          <View style={styles.msgView}>
            <Text style={[styles.lastCellText]}>{`No ${resultsText} found`}</Text>
            {
              showRequestPodcast &&
                requestPodcastTextLink
            }
          </View>
      }
      {
        !noSubscribedPodcasts && !noResultsFound &&
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
                  <View style={[styles.lastCell, globalTheme.tableCellBorder]}>
                    <ActivityIndicator />
                  </View>
                )
              } else if (endOfResults) {
                return (
                  <View style={[styles.lastCell, globalTheme.tableCellBorder]}>
                    <Text style={[styles.lastCellText]}>{`End of ${resultsText}`}</Text>
                    {
                      showRequestPodcast &&
                        requestPodcastTextLink
                    }
                  </View>
                )
              }
              return null
            }}
            {...(ListHeaderComponent ? { ListHeaderComponent } : {})}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            {...(onRefresh ? { refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> } : {})}
            renderHiddenItem={renderHiddenItem || _renderHiddenItem}
            renderItem={renderItem}
            rightOpenValue={-72}
            style={[globalTheme.flatList]} />
      }
    </View>
  )
}

const styles = StyleSheet.create({
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
  textLink: {
    fontSize: PV.Fonts.sizes.lg,
    marginVertical: 12,
    paddingVertical: 12,
    textAlign: 'center'
  },
  view: {
    flex: 1
  }
})
