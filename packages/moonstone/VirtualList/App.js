import React, {Component} from 'react';

import kind from '@enact/core/kind';
import ri from '@enact/ui/resolution';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';

import VirtualList from './VirtualList';

import css from './App.less';

const
	language = [
		'한국어 - 한국',
		'English - United States',
		'Português - Brasil',
		'Português - Portugal',
		'Čeština - Česká republika',
		'Dansk - Danmark',
		'Deutsch - Deutschland',
		'Ελληνική γλώσσα - Ελλάδα',
		'Español - España',
		'Suomi - Suomi'
	],
	inlineStyle = {padding: '0'};

let data = [];

function getRandomWidth() {
    return parseInt(Math.random() * 20) * 50 + 50;
}

for (let i = 0; i < 100; i++) {
	data[i] = [];
	for(let j = 0; j < 3000; j++) {
		data[i][j] = {
			width: getRandomWidth(),
			title: ('00' + j).slice(-3) + ' - ' + language[i % 10]
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
				<div key={key} className={css.item} style={{backgroundColor: bgcolors[Math.floor(Math.random() * bgcolors.length)]}}>
					{data[index.primaryIndex][index.secondaryIndex].title}
				</div>
			);
		}
	},

	render: ({getItemWidth, renderItem, className}) => {
		return (
			<div className={className} style={inlineStyle}>
				<VirtualList
					clientSize={57600 /* 200 * 2 ( 2 per 1 hour )* 24 hr * 6 day */}
					data={data}
					dataSize={data.length}
					direction={'vertical'}
					directionOption={'verticalFixedHorizontalVariable'}
					getItemWidth={getItemWidth}
					itemSize={70}
					spacing={0}
					className={css.list}
					component={renderItem}
				/>
			</div>
		);
	}
});

export default MoonstoneDecorator(VirtualLists)
