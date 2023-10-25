const _endOfResultsKey = 'endOfResults'
const _searchBarKey = 'searchBar'
const _isLoadingMoreKey = 'isLoadingMore'

export const FlatList = {
  endOfResultsKey: _endOfResultsKey as any,
  searchBarKey: _searchBarKey as any,
  isLoadingMoreKey: _isLoadingMoreKey as any,
  searchBar: {
    height: 44
  },
  lastCell: {
    height: 72
  },
  ListHeaderHiddenSearchBar: {
    contentOffset: { x: 0, y: 68 }
  },
  hiddenItems: {
    rightOpenValue: {
      oneButton: -120,
      twoButtons: -220
    }
  },
  transcriptRowHeights: {
    singleLine: 28,
    autoScrollYOffset: 28 * 8
  },
  optimizationProps: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    removeClippedSubviews: true,
    updateCellsBatchingPeriod: 100,
    windowSize: 7
  },
  optimizationPropsFaster: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    removeClippedSubviews: false,
    updateCellsBatchingPeriod: 100,
    windowSize: 4
  },
  optimizationPropsDefault: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    removeClippedSubviews: true,
    updateCellsBatchingPeriod: 50,
    windowSize: 21
  }
}
