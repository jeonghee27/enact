import Button from '@enact/moonstone/Button';
import ri from '@enact/ui/resolution';
import Item from '@enact/moonstone/Item';
import VirtualFlexList from '@enact/moonstone/VirtualFlexList';
import React, {Component} from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';

const
	channelLength = 200,
	timelineLength = 60,
	timeHeight = ri.scale(30),
	itemWidth = ri.scale(300),
	clientHeight = timeHeight * 10,
	clientWidth = itemWidth * 4,
	maxFlexScrollSize = timeHeight * 30;

// Inline style
const
	style = {
		epg: {
			background: 'black',
			position: 'absolute',
			height: (clientHeight) + 'px',
			width: (clientWidth) + 'px',
			padding: ri.scale(33) + 'px 0'
		},
		// Programs
		itemProgramWrapper: {
			position: 'absolute',
			padding: 0,
			border: ri.scale(3) + 'px solid black',
			boxSizing: 'border-box',
			overflow: 'hidden'
		},
		itemProgram: {
			height: '100%',
			fontSize: ri.scale(33) + 'px'
		}
	};

// Data
const
	// Programs
	programName = [
		'On Demand',
		'To Be Announced',
		'Newsedge',
		'TMZ',
		'Dish Nation',
		'Access Hollywood',
		'The Wendy Williams Show',
		'Harry',
		'Extra',
		'Dish Nation',
		'TMZ',
		'FOX 2 News Morning',
		'Secrets of the Dead',
		'SciTech Now',
		'Under the Radar Michigan',
		'Tavis Smiley',
		'Charlie Rose',
		'Nature',
		'NOVA',
		'Secrets of the Dead'
	],
	getRandomHeight = () => {
		return (parseInt(Math.random() * 10) + 1) * timeHeight;
	},
	getProgramData = function () {
		const data = [];

		for (let i = 0; i < channelLength; i++) {
			data[i] = [];
			for (let j = 0; j < timelineLength; j++) {
				data[i][j] = {
					programName: ('00' + i).slice(-3) + '/' + ('00' + j).slice(-3) + ' - ' + programName[(i + j) % 20],
					height: getRandomHeight()
				};
			}
		}

		return data;
	},
	updateProgramHeight = function (data) {
		for (let i = 0; i < channelLength; i++) {
			for (let j = 0; j < timelineLength; j++) {
				data[i][j].height = getRandomHeight();
			}
		}

		return data;
	};

let
	programData = getProgramData();

// Story
const
	// eslint-disable-next-line enact/prop-types
	getItemLength = ({data, index}) => {
		return data[index.col].length;
	},
	// eslint-disable-next-line enact/prop-types
	getItemHeight = ({data, index}) => {
		return data[index.row][index.col].height;
	},
	// eslint-disable-next-line enact/prop-types
	renderItem = ({data, index, key}) => {
		// Programs
		return (
			<Item key={key} style={style.itemProgramWrapper}>
				<div style={style.itemProgram}>
					{data[index.row][index.col].programName}
				</div>
			</Item>
		);
	};

class VirtualFlexListView extends Component {
	constructor () {
		super();

		this.state = {
			programData
		};
	}

	changeHeight = () => {
		this.setState({programData: updateProgramHeight(this.state.programData)});
	}

	render = () => (
		<div style={style.epg}>
			<VirtualFlexList
				items={{
					background: '#141416',
					colCount: number('items.rowCount', programData.length),
					component: renderItem,
					data: this.state.programData,
					height: getItemHeight,
					rowCount: getItemLength,
					width: ri.scale(number('items.width', 200))
				}}
				maxFlexScrollSize={maxFlexScrollSize}
				onPositionChange={action('onPositionChange')}
				x={ri.scale(number('x', 0))}
				y={ri.scale(number('y', 0))}
			/>
			<Button onClick={this.changeHeight}>Update</Button>
		</div>
	);
}

storiesOf('VirtualFlexList')
	.addDecorator(withKnobs)
	.addWithInfo(
		' ',
		'Basic usage of VirtualFlexList',
		() => <VirtualFlexListView />
	);
