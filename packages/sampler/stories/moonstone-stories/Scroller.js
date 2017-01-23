import Button from '@enact/moonstone/Button';
import ri from '@enact/ui/resolution';
//import {Scroller, ScrollerBase} from '@enact/moonstone/Scroller';
import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {withKnobs, boolean, select} from '@kadira/storybook-addon-knobs';

/*Scroller.displayName = 'Scroller';
Scroller.propTypes = Object.assign({}, ScrollerBase.propTypes);
Scroller.defaultProps = Object.assign({}, ScrollerBase.defaultProps);
*/
const
	// Set up some defaults for info and knobs
	/*prop = {
		horizontal: {'auto': 'auto', 'hidden': 'hidden', 'scroll': 'scroll'},
		vertical: {'auto': 'auto', 'hidden': 'hidden', 'scroll': 'scroll'}
	},*/
	style = {
		scroller: {
			height: ri.scale(550) + 'px',
			width: '100%',
			overflow: 'auto'
		},
		content: {
			height: ri.scale(1000) + 'px',
			width: ri.scale(2000) + 'px'
		},
		bottom: {
			marginTop: ri.scale(800) + 'px'
		}
	};

storiesOf('Scroller')
	.addDecorator(withKnobs)
	.addWithInfo(
		' ',
		'Basic usage of Scroller',
		() => (
			<div style={style.scroller}>
				<div style={style.content}>
					<Button>Top Button</Button>
					<div style={style.bottom}>
						<Button>Normal Button</Button>
					</div>
					<Button>Bottom Button</Button>
				</div>
			</div>
		)
	);
