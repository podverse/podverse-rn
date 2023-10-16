import { View } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getFlatCategoryItems } from '../services/category'
import { iconStyles } from '../styles'
import { Divider, DropdownButton, Icon, Text } from './'

type Props = {
  accessible?: boolean
  addByRSSPodcastFeedUrl?: string
  customButtons?: any
  expandedIconColor?: string
  expandedState?: 'expanded' | 'collapsed' | null
  filterScreenTitle?: string
  handleSelectCategoryItem?: any
  handleSelectCategorySubItem?: any
  handleSelectFilterItem?: any
  handleSelectFromItem?: any
  handleSelectSortItem?: any
  hasSeasons?: boolean
  hideDropdown?: boolean
  disableFilter?: boolean
  includePadding?: boolean
  navigation?: any
  screenName?: string
  selectedCategoryItemKey?: string | null
  selectedCategorySubItemKey?: string | null
  selectedFilterAccessibilityHint?: string | null
  selectedFilterItemKey?: string | null
  selectedFilterLabel?: string | null
  selectedFromItemKey?: string | null
  selectedSortItemKey?: string | null
  selectedSortLabel?: string | null
  showDivider?: boolean
  testID?: string
  transparentDropdownButton?: boolean
  textStyle?: any
  viewStyle?: any
}

type State = {
  flatCategoryItems: any[]
}

export class TableSectionSelectors extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      flatCategoryItems: []
    }
  }

  async componentDidMount() {
    const flatCategoryItems = await getFlatCategoryItems()
    this.setState({ flatCategoryItems })
  }

  render() {
    const {
      accessible = true,
      addByRSSPodcastFeedUrl,
      customButtons = null,
      disableFilter,
      expandedState,
      filterScreenTitle,
      handleSelectCategoryItem,
      handleSelectCategorySubItem,
      handleSelectFilterItem,
      handleSelectFromItem,
      handleSelectSortItem,
      hasSeasons,
      hideDropdown,
      includePadding,
      screenName,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedFilterLabel,
      selectedFilterAccessibilityHint,
      selectedSortItemKey,
      selectedSortLabel,
      showDivider,
      testID,
      transparentDropdownButton,
      textStyle,
      viewStyle = {}
    } = this.props
    const { flatCategoryItems } = this.state
    const { globalTheme } = this.global
    const wrapperStyle = includePadding ? { paddingHorizontal: 8 } : {}

    return (
      <>
        <View style={[styles.tableSectionHeaderWrapper, wrapperStyle, viewStyle]}>
          <View style={styles.tableSectionHeaderTitleWrapper}>
            {!!selectedFilterLabel && (
              <View style={styles.expandIndicatorWrapper}>
                {
                  (
                    expandedState === 'collapsed' && (
                      <Icon
                        accessible={false}
                        color={iconStyles.skyLight.color}
                        name='caret-right'
                        size={19}
                        style={styles.expandButtonIcon}
                      />
                    )
                  )
                }
                {
                  (
                    expandedState === 'expanded' && (
                      <Icon
                        accessible={false}
                        color={iconStyles.skyLight.color}
                        name='caret-down'
                        size={19}
                        style={styles.expandButtonIcon}
                      />
                    )
                  )
                }
                <Text
                  accessible={accessible}
                  accessibilityHint={
                    selectedFilterAccessibilityHint
                      ? selectedFilterAccessibilityHint
                      : !disableFilter
                      ? translate('ARIA HINT - This is the selected filter for this screen')
                      : ''
                  }
                  accessibilityLabel={selectedFilterLabel}
                  accessibilityRole='header'
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[styles.tableSectionHeaderTitleText, globalTheme.tableSectionHeaderText, textStyle]}
                  testID={`${testID}_table_section_header_title_text`}>
                  {selectedFilterLabel}
                </Text>
              </View>
            )}
          </View>
          {customButtons}
          {!hideDropdown && (
            <DropdownButton
              accessible={!!accessible && !disableFilter}
              // eslint-disable-next-line max-len
              accessibilityHint={translate(
                'ARIA HINT - This is the selected sorting filter for this screen select a different filter'
              )}
              accessibilityLabel={selectedSortLabel}
              disableFilter={!!disableFilter}
              importantForAccessibility={!!accessible && !disableFilter ? 'yes' : 'no'}
              onPress={() => {
                this.props.navigation.navigate(PV.RouteNames.FilterScreen, {
                  addByRSSPodcastFeedUrl,
                  filterScreenTitle,
                  flatCategoryItems,
                  handleSelectCategoryItem,
                  handleSelectCategorySubItem,
                  handleSelectFilterItem,
                  handleSelectFromItem,
                  handleSelectSortItem,
                  hasSeasons,
                  screenName,
                  selectedCategoryItemKey,
                  selectedCategorySubItemKey,
                  selectedSortItemKey,
                  selectedFilterItemKey
                })
              }}
              sortLabel={selectedSortLabel}
              testID={testID}
              transparent={transparentDropdownButton}
            />
          )}
        </View>
        {showDivider && <Divider />}
      </>
    )
  }
}

const styles = {
  expandButtonIcon: {
    width: 20,
    textAlign: 'center'
  },
  selectedFilterLabelIcon: {
    marginLeft: 8
  },
  tableSectionHeaderWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  tableSectionHeaderTitleText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  tableSectionHeaderTitleTextSubFrom: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
  },
  tableSectionHeaderTitleTextSubSort: {
    textAlign: 'right',
    flex: 1,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
  },
  tableSectionHeaderTitleWrapper: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  expandIndicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
}
