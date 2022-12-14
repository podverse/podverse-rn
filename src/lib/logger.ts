import { Config } from "react-native-config";

export const debugLogger = (message: string, data?: any) => {
  if (!!Config.IS_DEV) {
    console.log(message)
    if (data) console.log(data)
  }
}

export const errorLogger = (fileName: string, functionName: string, error: any) => {
  console.log(fileName)
  console.log(functionName)
  console.log(error)
}
