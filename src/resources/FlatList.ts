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
    contentOffset: { x: 0, y: 76 }
  },
  hiddenItems: {
    rightOpenValue: {
      oneButton: -120,
      twoButtons: -220
    }
  },
  optimizationProps: {
    initialNumToRender: 10, // default 10
    maxToRenderPerBatch: 10, // default 10
    removeClippedSubviews: true, // default false
    updateCellsBatchingPeriod: 100, // default 50
    windowSize: 7 // default 21
  },
  optimizationPropsFaster: {
    initialNumToRender: 10, // default 10
    maxToRenderPerBatch: 10, // default 10
    removeClippedSubviews: true, // default false
    updateCellsBatchingPeriod: 100, // default 50
    windowSize: 5 // default 21
  }
}
