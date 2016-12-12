/**
 * Exports the {@link moonstone/VirtualVariableList.VirtualVariableList} component.
 *
 * @module moonstone/VirtualVariableList
 */

import React, {Component, PropTypes} from 'react';
import clamp from 'ramda/src/clamp';
import classNames from 'classnames';

import kind from '@enact/core/kind';

import {VirtualListCore} from '../VirtualList/VirtualListBase';

import css from './VirtualVariableList.less';

const
	rowNumberColFuncShape = PropTypes.shape({row: PropTypes.number.isRequired, col: PropTypes.func.isRequired}),
	rowFuncColNumberShape = PropTypes.shape({row: PropTypes.func.isRequired, col: PropTypes.number.isRequired});

class VirtualVariableListCore extends Component {
	static propTypes = /** @lends moonstone/VirtualVariableList/VirtualVariableListBase.VirtualVariableListCore.prototype */ {
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
		 * Data for the list.
		 * Check mutation of this and determine whether the list should update or not.
		 *
		 * @type {Any}
		 * @default []
		 * @public
		 */
		data: PropTypes.any.isRequired,

		/**
		 * Size of data for the list.
		 *
		 * @type {Object}
		 * @public
		 */
		dataSize: PropTypes.oneOfType([rowNumberColFuncShape, rowFuncColNumberShape]).isRequired,

		/**
		 * Size of an item for the list.
		 *.
		 * @type {Object}
		 * @public
		 */
		itemSize: PropTypes.oneOfType([rowNumberColFuncShape, rowFuncColNumberShape]).isRequired,

		/**
		 * Adjust item width if the item is located in the list edge.
		 *
		 * @type {Boolean}
		 * @private
		 */
		clipItem: PropTypes.bool,

		/**
		 * For variable width or variable height, we need to define max scroll width or max scroll height
		 * instead of calculating them from all items.
		 *
		 * @type {Number}
		 * @public
		 */
		maxVariableScrollSize: PropTypes.number,

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
		 * Position x.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		posX: PropTypes.number,

		/**
		 * Position y.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		posY: PropTypes.number,

		/**
		 * Direction specific options of the list; valid values are `'row'` and `'col'`.
		 *
		 * @type {String}
		 * @public
		 */
		variableAxis: PropTypes.oneOf(['row', 'col'])
	}

	static defaultProps = {
		clipItem: false,
		component: null,
		data: [],
		dataSize: 0,
		overhang: 3,
		posX: 0,
		posY: 0,
		variableAxis: 'row',
		style: {}
	}

	scrollBounds = {
		clientWidth: 0,
		clientHeight: 0,
		scrollWidth: 0,
		scrollHeight: 0,
		maxLeft: 0,
		maxTop: 0
	}

	primary = null
	secondary = null

	fixedAxis = 'col'

	cc = []

	containerRef = null

	constructor (props) {
		super(props);

		this.state = {numOfItems: 0, primaryFirstIndex: 0};
		this.initContainerRef = this.initRef('containerRef');

		this.fixedAxis = (props.variableAxis === 'row') ? 'col' : 'row';
	}

	getScrollBounds = () => this.scrollBounds

	getContainerNode = () => this.containerRef

	getClientSize = (node) => {
		return {
			clientWidth: node.clientWidth,
			clientHeight: node.clientHeight
		};
	}

	calculateMetrics (props) {
		const
			{itemSize, variableAxis} = props,
			node = this.getContainerNode();

		if (!node) {
			return;
		}

		const
			{clientWidth, clientHeight} = this.getClientSize(node),
			heightInfo = {
				clientSize: clientHeight,
				itemSize,
				minItemSize: itemSize.minHeight || null,
				scrollPosition: 0
			},
			widthInfo = {
				clientSize: clientWidth,
				itemSize,
				minItemSize: itemSize.minWidth || null,
				scrollPosition: 0
			};
		let primary, secondary, primaryThresholdBase;

		if (variableAxis === 'row') {
			primary = heightInfo;
			secondary = widthInfo;
		} else {
			primary = widthInfo;
			secondary = heightInfo;
		}

		primary.itemSize = itemSize[variableAxis];
		secondary.itemSize = itemSize[this.fixedAxis];

		primary.maxFirstIndex = 0;
		primaryThresholdBase = primary.itemSize * 2;
		primary.threshold = {min: -Infinity, max: primaryThresholdBase, base: primaryThresholdBase};

		this.primary = primary;
		this.secondary = secondary;

		// eslint-disable-next-line react/no-direct-mutation-state
		this.state.primaryFirstIndex = 0;
		// eslint-disable-next-line react/no-direct-mutation-state
		this.state.numOfItems = 0;
	}

	updateStatesAndBounds (props) {
		const
			{dataSize, overhang, variableAxis} = props,
			{primaryFirstIndex} = this.state,
			{fixedAxis, primary, secondary} = this;
		let numOfItems = Math.ceil(primary.clientSize / primary.itemSize) + overhang;

		numOfItems = Math.min(dataSize[variableAxis], numOfItems);

		primary.dataSize = dataSize[variableAxis];
		primary.maxFirstIndex = primary.dataSize - numOfItems;

		secondary.dataSize = dataSize[fixedAxis];



		this.setState({numOfItems, primaryFirstIndex: Math.min(primaryFirstIndex, primary.maxFirstIndex)});
		this.calculateScrollBounds(props);
		this.initSecondaryScrollInfo(primary.dataSize, numOfItems);
	}

	calculateScrollBounds (props) {
		const node = this.getContainerNode();

		if (!node) {
			return;
		}

		const
			{maxVariableScrollSize, variableAxis} = props,
			{scrollBounds} = this,
			{clientWidth, clientHeight} = this.getClientSize(node);
		let maxPos;

		scrollBounds.clientWidth = clientWidth;
		scrollBounds.clientHeight = clientHeight;
		scrollBounds.scrollWidth = (variableAxis === 'row') ? maxVariableScrollSize : this.getScrollWidth();
		scrollBounds.scrollHeight = (variableAxis === 'col') ? maxVariableScrollSize : this.getScrollHeight();
		scrollBounds.maxLeft = Math.max(0, scrollBounds.scrollWidth - clientWidth);
		scrollBounds.maxTop = Math.max(0, scrollBounds.scrollHeight - clientHeight);

		// correct position
		maxPos = (variableAxis === 'row') ? scrollBounds.maxTop : scrollBounds.maxLeft;

		this.syncPrimaryThreshold(maxPos);
	}

	syncPrimaryThreshold (maxPos) {
		const {threshold} = this.primary;

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

	initSecondaryScrollInfo (primaryDataSize, numOfItems) {
		const {secondary} = this;

		secondary.firstIndices = Array(primaryDataSize);
		secondary.lastIndices = Array(primaryDataSize);
		secondary.positionOffsets = Array(primaryDataSize);
		secondary.thresholds = Array(primaryDataSize);

		for (let i = 0; i < numOfItems; i++) {
			this.updateSecondaryScrollInfo(i, 0);
		}
	}

	updateSecondaryScrollInfo (primaryIndex, secondaryPosition) {
		const
			{data, maxVariableScrollSize, variableAxis} = this.props,
			{fixedAxis, secondary} = this,
			i = primaryIndex,
			secondaryDataSize = secondary.dataSize({data, index:{[variableAxis]: i}});
		let
			accumulatedSize = 0,
			size, // width or height
			j;

		secondary.positionOffsets[i] = [];
		secondary.thresholds[i] = {};

		for (j = 0; j < secondaryDataSize; j++) {
			size = secondary.itemSize({data, index: {[variableAxis]: i, [fixedAxis]: j}});
			secondary.positionOffsets[i][j] = accumulatedSize;
			if (accumulatedSize <= secondaryPosition && secondaryPosition < accumulatedSize + size) {
				secondary.firstIndices[i] = j;
				secondary.thresholds[i].min = accumulatedSize;
			}
			if (accumulatedSize + size > secondaryPosition + secondary.clientSize) {
				secondary.lastIndices[i] = j;
				secondary.thresholds[i].max = accumulatedSize + size;
				break;
			}
			accumulatedSize += size;
		}
		if (j === secondaryDataSize || !secondary.thresholds[i].max) {
			secondary.lastIndices[i] = secondaryDataSize - 1;
			secondary.thresholds[i].max = maxVariableScrollSize;
		}
	}

	setPrimaryScrollPosition (pos, dir) {
		const
			{variableAxis} = this.props,
			{primaryFirstIndex} = this.state,
			{primary, scrollBounds} = this,
			{itemSize, maxFirstIndex, threshold} = primary,
			maxPos = (variableAxis === 'row') ? scrollBounds.maxTop : scrollBounds.maxLeft,
			minOfMax = threshold.base,
			maxOfMin = maxPos - minOfMax;
		let
			delta,
			newPrimaryFirstIndex = primaryFirstIndex,
			numOfGridLines;

		if (dir === 1 && pos > threshold.max) {
			delta = pos - threshold.max;
			numOfGridLines = Math.ceil(delta / itemSize); // how many lines should we add
			threshold.max = Math.min(maxPos, threshold.max + numOfGridLines * itemSize);
			threshold.min = Math.min(maxOfMin, threshold.max - itemSize);
			newPrimaryFirstIndex = Math.min(maxFirstIndex, primaryFirstIndex + numOfGridLines);
		} else if (dir === -1 && pos < threshold.min) {
			delta = threshold.min - pos;
			numOfGridLines = Math.ceil(delta / itemSize);
			threshold.max = Math.max(minOfMax, threshold.min - (numOfGridLines * itemSize - itemSize));
			threshold.min = (threshold.max > minOfMax) ? threshold.max - itemSize : -Infinity;
			newPrimaryFirstIndex = Math.max(0, primaryFirstIndex - numOfGridLines);
		}
		this.syncPrimaryThreshold(maxPos);
		primary.scrollPosition = pos;

		return newPrimaryFirstIndex;
	}

	setSecondaryScrollPosition (newPrimaryFirstIndex, pos, dir) {
		const
			{numOfItems, primaryFirstIndex} = this.state,
			{clientSize, thresholds: secondaryThresholds} = this.secondary;
		let	shouldUpdateState = false;

		for (let i = newPrimaryFirstIndex; i < newPrimaryFirstIndex + numOfItems; i++) {
			if (
				// primary boundary
				(primaryFirstIndex < newPrimaryFirstIndex && i >= primaryFirstIndex + numOfItems) ||
				(primaryFirstIndex > newPrimaryFirstIndex && i < primaryFirstIndex) ||
				// secondary boundary
				(dir === 1 && pos + clientSize > secondaryThresholds[i].max) ||
				(dir === -1 && pos < secondaryThresholds[i].min) ||
				// threshold was not defined yet
				(!(secondaryThresholds[i].max || secondaryThresholds[i].min))
			) {
				this.updateSecondaryScrollInfo(i, pos);
				shouldUpdateState = true;
			}
		}
		this.secondary.scrollPosition = pos;

		return shouldUpdateState;
	}

	setScrollPosition (x, y, dirX, dirY) {
		const
			{variableAxis} = this.props,
			{numOfItems, primaryFirstIndex} = this.state,
			isAariableAxisRow = (variableAxis === 'row');
		let
			dir = {primary: 0},
			pos,
			newPrimaryFirstIndex,
			shouldUpdateState = false;

		if (isAariableAxisRow) {
			pos = {primary: y, secondary: x};
			dir = {primary: dirY, secondary: dirX};
		} else if (variableAxis === 'col') {
			pos = {primary: x, secondary: y};
			dir = {primary: dirX, secondary: dirY};
		} else {
			pos = {primary: (isAariableAxisRow) ? y : x};
			dir = {primary: (isAariableAxisRow) ? dirY : dirX};
		}

		// for primary direction
		newPrimaryFirstIndex = this.setPrimaryScrollPosition(pos.primary, dir.primary);

		// for secondary direction
		shouldUpdateState = this.setSecondaryScrollPosition(newPrimaryFirstIndex, pos.secondary, dir.secondary);

		if ((primaryFirstIndex !== newPrimaryFirstIndex) || shouldUpdateState === true) {
			this.setState({primaryFirstIndex: newPrimaryFirstIndex});
		} else {
			this.positionItems(this.applyStyleToExistingNode, {
				updateFrom: primaryFirstIndex,
				updateTo: primaryFirstIndex + numOfItems
			});
		}
	}

	applyStyleToExistingNode = (i, j, key, ...rest) => {
		const node = this.containerRef.children[key];

		if (node) {
			this.composeStyle(node.style, ...rest);
		}
	}

	applyStyleToNewNode = (i, j, key, ...rest) => {
		const
			{component, data, variableAxis} = this.props,
			{fixedAxis} = this,
			itemElement = component({
				data,
				index: {[variableAxis]: i, [fixedAxis]: j},
				key
			}),
			style = {};

		this.composeStyle(style, ...rest);

		this.cc[key] = React.cloneElement(
			itemElement, {
				style: {...itemElement.props.style, ...style}
			}
		);
	}

	positionItems (applyStyle, {updateFrom, updateTo}) {
		const
			{clipItem, data, variableAxis} = this.props,
			{fixedAxis, primary, secondary} = this;
		let
			primaryPosition = primary.itemSize * updateFrom,
			secondaryPosition = 0,
			width,
			height,
			key = 0,
			position,
			size;

		primaryPosition -= primary.scrollPosition;
		if (variableAxis === 'row') {
			secondaryPosition -= secondary.scrollPosition;
			height = primary.itemSize;
		} else if (variableAxis === 'col') {
			secondaryPosition -= secondary.scrollPosition;
			width = primary.itemSize;
		}

		// positioning items
		for (let i = updateFrom; i < updateTo; i++) {
			position = secondaryPosition + this.secondary.positionOffsets[i][secondary.firstIndices[i]];

			for (let j = secondary.firstIndices[i]; j <= secondary.lastIndices[i]; j++) {
				size = secondary.itemSize({data, index: {[variableAxis]: i, [fixedAxis]: j}});

				if (clipItem) {
					if (position < 0) {
						size += position;
						position = 0;
					}
					if (position + size > secondary.clientSize) {
						size = secondary.clientSize - position;
					}
				}

				if (variableAxis === 'row') {
					applyStyle(i, j, key, size, height, primaryPosition, position);
				} else if (variableAxis === 'col') {
					applyStyle(i, j, key, width, size, primaryPosition, position);
				}

				position += size;
				key++;
			}

			primaryPosition += primary.itemSize;
		}
	}

	composeStyle (style, width, height, ...rest) {
		style.width = width;
		style.height = height;
		this.composeTransform(style, ...rest);
	}

	getXY = (primaryPosition, secondaryPosition) => {
		const rtlDirection = this.context.rtl ? -1 : 1;
		return ((this.props.variableAxis === 'row') ? {x: (secondaryPosition * rtlDirection), y: primaryPosition} : {x: (primaryPosition * rtlDirection), y: secondaryPosition});
	}

	composeTransform (style, primaryPosition, secondaryPosition = 0) {
		const {x, y} = this.getXY(primaryPosition, secondaryPosition);
		style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
	}

	getScrollHeight = () => ((this.props.variableAxis === 'row') ? this.getVirtualScrollDimension() : this.scrollBounds.clientHeight)

	getScrollWidth = () => ((this.props.variableAxis === 'row') ? this.scrollBounds.clientWidth : this.getVirtualScrollDimension())

	getVirtualScrollDimension = () => (this.primary.dataSize * this.primary.itemSize)

	// Calculate metrics for VirtualVariableList after the 1st render to know client W/H.
	// We separate code related with data due to re use it when data changed.
	componentDidMount () {
		this.calculateMetrics(this.props);
		this.updateStatesAndBounds(this.props);
	}

	// Call updateStatesAndBounds here when dataSize has been changed to update nomOfItems state.
	// Calling setState within componentWillReceivePropswill not trigger an additional render.
	componentWillReceiveProps (nextProps) {
		const
			{dataSize, itemSize, overhang, posX, posY, variableAxis} = this.props,
			hasMetricsChanged = (
				((itemSize instanceof Object) ? (itemSize.minWidth !== nextProps.itemSize.minWidth || itemSize.minHeight !== nextProps.itemSize.minHeight || itemSize.row !== nextProps.itemSize.row || itemSize.col !== nextProps.itemSize.col) : itemSize !== nextProps.itemSize) ||
				overhang !== nextProps.overhang ||
				variableAxis !== nextProps.variableAxis
			),
			hasDataChanged = (
				(dataSize instanceof Object) ?
				(dataSize.row !== nextProps.dataSize.row || dataSize.col !== nextProps.dataSize.col) :
				(dataSize !== nextProps.dataSize)
			),
			isPositionChanged = (
				(posX !== nextProps.posX) || (posY !== nextProps.posY)
			);

		this.fixedAxis = (nextProps.variableAxis === 'row') ? 'col' : 'row';

		if (hasMetricsChanged) {
			this.calculateMetrics(nextProps);
			this.updateStatesAndBounds(hasDataChanged ? nextProps : this.props);
		} else if (hasDataChanged) {
			this.updateStatesAndBounds(nextProps);
		}

		if (isPositionChanged) {
			if (nextProps.variableAxis === 'row') {
				this.setScrollPosition(
					clamp(0, nextProps.maxVariableScrollSize - this.scrollBounds.clientWidth, nextProps.posX),
					clamp(0, this.scrollBounds.maxTop, nextProps.posY),
					Math.sign(nextProps.posX - posX),
					Math.sign(nextProps.posY - posY)
				);
			} else {
				this.setScrollPosition(
					clamp(0, this.scrollBounds.maxLeft, nextProps.posX),
					clamp(0, nextProps.maxVariableScrollSize - this.scrollBounds.clientHeight, nextProps.posY),
					Math.sign(nextProps.posX - posX),
					Math.sign(nextProps.posY - posY)
				);
			}
		}
	}

	// render

	initRef (prop) {
		return (ref) => {
			this[prop] = ref;
		};
	}

	renderCalculate () {
		const
			{numOfItems, primaryFirstIndex} = this.state,
			{primary} = this,
			max = Math.min(primary.dataSize, primaryFirstIndex + numOfItems);

		this.cc.length = 0;

		this.positionItems(this.applyStyleToNewNode, {updateFrom: primaryFirstIndex, updateTo: max});
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{primary, cc} = this;

		delete props.clipItem;
		delete props.component;
		delete props.data;
		delete props.dataSize;
		delete props.itemSize;
		delete props.maxVariableScrollSize;
		delete props.overhang;
		delete props.posX;
		delete props.posY;
		delete props.variableAxis;

		if (primary) {
			this.renderCalculate();
		}

		return (
			<div {...props} ref={this.initContainerRef}>
				{cc}
			</div>
		);
	}
}

// PropTypes shapes
const
	itemHeadersAnyShape = PropTypes.shape({item: PropTypes.any.isRequired, rowHeader: PropTypes.any.isRequired, colHeader: PropTypes.any.isRequired}),
	itemHeadersFuncShpae = PropTypes.shape({item: PropTypes.func.isRequired, rowHeader: PropTypes.func.isRequired, colHeader: PropTypes.func.isRequired}),
	rowNumberColFuncHeadersNumberShape = PropTypes.shape({row: PropTypes.number.isRequired, col: PropTypes.func.isRequired, rowHeader: PropTypes.number.isRequired, colHeader: PropTypes.number.isRequired}),
	rowFuncColNumberHeadersNumberShape = PropTypes.shape({row: PropTypes.func.isRequired, col: PropTypes.number.isRequired, rowHeader: PropTypes.number.isRequired, colHeader: PropTypes.number.isRequired});

/**
 * {@link module:@enact/moonstone/VirtualVariableList~VirtualVariableList} is a VirtualVariableList with Moonstone styling
 * which has a variable width or height.
 *
 * @class VirtualVariableList
 * @ui
 * @public
 */
const VirtualVariableList = kind({
	name: 'VirtualVariableList',

	propTypes: /** @lends moonstone/VirtualVariableList.VirtualVariableList.prototype */ {
		/**
		 * The render function for an item of the list.
		 * `index` is for accessing the index of the item.
		 * `key` MUST be passed as a prop for DOM recycling.
		 * Data manipulation can be done in this function.
		 *
		 * @type {Function|Object}
		 * @public
		 */
		component: PropTypes.oneOfType([PropTypes.func, itemHeadersFuncShpae]).isRequired,

		/**
		 * Data for the list.
		 * Check mutation of this and determine whether the list should update or not.
		 *
		 * @type {Array|Object}
		 * @public
		 */
		data: PropTypes.oneOfType([PropTypes.array, itemHeadersAnyShape]).isRequired,

		/**
		 * Size of data for the list.
		 *
		 * @type {Object}
		 * @public
		 */
		dataSize: PropTypes.oneOfType([rowNumberColFuncShape, rowFuncColNumberShape, rowNumberColFuncHeadersNumberShape, rowFuncColNumberHeadersNumberShape]).isRequired,

		/**
		 * Size of an item for the list.
		 *
		 * @type {Object}
		 * @public
		 */
		itemSize: PropTypes.oneOfType([rowNumberColFuncShape, rowFuncColNumberShape, rowNumberColFuncHeadersNumberShape, rowFuncColNumberHeadersNumberShape]).isRequired,

		/**
		 * Direction specific options of the list; valid values are `'row'` and `'col'`.
		 *
		 * @type {String}
		 * @public
		 */
		variableAxis: PropTypes.oneOf(['row', 'col']).isRequired,

		/**
		 * Adjust item width if the item is located in the list edge.
		 *
		 * @type {Boolean}
		 * @private
		 */
		clipItem: PropTypes.bool,

		/**
		 * Use row and col headers; valid values are `'both'` and `'none'`.
		 *
		 * @type {Boolean}
		 * @private
		 */
		headers: PropTypes.oneOf(['both', 'none']),

		/**
		 * Position x.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		posX: PropTypes.number,

		/**
		 * Position y.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		posY: PropTypes.number
	},

	styles: {
		css,
		className: 'virtualVariableList'
	},

	computed: {
		clipItem: ({clipItem}) => (clipItem || true)
	},

	render: (orgProps) => {
		if (orgProps.headers === 'both') {
			const
				{component, data, dataSize, itemSize, posX, posY, variableAxis, ...rest} = orgProps,
				offsetX = itemSize.rowHeader,
				offsetY = itemSize.row,
				rowProps = {
					data: data.rowHeader,
					dataSize: dataSize.rowHeader,
					direction: 'vertical',
					itemSize: itemSize.row,
					posX: 0,
					posY,
					style: {width: offsetX + 'px', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px'},
					component: component.rowHeader
				},
				colProps = {
					data: data.colHeader,
					dataSize: dataSize.colHeader,
					direction: 'horizontal',
					itemSize: itemSize.colHeader,
					posX,
					posY: 0,
					style: {width: 'calc(100% - ' + offsetX + 'px)', height: offsetY + 'px', left: offsetX + 'px'},
					component: component.colHeader
				},
				itemProps = {
					...rest,
					clipItem: orgProps.clipItem,
					data: data.item,
					dataSize: {
						row: dataSize.row,
						col: dataSize.col
					},
					itemSize: {
						row: itemSize.row,
						col: itemSize.col
					},
					posX,
					posY,
					variableAxis,
					style: {width: 'calc(100% - ' + offsetX + 'px)', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px', left: offsetX + 'px'},
					component: component.item
				},
				childProps = {
					style: {width: offsetX + 'px', height: offsetY + 'px'}
				};

			return (
				<div className={classNames(orgProps.className, css.headers)} style={orgProps.style}>
					<VirtualListCore {...rowProps} />
					<VirtualListCore {...colProps} />
					<VirtualVariableListCore {...itemProps} />
					<div {...childProps}>{orgProps.children}</div>
				</div>
			);
		} else {
			return (<VirtualVariableListCore {...orgProps} />);
		}
	}
});

export default VirtualVariableList;
export {VirtualVariableList, VirtualVariableListCore};
