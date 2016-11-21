/**
 * Exports the {@link moonstone/Scroller/ScrollAnimator.ScrollAnimator} component.
 *
 * @module moonstone/Scroller/ScrollAnimator
 * @private
 */

import R from 'ramda';

let additionalValue = 0;
const
	// Use eases library
	timingFunctions = {
		'1px': function (source, target, duration, curTime) {
			if (target >= source) {
				return Math.ceil(source + curTime / 16);
			} else {
				return Math.ceil(source - curTime / 16);
			}
		},
		'linear': function (source, target, duration, curTime) {
			curTime /= duration;
			return (target - source) * curTime + source;
		},
		'ease-in': function (source, target, duration, curTime) {
			curTime /= duration;
			return (target - source) * curTime * curTime * curTime * curTime + source;
		},
		'ease-out': function (source, target, duration, curTime) {
			curTime /= duration;
			curTime--;
			return (target - source) * (curTime * curTime * curTime * curTime * curTime + 1) + source;
		},
		'enhanced-ease-out': function (source, target, duration, curTime) {
			if (target - source > 10) {
				if (curTime < 80) {
					additionalValue = (additionalValue + 1) % 2;
					if (target > source) {
						return Math.ceil(source + curTime / 8) + additionalValue;
					} else {
						return Math.ceil(source - curTime / 8) - additionalValue;
					}
				} else {
					curTime = (curTime - 80) / (duration - 80);
					curTime--;
					return (target - source) * (curTime * curTime * curTime * curTime * curTime + 1) + source;
				}
			} else {
				curTime /= duration;
				curTime--;
				return (target - source) * (curTime * curTime * curTime * curTime * curTime + 1) + source;
			}
		},
		'ease-in-out': function (source, target, duration, curTime) {
			curTime /= duration / 2;
			if (curTime < 1) {
				return (target - source) / 2 * curTime * curTime * curTime * curTime + source;
			} else {
				curTime -= 2;
			}
			return (source - target) / 2 * (curTime * curTime * curTime * curTime - 2) + source;
		}
	},

	frameTime = 16.0,         // time for one frame
	maxVelocity = 100,        // speed cap
	stopVelocity = 0.04,      // velocity to stop
	velocityFriction = 0.95,  // velocity decreasing factor

	clampVelocity = R.clamp(-maxVelocity, maxVelocity),

	// These guards probably aren't necessary because there shouldn't be any scrolling occurring
	// in isomorphic mode.
	rAF = (typeof window === 'object') ? window.requestAnimationFrame : function () {},
	cAF = (typeof window === 'object') ? window.cancelAnimationFrame : function () {},
	perf = (typeof window === 'object') ? window.performance : {};

/**
 * {@link moonstone/Scroller/ScrollAnimator.ScrollAnimator} is the class
 * to scroll a list or a scroller with animation.
 *
 * @class ScrollAnimator
 * @memberof moonstone/Scroller/ScrollAnimator
 * @public
 */
class ScrollAnimator {
	useRAF = true
	rAFId = null
	timingFunction = 'enhanced-ease-out'
	animationInfo = null

	/**
	 * @param {String|null} timingFunction - Timing function to use for animation.  Must be one of
	 *	`'linear'`, `'ease-in'`, `'ease-out'`, or `'ease-in-out'`, or null. If `null`, defaults to
	 *	`'ease-out'`.
	 * @constructor
	 */
	constructor (timingFunction) {
		this.timingFunction = timingFunction || this.timingFunction;
	}

	simulate (sourceX, sourceY, velocityX, velocityY) {
		let
			stepX = clampVelocity(velocityX * frameTime),
			stepY = clampVelocity(velocityY * frameTime),
			deltaX = 0,
			deltaY = 0,
			duration = 0;

		do {
			stepX *= velocityFriction;
			stepY *= velocityFriction;
			deltaX += stepX;
			deltaY += stepY;
			duration += frameTime;
		} while ((stepX * stepX + stepY * stepY) > stopVelocity);

		return {
			targetX: sourceX + deltaX,
			targetY: sourceY + deltaY,
			duration
		};
	}

	animate = () => {
		const animationInfo = this.animationInfo;
		if (this.useRAF) {
			this.rAFId = rAF(this.animate);
		}
		animationInfo.curTimeStamp = perf.now();
		animationInfo.rAFCBFn(animationInfo.curTimeStamp < animationInfo.endTimeStamp);
	}

	start ({silent, ...info}) {
		this.animationInfo = info;
		this.animationInfo.curTimeStamp = info.startTimeStamp;

		if (!silent) {
			if (this.useRAF) {
				this.animate();
			} else {
				setInterval(this.animate, 16);
				this.animate();
			}
		}
	}

	stop () {
		if (this.rAFId !== null) {
			if (this.useRAF) {
				cAF(this.rAFId);
			} else {
				clearInterval(this.rAFId);
			}
			this.rAFId = null;
		}
	}

	getRAFId = () => this.rAFId

	getAnimationCurrentPos = () => {
		const
			{sourceX, sourceY, targetX, targetY, startTimeStamp, curTimeStamp, duration,
			horizontalScrollability, verticalScrollability} = this.animationInfo,
			curTime = curTimeStamp - startTimeStamp;

		return {
			x: horizontalScrollability ? timingFunctions[this.timingFunction](sourceX, targetX, duration, curTime) : sourceX,
			y: verticalScrollability ? timingFunctions[this.timingFunction](sourceY, targetY, duration, curTime) : sourceY
		};
	}

	getAnimationTargetPos = () => {
		const {targetX: x, targetY: y} = this.animationInfo;
		return {x, y};
	}
}

export default ScrollAnimator;
export {ScrollAnimator};
