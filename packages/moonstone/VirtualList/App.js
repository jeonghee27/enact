import React, {Component} from 'react';

import kind from '@enact/core/kind';
import ri from '@enact/ui/resolution';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';

import VirtualList from './VirtualList';

import css from './App.less';

const
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
	];

let data = [];

function getRandomWidth() {
    return parseInt(Math.random() * 20) * 100 + 100;
}

for (let i = 0; i < 2000; i++) {
	data[i] = [];
	for(let j = 0; j < 200; j++) {
		data[i][j] = {
			width: getRandomWidth(),
			programName: ('00' + i).slice(-3) + '/' + ('00' + j).slice(-3) + ' - ' + programName[(i + j) % 20]
		};
	}
}

const bgcolors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const VirtualLists = kind({
	computed: {
		getItemWidth: () => (index) => {
			return data[index.primaryIndex][index.secondaryIndex].width;
		},
		renderItem: () => ({index, key}) => {
			return (
				<div
					key={key}
					className={css.item}
				>
					<div>
						{data[index.primaryIndex][index.secondaryIndex].programName}
					</div>
				</div>
			);
		}
	},

	render: ({getItemWidth, renderItem, className}) => {
		return (
			<VirtualList
				data={data}
				dataSize={data.length}
				direction={'vertical'}
				directionOption={'verticalFixedHorizontalVariable'}
				getItemWidth={getItemWidth}
				itemSize={83}
				scrollBoundsSize={57600 /* 200 * 2 ( 2 per 1 hour )* 24 hr * 6 day */}
				className={css.list}
				component={renderItem}
			/>
		);
	}
});

export default MoonstoneDecorator(VirtualLists)
