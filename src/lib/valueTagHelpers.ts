export interface Value {
  method: string
  suggested: string
  type: string
  valueRecipients: ValueRecipient[]
}

export interface ValueRecipient {
  address: string
  amount?: number
  customKey?: string
  customValue?: unknown
  fee?: boolean | null
  name?: string
  normalizedSplit?: number
  split: number
  type: string
}

export const convertPodcastIndexValueTagToStandardValueTag = (podcastIndexValueTag: any) => {
  const { destinations, model } = podcastIndexValueTag
  let valueModel = {}
  const valueRecipients = [] as ValueRecipient[]

  if (Array.isArray(destinations) && model) {
    const { method, suggested, type } = model
    valueModel = {
      method,
      suggested,
      type
    }

    for (const destination of destinations) {
      const valueRecipient = {
        address: destination.address,
        customKey: destination.customKey,
        customValue: destination.customValue,
        fee: destination.fee,
        name: destination.name,
        split: destination.split,
        type: destination.type
      } as ValueRecipient
      valueRecipients.push(valueRecipient)
    }
  }

  return { ...valueModel, valueRecipients } as Value
}

export const calculateSplit = (valueRecipients: ValueRecipient[], total: number) => {
  valueRecipients = normalizeSplit(valueRecipients)
  const feeRecipient = valueRecipients.find((valueRecipient) => valueRecipient.fee === true)
  let feeAmount = 0
  if (feeRecipient) {
    feeAmount = (total / 100) * (feeRecipient.normalizedSplit || 0)
    total = total - feeAmount
  }

  const splitAmounts: ValueRecipient[] = []
  for (const valueRecipient of valueRecipients) {
    let amount = (total / 100) * (valueRecipient.normalizedSplit || 0)

    if (feeAmount && valueRecipient.fee) {
      amount = feeAmount
    }

    splitAmounts.push({
      ...valueRecipient,
      amount: Math.floor(amount)
    })
  }

  return splitAmounts
}

const normalizeSplit = (valueRecipients: ValueRecipient[]) => {
  const totalSplit = valueRecipients.reduce((total, valueRecipient) => {
    return total + valueRecipient.split
  }, 0)

  valueRecipients = valueRecipients.map((valueRecipient) => {
    return {
      ...valueRecipient,
      normalizedSplit: (valueRecipient.split / totalSplit) * 100
    }
  })

  return valueRecipients
}
