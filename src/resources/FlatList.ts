import { Dimensions } from 'react-native'

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
    contentOffset: () => {
      const { height } = Dimensions.get('screen')
      return height >= 1200 ? { x: 0, y: 67 } : { x: 0, y: 0 }
    }
  }
}
