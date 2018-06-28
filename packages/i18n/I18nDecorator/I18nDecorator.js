/**
 * Adds Internationalization (I18N) support to an application using ilib.
 *
 * @module i18n/I18nDecorator
 * @exports	I18nDecorator
 * @exports	I18nConsumerDecorator
 * @exports I18nContext
 */

import {on, off} from '@enact/core/dispatcher';
import hoc from '@enact/core/hoc';
import PropTypes from 'prop-types';
import React from 'react';

import ilib from '../src/index.js';
import {isRtlLocale, updateLocale} from '../locale';

import getI18nClasses from './getI18nClasses';

const I18nContext = React.createContext(null);

/**
 * A higher-order component that is used to wrap the root element in an app. It provides an `rtl` member on the
 * context of the wrapped component, allowing the children to check the current text directionality as well as
 * an `updateLocale` method that can be used to update the current locale.
 *
 * There are no configurable options on this HOC.
 *
 * @class I18nDecorator
 * @memberof i18n/I18nDecorator
 * @hoc
 * @public
 */
const I18nDecorator = hoc((config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'I18nDecorator'

		static propTypes = /** @lends i18n/I18nDecorator.I18nDecorator.prototype */ {
			/**
			 * Classname for a root app element.
			 *
			 * @type {String}
			 * @public
			 */
			className: PropTypes.string,

			/**
			 * A string with a {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag}.
			 *
			 * The system locale will be used by default.
			 *
			 * @type {String}
			 * @public
			 */
			locale: PropTypes.string
		}

		constructor (props) {
			super(props);
			const ilibLocale = ilib.getLocale();
			const locale = props.locale && props.locale !== ilibLocale ? updateLocale(props.locale) : ilibLocale;

			this.state = {
				locale: locale,
				rtl: isRtlLocale(),
				updateLocale: this.updateLocale
			};
		}
		componentDidMount () {
			if (typeof window === 'object') {
				on('languagechange', this.handleLocaleChange, window);
			}
		}

		componentWillReceiveProps (newProps) {
			if (newProps.locale) {
				this.updateLocale(newProps.locale);
			}
		}

		componentWillUnmount () {
			if (typeof window === 'object') {
				off('languagechange', this.handleLocaleChange, window);
			}
		}

		handleLocaleChange = () => {
			this.updateLocale();
		}

		/**
		 * Updates the locale for the application. If `newLocale` is omitted, the locale will be
		 * reset to the device's default locale.
		 *
		 * @param	{String}	newLocale	Locale identifier string
		 *
		 * @returns	{undefined}
		 * @public
		 */
		updateLocale = (newLocale) => {
			const locale = updateLocale(newLocale);
			this.setState({
				locale,
				rtl: isRtlLocale()
			});
		}

		render () {
			const props = Object.assign({}, this.props);
			let classes = getI18nClasses();
			if (this.props.className) {
				classes = this.props.className + ' ' + classes;
			}

			delete props.locale;

			return (
				<I18nContext.Provider value={this.state}>
					<Wrapped {...props} className={classes} />
				</I18nContext.Provider>
			);
		}
	};
});

const defaultConfig = {
	localeProp: null,
	rtlProp: null,
	updateLocaleProp: null
};

const I18nConsumerDecorator = hoc(defaultConfig, (config, Wrapped) => {
	const {localeProp, rtlProp, updateLocaleProp} = config;

	// eslint-disable-next-line no-shadow
	return function I18nConsumerDecorator (props) {
		return (
			<I18nContext.Consumer>
				{({locale, rtl, updateLocale: update}) => {
					const updated = {...props};
					if (localeProp) {
						updated[localeProp] = locale;
					}

					if (rtlProp) {
						updated[rtlProp] = rtl;
					}

					if (updateLocaleProp) {
						updated[updateLocaleProp] = update;
					}

					return (
						<Wrapped {...updated} />
					);
				}}
			</I18nContext.Consumer>
		);
	};
});

export default I18nDecorator;
export {
	I18nConsumerDecorator,
	I18nContext,
	I18nDecorator
};
