import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, View as RNView } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import React from 'reactn'
import { FlatList, Icon, NavDismissIcon, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

type State = {
  categoryItems?: any
  sections?: any
  selectedCategoryItemKey?: string
  selectedCategorySubItemKey?: string
  selectedFilterItemKey?: string
  selectedSortItemKey?: string
  screenName: string
  allCategories: []
}

const testIDPrefix = 'filter_screen'

const sectionsWithCategory = (filterItems: any[], categoryItems: any[], sortItems: string[]) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Category'), data: categoryItems, value: PV.Filters._sectionCategoryKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

const sectionsWithoutCategory = (filterItems: any, sortItems: any) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

const generateSections = (options: {}) => {
  let sortItems: any[] = PV.FilterOptions.sortItems
  const allCategories = options.allCategories
  let filterItems: any[] = []

  switch (options.screenName) {
    case PV.RouteNames.PodcastsScreen:
      if (options.selectedFilterItemKey === PV.Filters._downloadedKey) {
        sortItems = sortItems.filter((item) => item.value === PV.Filters._alphabeticalKey)
      } else if (options.selectedFilterItemKey === PV.Filters._subscribedKey) {
        sortItems = sortItems.filter(
          (item) =>
            PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(item.value) ||
            item.value === PV.Filters._alphabeticalKey
        )
      } else {
        sortItems = sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(item.value)
        )
      }

      filterItems = PV.FilterOptions.typeItems.filter((item) =>
        PV.FilterOptions.screenFilters.PodcastsScreen.type.includes(item.value)
      )

      break
    default:
      break
  }

  const flatCategoryItems = []
  for (const categoryItem of allCategories) {
    flatCategoryItems.push(categoryItem)
    const subCategoryItems = categoryItem.categories
    for (const subCategoryItem of subCategoryItems) {
      subCategoryItem.parentId = categoryItem.id
      flatCategoryItems.push(subCategoryItem)
    }
  }

  const sections =
    options.selectedFilterItemKey === PV.Filters._categoryKey
      ? sectionsWithCategory(filterItems, flatCategoryItems, sortItems)
      : sectionsWithoutCategory(filterItems, sortItems)

  return { flatCategoryItems, sections }
}

export class FilterScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: null
    }
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      categoryItems: [],
      sections: [],
      selectedCategoryItemKey: '',
      selectedCategorySubItemKey: '',
      selectedFilterItemKey: '',
      selectedSortItemKey: '',
      screenName: '',
      allCategories: props.navigation.getParam('allCategories')
    }
  }

  async componentDidMount() {
    trackPageView('/filter', 'Filter Screen')
    const { navigation } = this.props
    const selectedCategoryItemKey = navigation.getParam('selectedCategoryItemKey')
    const selectedCategorySubItemKey = navigation.getParam('selectedCategorySubItemKey')
    const selectedFilterItemKey = navigation.getParam('selectedFilterItemKey')
    const selectedSortItemKey = navigation.getParam('selectedSortItemKey')
    const screenName = navigation.getParam('screenName')
    const { flatCategoryItems, sections } = generateSections({
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey,
      screenName,
      allCategories: this.state.allCategories
    })

    this.setState({
      categoryItems: flatCategoryItems,
      sections,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey,
      screenName
    })
  }

  getNewLocalState = (section: any, item: any) => {
    const { navigation } = this.props
    const { categoryItems } = this.state
    const value = item.value || item.id
    const filterItems = navigation.getParam('filterItems') || []
    const sortItems = navigation.getParam('sortItems') || []

    let stateKey
    if (section.value === PV.Filters._sectionFilterKey) {
      stateKey = 'selectedFilterItemKey'
      const sections =
        item.value === PV.Filters._categoryKey
          ? sectionsWithCategory(filterItems, categoryItems, sortItems)
          : sectionsWithoutCategory(filterItems, sortItems)
      if (value === PV.Filters._categoryKey) {
        this.setState({
          sections,
          selectedCategoryItemKey: categoryItems[0].value,
          selectedCategorySubItemKey: '',
          selectedFilterItemKey: value
        })
      } else {
        this.setState({
          sections,
          selectedCategoryItemKey: '',
          selectedCategorySubItemKey: '',
          selectedFilterItemKey: value
        })
      }
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.parentId) {
        stateKey = 'selectedCategorySubItemKey'
        this.setState({
          selectedCategorySubItemKey: value
        })
      } else {
        stateKey = 'selectedCategoryItemKey'
        this.setState({
          selectedCategoryItemKey: value,
          selectedCategorySubItemKey: ''
        })
      }
    } else if (section.value === PV.Filters._sectionSortKey) {
      stateKey = 'selectedSortItemKey'
      this.setState({
        selectedSortItemKey: value
      })
    }

    return stateKey
  }

  getSelectHandler = (section: any, item: any) => {
    const { navigation } = this.props
    let handleSelect: any
    if (section.value === PV.Filters._sectionFilterKey) {
      handleSelect = navigation.getParam('handleSelectFilterItem')
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.value && !item.parentId) {
        handleSelect = navigation.getParam('handleSelectCategoryItem')
      } else {
        handleSelect = navigation.getParam('handleSelectCategorySubItem')
      }
    } else if (section.value === PV.Filters._sectionSortKey) {
      handleSelect = navigation.getParam('handleSelectSortItem')
    }
    return handleSelect
  }

  renderItem = ({ item, section }) => {
    const {
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey
    } = this.state

    const value = item.value || item.id

    /* Do not render category cells unless the category filter is active. */
    if (
      section.value === PV.Filters._sectionCategoryKey &&
      selectedFilterItemKey === PV.Filters._categoryKey &&
      selectedCategoryItemKey &&
      item.parentId &&
      selectedCategoryItemKey !== item.parentId
    ) {
      return <RNView />
    }

    let isActive = false
    if (section.value === PV.Filters._sectionCategoryKey) {
      if (selectedCategorySubItemKey) {
        if (item.parentId && item.id === selectedCategorySubItemKey) {
          isActive = true
        }
      } else if (item.value && item.value === selectedCategoryItemKey) {
        isActive = true
      }
    } else {
      isActive = [selectedFilterItemKey, selectedSortItemKey].includes(value)
    }

    const isSubCategory = item.parentId
    const itemTextStyle = isSubCategory ? [styles.itemSubText] : [styles.itemText]

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          const selectHandler = this.getSelectHandler(section, item)
          // TODO: Don't call setState in below function
          const stateKey = this.getNewLocalState(section, item) as any
          this.setState({ [stateKey]: value }, async () => {
            selectHandler(value)
            const { flatCategoryItems, sections } = generateSections({
              ...this.state
            })

            this.setState({
              categoryItems: flatCategoryItems,
              sections
            })
          })
        }}>
        <View style={styles.itemWrapper}>
          <Text style={itemTextStyle}>{item.label || item.title}</Text>
          {isActive && <Icon style={styles.itemIcon} name='check' size={24} />}
        </View>
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const { sections } = this.state

    return (
      <View style={styles.view}>
        <FlatList
          disableLeftSwipe={true}
          disableNoResultsMessage={true}
          keyExtractor={(item: any) => item.value || item.id}
          renderSectionHeader={({ section }) => {
            return (
              <View style={styles.sectionItemWrapper}>
                <Text style={styles.sectionItemText}>{section.title}</Text>
              </View>
            )
          }}
          renderItem={this.renderItem}
          sections={sections}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  hideItem: {
    height: 0
  },
  itemIcon: {
    marginTop: 4
  },
  itemSubText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingLeft: 64,
    paddingRight: 36
  },
  itemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingHorizontal: 36
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: 20
  },
  sectionItemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    paddingHorizontal: 16
  },
  sectionItemWrapper: {
    marginBottom: 20,
    marginTop: 28
  },
  view: {
    backgroundColor: 'blue',
    flex: 1
  }
})
