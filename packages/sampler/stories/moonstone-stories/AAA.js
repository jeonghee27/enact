import Changeable from '@enact/ui/Changeable';
import {DatePicker, DatePickerBase} from '@enact/moonstone/DatePicker';
import {decrementIcons, incrementIcons} from './icons';
import ExpandablePicker from '@enact/moonstone/ExpandablePicker';
import Picker, {PickerBase} from '@enact/moonstone/Picker';
import RangePicker, {RangePickerBase} from '@enact/moonstone/RangePicker';
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
delete StatefulRangePicker.propTypes.value;

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
'year defaultOpen day maxDays maxMonths month onChangeDate onChangeMonth onChangeYear order'
	.split(' ')
	.forEach(prop => {
		delete ChangeableDatePicker.propTypes[prop];
		delete ChangeableDatePicker.defaultProps[prop];
	});

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
'onChangeHour defaultOpen onChangeMeridiem hour onChangeMinute minute meridiem meridiems order'
	.split(' ')
	.forEach(prop => {
		delete ChangeableTimePicker.propTypes[prop];
		delete ChangeableTimePicker.defaultProps[prop];
	});

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
				<thead>
					<tr>
						<th>Picker</th>
						<th>RangePicker</th>
						<th>ExpandablePicker, DatePicker and TimePicker</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<div>Picker</div>
							<div>
								<StatefulPicker
									onChange={action('onChange')}
									width={nullify(select('width', prop.width, 'small'))}
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
									width={nullify(select('width', prop.width, 'small'))}
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
								width={nullify(select('width', prop.width, 'small'))}
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
							<StatefulPicker
								onChange={action('onChange')}
								width={nullify(select('width', prop.width, 'small'))}
								orientation={'vertical'}
								wrap={boolean('wrap', false)}
								joined={boolean('joined', true)}
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
								<StatefulRangePicker
									onChange={action('onChange')}
									min={number('min', 0)}
									max={number('max', 100)}
									step={number('step', 5)}
									defaultValue={0}
									width={nullify(select('width', prop.width, 'small'))}
									orientation={select('orientation', prop.orientation, 'vertical')}
									wrap={boolean('wrap', false)}
									joined={boolean('joined', true)}
									noAnimation={boolean('noAnimation', false)}
									disabled={boolean('disabled', false)}
									incrementIcon={select('incrementIcon', ['', ...incrementIcons])}
									decrementIcon={select('decrementIcon', ['', ...decrementIcons])}
								/>
							</div>
						</td>

						<td>
							<div>ExpandablePicker</div>
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

							<div>DatePicker</div>
							<ChangeableDatePicker
								title={text('title', 'Date')}
								noLabels={boolean('noLabels', false)}
								noneText={text('noneText', 'Nothing Selected')}
								onChange={action('onChange')}
								onOpen={action('onOpen')}
								onClose={action('onClose')}
							/>

							<div>TimePicker</div>
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
				</tbody>
			</table>
		)
	);
