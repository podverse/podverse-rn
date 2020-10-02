import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, MessageWithAction, Text, View } from './'

type Props = {
  data?: any
  dataTotalCount: number | null
  disableLeftSwipe: boolean
  extraData?: any
  handleNoResultsBottomAction?: any
  handleNoResultsMiddleAction?: any
  handleNoResultsTopAction?: any
  handleFilterInputChangeText?: any
  handleFilterInputClear?: any
  initialScrollIndex?: number
  isLoadingMore?: boolean
  isRefreshing?: boolean
  ItemSeparatorComponent?: any
  keyExtractor: any
  ListHeaderComponent?: any
  noResultsBottomActionText?: string
  noResultsMessage?: string
  noResultsMiddleActionText?: string
  noResultsTopActionText?: string
  onEndReached?: any
  onEndReachedThreshold?: number
  onRefresh?: any
  renderHiddenItem?: any
  renderItem: any
  showNoInternetConnectionMessage?: boolean
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
    handleNoResultsBottomAction,
    handleNoResultsMiddleAction,
    handleNoResultsTopAction,
    isLoadingMore,
    isRefreshing = false,
    ItemSeparatorComponent,
    keyExtractor,
    ListHeaderComponent,
    noResultsBottomActionText,
    noResultsMessage,
    noResultsMiddleActionText,
    noResultsTopActionText,
    onEndReached,
    onEndReachedThreshold = 0.9,
    onRefresh,
    renderHiddenItem,
    renderItem,
    showNoInternetConnectionMessage,
    transparent
  } = props

  const [globalTheme] = useGlobal('globalTheme')
  const noResultsFound = !dataTotalCount
  const isEndOfResults = !isLoadingMore && data && dataTotalCount && dataTotalCount > 0 && data.length >= dataTotalCount
  const shouldShowResults = !noResultsFound && !showNoInternetConnectionMessage

  return (
    <View style={styles.view} transparent={transparent}>
      {!noResultsMessage && ListHeaderComponent && !Config.DISABLE_FILTER_TEXT_QUERY && <ListHeaderComponent />}
      {!isLoadingMore && !showNoInternetConnectionMessage && noResultsFound && (
        <MessageWithAction
          bottomActionHandler={handleNoResultsBottomAction}
          bottomActionText={noResultsBottomActionText}
          middleActionHandler={handleNoResultsMiddleAction}
          middleActionText={noResultsMiddleActionText}
          topActionHandler={handleNoResultsTopAction}
          topActionText={noResultsTopActionText}
          message={noResultsMessage}
        />
      )}
      {showNoInternetConnectionMessage && <MessageWithAction message={translate('No internet connection')} />}
      {shouldShowResults && (
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
            } else if (isEndOfResults) {
              return (
                <View style={[styles.lastCell, globalTheme.tableCellBorder]} transparent={transparent}>
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[styles.lastCellText]}>
                    {translate('End of results')}
                  </Text>
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
