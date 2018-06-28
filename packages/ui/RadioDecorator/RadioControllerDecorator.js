import hoc from '@enact/core/hoc';
import React from 'react';
import PropTypes from 'prop-types';

const RadioContext = React.createContext(null);

/**
 * {@link ui/RadioDecorator.RadioControllerDecorator} is a Higher-order Component that establishes
 * a radio group context for its descendants. Any descendants that are wrapped by
 * {@link ui/RadioDecorator.RadioDecorator} will be mutually exclusive.
 *
 * @class RadioControllerDecorator
 * @memberof ui/RadioDecorator
 * @hoc
 * @public
 */
const RadioControllerDecorator = hoc((config, Wrapped) => {

	return class extends React.Component {
		static displayName = 'RadioControllerDecorator'

		constructor (props) {
			super(props);

			this.state = {
				active: null,
				pending: []
			};

			this.contextValue = {
				activateRadioItem: this.activate.bind(this),
				deactivateRadioItem: this.deactivate.bind(this)
			};
		}

		componentDidUpdate (prevProps, prevState) {
			if (prevState.pending !== this.state.pending && this.state.pending.length) {
				this.state.pending.forEach(item => item.deactivate());
				this.setState({
					pending: []
				});
			}
		}

		activate (item) {
			this.setState(state => {
				if (state.active === item) {
					return null;
				}

				return {
					active: item,
					pending: state.active ? [
						...state.pending,
						state.active
					] : state.pending
				};
			});
		}

		deactivate (item) {
			this.setState(state => {
				if (state.active !== item) {
					return null;
				}

				return {
					active: null,
					pending: item ? [
						...state.pending,
						item
					] : state.pending
				};
			});
		}

		render () {
			return (
				<RadioContext.Provider value={this.contextValue}>
					<Wrapped {...this.props} />
				</RadioContext.Provider>
			);
		}
	};
});

export default RadioControllerDecorator;
export {
	RadioContext,
	RadioControllerDecorator
};
