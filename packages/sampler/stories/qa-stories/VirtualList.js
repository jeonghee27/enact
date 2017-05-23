import SwitchItem from '@enact/moonstone/SwitchItem';
import VirtualList from '@enact/moonstone/VirtualList';
import {VirtualListCore} from '@enact/moonstone/VirtualList/VirtualListBase';
import ri from '@enact/ui/resolution';
import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {number} from '@kadira/storybook-addon-knobs';

import {mergeComponentMetadata} from '../../src/utils/propTables';

const Config = mergeComponentMetadata('VirtualList', VirtualListCore, VirtualList);

const
	style = {
		item: {
			borderBottom: ri.unit(3, 'rem') + ' solid #202328',
			boxSizing: 'border-box'
		},
		list: {
			height: ri.unit(552, 'rem')
		}
	},
	itemList = [];

for (let i = 0; i < 100; i++) {
	itemList.push({item :'Item ' + ('00' + i).slice(-3), selected: false});
}

class StatefulSwitchItem extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			selected: itemList[props.index].selected
		};
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.index !== nextProps.index) {
			this.setState({selected: itemList[nextProps.index].selected});
		}
	}

	onToggle = () => {
		itemList[this.props.index].selected = !itemList[this.props.index].selected;
		this.setState({selected: !this.state.selected});
	}

	render () {
		const
			props = Object.assign({}, this.props),
			itemStyle = {height: this.props.size + 'px', ...style.item};
		delete props.size;
		delete props.selected;
		delete props.index;

		return (
			<SwitchItem {...props} onToggle={this.onToggle} style={itemStyle} selected={this.state.selected}>
				{this.props.children}
			</SwitchItem>
		);
	}
}

class StatefulVirtualList extends React.Component {
	renderItem = (size) => ({data, index, ...rest}) => {
		return (
			<StatefulSwitchItem size={size} index={index} {...rest}>
				{data[index].item}
			</StatefulSwitchItem>
		);
	};

	render () {
		const itemSize = ri.scale(number('itemSize', 60));
		return (
			<VirtualList
				{...this.props}
				component={this.renderItem(itemSize)}
				data={itemList}
				dataSize={number('dataSize', itemList.length)}
				itemSize={itemSize}
				onScrollStart={action('onScrollStart')}
				onScrollStop={action('onScrollStop')}
				spacing={ri.scale(number('spacing', 0))}
				style={style.list}
			/>
		);
	}
}

storiesOf('VirtualList')
	.addWithInfo(
		'with more items',
		() => {
			return (
				<StatefulVirtualList />
			);
		},
		{propTables: [Config]}
	);
