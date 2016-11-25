import {createStore} from 'redux';

// Reducers
const types = {
	ADD_ITEM: 'ADD_ITEM',
	DELETE_ITEM: 'DELETE_ITEM',
	SELECTION_ENABLE: 'SELECTION_ENABLE',
	SELECT_ALL: 'SELECT_ALL',
	TOGGLE_ITEM: 'TOGGLE_ITEM'
};

class Model {
	initialState = []

	// Reducers
	reducer = (state = this.initialState, action) => {
		switch (action.type) {
			case types.ADD_ITEM:
				//return [...state, {url: action.src, text: action.caption, subText: action.subCaption, selectionEnable: action.overlay}];
			case types.DELETE_ITEM:
				//return state.filter(item => !item.selected);
			case types.SELECTION_ENABLE:
				return state.map(item => ({...item, selectionEnable: !item.selectionEnable}));
			case types.SELECT_ALL:
				return state.map(item => ({...item, selected: !item.selected}));
			case types.TOGGLE_ITEM:
				return state.map((item, index) => (index !== action.index) ? item : {...item, selected: !item.selected});
			default:
				return state;
		}
	}

	// Actions
	//addItem = (src, caption, subCaption, overlay) => ({type: types.ADD_ITEM, src, caption, subCaption, overlay}

	// APIs
	initialize = (initialState, modelChanged) => {
		// set initialState
		this.initialState = initialState;

		// create store
		this.store = createStore(this.reducer);

		// start subscribing
		this.unsubscribe = this.store.subscribe(modelChanged);
	}

	getState = () => this.store.getState()

	//add = (....) => {}
	//remove = (index) => {}
	toggleSelectionEnable = () => this.store.dispatch({type: types.SELECTION_ENABLE})
	toggle = (index) => this.store.dispatch({type: types.TOGGLE_ITEM, index})
	selectAll = () => this.store.dispatch({type: types.SELECT_ALL});
}

export default Model;
export {Model};
