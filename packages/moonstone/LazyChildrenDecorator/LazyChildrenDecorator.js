import hoc from '@enact/core/hoc';
import React, {Component} from 'react';

/**
 * Default config for {@link moonstone/LazyChildrenDecorator.LazyChildrenDecorator}
 *
 * @memberof moonstone/LazyChildrenDecorator.LazyChildrenDecorator
 * @hocconfig
 */
const defaultConfig = {
	/**
	 * Configures the number of the children
	 *
	 * @type {Number}
	 * @default 5
	 * @memberof moonstone/LazyChildrenDecorator.LazyChildrenDecorator.defaultConfig
	 */
	numOfChildrenPerRender: 5,

	/**
	 * Configures the interval time
	 *
	 * @type {Number}
	 * @default 5
	 * @memberof moonstone/LazyChildrenDecorator.LazyChildrenDecorator.defaultConfig
	 */
	intervalPerRender: 20
};

/**
 * The context propTypes required by `Resizable`. This should be set as the `childContextTypes` of a
 * container that needs to be notified of a resize.
 *
 * @type {Object}
 * @memberof ui/Resizable
 * @public
 */
const contextTypes = {
	invalidateBounds: React.PropTypes.func
};

/**
 * {@link moonstone/LazyChildrenDecorator.LazyChildrenDecorator} is a Higher-order Component so that its few wrapped children
 * are rendered first and the other wrapped children are rendered later. The number of the former children
 * can be configured when applied to a component.
 *
 * By default, the only 5 wrapped children are rendered first.
 *
 * @class LazyChildrenDecorator
 * @memberof moonstone/LazyChildrenDecorator
 * @hoc
 * @public
 */
const LazyChildrenDecorator = hoc(defaultConfig, (config, Wrapped) => {
	const numOfChildrenPerRender = config.numOfChildrenPerRender;
	const intervalPerRender = config.intervalPerRender;

	return class Lazy extends Component {
		static contextTypes = contextTypes

		constructor (props) {
			super(props);

			this.state = {
				numOfChildren: numOfChildrenPerRender
			};

			this.didRender = false;
		}

		invalidateBounds = () => this.context.invalidateBounds()

		render () {
			let props = this.props;

			if (!this.didRender) {
				if (props.children.length <= this.state.numOfChildren) {
					this.didRender = true;
					if (this.invalidateBounds) {
						this.invalidateBounds();
					}
				} else {
					props = Object.assign({}, this.props);
					props.children = props.children.slice(0, this.state.numOfChildren);
					window.setTimeout(() => {
						if (!this.didRender) {
							this.setState({numOfChildren: Math.min(this.state.numOfChildren + numOfChildrenPerRender, this.props.children.length)});
						}
					}, intervalPerRender);
				}
			}

			return <Wrapped {...props} />;
		}
	};
});

export default LazyChildrenDecorator;
