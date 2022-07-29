import RNFS, { DownloadFileOptions } from "react-native-fs"
import { downloadCustomFileNameId } from './hash'
import { hasValidNetworkConnection } from "./network"
import { getExtensionFromUrl } from './utility'

const podverseImagesPath = RNFS.DocumentDirectoryPath + '/podverse_images/'

export const deleteImageCache = async () => {
  try {
    const folderExists = await RNFS.exists(podverseImagesPath)
    if (folderExists) {
      await RNFS.unlink(podverseImagesPath)
    }
  } catch (error) {
    console.log('deleteImageCache', error)
  }
}

export const downloadImageFile = async (uri:string) => {
  try {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected) return

    const ext = getExtensionFromUrl(uri)
    const folderExists = await RNFS.exists(podverseImagesPath)

    if (!folderExists) {
      await RNFS.mkdir(podverseImagesPath)
    }

    const destination = podverseImagesPath + downloadCustomFileNameId(uri) + ext

    const downloadOptions: DownloadFileOptions = {
      fromUrl: uri.replace('http://', 'https://'),
      toFile: destination
    }

    await RNFS.downloadFile(downloadOptions).promise
  } catch (error) {
    console.log('downloadImageFile error:', error)
  }
}

export const getSavedImageUri = async (uri:string) => {
  let fileExists = false
  const ext = getExtensionFromUrl(uri)
  const filePath = podverseImagesPath + downloadCustomFileNameId(uri) + ext

  try {
    fileExists = await RNFS.exists(filePath)
  } catch (error) {
    console.log('getSavedImageUri error', error)
  }

  if(fileExists) {
    return {exists: true, imageUrl: filePath}
  } else {
    return {exists: false, imageUrl:uri}
  }
}
