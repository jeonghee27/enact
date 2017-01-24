import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import A11yDecorator from '../A11yDecorator';

describe('A11yDecorator', () => {

	const Component = A11yDecorator('div');

	it('should use the aria-label when set', function () {
		const subject = shallow(
			<Component aria-label="LABEL">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityPreHint when set', function () {
		const subject = shallow(
			<Component accessibilityPreHint="PREHINT">
				CONTENT
			</Component>
		);

		const expected = 'PREHINT CONTENT';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityHint when set', function () {
		const subject = shallow(
			<Component accessibilityHint="HINT">
				CONTENT
			</Component>
		);

		const expected = 'CONTENT HINT';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the aria-label, accessibilityHint when set', function () {
		const subject = shallow(
			<Component aria-label="LABEL" accessibilityHint="HINT">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityHint, aria-label when set', function () {
		const subject = shallow(
			<Component accessibilityHint="HINT" aria-label="LABEL">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the aria-label, accessibilityPreHint when set', function () {
		const subject = shallow(
			<Component aria-label="LABEL" accessibilityPreHint="PREHINT">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityPreHint, aria-label when set', function () {
		const subject = shallow(
			<Component accessibilityPreHint="PREHINT" aria-label="LABEL">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityPreHint, accessibilityHint when set', function () {
		const subject = shallow(
			<Component accessibilityPreHint="PREHINT" accessibilityHint="HINT">
				CONTENT
			</Component>
		);

		const expected = 'PREHINT CONTENT HINT';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

	it('should use the accessibilityPreHint, accessibilityHint, aria-label when set', function () {
		const subject = shallow(
			<Component accessibilityPreHint="PREHINT" accessibilityHint="HINT" aria-label="LABEL">
				CONTENT
			</Component>
		);

		const expected = 'LABEL';
		const actual = subject.prop('aria-label');

		expect(actual).to.equal(expected);
	});

});
