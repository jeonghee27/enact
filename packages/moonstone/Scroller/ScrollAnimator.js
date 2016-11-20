/**
 * Exports the {@link moonstone/Scroller/ScrollAnimator.ScrollAnimator} component.
 *
 * @module moonstone/Scroller/ScrollAnimator
 * @private
 */

import R from 'ramda';

let cnt = 1;
const
	// Use eases library
	timingFunctions = {
		'linear': function (source, target, duration, curTime) {
			curTime /= duration;
			return (target - source) * curTime + source;
		},
		'ease-in': function (source, target, duration, curTime) {
			curTime /= duration;
			return (target - source) * curTime * curTime * curTime * curTime + source;
		},
		'ease-out': function (source, target, duration, curTime) {
			/*
			if (curTime < 80) {
				if (target > source) {
					return Math.floor(source + curTime / 16);
				} else {
					return Math.floor(source - curTime / 16);
				}
			} else {
				return curTime /= duration, curTime--, (target - source) * (curTime * curTime * curTime * curTime * curTime + 1) + source;
			}
			*/
			/*
			if (target > source) {
				return Math.floor(source + curTime / 16);
			} else {
				return Math.floor(source - curTime / 16);
			}
			*/

			cnt = cnt * (-1);
			return source + cnt;
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
	timingFunction = 'ease-out'
	newRAFCBFn = null // new rAF callback function

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

	start (rAFCBFn) {
		const
			// start timestamp
			startTimeStamp = perf.now(),
			fn = () => {
				if (this.newRAFCBFn) {
					// update new rAF callback funtion

					const
						// current timestamp
						curTimeStamp = perf.now(),
						// current time if 0 at starting position
						curTime = curTimeStamp - startTimeStamp;

					rAFCBFn(curTime);
					if (!this.useRAF) {
						clearInterval(this.rAFId);
					}
					this.rAFId = null;

					this.start(this.newRAFCBFn);
					this.newRAFCBFn = null;
				} else {
					// call rAF callback funtion

					const
						// schedule next frame
						rAFId = (this.useRAF) ? rAF(fn) : this.rAFId,
						// current timestamp
						curTimeStamp = perf.now(),
						// current time if 0 at starting position
						curTime = curTimeStamp - startTimeStamp;

					this.rAFId = rAFId;
					rAFCBFn(curTime);
				}
			};

		if (this.useRAF) {
			this.rAFId = rAF(fn);
		} else {
			this.rAFId = setInterval(fn, 16);
		}
	}

	update = (rAFCBFn) => {this.newRAFCBFn = rAFCBFn;}

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

	getTimingFn = () => (timingFunctions[this.timingFunction])
}

export default ScrollAnimator;
export {ScrollAnimator};
