import RNFS, { DownloadFileOptions } from "react-native-fs"
import { downloadCustomFileNameId } from './hash'
import { hasValidNetworkConnection } from "./network"
import { getExtensionFromUrl } from './utility'

export const downloadImageFile = async (uri:string) => {
  const isConnected = await hasValidNetworkConnection()
  if (!isConnected) return

  const ext = getExtensionFromUrl(uri)
  const folderExists = await RNFS.exists(RNFS.DocumentDirectoryPath + "/podverse_images")
  
  if(!folderExists) {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath + "/podverse_images")
  }

  const destination = RNFS.DocumentDirectoryPath  + "/podverse_images/" 
                                                  + downloadCustomFileNameId(uri)
                                                  + ext
  const downloadOptions:DownloadFileOptions = {
      fromUrl: uri.replace('http://', 'https://'),
      toFile: destination,
  }

  await RNFS.downloadFile(downloadOptions).promise
}

export const getSavedImageUri = async (uri:string) => {
    const ext = getExtensionFromUrl(uri)

    const filePath = RNFS.DocumentDirectoryPath + "/podverse_images/" + downloadCustomFileNameId(uri) + ext
    const fileExists = await RNFS.exists(filePath)

    if(fileExists) {
        return {exists: true, imageUrl: filePath}
    } else {
        return {exists: false, imageUrl:uri}
    }
}