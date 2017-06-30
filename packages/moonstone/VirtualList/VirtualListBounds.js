class VirtualListBounds {
	constructor (list) {
		this.list = list;
	}

	scrollBounds = {
		clientWidth: 0,
		clientHeight: 0,
		scrollWidth: 0,
		scrollHeight: 0,
		maxLeft: 0,
		maxTop: 0
	}

	// private
	getClientSize = (node) => {
		return {
			clientWidth: node.clientWidth,
			clientHeight: node.clientHeight
		};
	}

	// private
	getScrollHeight = () => (this.list.isPrimaryDirectionVertical ? this.getVirtualScrollDimension() : this.scrollBounds.clientHeight)

	// private
	getScrollWidth = () => (this.list.isPrimaryDirectionVertical ? this.scrollBounds.clientWidth : this.getVirtualScrollDimension())

	// private
	getVirtualScrollDimension = () => {
		const
			{dimensionToExtent, primary, curDataSize} = this.list,
			{spacing} = this.list.props;

		return (Math.ceil(curDataSize / dimensionToExtent) * primary.gridSize) - spacing;
	}

	// private
	calculateScrollBounds (props) {
		const
			{clientSize} = props,
			node = this.list.containerRef;

		if (!clientSize && !node) {
			return;
		}

		const
			{scrollBounds} = this,
			{isPrimaryDirectionVertical} = this.list,
			{clientWidth, clientHeight} = clientSize || this.getClientSize(node);
		let maxPos;

		scrollBounds.clientWidth = clientWidth;
		scrollBounds.clientHeight = clientHeight;
		scrollBounds.scrollWidth = this.getScrollWidth();
		scrollBounds.scrollHeight = this.getScrollHeight();
		scrollBounds.maxLeft = Math.max(0, scrollBounds.scrollWidth - clientWidth);
		scrollBounds.maxTop = Math.max(0, scrollBounds.scrollHeight - clientHeight);

		// correct position
		maxPos = isPrimaryDirectionVertical ? scrollBounds.maxTop : scrollBounds.maxLeft;

		this.list.syncThreshold(maxPos);

		if (this.list.scrollPosition > maxPos) {
			this.list.props.cbScrollTo({position: (isPrimaryDirectionVertical) ? {y: maxPos} : {x: maxPos}});
		}
	}

	// public
	calculateMetrics (props) {
		const
			{clientSize, direction, itemSize, spacing} = props,
			node = this.list.containerRef;

		if (!clientSize && !node) {
			return;
		}

		const
			{clientWidth, clientHeight} = (clientSize || this.getClientSize(node)),
			heightInfo = {
				clientSize: clientHeight,
				minItemSize: itemSize.minHeight || null,
				itemSize: itemSize
			},
			widthInfo = {
				clientSize: clientWidth,
				minItemSize: itemSize.minWidth || null,
				itemSize: itemSize
			};
		let primary, secondary, dimensionToExtent, thresholdBase;

		this.list.isPrimaryDirectionVertical = (direction === 'vertical');

		if (this.list.isPrimaryDirectionVertical) {
			primary = heightInfo;
			secondary = widthInfo;
		} else {
			primary = widthInfo;
			secondary = heightInfo;
		}
		dimensionToExtent = 1;

		this.list.isItemSized = (primary.minItemSize && secondary.minItemSize);

		if (this.list.isItemSized) {
			// the number of columns is the ratio of the available width plus the spacing
			// by the minimum item width plus the spacing
			dimensionToExtent = Math.max(Math.floor((secondary.clientSize + spacing) / (secondary.minItemSize + spacing)), 1);
			// the actual item width is a ratio of the remaining width after all columns
			// and spacing are accounted for and the number of columns that we know we should have
			secondary.itemSize = Math.floor((secondary.clientSize - (spacing * (dimensionToExtent - 1))) / dimensionToExtent);
			// the actual item height is related to the item width
			primary.itemSize = Math.floor(primary.minItemSize * (secondary.itemSize / secondary.minItemSize));
		}

		primary.gridSize = primary.itemSize + spacing;
		secondary.gridSize = secondary.itemSize + spacing;
		thresholdBase = primary.gridSize * 2;

		this.list.threshold = {min: -Infinity, max: thresholdBase, base: thresholdBase};
		this.list.dimensionToExtent = dimensionToExtent;

		this.list.primary = primary;
		this.list.secondary = secondary;

		// reset
		this.list.scrollPosition = 0;
		// eslint-disable-next-line react/no-direct-mutation-state
		this.list.state.firstIndex = 0;
		// eslint-disable-next-line react/no-direct-mutation-state
		this.list.state.numOfItems = 0;
	}

	// public
	updateStatesAndBounds (props) {
		const
			{dataSize, overhang} = props,
			{firstIndex} = this.list.state,
			{dimensionToExtent, primary, moreInfo} = this.list,
			numOfItems = Math.min(dataSize, dimensionToExtent * (Math.ceil(primary.clientSize / primary.gridSize) + overhang)),
			wasFirstIndexMax = ((this.list.maxFirstIndex < moreInfo.firstVisibleIndex - dimensionToExtent) && (firstIndex === this.list.maxFirstIndex));

		this.list.maxFirstIndex = dataSize - numOfItems;
		this.list.curDataSize = dataSize;

		this.list.virtualListDOM.initialize();

		// reset children
		this.list.cc = [];

		this.list.setState({firstIndex: wasFirstIndexMax ? this.list.maxFirstIndex : Math.min(firstIndex, this.list.maxFirstIndex), numOfItems});
		this.calculateScrollBounds(props);
	}

	// public
	syncClientSize = () => {
		const
			{props} = this.list,
			node = this.list.containerRef;

		if (!props.clientSize && !node) {
			return;
		}

		const
			{clientWidth, clientHeight} = props.clientSize || this.getClientSize(node),
			{scrollBounds} = this;

		if (clientWidth !== scrollBounds.clientWidth || clientHeight !== scrollBounds.clientHeight) {
			this.calculateMetrics(props);
			this.updateStatesAndBounds(props);
		}
	}
}

export default VirtualListBounds;
export {VirtualListBounds};
