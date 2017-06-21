import Holdable from '../internal/Holdable';
import kind from '@enact/core/kind';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import React from 'react';
import PropTypes from 'prop-types';

import $L from '../internal/$L';
import IconButton from '../IconButton';
import {withSkinnableProps} from '../Skinnable';

import css from './Scrollbar.less';

const HoldableIconButton = Holdable({endHold: 'onLeave'}, IconButton);

const classNameMap = {
	up: css.scrollbarUpButton,
	down: css.scrollbarBottomButton,
	left: css.scrollbarLeftButton,
	right: css.scrollbarRightButton
};

/**
 * {@link moonstone/Scroller.ScrollButtonBase} is the base implementation for
 * {@link moonstone/Scroller.ScrollButton}.
 *
 * @class ScrollButtonBase
 * @memberof moonstone/Scroller
 * @ui
 * @private
 */
const ScrollButtonBase = kind({
	name: 'ScrollButton',

	propTypes: /** @lends moonstone/Scroller.ScrollButtonBase.prototype */ {
		/**
		 * Name of icon
		 *
		 * @type {String}
		 * @public
		 */
		children: PropTypes.string.isRequired,

		/**
		 * Scroll direction for this button (down, left, right, or up)
		 *
		 * @type {String}
		 * @public
		 */
		direction: PropTypes.oneOf(['down', 'left', 'right', 'up']).isRequired,

		/**
		 * When `true`, the component is shown as disabled and does not generate `onClick`
		 * [events]{@glossary event}.
		 *
		 * @type {Boolean}
		 * @public
		 */
		disabled: PropTypes.bool
	},

	styles: {
		css,
		className: 'scrollButton'
	},

	computed: {
		'aria-label': ({direction}) => $L(`scroll ${direction}`),
		className: ({direction, styler}) => styler.append(classNameMap[direction])
	},

	render: ({children, disabled, ...rest}) => {
		delete rest.direction;

		return (
			<HoldableIconButton
				{...rest}
				backgroundOpacity="transparent"
				disabled={disabled}
				small
			>
				{children}
			</HoldableIconButton>
		);
	}
});


/**
 * {@link moonstone/Scroller.ScrollButton} is an {@link moonstone/IconButton.IconButton} used within
 * a {@link moonstone/Scroller.Scrollbar}.
 *
 * @class ScrollButton
 * @memberof moonstone/Scroller
 * @ui
 * @private
 */
const ScrollButton = withSkinnableProps(
	onlyUpdateForKeys(['children', 'disabled', 'skin'])(
		ScrollButtonBase
	)
);

export default ScrollButton;
export {
	ScrollButton,
	ScrollButtonBase
};
