import { setGlobal } from 'reactn'
import { toggleHideDividersInLists as toggleHideDividersInListsService } from '../../services/settings-ui'

export const toggleHideDividersInLists = async () => {
  const newValue = await toggleHideDividersInListsService()
  setGlobal({ hideDividersInLists: newValue })
}
