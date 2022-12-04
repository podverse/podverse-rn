import React from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, MessageWithAction, View, GridView } from './'

type Props = {
  contentContainerStyle: any
  contentOffset?: {
    x: number
    y: number
  }
  data?: any
  dataTotalCount?: number | null
  disableLeftSwipe: boolean
  disableNoResultsMessage?: boolean
  extraData?: any
  gridView?: boolean
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
  noResultsBottomActionTextAccessibilityHint?: string
  noResultsMessage?: string
  noResultsMiddleActionTextAccessibilityHint?: string
  noResultsMiddleActionText?: string
  noResultsSubMessage?: string
  noResultsTopActionTextAccessibilityHint?: string
  noResultsTopActionText?: string
  onEndReached?: any
  onEndReachedThreshold?: number
  onGridItemSelected?: any
  onRefresh?: any
  onScrollBeginDrag?: any
  renderHiddenItem?: any
  renderSectionHeader?: any
  renderItem: any
  rightOpenValue?: number,
  sections?: any
  showNoInternetConnectionMessage?: boolean
  stickySectionHeadersEnabled?: boolean
  testID: string
  transparent?: boolean
  listRef?: any
  getItemLayout?: any
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = (transparent?: boolean) => <View transparent={transparent} />

export const PVFlatList = (props: Props) => {
  const {
    contentContainerStyle = {},
    contentOffset = { x: 0, y: 0 },
    data,
    dataTotalCount,
    disableLeftSwipe = true,
    disableNoResultsMessage,
    extraData,
    getItemLayout,
    gridView,
    handleNoResultsBottomAction,
    handleNoResultsMiddleAction,
    handleNoResultsTopAction,
    isLoadingMore,
    isRefreshing = false,
    ItemSeparatorComponent,
    keyExtractor,
    ListHeaderComponent,
    listRef,
    noResultsBottomActionTextAccessibilityHint,
    noResultsBottomActionText,
    noResultsMessage,
    noResultsMiddleActionText,
    noResultsMiddleActionTextAccessibilityHint,
    noResultsSubMessage,
    noResultsTopActionText,
    noResultsTopActionTextAccessibilityHint,
    onEndReached,
    onEndReachedThreshold = 0.9,
    onGridItemSelected,
    onRefresh,
    onScrollBeginDrag,
    renderHiddenItem,
    renderItem,
    renderSectionHeader,
    rightOpenValue = PV.FlatList.hiddenItems.rightOpenValue.oneButton,
    sections,
    showNoInternetConnectionMessage,
    stickySectionHeadersEnabled,
    testID,
    transparent
  } = props

  const [globalTheme] = useGlobal('globalTheme')
  let noResultsFound = data?.length === 0
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
  const shouldShowNoResultsFoundMessage =
    !disableNoResultsMessage && !isLoadingMore && !showNoInternetConnectionMessage && noResultsFound

  return (
    <View style={styles.view} transparent={transparent}>
      {gridView ? (
        <GridView
          {...props}
          onItemSelected={onGridItemSelected}
          data={shouldShowResults ? data : []}
          ListFooterComponent={() => {
            if (isLoadingMore && !isEndOfResults) {
              return (
                <View
                  accessible={false}
                  style={[styles.isLoadingMoreCell, globalTheme.tableCellBorder]}
                  transparent={transparent}>
                  <ActivityIndicator accessible={false} testID={testID} />
                </View>
              )
            } else if (!isLoadingMore && !isEndOfResults) {
              return <View style={[styles.isLoadingMoreCell]} transparent={transparent} />
            }

            return null
          }}
          {...(onRefresh
            ? {
                refreshControl: (
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={globalTheme?.activityIndicator?.color}
                  />
                )
              }
            : {})}
        />
      ) : (
        <SwipeListView
          closeOnRowPress
          contentContainerStyle={contentContainerStyle}
          contentOffset={contentOffset}
          data={shouldShowResults ? data : []}
          disableLeftSwipe={disableLeftSwipe}
          disableRightSwipe
          extraData={extraData}
          ItemSeparatorComponent={ItemSeparatorComponent}
          keyExtractor={keyExtractor}
          onScrollBeginDrag={onScrollBeginDrag}
          ListFooterComponent={() => {
            if (isLoadingMore && !isEndOfResults) {
              return (
                <View
                  accessible={false}
                  style={[styles.isLoadingMoreCell, globalTheme.tableCellBorder]}
                  transparent={transparent}>
                  <ActivityIndicator accessible={false} testID={testID} />
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
          ListHeaderComponent={ListHeaderComponent}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          {...(onRefresh
            ? {
                refreshControl: (
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={globalTheme?.activityIndicator?.color}
                  />
                )
              }
            : {})}
          renderHiddenItem={renderHiddenItem || _renderHiddenItem}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          rightOpenValue={rightOpenValue}
          sections={sections}
          stickySectionHeadersEnabled={!!stickySectionHeadersEnabled}
          style={[
            globalTheme.flatList,
            transparent ? { backgroundColor: 'transparent' } : {},
            !shouldShowResults ? styles.noResultsFlatList : {}
          ]}
          useFlatList={!useSectionList}
          useSectionList={useSectionList}
          listViewRef={listRef}
          getItemLayout={getItemLayout}
        />
      )}
      {shouldShowNoResultsFoundMessage && (
        <MessageWithAction
          bottomActionHandler={handleNoResultsBottomAction}
          bottomActionText={noResultsBottomActionText}
          message={noResultsMessage}
          middleActionHandler={handleNoResultsMiddleAction}
          middleActionText={noResultsMiddleActionText}
          bottomActionAccessibilityHint={noResultsBottomActionTextAccessibilityHint}
          middleActionAccessibilityHint={noResultsMiddleActionTextAccessibilityHint}
          subMessage={noResultsSubMessage}
          testID={testID}
          topActionAccessibilityHint={noResultsTopActionTextAccessibilityHint}
          topActionHandler={handleNoResultsTopAction}
          topActionText={noResultsTopActionText}
          transparent={transparent}
        />
      )}
      {showNoInternetConnectionMessage && (
        <MessageWithAction message={translate('No internet connection')} testID={testID} />
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
  noResultsFlatList: {
    flexGrow: 0,
    flexShrink: 0
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
