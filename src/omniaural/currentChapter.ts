import OmniAural from 'omniaural'

export type CurrentChapter = null | {
    endTime: number
    hasCustomImage: boolean
    id: string
    imageUrl: string
    isOfficialChapter: boolean
    linkUrl: string | null
    startTime: number
    title: string
}

const setCurrentChapter = (val: CurrentChapter) => {
  console.log('setCurrentChapter val', val)
  OmniAural.state.currentChapter.set(val)
}

OmniAural.addActions({ setCurrentChapter })
