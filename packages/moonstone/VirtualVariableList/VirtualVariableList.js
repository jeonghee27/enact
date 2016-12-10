/**
 * Exports the {@link moonstone/VirtualVariableList.VirtualVariableList} component.
 *
 * @module moonstone/VirtualVariableList
 */

import React, {Component, PropTypes} from 'react';
import clamp from 'ramda/src/clamp';
import classNames from 'classnames';

import kind from '@enact/core/kind';
import {Spotlight, SpotlightContainerDecorator} from '@enact/spotlight';
import {contextTypes} from '@enact/i18n/I18nDecorator';

import {dataIndexAttribute, Scrollable} from '../Scroller/Scrollable';
import {VirtualListCore} from '../VirtualList/VirtualListBase';

import css from './VirtualVariableList.less';

const
	dataContainerDisabledAttribute = 'data-container-disabled',
	dataContainerIdAttribute = 'data-container-id',
	keyLeft	 = 37,
	keyUp	 = 38,
	keyRight = 39,
	keyDown	 = 40,
	nop = () => {};

class VirtualVariableListCore extends Component {
	static propTypes = /** @lends moonstone/VirtualVariableList/VirtualVariableListBase.VirtualVariableListCore.prototype */ {
		/**
		 * The render function for an item of the list.
		 * `index` is for accessing the index of the item.
		 * `key` MUST be passed as a prop for DOM recycling.
		 * Data manipulation can be done in this function.
		 *
		 * @type {Function}
		 * @default ({index, key}) => (<div key={key}>{index}</div>)
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
		 * Size of data for the list; valid values are either a number
		 * or an object that has `fixed` and `variable`.
		 *
		 * @type {Object}
		 * @public
		 */
		dataSize: PropTypes.object.isRequired,

		/**
		 * Size of an item for the list; valid values are either a number for `VirtualVariableList`
		 * or an object that has `minWidth` and `minHeight` for `VirtualGridList`.
		 *
		 * @type {Object}
		 * @public
		 */
		itemSize: PropTypes.object.isRequired,

		/**
		 * Callback method of scrollTo.
		 * Normally, `Scrollable` should set this value.
		 *
		 * @type {Function}
		 * @private
		 */
		cbScrollTo: PropTypes.func,

		/**
		 * Adjust item width if the item is located in the list edge.
		 *
		 * @type {Boolean}
		 * @private
		 */
		clipItem: PropTypes.bool,

		/**
		 * Direction of the list; valid values are `'horizontal'` and `'vertical'`.
		 *
		 * @type {String}
		 * @default 'vertical'
		 * @public
		 */
		direction: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * For variable width or variable height, we need to define max scroll width or max scroll height
		 * instead of calculating them from all items.
		 *
		 * @type {Number}
		 * @public
		 */
		maxVariableScrollSize: PropTypes.number,

		/**
		 * Called when onScroll [events]{@glossary event} occurs.
		 *
		 * @type {Function}
		 * @private
		 */
		onScroll: PropTypes.func,

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
		 * Option for positioning the items; valid values are `'byItem'`, `'byContainer'`,
		 * and `'byBrowser'`.
		 * If `'byItem'`, the list moves each item.
		 * If `'byContainer'`, the list moves the container that contains rendered items.
		 * If `'byBrowser'`, the list scrolls by browser.
		 *
		 * @type {String}
		 * @default 'byItem'
		 * @private
		 */
		positioningOption: PropTypes.oneOf(['byItem', 'byContainer', 'byBrowser']),

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
		 * Spacing between items.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		spacing: PropTypes.number,

		/**
		 * Direction specific options of the list; valid values are `'width'` and `'height'`.
		 *
		 * @type {String}
		 * @public
		 */
		variableAxis: PropTypes.oneOf(['row', 'col'])
	}

	static contextTypes = contextTypes

	static defaultProps = {
		cbScrollTo: nop,
		clipItem: false,
		component: nop,
		data: [],
		dataSize: 0,
		direction: 'vertical',
		onScroll: nop,
		overhang: 3,
		positioningOption: 'byItem',
		posX: 0,
		posY: 0,
		spacing: 0,
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

	isPrimaryDirectionVertical = true
	isVirtualGridList = false
	isVirtualVariableList = false
	
	dimensionToExtent = 0
	cc = []
	fixedAxis = 'col'

	containerRef = null
	wrapperRef = null

	composeItemPosition = null
	positionContainer = null

	// spotlight
	nodeIndexToBeBlurred = null
	lastFocusedIndex = null

	constructor (props) {
		const {positioningOption} = props;

		super(props);

		this.state = {numOfItems: 0, primaryFirstIndex: 0};
		this.initContainerRef = this.initRef('containerRef');
		this.initWrapperRef = this.initRef('wrapperRef');

		switch (positioningOption) {
			case 'byItem':
				this.composeItemPosition = this.composeTransform;
				this.positionContainer = nop;
				break;
			case 'byContainer':
				this.composeItemPosition = this.composeLeftTop;
				this.positionContainer = this.applyTransformToContainerNode;
				break;
			case 'byBrowser':
				this.composeItemPosition = this.composeLeftTop;
				this.positionContainer = this.applyScrollLeftTopToWrapperNode;
				break;
		}

		this.fixedAxis = (props.variableAxis === 'row') ? 'col' : 'row';
	}

	isVertical = () => (this.isVirtualVariableList || this.isPrimaryDirectionVertical)

	isHorizontal = () => (this.isVirtualVariableList || !this.isPrimaryDirectionVertical)

	getScrollBounds = () => (this.scrollBounds)

	getGridPosition (index) {
		const
			{dimensionToExtent, primary, secondary} = this,
			primaryPosition = Math.floor(index / dimensionToExtent) * primary.gridSize,
			secondaryPosition = (index % dimensionToExtent) * secondary.gridSize;

		return {primaryPosition, secondaryPosition};
	}

	getVariableGridPosition (i, j) {
		const
			{dimensionToExtent, primary, secondary} = this,
			primaryPosition = Math.floor(i / dimensionToExtent) * primary.gridSize,
			secondaryPosition = secondary.positionOffsets[i][j];

		return {primaryPosition, secondaryPosition};
	}

	getItemPosition = (index) => this.gridPositionToItemPosition(this.getGridPosition(index))

	gridPositionToItemPosition = ({primaryPosition, secondaryPosition}) =>
		(this.isPrimaryDirectionVertical ? {left: secondaryPosition, top: primaryPosition} : {left: primaryPosition, top: secondaryPosition})

	getContainerNode = (positioningOption) => {
		if (positioningOption === 'byItem') {
			return this.containerRef;
		} else {
			return this.wrapperRef;
		}
	}

	getClientSize = (node) => {
		return {
			clientWidth: node.clientWidth,
			clientHeight: node.clientHeight
		};
	}

	calculateMetrics (props) {
		const
			{direction, itemSize, positioningOption, spacing, variableAxis} = props,
			node = this.getContainerNode(positioningOption);

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
		let primary, secondary, dimensionToExtent, primaryThresholdBase;

		this.isPrimaryDirectionVertical = (direction === 'vertical');
		this.isVirtualVariableList = ((variableAxis === 'row') || (variableAxis === 'col'));
		this.isVirtualGridList = (itemSize.minWidth && itemSize.minHeight);

		if (this.isPrimaryDirectionVertical) {
			primary = heightInfo;
			secondary = widthInfo;
		} else {
			primary = widthInfo;
			secondary = heightInfo;
		}
		dimensionToExtent = 1;

		if (this.isVirtualGridList) {
			// the number of columns is the ratio of the available width plus the spacing
			// by the minimum item width plus the spacing
			dimensionToExtent = Math.max(Math.floor((secondary.clientSize + spacing) / (secondary.minItemSize + spacing)), 1);
			// the actual item width is a ratio of the remaining width after all columns
			// and spacing are accounted for and the number of columns that we know we should have
			secondary.itemSize = Math.round((secondary.clientSize - (spacing * (dimensionToExtent - 1))) / dimensionToExtent);
			// the actual item height is related to the item width
			primary.itemSize = Math.round(primary.minItemSize * (secondary.itemSize / secondary.minItemSize));
		}

		if (this.isVirtualVariableList) {
			primary.itemSize = itemSize[variableAxis];
			primary.gridSize = primary.itemSize + spacing;
			secondary.itemSize = itemSize[this.fixedAxis];
			secondary.gridSize = itemSize[variableAxis] + spacing;
		} else {
			primary.gridSize = primary.itemSize + spacing;
			secondary.gridSize = secondary.itemSize + spacing;
		}

		primary.maxFirstIndex = 0;
		primaryThresholdBase = primary.gridSize * 2;
		primary.threshold = {min: -Infinity, max: primaryThresholdBase, base: primaryThresholdBase};

		this.dimensionToExtent = dimensionToExtent;

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
			{dimensionToExtent, fixedAxis, primary, secondary, isVirtualVariableList} = this;
		let numOfItems = dimensionToExtent * (Math.ceil(primary.clientSize / primary.gridSize) + overhang);

		if (isVirtualVariableList) {
			numOfItems = Math.min(dataSize[variableAxis], numOfItems);
			primary.dataSize = dataSize[variableAxis];
			secondary.dataSize = dataSize[fixedAxis];
		} else {
			numOfItems = Math.min(dataSize, numOfItems);
			primary.dataSize = dataSize;
		}

		primary.maxFirstIndex = primary.dataSize - numOfItems;

		this.setState({primaryFirstIndex: Math.min(primaryFirstIndex, primary.maxFirstIndex), numOfItems});
		this.calculateScrollBounds(props);
		if (isVirtualVariableList) {
			this.initSecondaryScrollInfo(primary.dataSize, numOfItems);
		}
	}

	calculateScrollBounds (props) {
		const
			node = this.getContainerNode(props.positioningOption);

		if (!node) {
			return;
		}

		const
			{clientWidth, clientHeight} = this.getClientSize(node),
			{cbScrollTo, maxVariableScrollSize, variableAxis} = this.props,
			{scrollBounds, isPrimaryDirectionVertical, primary} = this;
		let maxPos;

		scrollBounds.clientWidth = clientWidth;
		scrollBounds.clientHeight = clientHeight;
		scrollBounds.scrollWidth = (variableAxis === 'row') ? maxVariableScrollSize : this.getScrollWidth();
		scrollBounds.scrollHeight = (variableAxis === 'col') ? maxVariableScrollSize : this.getScrollHeight();
		scrollBounds.maxLeft = Math.max(0, scrollBounds.scrollWidth - clientWidth);
		scrollBounds.maxTop = Math.max(0, scrollBounds.scrollHeight - clientHeight);

		// correct position
		maxPos = isPrimaryDirectionVertical ? scrollBounds.maxTop : scrollBounds.maxLeft;

		this.syncPrimaryThreshold(maxPos);

		if (primary.scrollPosition > maxPos) {
			cbScrollTo({position: (isPrimaryDirectionVertical) ? {y: maxPos} : {x: maxPos}});
		}
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
			{dimensionToExtent, primary, scrollBounds, isPrimaryDirectionVertical} = this,
			{primaryFirstIndex} = this.state,
			{gridSize, maxFirstIndex, threshold} = primary,
			maxPos = isPrimaryDirectionVertical ? scrollBounds.maxTop : scrollBounds.maxLeft,
			minOfMax = threshold.base,
			maxOfMin = maxPos - minOfMax;
		let
			delta,
			newPrimaryFirstIndex = primaryFirstIndex,
			numOfGridLines;

		if (dir === 1 && pos > threshold.max) {
			delta = pos - threshold.max;
			numOfGridLines = Math.ceil(delta / gridSize); // how many lines should we add
			threshold.max = Math.min(maxPos, threshold.max + numOfGridLines * gridSize);
			threshold.min = Math.min(maxOfMin, threshold.max - gridSize);
			newPrimaryFirstIndex = Math.min(maxFirstIndex, (dimensionToExtent * Math.ceil(primaryFirstIndex / dimensionToExtent)) + (numOfGridLines * dimensionToExtent));
		} else if (dir === -1 && pos < threshold.min) {
			delta = threshold.min - pos;
			numOfGridLines = Math.ceil(delta / gridSize);
			threshold.max = Math.max(minOfMax, threshold.min - (numOfGridLines * gridSize - gridSize));
			threshold.min = (threshold.max > minOfMax) ? threshold.max - gridSize : -Infinity;
			newPrimaryFirstIndex = Math.max(0, (dimensionToExtent * Math.ceil(primaryFirstIndex / dimensionToExtent)) - (numOfGridLines * dimensionToExtent));
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

	setScrollPosition (x, y, dirX, dirY, skipPositionContainer = false) {
		const
			{variableAxis} = this.props,
			{primaryFirstIndex} = this.state,
			{isPrimaryDirectionVertical} = this;
		let
			dir = {primary: 0},
			pos,
			newPrimaryFirstIndex,
			shouldUpdateState = false;

		if (variableAxis === 'row') {
			pos = {primary: y, secondary: x};
			dir = {primary: dirY, secondary: dirX};
		} else if (variableAxis === 'col') {
			pos = {primary: x, secondary: y};
			dir = {primary: dirX, secondary: dirY};
		} else {
			pos = {primary: isPrimaryDirectionVertical ? y : x};
			dir = {primary: isPrimaryDirectionVertical ? dirY : dirX};
		}

		// for primary direction
		newPrimaryFirstIndex = this.setPrimaryScrollPosition(pos.primary, dir.primary);

		// for secondary direction
		if (this.isVirtualVariableList) {
			shouldUpdateState = this.setSecondaryScrollPosition(newPrimaryFirstIndex, pos.secondary, dir.secondary);
		}

		if (!skipPositionContainer) {
			this.positionContainer();
		}

		if ((primaryFirstIndex !== newPrimaryFirstIndex) ||
			(this.isVirtualVariableList && shouldUpdateState === true)) {
			this.setState({primaryFirstIndex: newPrimaryFirstIndex});
		} else {
			this.positionItems(this.applyStyleToExistingNode, this.determineUpdatedNeededIndices(primaryFirstIndex));
		}
	}

	determineUpdatedNeededIndices (oldPrimaryFirstIndex) {
		const
			{positioningOption} = this.props,
			{numOfItems, primaryFirstIndex} = this.state;

		if (positioningOption === 'byItem') {
			return {
				updateFrom: primaryFirstIndex,
				updateTo: primaryFirstIndex + numOfItems
			};
		} else {
			const diff = primaryFirstIndex - oldPrimaryFirstIndex;
			return {
				updateFrom: (0 < diff && diff < numOfItems ) ? oldPrimaryFirstIndex + numOfItems : primaryFirstIndex,
				updateTo: (-numOfItems < diff && diff <= 0 ) ? oldPrimaryFirstIndex : primaryFirstIndex + numOfItems
			};
		}
	}

	applyStyleToExistingNode = (i, j, key, ...rest) => {
		const
			node = this.containerRef.children[key],
			id = this.isVirtualVariableList ? (i + '-' + j) : i;

		if (node) {
			// spotlight
			node.setAttribute(dataIndexAttribute, id);
			if (key === this.nodeIndexToBeBlurred && id !== this.lastFocusedIndex) {
				node.blur();
				this.nodeIndexToBeBlurred = null;
			}
			this.composeStyle(node.style, ...rest);
		}
	}

	applyStyleToNewNode = (i, j, key, ...rest) => {
		const
			{component, data, variableAxis} = this.props,
			{fixedAxis, isVirtualVariableList} = this,
			id = isVirtualVariableList ? (i + '-' + j) : i,
			itemElement = isVirtualVariableList ?
				component({
					data,
					index: {[variableAxis]: i, [fixedAxis]: j},
					key: id
				}) :
				component({
					data,
					index: i,
					key
				}),
			style = {};

		this.composeStyle(style, ...rest);

		this.cc[key] = React.cloneElement(
			itemElement, {
				style: {...itemElement.props.style, ...style},
				[dataIndexAttribute]: id
			}
		);
	}

	positionItems (applyStyle, {updateFrom, updateTo}) {
		const
			{clipItem, data, positioningOption, variableAxis} = this.props,
			{numOfItems} = this.state,
			{dimensionToExtent, fixedAxis, isPrimaryDirectionVertical, isVirtualVariableList, primary, secondary} = this;
		let
			{primaryPosition, secondaryPosition} = this.getGridPosition(updateFrom),
			width,
			height,
			key = 0,
			position,
			size,
			j;

		primaryPosition -= (positioningOption === 'byItem') ? primary.scrollPosition : 0;
		if (variableAxis === 'row') {
			secondaryPosition -= (positioningOption === 'byItem') ? secondary.scrollPosition : 0;
			height = primary.itemSize;
		} else if (variableAxis === 'col') {
			secondaryPosition -= (positioningOption === 'byItem') ? secondary.scrollPosition : 0;
			width = primary.itemSize;
		} else {
			width = (isPrimaryDirectionVertical ? secondary.itemSize : primary.itemSize) + 'px';
			height = (isPrimaryDirectionVertical ? primary.itemSize : secondary.itemSize) + 'px';
			j = updateFrom % dimensionToExtent;
		}

		// positioning items
		for (let i = updateFrom; i < updateTo; i++) {
			if (isVirtualVariableList) {
				position = secondaryPosition + this.secondary.positionOffsets[i][secondary.firstIndices[i]];				

				for (j = secondary.firstIndices[i]; j <= secondary.lastIndices[i]; j++) {
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

				primaryPosition += primary.gridSize;
			} else {
				key = i % numOfItems;

				applyStyle(i, null, key, width, height, primaryPosition, secondaryPosition);

				if (++j === dimensionToExtent) {
					secondaryPosition = 0;
					primaryPosition += primary.gridSize;
					j = 0;
				} else {
					secondaryPosition += secondary.gridSize;
				}
			}
		}
	}

	composeStyle (style, width, height, ...rest) {
		if (this.isVirtualGridList || this.isVirtualVariableList) {
			style.width = width;
			style.height = height;
		}
		this.composeItemPosition(style, ...rest);
	}

	getXY = (primaryPosition, secondaryPosition) => (
		(this.isPrimaryDirectionVertical) ? {x: secondaryPosition, y: primaryPosition} : {x: primaryPosition, y: secondaryPosition}
	)

	composeTransform (style, primaryPosition, secondaryPosition = 0) {
		const {x, y} = this.getXY(primaryPosition, secondaryPosition);
		style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
	}

	composeLeftTop (style, primaryPosition, secondaryPosition = 0) {
		const {x, y} = this.getXY(primaryPosition, secondaryPosition);
		style.left = x + 'px';
		style.top = y + 'px';
	}

	applyTransformToContainerNode () {
		this.composeTransform(this.containerRef.style, -this.primary.scrollPosition, 0);
	}

	applyScrollLeftTopToWrapperNode () {
		const
			node = this.wrapperRef,
			{x, y} = this.getXY(this.primary.scrollPosition, 0);
		node.scrollLeft = x;
		node.scrollTop = y;
	}

	composeOverflow (style) {
		style[this.isPrimaryDirectionVertical ? 'overflowY' : 'overflowX'] = 'scroll';
	}

	getScrollHeight = () => (this.isPrimaryDirectionVertical ? this.getVirtualScrollDimension() : this.scrollBounds.clientHeight)

	getScrollWidth = () => (this.isPrimaryDirectionVertical ? this.scrollBounds.clientWidth : this.getVirtualScrollDimension())

	getVirtualScrollDimension = () => {
		const
			{dimensionToExtent, primary} = this,
			{spacing} = this.props;

		return (Math.ceil(primary.dataSize / dimensionToExtent) * primary.gridSize) - spacing;
	}

	adjustPositionOnFocus = (info, pos, itemSize, offsetHeader) => {
		const offsetToClientEnd = info.clientSize - itemSize;

		if (info.clientSize - offsetHeader >= itemSize) {
			if (pos > info.scrollPosition + offsetToClientEnd) {
				pos -= offsetToClientEnd;
			} else if (pos > info.scrollPosition + offsetHeader) {
				pos = info.scrollPosition;
			} else {
				pos -= offsetHeader;
			}
		}

		return pos;
	}

	calculatePositionOnFocus = (focusedIndex, key) => {
		const
			{data, variableAxis} = this.props,
			{fixedAxis, primary, secondary, isVirtualVariableList} = this;
		let gridPosition;
		if (isVirtualVariableList) {
			const
				indices = focusedIndex.split('-'),
				i = Number.parseInt(indices[0]),
				j = Number.parseInt(indices[1]);

			gridPosition = this.getVariableGridPosition(i, j);
			gridPosition.primaryPosition = this.adjustPositionOnFocus(primary, gridPosition.primaryPosition, primary.itemSize, 0);
			gridPosition.secondaryPosition = this.adjustPositionOnFocus(secondary, gridPosition.secondaryPosition, secondary.itemSize({data, index: {[variableAxis]: i, [fixedAxis]: j}}));
		} else {
			const index = Number.parseInt(focusedIndex);
			gridPosition = this.getGridPosition(index);
			gridPosition.primaryPosition = this.adjustPositionOnFocus(primary, gridPosition.primaryPosition, primary.itemSize);
			gridPosition.secondaryPosition = 0;
		}

		this.nodeIndexToBeBlurred = key;
		this.lastFocusedIndex = focusedIndex;

		return this.gridPositionToItemPosition(gridPosition);
	}

	setRestrict = (bool) => {
		Spotlight.set(this.props[dataContainerIdAttribute], {restrict: (bool) ? 'self-only' : 'self-first'});
	}

	setSpotlightContainerRestrict = (keyCode, index) => {
		const
			{isPrimaryDirectionVertical, dimensionToExtent, primary, isVirtualVariableList} = this;
		let
			isSelfOnly = false,
			i = 0,
			canMoveBackward,
			canMoveForward;

		if (isVirtualVariableList) {
			const indices = index.split('-');
			i = Number.parseInt(indices[0]);
			canMoveBackward = i > dimensionToExtent;
		} else {
			i = Number.parseInt(index);
			canMoveBackward = i >= dimensionToExtent;
		}
		canMoveForward = i < (primary.dataSize - (((primary.dataSize - 1) % dimensionToExtent) + 1));

		if (isPrimaryDirectionVertical) {
			if (keyCode === keyUp && canMoveBackward || keyCode === keyDown && canMoveForward) {
				isSelfOnly = true;
			}
		}
		if (!isPrimaryDirectionVertical || isVirtualVariableList) {
			if (keyCode === keyLeft && canMoveBackward || keyCode === keyRight && canMoveForward) {
				isSelfOnly = true;
			}
		}

		this.setRestrict(isSelfOnly);
	}

	setContainerDisabled = (bool) => {
		const containerNode = this.getContainerNode(this.props.positioningOption);

		if (containerNode) {
			containerNode.setAttribute(dataContainerDisabledAttribute, bool);
		}
	}

	updateClientSize = () => {
		const
			{positioningOption} = this.props,
			node = this.getContainerNode(positioningOption);

		if (!node) {
			return;
		}

		const
			{isPrimaryDirectionVertical, primary} = this,
			{clientWidth, clientHeight} = this.getClientSize(node);

		if (isPrimaryDirectionVertical) {
			primary.clientSize = clientHeight;
		} else {
			primary.clientSize = clientWidth;
		}

		this.updateStatesAndBounds(this.props);
	}

	// Calculate metrics for VirtualVariableList after the 1st render to know client W/H.
	// We separate code related with data due to re use it when data changed.
	componentDidMount () {
		const {positioningOption, posX, posY} = this.props;

		this.calculateMetrics(this.props);
		this.updateStatesAndBounds(this.props);

		if (positioningOption !== 'byBrowser') {
			const containerNode = this.getContainerNode(positioningOption);

			// prevent native scrolling by Spotlight
			this.preventScroll = () => {
				containerNode.scrollTop = 0;
				containerNode.scrollLeft = this.context.rtl ? containerNode.scrollWidth : 0;
			};

			if (containerNode && containerNode.addEventListener) {
				containerNode.addEventListener('scroll', this.preventScroll);
			}
		}
	}

	// Call updateStatesAndBounds here when dataSize has been changed to update nomOfItems state.
	// Calling setState within componentWillReceivePropswill not trigger an additional render.
	componentWillReceiveProps (nextProps) {
		const
			{dataSize, direction, itemSize, overhang, spacing, posX, posY} = this.props,
			hasMetricsChanged = (
				direction !== nextProps.direction ||
				((itemSize instanceof Object) ? (itemSize.minWidth !== nextProps.itemSize.minWidth || itemSize.minHeight !== nextProps.itemSize.minHeight || itemSize.row !== nextProps.itemSize.row || itemSize.col !== nextProps.itemSize.col) : itemSize !== nextProps.itemSize) ||
				overhang !== nextProps.overhang ||
				spacing !== nextProps.spacing
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
			this.updateStatesAndBounds(nextProps);
		} else if (hasDataChanged) {
			this.updateStatesAndBounds(nextProps);
		}

		if (isPositionChanged) {
			if (nextProps.direction === 'vertical') {
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

	componentWillUnmount () {
		const
			{positioningOption} = this.props,
			containerNode = this.getContainerNode(positioningOption);

		// remove a function for preventing native scrolling by Spotlight
		if (containerNode && containerNode.removeEventListener) {
			containerNode.removeEventListener('scroll', this.preventScroll);
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
		this.positionContainer();
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{positioningOption, onScroll} = this.props,
			{primary, cc} = this;

		delete props.cbScrollTo;
		delete props.component;
		delete props.data;
		delete props.dataSize;
		delete props.direction;
		delete props.hideScrollbars;
		delete props.itemSize;
		delete props.maxVariableScrollSize;
		delete props.onScroll;
		delete props.onScrolling;
		delete props.onScrollStart;
		delete props.onScrollStop;
		delete props.overhang;
		delete props.positioningOption;
		delete props.posX;
		delete props.posY;
		delete props.spacing;
		delete props.variableAxis;

		if (primary) {
			this.renderCalculate();
		}

		if (positioningOption === 'byItem') {
			return (
				<div {...props} ref={this.initContainerRef}>
					{cc}
				</div>
			);
		} else {
			const {className, style, ...rest} = props;

			if (positioningOption === 'byBrowser') {
				this.composeOverflow(style);
			}

			return (
				<div ref={this.initWrapperRef} className={className} style={style} onScroll={onScroll}>
					<div {...rest} ref={this.initContainerRef}>
						{cc}
					</div>
				</div>
			);
		}
	}
}

// TBD
const VirtualVariableListBase = SpotlightContainerDecorator({restrict: 'self-first'}, Scrollable(VirtualVariableListCore));

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

	styles: {
		css,
		className: 'virtualVariableList'
	},

	render: (orgProps) => {
		if (orgProps.lockHeaders === 'both') {
			const
				offsetX = orgProps.itemSize.rowHeader,
				offsetY = orgProps.itemSize.row,
				rowProps = {
					data: orgProps.data.rowHeader,
					dataSize: orgProps.dataSize.rowHeader,
					direction: 'vertical',
					hideScrollbars: orgProps.hideScrollbars,
					itemSize: orgProps.itemSize.row,
					posX: 0,
					posY: orgProps.posY,
					style: {width: offsetX + 'px', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px'},
					component: orgProps.component.rowHeader
				},
				colProps = {
					data: orgProps.data.colHeader,
					dataSize: orgProps.dataSize.colHeader,
					direction: 'horizontal',
					hideScrollbars: orgProps.hideScrollbars,
					itemSize: orgProps.itemSize.colHeader,
					posX: orgProps.posX,
					posY: 0,
					style: {width: 'calc(100% - ' + offsetX + 'px)', height: offsetY + 'px', left: offsetX + 'px'},
					component: orgProps.component.colHeader
				},
				itemProps = {
					clipItem: true,
					data: orgProps.data.item,
					dataSize: {
						row: orgProps.dataSize.row,
						col: orgProps.dataSize.col
					},
					direction: (orgProps.variableAxis === 'col') ? 'horizontal' : 'vertical',
					hideScrollbars: orgProps.hideScrollbars,
					itemSize: {
						row: orgProps.itemSize.row,
						col: orgProps.itemSize.col
					},
					maxVariableScrollSize: orgProps.maxVariableScrollSize,
					posX: orgProps.posX,
					posY: orgProps.posY,
					variableAxis: orgProps.variableAxis,
					style: {width: 'calc(100% - ' + offsetX + 'px)', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px', left: offsetX + 'px'},
					component: orgProps.component.item
				},
				childProps = {
					style: {width: offsetX + 'px', height: offsetY + 'px'}
				};

			return (
				<div className={classNames(orgProps.className, css.lockHeaders)} style={orgProps.style}>
					<VirtualListCore {...rowProps} />
					<VirtualListCore {...colProps} />
					<VirtualVariableListCore {...itemProps} />
					<div {...childProps}>{orgProps.children}</div>
				</div>
			);
		} else {
			const props = Object.assign({}, orgProps);

			if (props.variableAxis === 'col') {
				props.direction = 'horizontal';
			}

			return (<VirtualVariableListCore {...props} />);
		}
	}
});

export default VirtualVariableList;
export {VirtualVariableList, VirtualVariableListCore};
