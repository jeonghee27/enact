import hoc from '@enact/core/hoc';
import React from 'react';

const ResizeContainer = React.createContext();

const ResizeContainerConsumerDecorator = hoc({prop: null}, (config, Wrapped) => {
	const {prop} = config;

	// eslint-disable-next-line no-shadow
	return function ResizeContainerConsumerDecorator (props) {
		return (
			<ResizeContainer.Consumer>
				{resize => {
					let updated = props;

					if (prop) {
						updated = {
							...props,
							[prop]: resize
						};
					}

					return (
						<Wrapped {...updated} />
					);
				}}
			</ResizeContainer.Consumer>
		);
	};
});

const ResizeContent = React.createContext();

const ResizeContentConsumerDecorator = hoc({prop: null}, (config, Wrapped) => {
	const {prop} = config;

	// eslint-disable-next-line no-shadow
	return function ResizeContentConsumerDecorator (props) {
		return (
			<ResizeContent.Consumer>
				{resize => {
					let updated = props;

					if (prop) {
						updated = {
							...props,
							[prop]: resize
						};
					}

					return (
						<Wrapped {...updated} />
					);
				}}
			</ResizeContent.Consumer>
		);
	};
});

export {
	ResizeContainer,
	ResizeContainerConsumerDecorator,
	ResizeContent,
	ResizeContentConsumerDecorator
};
