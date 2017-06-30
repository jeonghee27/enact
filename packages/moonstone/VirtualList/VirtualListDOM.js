import classNames from 'classnames';
import {dataIndexAttribute} from '../Scroller/Scrollable';
import React from 'react';

import css from './ListItem.less';

class VirtualListDOM {
	constructor (list) {
		this.list = list;
	}

	updateFrom = null
	updateTo = null

	// private
	initialize () {
		this.updateFrom = null;
		this.updateTo = null;
	}

	// private
	getXY = (primaryPosition, secondaryPosition) => {
		const rtlDirection = this.list.context.rtl ? -1 : 1;
		return (this.list.isPrimaryDirectionVertical ? {x: (secondaryPosition * rtlDirection), y: primaryPosition} : {x: (primaryPosition * rtlDirection), y: secondaryPosition});
	}

	// private
	composeTransform (style, primaryPosition, secondaryPosition = 0) {
		const {x, y} = this.getXY(primaryPosition, secondaryPosition);

		style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
	}

	// private
	composeStyle (style, width, height, ...rest) {
		if (this.list.isItemSized) {
			style.width = width;
			style.height = height;
		}
		this.composeTransform(style, ...rest);
	}

	// private
	applyStyleToExistingNode = (index, ...rest) => {
		const
			{numOfItems} = this.list.state,
			node = this.list.containerRef.children[index % numOfItems];

		if (node) {
			if ((index % numOfItems) === this.list.nodeIndexToBeBlurred && index !== this.list.lastFocusedIndex) {
				node.blur();
				this.list.nodeIndexToBeBlurred = null;
			}
			this.composeStyle(node.style, ...rest);
		}
	}

	// private
	applyStyleToNewNode = (index, ...rest) => {
		const
			{component, data} = this.list.props,
			{numOfItems} = this.list.state,
			key = index % numOfItems,
			itemElement = component({
				data,
				[dataIndexAttribute]: index,
				index,
				key
			}),
			style = {};

		this.composeStyle(style, ...rest);

		this.list.cc[key] = React.cloneElement(itemElement, {
			className: classNames(css.listItem, itemElement.props.className),
			style: {...itemElement.props.style, ...style}
		});
	}

	// public
	positionItems ({updateFrom, updateTo}, moreInfo) {
		const {isPrimaryDirectionVertical, dimensionToExtent, primary, secondary, scrollPosition} = this.list;

		// we only calculate position of the first child
		let
			position = this.list.getGridPosition(updateFrom),
			{primaryPosition, secondaryPosition} = position,
			firstVisibleIndex = null, lastVisibleIndex = null,
			width, height;

		primaryPosition -= scrollPosition;
		width = (isPrimaryDirectionVertical ? secondary.itemSize : primary.itemSize) + 'px';
		height = (isPrimaryDirectionVertical ? primary.itemSize : secondary.itemSize) + 'px';

		// positioning items
		for (let i = updateFrom, j = updateFrom % dimensionToExtent; i < updateTo; i++) {

			// determine the first and the last visible item
			if (firstVisibleIndex === null && (primaryPosition + primary.itemSize) > 0) {
				firstVisibleIndex = i;
			}
			if (primaryPosition < primary.clientSize) {
				lastVisibleIndex = i;
			}
			if (this.updateFrom === null || this.updateTo === null || this.updateFrom > i || this.updateTo <= i) {
				this.applyStyleToNewNode(i, width, height, primaryPosition, secondaryPosition);
			} else {
				this.applyStyleToExistingNode(i, width, height, primaryPosition, secondaryPosition);
			}

			if (++j === dimensionToExtent) {
				secondaryPosition = 0;
				primaryPosition += primary.gridSize;
				j = 0;
			} else {
				secondaryPosition += secondary.gridSize;
			}
		}

		this.updateFrom = updateFrom;
		this.updateTo = updateTo;
		moreInfo.firstVisibleIndex = firstVisibleIndex;
		moreInfo.lastVisibleIndex = lastVisibleIndex;
	}
}

export default VirtualListDOM;
export {VirtualListDOM};
