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

for (let i = 0; i < 10; i++) {
	data[i] = [];
	for(let j = 0; j < 1000; j++) {
		data[i][j] = {title: ('00' + i).slice(-3) + ' - ' + language[j % 10]};
	}
}

const VirtualLists = kind({
	computed: {
		renderItem: () => ({
			width: 200,
			height: 50,
			render: ({index, key}) => (
				<div key={key} className={css.div} style={{
					position: 'absolute',
					overflow: 'hidden'
				}}>
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
					itemSize={50}
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
