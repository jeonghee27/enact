import React, {Component, PropTypes} from 'react';

import Item from '@enact/moonstone/Item';

import css from './ListItem.less';

const ListItem = ({style, index, numOfItems, child}) => {
	return (
		<div key={index % numOfItems} className={css.listItem} style={style}>
			<Item data-index={index} className={css.listItemInner} component='div'>
				{child}
			</Item>
		</div>
	);
};

export default ListItem;
