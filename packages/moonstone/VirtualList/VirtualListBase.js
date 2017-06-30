/*
 * Exports the {@link moonstone/VirtualList.VirtualListBase} and
 * {@link moonstone/VirtualList.VirtualListCore} components and the
 * {@link moonstone/VirtualList.gridListItemSizeShape} validator. The default
 * export is {@link moonstone/VirtualList.VirtualListBase}.
 */

import {contextTypes} from '@enact/i18n/I18nDecorator';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';

import {dataIndexAttribute, Scrollable} from '../Scroller/Scrollable';

import VirtualListBounds from './VirtualListBounds.js';
import VirtualListDOM from './VirtualListDOM.js';

const SpotlightPlaceholder = Spottable('div');

const
	dataContainerMutedAttribute = 'data-container-muted',
	nop = () => {};

/**
 * The shape for the grid list item size in a list for {@link moonstone/VirtualList.listItemSizeShape}.
 *
 * @typedef {Object} gridListItemSizeShape
 * @memberof moonstone/VirtualList
 * @property {Number} minWidth - The minimum width of the grid list item.
 * @property {Number} minHeight - The minimum height of the grid list item.
 */
const gridListItemSizeShape = PropTypes.shape({
	minWidth: PropTypes.number.isRequired,
	minHeight: PropTypes.number.isRequired
});

/**
 * {@link moonstone/VirtualList.VirtualListBase} is a base component for
 * {@link moonstone/VirtualList.VirtualList} and
 * {@link moonstone/VirtualList.VirtualGridList} with Scrollable and SpotlightContainerDecorator applied.
 *
 * @class VirtualListCore
 * @memberof moonstone/VirtualList
 * @ui
 * @private
 */
class VirtualListCore extends Component {
	static displayName = 'VirtualListBase'

	static propTypes = /** @lends moonstone/VirtualList.VirtualListCore.prototype */ {
		/**
		 * The render function for an item of the list.
		 * `index` is for accessing the index of the item.
		 * `key` MUST be passed as a prop for DOM recycling.
		 * Data manipulation can be done in this function.
		 *
		 * @type {Function}
		 * @public
		 */
		component: PropTypes.func.isRequired,

		/**
		 * Size of an item for the list; valid values are either a number for `VirtualList`
		 * or an object that has `minWidth` and `minHeight` for `VirtualGridList`.
		 *
		 * @type {Number|moonstone/VirtualList.gridListItemSizeShape}
		 * @public
		 */
		itemSize: PropTypes.oneOfType([
			PropTypes.number,
			gridListItemSizeShape
		]).isRequired,

		/**
		 * Callback method of scrollTo.
		 * Normally, `Scrollable` should set this value.
		 *
		 * @type {Function}
		 * @private
		 */
		cbScrollTo: PropTypes.func,

		/**
		 * Client size of the list; valid values are an object that has `clientWidth` and `clientHeight`.
		 *
		 * @type {Object}
		 * @property {Number} clientWidth - The client width of the list.
		 * @property {Number} clientHeight - The client height of the list.
		 * @public
		 */
		clientSize: PropTypes.shape({
			clientWidth: PropTypes.number.isRequired,
			clientHeight:  PropTypes.number.isRequired
		}),

		/**
		 * Data for the list.
		 * Check mutation of this and determine whether the list should update or not.
		 *
		 * @type {Any}
		 * @default []
		 * @public
		 */
		data: PropTypes.any,

		/**
		 * Spotlight container Id
		 *
		 * @type {String}
		 * @private
		 */
		'data-container-id': PropTypes.string, // eslint-disable-line react/sort-prop-types

		/**
		 * Size of the data.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		dataSize: PropTypes.number,

		/**
		 * Direction of the list; valid values are `'horizontal'` and `'vertical'`.
		 *
		 * @type {String}
		 * @default 'vertical'
		 * @public
		 */
		direction: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * Number of spare DOM node.
		 * `3` is good for the default value experimentally and
		 * this value is highly recommended not to be changed by developers.
		 *
		 * @type {Number}
		 * @default 3
		 * @private
		 */
		overhang: PropTypes.number,

		/**
		 * It scrolls by page when 'true', by item when 'false'
		 *
		 * @type {Boolean}
		 * @default false
		 * @private
		 */
		pageScroll: PropTypes.bool,

		/**
		 * Spacing between items.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		spacing: PropTypes.number
	}

	static contextTypes = contextTypes

	static defaultProps = {
		cbScrollTo: nop,
		data: [],
		dataSize: 0,
		direction: 'vertical',
		overhang: 3,
		pageScroll: false,
		spacing: 0
	}

	constructor (props) {
		super(props);

		this.state = {firstIndex: 0, numOfItems: 0};
		this.initContainerRef = this.initRef('containerRef');

		this.virtualListDOM = new VirtualListDOM(this);
		this.virtualListBounds = new VirtualListBounds(this);
	}

	componentWillMount () {
		if (this.props.clientSize) {
			this.virtualListBounds.calculateMetrics(this.props);
			this.virtualListBounds.updateStatesAndBounds(this.props);
		}
	}

	// Calculate metrics for VirtualList after the 1st render to know client W/H.
	// We separate code related with data due to re use it when data changed.
	componentDidMount () {
		const containerNode = this.containerRef;

		if (!this.props.clientSize) {
			this.virtualListBounds.calculateMetrics(this.props);
			this.virtualListBounds.updateStatesAndBounds(this.props);
		}
		// prevent native scrolling by Spotlight
		this.preventScroll = () => {
			containerNode.scrollTop = 0;
			containerNode.scrollLeft = this.context.rtl ? containerNode.scrollWidth : 0;
		};

		if (containerNode && containerNode.addEventListener) {
			containerNode.addEventListener('scroll', this.preventScroll);
		}
	}

	// Call updateStatesAndBounds here when dataSize has been changed to update nomOfItems state.
	// Calling setState within componentWillReceivePropswill not trigger an additional render.
	componentWillReceiveProps (nextProps) {
		const
			{dataSize, direction, itemSize, overhang, spacing} = this.props,
			hasMetricsChanged = (
				direction !== nextProps.direction ||
				((itemSize instanceof Object) ? (itemSize.minWidth !== nextProps.itemSize.minWidth || itemSize.minHeight !== nextProps.itemSize.minHeight) : itemSize !== nextProps.itemSize) ||
				overhang !== nextProps.overhang ||
				spacing !== nextProps.spacing
			),
			hasDataChanged = (dataSize !== nextProps.dataSize);

		if (hasMetricsChanged) {
			this.virtualListBounds.calculateMetrics(nextProps);
			this.virtualListBounds.updateStatesAndBounds(nextProps);
		} else if (hasDataChanged) {
			this.virtualListBounds.updateStatesAndBounds(nextProps);
		}

		const placeholder = this.getPlaceholder();

		if (placeholder) {
			const index = placeholder.dataset.index;

			if (index) {
				this.lastFocusedIndex = parseInt(index);
				this.restoreLastFocused = true;
				this.setState({
					firstIndex: this.lastFocusedIndex
				});
			}
		}
	}

	shouldComponentUpdate (nextProps, nextState) {
		if ((this.props.dataSize !== nextProps.dataSize) &&
			(nextState.firstIndex + nextState.numOfItems) < nextProps.dataSize) {
			return false;
		}
		return true;
	}

	componentDidUpdate () {
		this.restoreFocus();
	}

	componentWillUnmount () {
		const containerNode = this.containerRef;

		// remove a function for preventing native scrolling by Spotlight
		if (containerNode && containerNode.removeEventListener) {
			containerNode.removeEventListener('scroll', this.preventScroll);
		}
	}

	moreInfo = {
		firstVisibleIndex: null,
		lastVisibleIndex: null
	}

	primary = null
	secondary = null

	isPrimaryDirectionVertical = true
	isItemSized = false

	dimensionToExtent = 0
	threshold = 0
	maxFirstIndex = 0
	curDataSize = 0
	cc = []
	scrollPosition = 0

	containerRef = null

	// spotlight
	nodeIndexToBeBlurred = null
	lastFocusedIndex = null

	// public for Scrollable
	isVertical = () => this.isPrimaryDirectionVertical

	// public for Scrollable
	isHorizontal = () => !this.isPrimaryDirectionVertical

	// public for Scrollable
	syncClientSize = () => this.virtualListBounds.syncClientSize()

	// public for Scrollable
	getScrollBounds = () => this.virtualListBounds.scrollBounds

	// public for Scrollable
	getMoreInfo = () => this.moreInfo

	// private
	getPlaceholder () {
		const current = Spotlight.getCurrent();
		if (current && current.dataset.vlPlaceholder && this.containerRef.contains(current)) {
			return current;
		}

		return false;
	}

	// private
	getGridPosition (index) {
		const
			{dimensionToExtent, primary, secondary} = this,
			primaryPosition = Math.floor(index / dimensionToExtent) * primary.gridSize,
			secondaryPosition = (index % dimensionToExtent) * secondary.gridSize;

		return {primaryPosition, secondaryPosition};
	}

	// private
	gridPositionToItemPosition = ({primaryPosition, secondaryPosition}) =>
		(this.isPrimaryDirectionVertical ? {left: secondaryPosition, top: primaryPosition} : {left: primaryPosition, top: secondaryPosition})

	// public for Scrollable
	getItemPosition = (index) => this.gridPositionToItemPosition(this.getGridPosition(index))

	// private
	syncThreshold (maxPos) {
		const {threshold} = this;

		if (threshold.max > maxPos) {
			if (maxPos < threshold.base) {
				threshold.max = threshold.base;
				threshold.min = -Infinity;
			} else {
				threshold.max = maxPos;
				threshold.min = maxPos - threshold.base;
			}
		}
	}

	// public for Scrollable
	setScrollPosition (x, y, dirX, dirY) {
		const
			{firstIndex, numOfItems} = this.state,
			{isPrimaryDirectionVertical, threshold, dimensionToExtent, maxFirstIndex} = this,
			{gridSize} = this.primary,
			maxPos = isPrimaryDirectionVertical ? this.getScrollBounds().maxTop : this.getScrollBounds().maxLeft,
			minOfMax = threshold.base,
			maxOfMin = maxPos - minOfMax;
		let
			delta, numOfGridLines, newFirstIndex = firstIndex, pos, dir = 0;

		if (isPrimaryDirectionVertical) {
			pos = y;
			dir = dirY;
		} else {
			pos = x;
			dir = dirX;
		}

		if (dir === 1 && pos > threshold.max) {
			delta = pos - threshold.max;
			numOfGridLines = Math.ceil(delta / gridSize); // how many lines should we add
			threshold.max = Math.min(maxPos, threshold.max + numOfGridLines * gridSize);
			threshold.min = Math.min(maxOfMin, threshold.max - gridSize);
			newFirstIndex = Math.min(maxFirstIndex, (dimensionToExtent * Math.ceil(firstIndex / dimensionToExtent)) + (numOfGridLines * dimensionToExtent));
		} else if (dir === -1 && pos < threshold.min) {
			delta = threshold.min - pos;
			numOfGridLines = Math.ceil(delta / gridSize);
			threshold.max = Math.max(minOfMax, threshold.min - (numOfGridLines * gridSize - gridSize));
			threshold.min = (threshold.max > minOfMax) ? threshold.max - gridSize : -Infinity;
			newFirstIndex = Math.max(0, (dimensionToExtent * Math.ceil(firstIndex / dimensionToExtent)) - (numOfGridLines * dimensionToExtent));
		}

		this.syncThreshold(maxPos);
		this.scrollPosition = pos;

		if (firstIndex !== newFirstIndex) {
			this.setState({firstIndex: newFirstIndex});
		} else {
			this.virtualListDOM.positionItems({updateFrom: firstIndex, updateTo: firstIndex + numOfItems}, this.moreInfo);
		}
	}

	// private
	restoreFocus () {
		const {firstVisibleIndex, lastVisibleIndex} = this.moreInfo;
		if (
			this.restoreLastFocused &&
			!this.getPlaceholder() &&
			firstVisibleIndex <= this.lastFocusedIndex &&
			lastVisibleIndex >= this.lastFocusedIndex
		) {
			// if we're supposed to restore focus and virtual list has positioned a set of items
			// that includes lastFocusedIndex, clear the indicator
			this.restoreLastFocused = false;
			const containerId = this.props['data-container-id'];

			// try to focus the last focused item
			const foundLastFocused = Spotlight.focus(
				`[data-container-id="${containerId}"] [data-index="${this.lastFocusedIndex}"]`
			);

			// but if that fails (because it isn't found or is disabled), focus the container so
			// spotlight isn't lost
			if (!foundLastFocused) {
				Spotlight.focus(containerId);
			}
		}
	}

	// public for Scrollable
	focusByIndex = (index) => {
		// We have to focus node async for now since list items are not yet ready when it reaches componentDid* lifecycle methods
		setTimeout(() => {
			const item = this.containerRef.querySelector(`[data-index='${index}'].spottable`);
			this.focusOnNode(item);
		}, 0);
	}

	// private
	focusOnNode = (node) => {
		if (node) {
			Spotlight.focus(node);
		}
	}

	// public for Scrollable
	calculatePositionOnFocus = (item) => {
		const
			{pageScroll} = this.props,
			{primary, numOfItems, scrollPosition} = this,
			offsetToClientEnd = primary.clientSize - primary.itemSize,
			focusedIndex = Number.parseInt(item.getAttribute(dataIndexAttribute));

		if (!isNaN(focusedIndex)) {
			let gridPosition = this.getGridPosition(focusedIndex);

			this.nodeIndexToBeBlurred = this.lastFocusedIndex % numOfItems;
			this.lastFocusedIndex = focusedIndex;

			if (primary.clientSize >= primary.itemSize) {
				if (gridPosition.primaryPosition > scrollPosition + offsetToClientEnd) { // forward over
					gridPosition.primaryPosition -= pageScroll ? 0 : offsetToClientEnd;
				} else if (gridPosition.primaryPosition >= scrollPosition) { // inside of client
					gridPosition.primaryPosition = scrollPosition;
				} else { // backward over
					gridPosition.primaryPosition -= pageScroll ? offsetToClientEnd : 0;
				}
			}

			// Since the result is used as a target position to be scrolled,
			// scrondaryPosition should be 0 here.
			gridPosition.secondaryPosition = 0;
			return this.gridPositionToItemPosition(gridPosition);
		}
	}

	// public for Scrollable
	setContainerDisabled = (bool) => {
		const containerNode = this.containerRef;

		if (containerNode) {
			containerNode.setAttribute(dataContainerMutedAttribute, bool);
		}
	}

	// render

	initRef (prop) {
		return (ref) => {
			this[prop] = ref;
		};
	}

	// private
	renderCalculate () {
		const
			{dataSize} = this.props,
			{firstIndex, numOfItems} = this.state,
			max = Math.min(dataSize, firstIndex + numOfItems);

		this.virtualListDOM.positionItems({updateFrom: firstIndex, updateTo: max}, this.moreInfo);
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{primary, cc} = this;

		delete props.cbScrollTo;
		delete props.clientSize;
		delete props.component;
		delete props.data;
		delete props.dataSize;
		delete props.direction;
		delete props.itemSize;
		delete props.overhang;
		delete props.pageScroll;
		delete props.spacing;

		if (primary) {
			this.renderCalculate();
		}

		return (
			<div {...props} ref={this.initContainerRef}>
				{cc.length ? cc : (
					<SpotlightPlaceholder data-index={0} data-vl-placeholder />
				)}
			</div>
		);
	}
}

/**
 * {@link moonstone/VirtualList.VirtualListBase} is a base component for
 * {@link moonstone/VirtualList.VirtualList} and
 * {@link moonstone/VirtualList.VirtualGridList} with Scrollable and SpotlightContainerDecorator applied.
 *
 * @class VirtualListBase
 * @memberof moonstone/VirtualList
 * @mixes moonstone/Scrollable
 * @mixes spotlight/SpotlightContainerDecorator
 * @ui
 * @private
 */
const VirtualListBase = SpotlightContainerDecorator(
	{
		enterTo: 'last-focused',
		/*
		 * Returns the data-index as the key for last focused
		 */
		lastFocusedPersist: (node) => {
			const indexed = node.dataset.index ? node : node.closest('[data-index]');

			if (indexed) {
				return {
					container: false,
					element: true,
					key: indexed.dataset.index
				};
			}
		},
		/*
		 * Restores the data-index into the placeholder if its the only element. Tries to find a
		 * matching child otherwise.
		 */
		lastFocusedRestore: ({key}, all) => {
			if (all.length === 1 && 'vlPlaceholder' in all[0].dataset) {
				all[0].dataset.index = key;

				return all[0];
			}

			return all.reduce((focused, node) => {
				return focused || node.dataset.index === key && node;
			}, null);
		},
		preserveId: true,
		restrict: 'self-first'
	},
	Scrollable(
		VirtualListCore
	)
);

export default VirtualListBase;
export {gridListItemSizeShape, VirtualListCore, VirtualListBase};
