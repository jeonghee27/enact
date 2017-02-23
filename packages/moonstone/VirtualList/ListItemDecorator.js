/**
 * Exports the {@link moonstone/ListItemDecorator.ListItemDecorator} Higher-order Component (HOC).
 *
 * @module moonstone/ListItemDecorator
 */

import {dataIndexAttribute} from '../Scroller/Scrollable';
import factory from '@enact/core/factory';
import hoc from '@enact/core/hoc';
import kind from '@enact/core/kind';
import React from 'react';

import componentCss from './ListItemDecorator.less';

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
	 * If you already wrapped your component with it, it should be `false`.
	 *
	 * @type {Boolean}
	 * @default true
	 * @memberof ui/ListItemDecorator.ListItemDecorator.defaultConfig
	 */
	wrap: true
};

/**
 * {@link moonstone/ListItemDecoratorFactory.ListItemDecoratorFactory} is Factory wrapper around {@link moonstone/listItemDecorator.listItemDecorator}
 * that allows overriding certain classes at design time. The following are properties of the `css`
 * member of the argument to the factory.
 *
 * @class ListItemDecoratorFactory
 * @memberof moonstone/ListItemDecoratorFactory
 * @ui
 * @public
 */
const ListItemDecoratorFactory = factory({css: componentCss}, ({css}) => hoc(defaultConfig, ({border, wrap}, Wrapped) => kind({
	name: 'ListItemDecorator',

	styles: {
		css: {
			...componentCss,
			border: css.border
		},
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
})));

/**
 * {@link moonstone/ListItemDecorator.ListItemDecorator} is the Higher-order Component for a list item wrapper.
 *
 * @class ListItemDecorator
 * @memberof moonstone/ListItemDecorator
 * @ui
 * @public
 */
const ListItemDecorator = ListItemDecoratorFactory();

export default ListItemDecorator;
export {ListItemDecorator, ListItemDecoratorFactory};
