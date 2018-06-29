/**
 * Exports the {@link ui/Resizable.Resizable} Higher-order Component (HOC).
 *
 * @module ui/Resizable
 */

import {forward, handle} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import invariant from 'invariant';
import React from 'react';

const ResizeContext = React.createContext(null);

/**
 * Default config for {@link ui/Resizable.Resizable}
 *
 * @memberof ui/Resizable.Resizable
 * @hocconfig
 */
const defaultConfig = {
	/**
	 * Configures the event name that will indicate a resize of a container may be necessary
	 *
	 * @type {String}
	 * @default null
	 * @memberof ui/Resizable.Resizable.defaultConfig
	 */
	filter: null,

	/**
	 * Configures a function that can filter the event to limit when the container is notified. This
	 * function will receive the event payload as its only argument and should return `true` to
	 * prevent the resize notification.
	 *
	 * @type {Function}
	 * @default null
	 * @memberof ui/Resizable.Resizable.defaultConfig
	 */
	resize: null
};

/**
 * {@link ui/Resizable.Resizable} is a Higher-order Component that can be used to notify a container
 * that the Wrapped component has been resized. It may be useful in cases where a component may need
 * to update itself as a result of its children changing in size, such a Scroller.
 *
 * Containers must provide an `invalidateBounds` method via React's context in order for `Resizable`
 * instances to notify it of resize.
 *
 * @class Resizable
 * @memberof ui/Resizable
 * @hoc
 * @public
 */
const Resizable = hoc(defaultConfig, (config, Wrapped) => {
	const {filter, resize} = config;

	invariant(
		resize,
		`resize is required by Resizable but was omitted when applied to ${Wrapped.displayName}`
	);

	/*
	 * Handles the event that indicates a resize is necessary
	 *
	 * @param   {Object}    ev  Event payload
	 *
	 * @returns {undefined}
	 * @private
	 */
	const handleResize = (invalidateBounds) => handle(
		forward(resize),
		// optionally filter the event before notifying the container
		filter,
		invalidateBounds
	);

	return function Resizeable (props) {
		return (
			<ResizeContext.Consumer>
				{(resizeContext) => {
					let updated = props;

					if (resizeContext) {
						updated = Object.assign({}, props);
						updated[resize] = handleResize(resizeContext.invalidateBounds);
					}

					return (
						<Wrapped {...updated} />
					);
				}}
			</ResizeContext.Consumer>
		);
	};
});

export default Resizable;
export {
	Resizable,
	ResizeContext
};
