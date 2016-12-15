/**
 * Exports the {@link moonstone/VirtualVariableList/Positionable.Positionable} component.
 *
 * @module moonstone/VirtualVariableList/Positionable
 */

import React, {Component, PropTypes} from 'react';
import clamp from 'ramda/src/clamp';

import hoc from '@enact/core/hoc';

const
	dataIndexAttribute = 'data-index',
	doc = (typeof window === 'object') ? window.document : {},
	nop = () => {};

const PositionableHoc = hoc((config, Wrapped) => {
	return class Positionable extends Component {
		static propTypes = {
			/**
			 * Position x.
			 *
			 * @type {Number}
			 * @default 0
			 * @public
			 */
			posX: PropTypes.number.isRequired,

			/**
			 * Position y.
			 *
			 * @type {Number}
			 * @default 0
			 * @public
			 */
			posY: PropTypes.number.isRequired,

			/**
			 * Support 5 way navigation and wheel event handling with spotlight
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			gesture: PropTypes.bool,

			/**
			 * Called whtn position updates internally
			 *
			 * @type {Function}
			 * @public
			 */
			doPosition: PropTypes.func
		}

		static defaultProps = {
			gesture: false,
			doPosition: nop,
			posX: 0,
			posY: 0
		}

		// status
		isKeyDown = false
		childRef = null

		// bounds info
		bounds = {
			clientWidth: 0,
			clientHeight: 0,
			scrollWidth: 0,
			scrollHeight: 0,
			maxTop: 0,
			maxLeft: 0
		}

		// spotlight
		lastFocusedItem = null

		constructor (props) {
			super(props);

			this.initChildRef = this.initRef('childRef');
		}

		// event handling

		onFocus = (e) => {
			// for virtuallist
			if (this.props.gesture && this.isKeyDown) {
				const
					item = e.target,
					//index = Number.parseInt(item.getAttribute(dataIndexAttribute));
					index = item.getAttribute(dataIndexAttribute);

				if (index && item !== this.lastFocusedItem && item === doc.activeElement && this.childRef.calculatePositionOnFocus) {
					const
						key = item.getAttribute('key'),
						pos = this.childRef.calculatePositionOnFocus(index, key);
					if (pos) {
						if (pos.left !== this.scrollLeft || pos.top !== this.scrollTop) {
							this.scroll(pos.left, pos.top);
						}
						this.lastFocusedItem = item;
					}
				}
			}
		}

		onKeyDown = (e) => {
			if (this.props.gesture && this.childRef.setSpotlightContainerRestrict) {
				this.isKeyDown = true;
				//const index = Number.parseInt(e.target.getAttribute(dataIndexAttribute));
				const index = e.target.getAttribute(dataIndexAttribute);
				this.childRef.setSpotlightContainerRestrict(e.keyCode, index);
			}
		}

		onKeyUp = () => {
			if (this.props.gesture) {
				this.isKeyDown = false;
			}
		}

		onWheel = (ev) => {
			if (this.props.gesture) {
				let posY;

				ev.preventDefault();

				if (ev.deltaY > 0) {
					posY = clamp(0, this.bounds.maxTop, this.props.posY + this.bounds.clientHeight);
				} else if (ev.deltaY < 0) {
					posY = clamp(0, this.bounds.maxTop, this.props.posY - this.bounds.clientHeight);
				} else {
					posY = this.props.posY;
				}
				this.props.doPosition({posX: null, posY});
			}
		}

		// positioning

		setScrollLeft (v) {
			this.dirHorizontal = Math.sign(v - this.scrollLeft);
			this.scrollLeft = clamp(0, this.bounds.maxLeft, v);
		}

		setScrollTop (v) {
			this.dirVertical = Math.sign(v - this.scrollTop);
			this.scrollTop = clamp(0, this.bounds.maxTop, v);
		}

		doPosition () {
			this.props.doPosition({posX: this.scrollLeft, posY: this.scrollTop});
		}

		scroll = (left, top, skipPositionContainer = false) => {
			if (left !== this.scrollLeft) {
				this.setScrollLeft(left);
			}
			if (top !== this.scrollTop) {
				this.setScrollTop(top);
			}

			this.childRef.setScrollPosition(this.scrollLeft, this.scrollTop, this.dirHorizontal, this.dirVertical, skipPositionContainer);
			this.doPosition();
		}

		initRef (prop) {
			return (ref) => {
				this[prop] = ref;
			};
		}

		// prevent native scrolling by Spotlight
		preventScroll = () => {
			const childRef = this.childRef;
			childRef.scrollTop = 0;
			childRef.scrollLeft = childRef.scrollWidth;
		}

		componentDidMount () {
			const childRef = this.childRef;

			this.bounds = this.childRef.getScrollBounds();

			if (childRef.containerNode && childRef.containerNode.addEventListener) {
				childRef.containerNode.addEventListener('scroll', this.preventScroll);
			}
		}

		componentWillReceiveProps (nextProps) {
			const {posX, posY} = this.props;

			if (posX !== nextProps.posX || posY !== nextProps.posY) {
				this.childRef.setScrollPosition(
					nextProps.posX,
					nextProps.posY,
					Math.sign(nextProps.posX - posX),
					Math.sign(nextProps.posY - posY)
				);
			}
		}

		render () {
			const
				{onFocus, onKeyDown, onKeyUp, onWheel} = this,
				props = Object.assign({}, this.props, (this.props.gesture) ? {
					onFocus,
					onKeyDown,
					onKeyUp,
					onWheel
				} : {});

			delete props.doPosition;
			delete props.posX;
			delete props.posY;
			delete props.gesture;

			return (<Wrapped {...props} ref={this.initChildRef} />);
		}
	};
});

export default PositionableHoc;
export {PositionableHoc};
