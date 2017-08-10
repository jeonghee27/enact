import kind from '@enact/core/kind';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import React from 'react';
import PropTypes from 'prop-types';

import ProgressBar from '../ProgressBar';
import {SliderFactory} from '../Slider';

import css from './VideoPlayer.less';

const Slider = SliderFactory({css});

/**
 * MediaSlider {@link moonstone/VideoPlayer}.
 *
 * @class MediaSlider
 * @memberof moonstone/VideoPlayer
 * @ui
 * @private
 */
const MediaSliderBase = kind({
	name: 'MediaSlider',

	propTypes: /** @lends moonstone/VideoPlayer.MediaSlider.prototype */ {
		/**
		 * Background progress, as a proportion from `0` to `1`
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		backgroundProgress: PropTypes.number,

		/**
		 * When `true`, the component is shown as disabled and does not generate events
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		disabled: PropTypes.bool,

		/**
		 * Setting this to `true` will render a non-actionable progress bar component
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		noInteraction: PropTypes.bool,

		/**
		 * The handler to run when the value is changed.
		 *
		 * @type {Function}
		 * @param {Object} event
		 * @param {Number} event.value Value of the slider
		 * @public
		 */
		onChange: PropTypes.func,

		/**
		 * The value of the slider.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		value: PropTypes.number
	},

	computed: {
		component: ({noInteraction}) => (noInteraction ? ProgressBar : Slider),
		props: ({backgroundProgress, noInteraction, value, ...rest}) => (noInteraction ? {
			backgroundProgress: backgroundProgress,
			progress: value
		} : {
			'aria-hidden': 'true',
			backgroundProgress: backgroundProgress,
			className: css.mediaSlider,
			detachedKnob: 'true',
			min: 0,
			max: 1,
			step: 0.00001,
			knobStep: 0.05,
			value: value,
			...rest
		})
	},

	render: ({component: Component, props}) => (
		<div className={css.sliderFrame}>
			<Component {...props} />
		</div>
	)
});

const MediaSlider = onlyUpdateForKeys(['backgroundProgress', 'children', 'value'])(MediaSliderBase);

export default MediaSlider;
export {
	MediaSlider,
	MediaSliderBase
};
