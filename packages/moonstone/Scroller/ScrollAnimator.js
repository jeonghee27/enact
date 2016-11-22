/**
 * Exports the {@link moonstone/Scroller/ScrollAnimator.ScrollAnimator} component.
 *
 * @module moonstone/Scroller/ScrollAnimator
 * @private
 */

import R from 'ramda';

const
	timingFunctions = {
		'linear': function (distance, duration, curTime) {
			curTime /= duration;
			return distance * curTime;
		},
		'ease-in': function (distance, duration, curTime) {
			curTime /= duration;
			return distance * curTime * curTime * curTime * curTime;
		},
		'ease-out': function (distance, duration, curTime) {
			curTime /= duration;
			curTime--;
			return distance * (curTime * curTime * curTime * curTime * curTime + 1);
		},
		'flexible-ease-out': function (distance, duration, curTime) {
			if (curTime <= 80) {
				return (distance >= 0) ? Math.ceil(curTime / 16) : -Math.ceil(curTime / 16);
			} else {
				curTime /= duration;
				curTime--;
				return distance * (curTime * curTime * curTime * curTime * curTime + 1);
			}
		},
		'ease-in-out': function (distance, duration, curTime) {
			curTime /= duration / 2;
			if (curTime < 1) {
				return distance / 2 * curTime * curTime * curTime * curTime;
			} else {
				curTime -= 2;
			}
			return -distance / 2 * (curTime * curTime * curTime * curTime - 2);
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
	useRAF = true
	rAFId = null
	timingFunction = 'flexible-ease-out'
	animationInfo = null

	/**
	 * @param {String|null} timingFunction - Timing function to use for animation.  Must be one of
	 *	`'linear'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`, 'flexible-ease-out', or null. If `null`, defaults to
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

	animate = (curTimeStamp) => {
		const animationInfo = this.animationInfo;
		if (this.useRAF) {
			this.rAFId = rAF(this.animate);
		}
		animationInfo.curTimeStamp = curTimeStamp || Math.ceil(perf.now());
		animationInfo.rAFCBFn(animationInfo.curTimeStamp < animationInfo.endTimeStamp);
	}

	start ({sourceX, sourceY, targetX, targetY, startTimeStamp, silent, ...rest}) {
		const
			curTimeStamp = Math.floor(startTimeStamp),
			startTimeInt = curTimeStamp - 16;

		this.animationInfo = {
			sourceX: Math.floor(sourceX),
			sourceY: Math.floor(sourceY),
			targetX,
			targetY,
			distanceX: Math.floor(targetX - sourceX),
			distanceY: Math.floor(targetY - sourceY),
			startTimeStamp: startTimeInt,
			curTimeStamp: curTimeStamp,
			silent,
			...rest
		};

		// if (!silent) {
			if (this.useRAF) {
				this.stop();
				this.animate(curTimeStamp);
			} else {
				setInterval(this.animate, 16);
				this.animate();
			}
		// }
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

	getAnimationCurrentPos = () => {
		const
			{sourceX, sourceY, distanceX, distanceY, startTimeStamp, curTimeStamp, duration, horizontalScrollability, verticalScrollability} = this.animationInfo,
			curTime = curTimeStamp - startTimeStamp;

		const ret = {
			x: horizontalScrollability ? (sourceX + Math.ceil(timingFunctions[this.timingFunction](distanceX, duration, curTime))) : sourceX,
			y: verticalScrollability ? (sourceY + Math.ceil(timingFunctions[this.timingFunction](distanceY, duration, curTime))) : sourceY
		};

		// console.log('curPos : ' + ret.y);

		return ret;
	}

	getAnimationTargetPos = () => {
		const {targetX: x, targetY: y} = this.animationInfo;
		return {x, y};
	}
}

export default ScrollAnimator;
export {ScrollAnimator};
