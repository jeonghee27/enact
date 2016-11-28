import React, {Component, PropTypes} from 'react';

import Item from '@enact/moonstone/Item';

const ListItem = ({index, key, style, child}) => {
	return (
		<div key={key} style={style}>
			<Item data-index={index} component='div'>
				{child}
			</Item>
		</div>
	);
};

export default ListItem;
