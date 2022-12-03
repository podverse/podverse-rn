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
    contentOffset: { x: 0, y: 67 }
  },
  hiddenItems: {
    rightOpenValue: {
      oneButton: -120,
      twoButtons: -220
    }
  }
}
