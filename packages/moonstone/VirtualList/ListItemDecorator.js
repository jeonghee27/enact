/**
 * Exports the {@link moonstone/ListItemDecorator.ListItemDecorator} Higher-order Component (HOC).
 *
 * @module moonstone/ListItemDecorator
 */

import {dataIndexAttribute} from '../Scroller/Scrollable';
import hoc from '@enact/core/hoc';
import kind from '@enact/core/kind';
import React from 'react';

import css from './ListItemDecorator.less';

/**
 * Default config for {@link moonstone/ListItemDecorator.ListItemDecorator}
 *
 * @memberof moonstone/ListItemDecorator.ListItemDecorator
 * @hocconfig
 */
const defaultConfig = {
	/**
	 * Determines whether an element has the common list item bottom border.
	 *
	 * @type {Boolean}
	 * @default false
	 * @memberof ui/ListItemDecorator.ListItemDecorator.defaultConfig
	 */
	border: false,

	/**
	 * Determines whether wrapping a wrapped component with a div element or not
	 *
	 * @type {Boolean}
	 * @default true
	 * @memberof ui/ListItemDecorator.ListItemDecorator.defaultConfig
	 */
	wrap: true
};

/**
 * {@link moonstone/ListItemDecorator.ListItemDecorator} is the Higher-order Component for a list item wrapper.
 *
 * @class ListItemDecorator
 * @memberof moonstone/ListItemDecorator
 * @ui
 * @public
 */
const ListItemDecorator = hoc(defaultConfig, ({border, wrap}, Wrapped) => {
	return kind({
		name: 'ListItemDecorator',

		styles: {
			css,
			className: 'listItemDecorator'
		},

		computed: {
			className: ({styler}) => styler.append({border})
		},

		render: (props) => {
			if (wrap) {
				const {className, [dataIndexAttribute]: dataIndex, style, ...rest} = props;

				return (
					<div className={className} data-index={dataIndex} style={style}>
						<Wrapped {...rest} data-index={dataIndex} />
					</div>
				);
			} else {
				return (<Wrapped {...props} />);
			}
		}
	});
});

export default ListItemDecorator;
export {ListItemDecorator};
