import { combineReducers } from 'redux'
import counter from './counter'
import user from './user'
import page from './page'

export default combineReducers({
  counter,
  user,
  page
})
