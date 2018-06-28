/**
 * Exports the {@link ui/RadioDecorator.RadioDecorator} and
 * {@link ui/RadioDecorator.RadioControllerDecorator} Higher-order Components (HOCs).
 *
 * @module ui/RadioDecorator
 */

import {forward} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import React from 'react';

import {RadioContext, RadioControllerDecorator} from './RadioControllerDecorator';

/**
 * Default config for {@link ui/RadioDecorator.RadioDecorator}.
 *
 * @memberof ui/RadioDecorator.RadioDecorator
 * @hocconfig
 */
const defaultConfig = {
	/**
	 * The event indicating the wrapped component is activated
	 *
	 * @type {String}
	 * @default null
	 * @memberof ui/RadioDecorator.RadioDecorator.defaultConfig
	 */
	activate: null,

	/**
	 * The event indicating the wrapped component is deactivated
	 *
	 * @type {String}
	 * @default null
	 * @memberof ui/RadioDecorator.RadioDecorator.defaultConfig
	 */
	deactivate: null,

	/**
	 * The name of a boolean prop that, when `true`, should activate the wrapped component.
	 *
	 * @type {String}
	 * @default 'active'
	 * @memberof ui/RadioDecorator.RadioDecorator.defaultConfig
	 */
	prop: 'active'
};

/**
 * {@link ui/RadioDecorator.RadioDecorator} is a Higher-order Component that allows another
 * component to have a mutually exclusive relationship with other descendants of the same
 * {@link ui/RadioDecorator.RadioControllerDecorator}.
 *
 * When the `activate` event for the wrapped component is called, the component is activated and the
 * previously activated component, if any, is deactivated by invoking the `deactivate` event.
 *
 * @class RadioDecorator
 * @memberof ui/RadioDecorator
 * @hoc
 * @public
 */
const RadioDecorator = hoc(defaultConfig, (config, Wrapped) => {
	const {activate, deactivate, prop} = config;

	return class extends React.Component {
		static displayName = 'RadioDecorator'

		state = {
			becameActive: false
		}

		componentWillReceiveProps (nextProps) {
			this.setState({
				becameActive: nextProps[prop] && !this.props[prop]
			});
		}

		/**
		 * Invoked by a RadioControllerDecorator when the wrapped component should be deactivated
		 *
		 * @returns {undefined}
		 */
		deactivate = () => {
			if (this.props[prop]) {
				forward(deactivate, {type: deactivate}, this.props);
			}
		}

		handleActivate (radio, ev) {
			radio.activateRadioItem(this);
			forward(activate, ev, this.props);
		}

		handleDeactivate (radio, ev) {
			radio.deactivateRadioItem(this);
			forward(deactivate, ev, this.props);
		}

		decorateProps (radio, props) {
			if (radio && (activate || deactivate)) {
				props = Object.assign({}, this.props);

				if (this.state.becameActive) {
					radio.activateRadioItem(this);
				}

				if (activate) {
					props[activate] = this.handleActivate.bind(this, radio);
				}

				if (deactivate) {
					props[deactivate] = this.handleDeactivate.bind(this, radio);
				}
			}

			return props;
		}

		render () {
			return (
				<RadioContext.Consumer>
					{radio => (
						<Wrapped {...this.decorateProps(radio, this.props)} />
					)}
				</RadioContext.Consumer>
			);
		}
	};
});

export default RadioDecorator;
export {
	RadioControllerDecorator,
	RadioDecorator
};

