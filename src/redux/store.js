
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import cartReducer from './addCart';

const rootReducer = combineReducers({
  cart: cartReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;