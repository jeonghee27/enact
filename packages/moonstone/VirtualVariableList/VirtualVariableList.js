/**
 * Exports the {@link moonstone/VirtualVariableList/VirtualVariableList.VirtualVariableList} component.
 *
 * @module moonstone/VirtualVariableList/VirtualVariableList
 */

import React, {PropTypes, Component} from 'react';
import classNames from 'classnames';

import kind from '@enact/core/kind';
import {SpotlightContainerDecorator} from '@enact/spotlight';

import {VirtualListCore} from '../VirtualList/VirtualListBase';

import Positionable from './Positionable';
import {VirtualVariableListCore} from './VirtualVariableListCore';
import css from './VirtualVariableList.less';

const
	PositionableVirtualList = Positionable(VirtualListCore),
	SpotlightPositionableVirtualList = SpotlightContainerDecorator(Positionable(VirtualListCore)),
	PositionableVirtualVariableList = Positionable(VirtualVariableListCore);

// PropTypes shape
const sizeShape = PropTypes.oneOfType(
	[PropTypes.shape({
		row: PropTypes.number.isRequired,
		col: PropTypes.func.isRequired,
		rowHeader: PropTypes.number,
		colHeader: PropTypes.number
	}),
	PropTypes.shape({
		row: PropTypes.func.isRequired,
		col: PropTypes.number.isRequired,
		rowHeader: PropTypes.number,
		colHeader: PropTypes.number
	})]
);

/**
 * {@link module:@enact/moonstone/VirtualVariableList~VirtualVariableList} is a VirtualVariableList with Moonstone styling
 * which has a variable width or height.
 *
 * @class VirtualVariableList
 * @ui
 * @public
 */
class VirtualVariableList extends Component {

	static propTypes = /** @lends moonstone/VirtualVariableList.VirtualVariableList.prototype */ {
		/**
		 * The render function for an item of the list.
		 * `index` is for accessing the index of the item.
		 * `key` MUST be passed as a prop for DOM recycling.
		 * Data manipulation can be done in this function.
		 *
		 * @type {Function|Object}
		 * @public
		 */
		component: PropTypes.shape({item: PropTypes.func.isRequired, rowHeader: PropTypes.func, colHeader: PropTypes.func, corner: PropTypes.func}).isRequired,

		/**
		 * Data for the list.
		 * Check mutation of this and determine whether the list should update or not.
		 *
		 * @type {Array|Object}
		 * @public
		 */
		data: PropTypes.shape({item: PropTypes.any.isRequired, rowHeader: PropTypes.any, colHeader: PropTypes.any}).isRequired,

		/**
		 * Size of data for the list.
		 *
		 * @type {Object}
		 * @public
		 */
		dataSize: sizeShape,

		/**
		 * Size of an item for the list.
		 *
		 * @type {Object}
		 * @public
		 */
		itemSize: sizeShape,

		/**
		 * Option to use row and column headers
		 *
		 * @type {String}
		 * @public
		 */
		headers: PropTypes.oneOf(['both', 'none'])
	}

	static defaultProps = {
		headers: 'none'
	}

	constructor (props) {
		super(props);

		this.state = {
			posX: props.posX,
			posY: props.posY
		};
	}

	getPositionTo = (positionTo) => {
		this.positionTo = positionTo;
	}

	doPosition = ({posX, posY}) => {
		this.setState({posX, posY});
	}

	componentWillReceiveProps (nextProps) {
		const {posX, posY} = this.props;

		if (posX !== nextProps.posX || posY !== nextProps.posY) {
			this.setState({posX, posY});
		}
	}

	render () {
		const
			{component, data, dataSize, headers, itemSize, maxVariableScrollSize, posX, posY, variableAxis, ...rest} = this.props,
			offsetX = itemSize.rowHeader,
			offsetY = itemSize.row,
			rowProps = (headers === 'none') ? null : {
				data: data.rowHeader,
				dataSize: dataSize.rowHeader,
				direction: 'vertical',
				itemSize: itemSize.row,
				pageScroll: true,
				posY : this.state.posY,
				style: {width: offsetX + 'px', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px'},
				component: component.rowHeader
			},
			colProps = (headers === 'none') ? null : {
				data: data.colHeader,
				dataSize: dataSize.colHeader,
				direction: 'horizontal',
				itemSize: itemSize.colHeader,
				posX : this.state.posX,
				style: {width: 'calc(100% - ' + offsetX + 'px)', height: offsetY + 'px', left: offsetX + 'px'},
				component: component.colHeader
			},
			itemProps = {
				data: data.item,
				dataSize: {
					row: dataSize.row,
					col: dataSize.col
				},
				itemSize: {
					row: itemSize.row,
					col: itemSize.col
				},
				maxVariableScrollSize,
				posX : this.state.posX,
				posY : this.state.posY,
				variableAxis,
				style: {width: 'calc(100% - ' + offsetX + 'px)', height: 'calc(100% - ' + offsetY + 'px)', top: offsetY + 'px', left: offsetX + 'px'},
				component: component.item
			};

		if (headers === 'both') {
			return (
				<div {...rest} className={classNames(css.virtualVariableList, css.headers)}>
					<SpotlightPositionableVirtualList {...rowProps} doPosition={this.doPosition} />
					<PositionableVirtualList {...colProps} />
					<PositionableVirtualVariableList {...itemProps} />
					{component.corner()}
				</div>
			);
		} else {
			return (<PositionableVirtualVariableList {...rest} {...itemProps} className={css.virtualVariableList} />);
		}
	}
};

export default VirtualVariableList;
export {VirtualVariableList, PositionableVirtualVariableList, VirtualVariableListCore};
