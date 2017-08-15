'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {
          correctPath,
          correctUrl,
          StreamsInfo
      } = require('./');

describe('StreamsInfo::_findGCD', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath:  correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('zeros input values', () => {
        const answer = streamsInfo._findGCD(0, 0);

        assert(answer === 0);
    });

    it('ones input values', () => {
        const answer = streamsInfo._findGCD(1, 1);

        assert(answer === 1);
    });

    it('correct positive natural numbers', () => {
        const answer = streamsInfo._findGCD(98, 56);

        assert(answer === 14);
    });

    it('correct positive natural numbers in reverse order', () => {
        const answer = streamsInfo._findGCD(56, 98);

        assert(answer === 14);
    });

});