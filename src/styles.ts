import { StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
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
  player: {
    borderColor: PV.Colors.gray
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
  tableSectionHeaderText: {
    color: PV.Colors.white
  },
  text: {
    color: PV.Colors.white
  },
  view: {
    backgroundColor: PV.Colors.black
  }
})

export const lightTheme = StyleSheet.create({
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
  player: {
    borderColor: PV.Colors.gray
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
  tableSectionHeaderText: {
    color: PV.Colors.black
  },
  text: {
    color: PV.Colors.black
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
  backgroundView: {
    flex: 1
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const table = StyleSheet.create({
  cellWrapper: {
    height: 50,
    justifyContent: 'center'
  }
})
