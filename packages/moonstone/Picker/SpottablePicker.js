import hoc from '@enact/core/hoc';
import Spottable from '@enact/spotlight/Spottable';
import Pressable from '@enact/ui/Pressable';
import React from 'react';
import PropTypes from 'prop-types';

const SpottablePicker = hoc(null, (config, Wrapped) => {
	const Joined = Pressable(Spottable(Wrapped));
	return class extends React.Component {
		static displayName = 'SpottablePicker'

		static propTypes = {
			joined: PropTypes.bool
		}

		render () {
			const props = Object.assign({}, this.props);
			const Component = props.joined ? Joined : Wrapped;

			if (!props.joined) {
				delete props.onSpotlightDown;
				delete props.onSpotlightLeft;
				delete props.onSpotlightRight;
				delete props.onSpotlightUp;
			}

			return <Component {...props} />;
		}
	};
});

export default SpottablePicker;
export {SpottablePicker};
