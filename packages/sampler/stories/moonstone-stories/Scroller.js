import ri from '@enact/ui/resolution';
import {Scroller, ScrollerBase} from '@enact/moonstone/Scroller';
import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {withKnobs, select} from '@kadira/storybook-addon-knobs';

Scroller.displayName = 'Scroller';
Scroller.propTypes = Object.assign({}, ScrollerBase.propTypes);
Scroller.defaultProps = Object.assign({}, ScrollerBase.defaultProps);

const
	// Set up some defaults for info and knobs
	prop = {
		horizontal: {'auto': 'auto', 'hidden': 'hidden', 'scroll': 'scroll'},
		vertical: {'auto': 'auto', 'hidden': 'hidden', 'scroll': 'scroll'}
	},
	style = {
		scroller: {
			height: ri.scale(550) + 'px',
			width: '100%'
		},
		content: {
			height: ri.scale(1000) + 'px',
			width: ri.scale(2000) + 'px'
		}
	};

storiesOf('Scroller')
	.addDecorator(withKnobs)
	.addWithInfo(
		' ',
		'Basic usage of Scroller',
		() => (
			<Scroller
				/* To see action logger, enable commented code
				onScroll={action('onScroll')}
				onScrollStart={action('onScrollStart')}
				onScrollStop={action('onScrollStop')}
				*/
				horizontal={select('horizontal', prop.horizontal, 'auto')}
				vertical={select('vertical', prop.vertical, 'auto')}
				style={style.scroller}
			>
				<div style={style.content}>
					Foo<br />Bar<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />
					Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br />Foo<br />Bar<br />Bar<br />
					Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />
					Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. <br />Foo<br />Bar<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />
					Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />
					Foo<br />Bar<br />Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. <br />Foo<br />Bar<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />
					Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow<br />Foo<br />Bar<br />Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
					Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow.
				</div>
			</Scroller>
		)
	);
