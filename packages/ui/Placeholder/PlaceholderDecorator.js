import {forward} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import PropTypes from 'prop-types';
import React from 'react';

import Resizeable from '../Resizable';

const PlaceholderContext = React.createContext(null);

class PlaceholderBase extends React.Component {
	static propTypes = {
		component: PropTypes.func,
		onRegister: PropTypes.func,
		onShow: PropTypes.func,
		onUnregister: PropTypes.func
	}

	constructor () {
		super();

		this.state = {
			visible: false
		};
	}

	componentDidMount () {
		if (!this.state.visible) {
			this.emitRegister();
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.state.visible && prevState.visible !== this.state.visible) {
			forward('onShow', {type: 'onShow'}, this.props);
			this.emitUnregister();
		}
	}

	componentWillUnmount () {
		if (!this.state.visible) {
			this.emitUnregister();
		}
	}

	emitRegister () {
		forward('onRegister', {
			type: 'onRegister',
			component: this,
			callback: this.update
		}, this.props);
	}

	emitUnregister () {
		forward('onUnregister', {
			type: 'onUnregister',
			component: this
		}, this.props);
	}

	update = ({leftThreshold, topThreshold}) => {
		const {offsetLeft, offsetTop, offsetHeight, offsetWidth} = this.placeholderRef;

		if (offsetTop < topThreshold + offsetHeight && offsetLeft < leftThreshold + offsetWidth) {
			this.setState((state) => state.visible ? null : {visible: true});
		}
	}

	initPlaceholderRef = (ref) => {
		this.placeholderRef = ref;
	}

	render () {
		const {children, component: PlaceholderComponent, ...rest} = this.props;
		const {visible} = this.state;

		if (visible) {
			return children;
		} else {
			return (
				<PlaceholderComponent {...rest} ref={this.initPlaceholderRef} />
			);
		}
	}
}

const Placeholder = Resizeable({resize: 'onShow'}, PlaceholderBase);

/**
 * Default config for [PlaceholderDecorator]{@link ui/Placeholder.PlaceholderDecorator}
 *
 * @memberof ui/Placeholder.PlaceholderDecorator
 * @hocconfig
 * @public
 */
const defaultConfig = {
	/**
	 * Configures the style of the placeholder element
	 *
	 * @type {Object}
	 * @default {height: 0, width: 'auto'}
	 * @memberof ui/Placeholder.PlaceholderDecorator.defaultConfig
	 */
	style: {height: 0, width: 'auto'},

	/**
	 * The component to use as a placeholder.
	 *
	 * @type {String}
	 * @default 'div'
	 * @memberof ui/Placeholder.PlaceholderDecorator.defaultConfig
	 */
	placeholderComponent: 'div'
};

/**
 * [PlaceholderDecorator]{@link ui/Placeholder.PlaceholderDecorator} is a Higher-order Component that can be used that
 * a container notify the Wrapped component when scrolling.
 *
 * Containers must provide `registerPlaceholder`, `unregisterPlaceholder`, and `invalidateBounds` methods via React's context for
 * `PlaceholderDecorator` instances.
 *
 * @class PlaceholderDecorator
 * @memberof ui/Placeholder
 * @hoc
 * @public
 */
const PlaceholderDecorator = hoc(defaultConfig, (config, Wrapped) => {
	const {placeholderComponent, style} = config;
	const placeholderStyle = Object.assign({}, defaultConfig.style, style);

	// eslint-disable-next-line no-shadow
	return function PlaceholderDecorator (props) {
		return (
			<PlaceholderContext.Consumer>
				{({register, unregister}) => (
					<Placeholder
						onRegister={register}
						onUnregister={unregister}
						component={placeholderComponent}
						style={placeholderStyle}
					>
						<Wrapped {...props} />
					</Placeholder>
				)}
			</PlaceholderContext.Consumer>
		);
	};
});

export default PlaceholderDecorator;
export {
	PlaceholderContext,
	PlaceholderDecorator
};
