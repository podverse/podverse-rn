import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, MessageWithAction, View } from './'

type Props = {
  data?: any
  dataTotalCount?: number | null
  disableLeftSwipe: boolean
  disableNoResultsMessage?: boolean
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
  noResultsSubMessage?: string
  noResultsTopActionText?: string
  onEndReached?: any
  onEndReachedThreshold?: number
  onRefresh?: any
  renderHiddenItem?: any
  renderSectionHeader?: any
  renderItem: any
  sections?: any
  showNoInternetConnectionMessage?: boolean
  stickySectionHeadersEnabled?: boolean
  transparent?: boolean
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = (transparent?: boolean) => <View transparent={transparent} />

export const PVFlatList = (props: Props) => {
  const {
    data,
    dataTotalCount,
    disableLeftSwipe = true,
    disableNoResultsMessage,
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
    noResultsSubMessage,
    noResultsTopActionText,
    onEndReached,
    onEndReachedThreshold = 0.9,
    onRefresh,
    renderHiddenItem,
    renderItem,
    renderSectionHeader,
    sections,
    showNoInternetConnectionMessage,
    stickySectionHeadersEnabled,
    transparent
  } = props

  const [globalTheme] = useGlobal('globalTheme')
  let noResultsFound = !dataTotalCount
  if (sections) {
    noResultsFound = true
    for (const section of sections) {
      const { data } = section
      if (data && data.length > 0) {
        noResultsFound = false
      }
    }
  }
  const isEndOfResults = !isLoadingMore && data && dataTotalCount && dataTotalCount > 0 && data.length >= dataTotalCount
  const useSectionList = Array.isArray(sections) && sections.length > 0
  const shouldShowResults = (!noResultsFound && !showNoInternetConnectionMessage) || useSectionList

  return (
    <View style={styles.view} transparent={transparent}>
      {!noResultsMessage && ListHeaderComponent && !Config.DISABLE_FILTER_TEXT_QUERY && <ListHeaderComponent />}
      {!disableNoResultsMessage && !isLoadingMore && !showNoInternetConnectionMessage && noResultsFound && (
        <MessageWithAction
          bottomActionHandler={handleNoResultsBottomAction}
          bottomActionText={noResultsBottomActionText}
          message={noResultsMessage}
          middleActionHandler={handleNoResultsMiddleAction}
          middleActionText={noResultsMiddleActionText}
          subMessage={noResultsSubMessage}
          topActionHandler={handleNoResultsTopAction}
          topActionText={noResultsTopActionText}
          transparent={transparent}
        />
      )}
      {showNoInternetConnectionMessage && <MessageWithAction message={translate('No internet connection')} />}
      {shouldShowResults && (
        <SwipeListView
          closeOnRowPress={true}
          data={data}
          disableLeftSwipe={disableLeftSwipe}
          disableRightSwipe={true}
          extraData={extraData}
          ItemSeparatorComponent={ItemSeparatorComponent}
          keyExtractor={keyExtractor}
          ListFooterComponent={() => {
            if (isLoadingMore && !isEndOfResults) {
              return (
                <View style={[styles.isLoadingMoreCell, globalTheme.tableCellBorder]} transparent={transparent}>
                  <ActivityIndicator />
                </View>
              )
            } else if (!isLoadingMore && !isEndOfResults) {
              return <View style={[styles.isLoadingMoreCell]} transparent={transparent} />
            }
            // else if (isEndOfResults && !isCompleteData) {
            //   return (
            //     <View style={[styles.lastCell, globalTheme.tableCellBorder]} transparent={transparent}>
            //       <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[styles.lastCellText]}>
            //         {translate('End of results')}
            //       </Text>
            //     </View>
            //   )
            // }

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
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          rightOpenValue={-100}
          sections={sections}
          stickySectionHeadersEnabled={!!stickySectionHeadersEnabled}
          style={[globalTheme.flatList, transparent ? { backgroundColor: 'transparent' } : {}]}
          useFlatList={!useSectionList}
          useSectionList={useSectionList}
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
