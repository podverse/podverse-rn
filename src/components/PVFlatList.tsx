import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, MessageWithAction, Text, TextLink, View } from './'

type Props = {
  data?: any
  dataTotalCount: number | null
  disableLeftSwipe: boolean
  extraData?: any
  handleAddPodcastByRSSURLNavigation?: any
  handleAddPodcastByRSSQRCodeNavigation?: any
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
  showAddPodcastByQR?: boolean
  showNoInternetConnectionMessage?: boolean
  showRequestPodcast?: boolean
  transparent?: boolean
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = (transparent?: boolean) => <View transparent={transparent} />

export const PVFlatList = (props: Props) => {
  const {
    data,
    dataTotalCount,
    disableLeftSwipe = true,
    extraData,
    handleAddPodcastByRSSURLNavigation,
    handleAddPodcastByRSSQRCodeNavigation,
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
    showAddPodcastByQR,
    showNoInternetConnectionMessage,
    showRequestPodcast,
    transparent
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  let noResultsFound = false
  let endOfResults = false

  if (dataTotalCount === 0 || dataTotalCount === null) {
    noResultsFound = true
  }

  if (!isLoadingMore && data && dataTotalCount && dataTotalCount > 0 && data.length >= dataTotalCount) {
    endOfResults = true
  }

  const textLinkStyle =
    PV.Fonts.fontScale.largest === fontScaleMode
      ? [core.buttonTextLink, { fontSize: PV.Fonts.largeSizes.md }]
      : [core.buttonTextLink]
  const noResultsFoundTextStyle =
    PV.Fonts.fontScale.largest === fontScaleMode
      ? [styles.noResultsFoundText, { fontSize: PV.Fonts.largeSizes.md }]
      : [styles.noResultsFoundText]

  const requestPodcastTextLink = (
    <TextLink fontSizeLargestScale={PV.Fonts.largeSizes.md} onPress={handleRequestPodcast} style={textLinkStyle}>
      {translate('Request Podcast')}
    </TextLink>
  )

  const addPodcastByRSSTextLink = (
    <TextLink
      fontSizeLargestScale={PV.Fonts.largeSizes.md}
      onPress={handleAddPodcastByRSSURLNavigation}
      style={textLinkStyle}>
      {translate('Add Podcast by RSS Feed')}
    </TextLink>
  )

  const scanRSSCode = (
    <TextLink
      fontSizeLargestScale={PV.Fonts.largeSizes.md}
      onPress={handleAddPodcastByRSSQRCodeNavigation}
      style={textLinkStyle}>
      Scan RSS Feed QR Code
    </TextLink>
  )

  return (
    <View style={styles.view} transparent={transparent}>
      {!noSubscribedPodcasts && ListHeaderComponent && !Config.DISABLE_FILTER_TEXT_QUERY && <ListHeaderComponent />}
      {noSubscribedPodcasts && !showNoInternetConnectionMessage && !isLoadingMore && (
        <MessageWithAction
          topActionHandler={handleSearchNavigation}
          topActionText={translate('Search')}
          message={translate('You are not subscribed to any podcasts')}
        />
      )}
      {showNoInternetConnectionMessage && !dataTotalCount && !isLoadingMore && (
        <View style={styles.msgView} transparent={transparent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={noResultsFoundTextStyle}>{`${translate(
            'No internet connection'
          )}`}</Text>
        </View>
      )}
      {noResultsFound && !noSubscribedPodcasts && !isLoadingMore && !showNoInternetConnectionMessage && (
        <View style={styles.msgView} transparent={transparent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={noResultsFoundTextStyle}>
            {`No ${resultsText} found`}
          </Text>
          {showRequestPodcast && requestPodcastTextLink}
          {showAddPodcastByRSS && addPodcastByRSSTextLink}
          {showAddPodcastByQR && scanRSSCode}
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
          keyExtractor={keyExtractor}
          ListFooterComponent={() => {
            if (isLoadingMore) {
              return (
                <View style={[styles.isLoadingMoreCell, globalTheme.tableCellBorder]} transparent={transparent}>
                  <ActivityIndicator />
                </View>
              )
            } else if (endOfResults && !hideEndOfResults) {
              return (
                <View style={[styles.lastCell, globalTheme.tableCellBorder]} transparent={transparent}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    style={[styles.lastCellText]}>{`End of ${resultsText}`}</Text>
                  {showRequestPodcast && requestPodcastTextLink}
                </View>
              )
            }
            return null
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          {...(onRefresh
            ? {
                refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
              }
            : {})}
          renderHiddenItem={renderHiddenItem || _renderHiddenItem}
          renderItem={renderItem}
          rightOpenValue={-100}
          style={[globalTheme.flatList, transparent ? { backgroundColor: 'transparent' } : {}]}
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
    fontSize: PV.Fonts.sizes.xl,
    textAlign: 'center'
  },
  msgView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  noResultsFoundText: {
    fontSize: PV.Fonts.sizes.xl,
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
