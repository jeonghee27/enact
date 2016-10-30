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
    return Math.random() * 2000 / 10;
}

for (let i = 0; i < 10; i++) {
	data[i] = [];
	for(let j = 0; j < 1000; j++) {
		data[i][j] = {
			width: getRandomWidth(),
			title: ('00' + j).slice(-3) + ' - ' + language[i % 10]
		};
	}
}

const VirtualLists = kind({
	computed: {
		renderItem: () => ({
			getWidth: (index) => data[index.primaryIndex][index.secondaryIndex].width,
			render: ({index, key}) => (
				<div key={key} className={css.item}>
					{data[index.primaryIndex][index.secondaryIndex].title}
				</div>
			)
		})
	},

	render: ({renderItem, className}) => {
		return (
			<div className={className} style={inlineStyle}>
				<VirtualList
					data={data}
					dataSize={data.length}
					itemSize={70}
					spacing={0}

					clientSize={{
						width: 57600, // 200 * 2 ( 2 per 1 hour )* 24 hr * 6 day
					}}
					direction={'vertical'}
					directionOption={'verticalFixedHorizontalVariable'}

					className={css.list}
					component={renderItem}
				/>
			</div>
		);
	}
});

export default MoonstoneDecorator(VirtualLists)
