/**
 * Exports the {@link moonstone/Scroller/ScrollAnimator.ScrollAnimator} component.
 *
 * @module moonstone/Scroller/ScrollAnimator
 * @private
 */

import R from 'ramda';

let easingFactorCache = {};
const
	defaultAnimationDuration = 500,
	timingFunctions = {
		'linear': function (duration, curTime) {
			curTime /= duration;
			return curTime;
		},
		'ease-in': function (duration, curTime) {
			curTime /= duration;
			return curTime * curTime * curTime * curTime;
		},
		'ease-out': function (duration, curTime) {
			curTime /= duration;
			curTime--;
			return (curTime * curTime * curTime * curTime * curTime + 1);
		},
		'cache-ease-out': function (duration, curTime) {
			const index = parseInt(curTime * 1000, 10);
			if (duration === defaultAnimationDuration && easingFactorCache[index]) {
				console.log(curTime, easingFactorCache[index]);
				return easingFactorCache[index];
			} else {
				curTime /= duration;
				curTime--;
				return easingFactorCache[index] = (curTime * curTime * curTime * curTime * curTime + 1);
			}
		},
		'ease-in-out': function (duration, curTime) {
			curTime /= duration / 2;
			if (curTime < 1) {
				return (curTime * curTime * curTime * curTime) / 2;
			} else {
				curTime -= 2;
			}
			return -(curTime * curTime * curTime * curTime - 2) / 2;
		}
	},

	// simuate constants
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
	rAFId = null
	timingFunction = 'ease-out'
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
		const info = this.animationInfo;
		info.curTimeStamp = Math.ceil(perf.now());
		this.rAFId = rAF(this.animate);

		if (info.curTimeStamp < info.endTimeStamp) {
			// animating
			info.rAFCBFn(true, this.getAnimationCurrentPos());
		} else {
			// stopping animation
			info.rAFCBFn(false, {x: info.targetX, y: info.targetY});
		}
	}

	start ({sourceX, sourceY, targetX, targetY, duration, silent, ...rest}) {
		const
			curTimeStamp = Math.floor(perf.now()),
			startTimeStamp = curTimeStamp - frameTime;

		this.animationInfo = {
			...rest,
			sourceX: Math.floor(sourceX),
			sourceY: Math.floor(sourceY),
			targetX,
			targetY,
			distanceX: Math.floor(targetX - sourceX),
			distanceY: Math.floor(targetY - sourceY),
			startTimeStamp: startTimeStamp,
			endTimeStamp: startTimeStamp + duration,
			curTimeStamp: curTimeStamp,
			duration
		};

		if (silent) {
			// Without cancelling rAF callback funtion, we'd like to start scrolling
			this.animationInfo.rAFCBFn(true, {x: targetX, y: targetY});
		} else {
			this.animate();
		}
	}

	stop () {
		if (this.rAFId !== null) {
			cAF(this.rAFId);
			this.rAFId = null;
		}
	}

	getAnimationCurrentPos = () => {
		const
			{sourceX, sourceY, distanceX, distanceY, startTimeStamp, curTimeStamp, duration, horizontalScrollability, verticalScrollability} = this.animationInfo,
			curTime = curTimeStamp - startTimeStamp,
			deltaX = horizontalScrollability ? (Math.ceil(timingFunctions[this.timingFunction](duration, curTime) * distanceX)) : 0,
			deltaY = verticalScrollability ? (Math.ceil(timingFunctions[this.timingFunction](duration, curTime) * distanceY)) : 0;

		return {
			x: sourceX + deltaX,
			y: sourceY + deltaY
		};
	}
}

export default ScrollAnimator;
export {ScrollAnimator, defaultAnimationDuration};
