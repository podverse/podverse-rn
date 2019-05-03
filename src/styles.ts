import { StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.grayDarkest,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayDarker,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonText: {
    color: PV.Colors.white
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.white
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.grayDarker
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayDark
  },
  actionSheetView: {
    backgroundColor: PV.Colors.grayDarker
  },
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
  buttonImage: {
    borderColor: PV.Colors.white,
    tintColor: PV.Colors.white
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
  inputContainerText: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
  },
  modalBackdrop: {
    backgroundColor: '#00000050'
  },
  player: {
    borderColor: PV.Colors.grayDarker
  },
  playerText: {
    color: PV.Colors.white
  },
  selectorText: {
    color: PV.Colors.white
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
    borderColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputPlaceholder: {
    color: PV.Colors.gray
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
  actionSheetButton: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayLightest,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonText: {
    color: PV.Colors.black
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.black
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.grayLightest
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayLighter
  },
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
  buttonImage: {
    borderColor: PV.Colors.black,
    tintColor: PV.Colors.black
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
  inputContainerText: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  modalBackdrop: {
    backgroundColor: '#00000050'
  },
  player: {
    borderColor: PV.Colors.grayLighter
  },
  playerText: {
    color: PV.Colors.black
  },
  selectorText: {
    color: PV.Colors.black
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
    borderColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputPlaceholder: {
    color: PV.Colors.gray
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
  iconOnlyLarge: {
    flex: 0,
    height: 76,
    lineHeight: 76,
    textAlign: 'center',
    width: 40
  },
  iconOnlyMedium: {
    flex: 0,
    height: 60,
    lineHeight: 60,
    textAlign: 'center',
    width: 40
  },
  iconOnlySmall: {
    flex: 0,
    height: 38,
    lineHeight: 38,
    textAlign: 'center',
    width: 40
  },
  iconOnlyAlignToTop: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 5,
    padding: 8
  },
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
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  selectorText: {
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    justifyContent: 'center',
    lineHeight: 44,
    paddingHorizontal: 8
  },
  searchBar: {
    borderBottomWidth: 1,
    borderWidth: 1
  },
  textInput: {
    fontSize: PV.Fonts.sizes.md,
    height: 44,
    marginVertical: 4,
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

export const navHeader = StyleSheet.create({
  buttonIcon: {
    color: PV.Colors.white,
    height: 44,
    lineHeight: 44,
    paddingHorizontal: 12
  },
  buttonText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.lg,
    height: 44,
    lineHeight: 44,
    paddingHorizontal: 12
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

export const iconStyles = {
  dark: {
    color: PV.Colors.white,
    underlayColor: PV.Colors.black
  },
  light: {
    color: PV.Colors.black,
    underlayColor: PV.Colors.white
  }
}
