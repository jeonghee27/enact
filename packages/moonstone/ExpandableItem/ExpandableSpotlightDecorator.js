import {getContainersForNode, setContainerLastFocusedElement} from '@enact/spotlight/src/container';
import {forward, handle} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import Spotlight from '@enact/spotlight';
import Pause from '@enact/spotlight/Pause';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Default config for {@link mooonstone/ExpandableItem.ExpandableSpotlightDecorator}
 *
 * @memberof moonstone/ExpandableItem.ExpandableSpotlightDecorator
 * @hocconfig
 * @private
 */
const defaultConfig = {
	/**
	 * When `true` and used in conjunction with `noAutoFocus` when `false`, the contents of the
	 * container will receive spotlight focus expanded, even in pointer mode.
	 *
	 * @type {Boolean}
	 * @default false
	 * @memberof moonstone/ExpandableItem.ExpandableSpotlightDecorator.defaultConfig
	 * @private
	 */
	noPointerMode: false
};

/**
 * Restores spotlight focus to root container when closing the container if the previously focused
 * component is contained.
 *
 * @class ExpandableSpotlightDecorator
 * @memberof moonstone/ExpandableItem
 * @private
 */
const ExpandableSpotlightDecorator = hoc(defaultConfig, (config, Wrapped) => {
	const {noPointerMode} = config;

	return class extends React.Component {
		static displayName = 'ExpandableSpotlightDecorator'

		static propTypes =  /** @lends moonstone/ExpandableItem.ExpandableSpotlightDecorator.prototype */ {
			/**
			 * When `true`, the contents of the container will not receive spotlight focus when becoming
			 * expanded.
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			noAutoFocus: PropTypes.bool,

			/**
			 * Set the open state of the component, which determines whether it's expanded or not.
			 *
			 * @type {Boolean}
			 * @default true
			 * @public
			 */
			open: PropTypes.bool
		}

		static defaultProps = {
			noAutoFocus: false
		}

		paused = new Pause()

		highlightContents = () => {
			const current = Spotlight.getCurrent();
			if (this.containerNode.contains(current) || document.activeElement === document.body) {
				const contents = this.containerNode.querySelector('[data-expandable-container]');
				if (contents && !this.props.noAutoFocus && !contents.contains(current)) {
					Spotlight.focus(contents.dataset.containerId);
				}
			}
		}

		highlightLabeledItem = () => {
			const current = Spotlight.getCurrent();
			if (this.containerNode.contains(current)) {
				Spotlight.focus(this.containerNode.querySelector('[data-expandable-label]'));
			} else if (!current) {
				// when focus is not currently set during close (due to a cancel event or the close
				// on blur from ExpandableInput), we need to fix the last focused element for the
				// container tree to be the labeled item so that focus can be restored to it rather
				// than spotlight getting lost
				const label = this.containerNode.querySelector('[data-expandable-label]');
				const containerIds = getContainersForNode(label);

				setContainerLastFocusedElement(label, containerIds);
			}
		}

		highlight = (callback) => {
			if (Spotlight.isPaused()) return;

			const {open} = this.props;
			const pointerMode = Spotlight.getPointerMode();
			const changePointerMode = pointerMode && (noPointerMode || !open);

			if (changePointerMode) {
				// we temporarily set pointer mode to `false` to ensure that focus is forced away
				// from the collapsing expandable.
				Spotlight.setPointerMode(false);
			}

			callback();

			if (changePointerMode) {
				Spotlight.setPointerMode(pointerMode);
			}
		}


		pause = () => this.paused.pause()

		resume = () => this.paused.resume()

		handle = handle.bind(this)

		handleClose = this.handle(
			forward('onClose'),
			this.pause
		)

		handleOpen = this.handle(
			forward('onOpen'),
			this.pause
		)

		handleHide = () => {
			this.resume();
			const pointerMode = Spotlight.getPointerMode();

			if (!pointerMode || noPointerMode) {
				// In `pointerMode`, only highlight `LabeledItem` when `noPointerMode` is `true`
				this.highlight(this.highlightLabeledItem);
			}
		}

		handleShow = () => {
			this.resume();
			this.highlight(this.highlightContents);
		}

		setContainerNode = (node) => {
			this.containerNode = ReactDOM.findDOMNode(node);	// eslint-disable-line react/no-find-dom-node
		}

		render () {
			const props = Object.assign({}, this.props);
			delete props.noAutoFocus;

			return (
				<Wrapped
					{...props}
					onHide={this.handleHide}
					onShow={this.handleShow}
					onOpen={this.handleOpen}
					onClose={this.handleClose}
					setContainerNode={this.setContainerNode}
				/>
			);
		}
	};
});

export default ExpandableSpotlightDecorator;
export {
	ExpandableSpotlightDecorator
};
