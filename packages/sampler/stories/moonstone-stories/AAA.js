import Changeable from '@enact/ui/Changeable';

import Picker, {PickerBase} from '@enact/moonstone/Picker';
import {decrementIcons, incrementIcons} from './icons';

import RangePicker, {RangePickerBase} from '@enact/moonstone/RangePicker';

import ExpandablePicker from '@enact/moonstone/ExpandablePicker';

import {DatePicker, DatePickerBase} from '@enact/moonstone/DatePicker';

import {TimePicker, TimePickerBase} from '@enact/moonstone/TimePicker';

import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {withKnobs, boolean, number, select, text} from '@kadira/storybook-addon-knobs';

const StatefulPicker = Changeable(Picker);
StatefulPicker.propTypes = Object.assign({}, PickerBase.propTypes, StatefulPicker.propTypes);
StatefulPicker.defaultProps = Object.assign({}, PickerBase.defaultProps, StatefulPicker.defaultProps);
StatefulPicker.displayName = 'Picker';

const StatefulRangePicker = Changeable(RangePicker);
StatefulRangePicker.propTypes = Object.assign({}, RangePickerBase.propTypes, RangePicker.propTypes);
StatefulRangePicker.defaultProps = Object.assign({}, RangePickerBase.defaultProps, RangePicker.defaultProps);
StatefulRangePicker.displayName = 'RangePicker';

const emoticons = ['💥 boom', '😩🖐 facepalm', '🍩 doughnut', '👻 ghost', '💍 ring', '🎮 videogame', '🍌🍌 bananas'];
const ChangeableExpandablePicker = Changeable({value: 2}, ExpandablePicker);
ChangeableExpandablePicker.displayName = 'ExpandablePicker';

const ChangeableDatePicker = Changeable(DatePicker);
ChangeableDatePicker.propTypes = Object.assign({}, DatePicker.propTypes, DatePickerBase.propTypes, {
	onChange: React.PropTypes.func,
	onOpen: React.PropTypes.func,
	onClose: React.PropTypes.func,
	open: React.PropTypes.bool,
	value: React.PropTypes.instanceOf(Date)
});
ChangeableDatePicker.defaultProps = Object.assign({}, DatePicker.defaultProps, DatePickerBase.defaultProps);
ChangeableDatePicker.displayName = 'DatePicker';

const ChangeableTimePicker = Changeable(TimePicker);
ChangeableTimePicker.propTypes = Object.assign({}, TimePicker.propTypes, TimePickerBase.propTypes, {
	onChange: React.PropTypes.func,
	onOpen: React.PropTypes.func,
	onClose: React.PropTypes.func,
	open: React.PropTypes.bool,
	value: React.PropTypes.instanceOf(Date)
});
ChangeableTimePicker.defaultProps = Object.assign({}, TimePicker.defaultProps, TimePickerBase.defaultProps);
ChangeableTimePicker.displayName = 'TimePicker';

// Set up some defaults for info and knobs
const prop = {
	orientation: ['horizontal', 'vertical'],
	width: ['<null>', 'small', 'medium', 'large']
};
const nullify = (v) => v === '<null>' ? null : v;

const airports = [
	'San Francisco Airport Terminal Gate 1',
	'Boston Airport Terminal Gate 2',
	'Tokyo Airport Terminal Gate 3',
	'נמל התעופה בן גוריון טרמינל הבינלאומי'
];

storiesOf('Pickers')
	.addDecorator(withKnobs)
	.addWithInfo(
		' ',
		'Basic usage of Picker',
		() => (
			<table>
				<tr>
					<th>Picker</th>
					<th>RangePicker</th>
					<th>ExpandablePicker</th>
					<th>DatePicker</th>
					<th>TimePicker</th>
				</tr>
				<tr>
					<td>
						<div>Picker</div>
						<div>
							<StatefulPicker
								onChange={action('onChange')}
								width={nullify(select('width', prop.width, prop.width[3]))}
								orientation={select('orientation', prop.orientation, prop.orientation[0])}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', false)}
								noAnimation={boolean('noAnimation', false)}
								disabled={boolean('disabled', false)}
								incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
								decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
							>
								{airports}
							</StatefulPicker>
						</div>

						<div>Picker + joined</div>
						<div>
							<StatefulPicker
								onChange={action('onChange')}
								width={nullify(select('width', prop.width, prop.width[3]))}
								orientation={select('orientation', prop.orientation, prop.orientation[0])}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', true)}
								noAnimation={boolean('noAnimation', false)}
								disabled={boolean('disabled', false)}
								incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
								decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
							>
								{airports}
							</StatefulPicker>
						</div>

						<div>Picker + vertical</div>
						<StatefulPicker
							onChange={action('onChange')}
							width={nullify(select('width', prop.width, prop.width[3]))}
							orientation={'vertical'}
							wrap={boolean('wrap', false)}
							joined={boolean('joined', false)}
							noAnimation={boolean('noAnimation', false)}
							disabled={boolean('disabled', false)}
							incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
							decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
						>
							{airports}
						</StatefulPicker>
					</td>

					<td>
						<div>RangePicker</div>
						<div>
							<StatefulRangePicker
								onChange={action('onChange')}
								min={number('min', 0)}
								max={number('max', 100)}
								step={number('step', 5)}
								defaultValue={0}
								width={nullify(select('width', prop.width, 'small'))}
								orientation={select('orientation', prop.orientation, 'horizontal')}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', false)}
								noAnimation={boolean('noAnimation', false)}
								disabled={boolean('disabled', false)}
								incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
								decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
							/>
						</div>

						<div>RangePicker + joined</div>
						<div>
							<StatefulRangePicker
								onChange={action('onChange')}
								min={number('min', 0)}
								max={number('max', 100)}
								step={number('step', 5)}
								defaultValue={0}
								width={nullify(select('width', prop.width, 'small'))}
								orientation={select('orientation', prop.orientation, 'horizontal')}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', true)}
								noAnimation={boolean('noAnimation', false)}
								disabled={boolean('disabled', false)}
								incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
								decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
							/>
						</div>

						<div>RangePicker + vertical</div>
						<div>
							<StatefulRangePicker
								onChange={action('onChange')}
								min={number('min', 0)}
								max={number('max', 100)}
								step={number('step', 5)}
								defaultValue={0}
								width={nullify(select('width', prop.width, 'small'))}
								orientation={select('orientation', prop.orientation, 'vertical')}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', false)}
								noAnimation={boolean('noAnimation', false)}
								disabled={boolean('disabled', false)}
								incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
								decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
							/>
						</div>
					</td>

					<td>
						<ChangeableExpandablePicker
							title={text('title', 'Favorite Emoji')}
							onChange={action('onChange')}
							onClose={action('onClose')}
							onOpen={action('onOpen')}
							open={boolean('open', false)}
							width={select('width', ['small', 'medium', 'large'], 'large')}
						>
							{emoticons}
						</ChangeableExpandablePicker>
					</td>

					<td>
						<ChangeableDatePicker
							title={text('title', 'Date')}
							noLabels={boolean('noLabels', false)}
							noneText={text('noneText', 'Nothing Selected')}
							onChange={action('onChange')}
							onOpen={action('onOpen')}
							onClose={action('onClose')}
						/>
					</td>

					<td>
						<ChangeableTimePicker
							title={text('title', 'Time')}
							noLabels={boolean('noLabels', false)}
							noneText={text('noneText', 'Nothing Selected')}
							onChange={action('onChange')}
							onOpen={action('onOpen')}
							onClose={action('onClose')}
						/>
					</td>
				</tr>
			</table>
		)
	);
