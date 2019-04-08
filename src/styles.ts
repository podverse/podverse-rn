import { StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
  activityIndicator: {
    color: PV.Colors.grayLighter
  },
  buttonGroup: {
    backgroundColor: PV.Colors.grayDarkest
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.grayDark
  },
  buttonGroupText: {
    color: PV.Colors.grayLighter
  },
  buttonGroupTextSelected: {
    color: PV.Colors.white
  },
  buttonPrimaryText: {
    color: PV.Colors.white
  },
  buttonPrimaryTextDisabled: {
    color: PV.Colors.gray
  },
  buttonPrimaryWrapper: {
    borderColor: PV.Colors.grayDarker
  },
  buttonPrimaryWrapperDisabled: {
    backgroundColor: PV.Colors.grayLighter
  },
  divider: {
    backgroundColor: PV.Colors.grayDarker
  },
  flatList: {
    backgroundColor: PV.Colors.black
  },
  player: {
    borderColor: PV.Colors.gray
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.gray,
    color: PV.Colors.white
  },
  tabbar: {
    backgroundColor: PV.Colors.black
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tableCellTextPrimary: {
    color: PV.Colors.grayLighter
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.grayDarker
  },
  tableSectionHeaderText: {
    color: PV.Colors.white
  },
  text: {
    color: PV.Colors.white
  },
  textInput: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
  },
  textSecondary: {
    color: PV.Colors.grayLighter
  },
  view: {
    backgroundColor: PV.Colors.black
  }
})

export const lightTheme = StyleSheet.create({
  activityIndicator: {
    color: PV.Colors.grayDarker
  },
  buttonGroup: {
    backgroundColor: PV.Colors.grayLightest
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.grayLight
  },
  buttonGroupText: {
    color: PV.Colors.grayDarker
  },
  buttonGroupTextSelected: {
    color: PV.Colors.black
  },
  buttonPrimaryText: {
    color: PV.Colors.black
  },
  buttonPrimaryTextDisabled: {
    color: PV.Colors.gray
  },
  buttonPrimaryWrapper: {
    borderColor: PV.Colors.grayLighter
  },
  buttonPrimaryWrapperDisabled: {
    backgroundColor: PV.Colors.grayDarker
  },
  divider: {
    backgroundColor: PV.Colors.grayLighter
  },
  flatList: {
    backgroundColor: PV.Colors.white
  },
  player: {
    borderColor: PV.Colors.gray
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.gray,
    color: PV.Colors.black
  },
  tabbar: {
    backgroundColor: PV.Colors.white
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tableCellTextPrimary: {
    color: PV.Colors.grayLighter
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.grayLighter
  },
  tableSectionHeaderText: {
    color: PV.Colors.black
  },
  text: {
    color: PV.Colors.black
  },
  textInput: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  textSecondary: {
    color: PV.Colors.grayDarker
  },
  view: {
    backgroundColor: PV.Colors.white
  }
})

export const button = StyleSheet.create({
  primaryWrapper: {
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 200
  }
})

export const core = StyleSheet.create({
  activityIndicator: {
    flex: 1
  },
  backgroundView: {
    flex: 1
  },
  searchBar: {
    borderBottomWidth: 1,
    borderWidth: 1
  },
  textInput: {
    flex: 1,
    height: 32,
    paddingLeft: 8,
    paddingRight: 8
  },
  textInputWrapper: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    height: 34,
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const table = StyleSheet.create({
  cellText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    height: PV.Table.cells.standard.height,
    lineHeight: PV.Table.cells.standard.height,
    paddingLeft: 8
  }
})
