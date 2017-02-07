import ExpandableList from '@enact/moonstone/ExpandableList';
import Selectable from '@enact/ui/Selectable';
import React from 'react';

const List = Selectable(ExpandableList);

const handleSelect = ({data}) => {
	[].slice.call(parent.document.querySelectorAll('ul > li > a')).forEach((node) => {
		if (node.textContent === data) {
			node.click();
		}
	});
};

const StoryLinkable = (props) => {
	return (
		<div>
			<div>
				{props}
			</div>
			<List
				onSelect={handleSelect}
				style={{marginTop: '10px'}}
				title="Story links"
			>
				{[].slice.call(parent.document.querySelectorAll('ul > li > a')).map((node) => node.textContent)}
			</List>
		</div>
	);
};

export default StoryLinkable;
