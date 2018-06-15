import hoc from '@enact/core/hoc';
import {ResizeContent} from '@enact/ui/internal/ResizeContext';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * {@link moonstone/MoonstoneDecorator.AccessibilityDecorator} is a Higher-order Component that
 * classifies an application with a target set of font sizing rules
 *
 * @class AccessibilityDecorator
 * @memberof moonstone/MoonstoneDecorator
 * @hoc
 * @public
 */
const AccessibilityDecorator = hoc((config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'AccessibilityDecorator'

		static propTypes =  /** @lends moonstone/MoonstoneDecorator.AccessibilityDecorator.prototype */ {
			/**
			 * Enables additional features to help users visually differentiate components.
			 * The UI library will be responsible for using this information to adjust
			 * the components' contrast to this preset.
			 *
			 * @type {Boolean}
			 * @public
			 */
			highContrast: PropTypes.bool,

			/**
			 * Set the goal size of the text. The UI library will be responsible for using this
			 * information to adjust the components' text sizes to this preset.
			 * Current presets are `'normal'` (default), and `'large'`.
			 *
			 * @type {String}
			 * @default 'normal'
			 * @public
			 */
			textSize: PropTypes.oneOf(['normal', 'large'])
		}

		static defaultProps = {
			highContrast: false,
			textSize: 'normal'
		}

		state = {
			resize: false
		}

		componentWillReceiveProps (nextProps) {
			this.setState({
				resize: nextProps.textSize !== this.props.textSize && Date.now()
			});
		}

		render () {
			const {className, highContrast, textSize, ...props} = this.props;
			const accessibilityClassName = highContrast ? `enact-a11y-high-contrast enact-text-${textSize}` : `enact-text-${textSize}`;
			const combinedClassName = className ? `${className} ${accessibilityClassName}` : accessibilityClassName;

			return (
				<ResizeContent.Provider value={this.state.resize}>
					<Wrapped className={combinedClassName} {...props} />
				</ResizeContent.Provider>
			);
		}
	};
});

export default AccessibilityDecorator;
export {
	AccessibilityDecorator
};
