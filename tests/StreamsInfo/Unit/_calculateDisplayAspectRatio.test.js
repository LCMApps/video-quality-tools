'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {
          correctPath,
          correctUrl,
          StreamsInfo
      } = require('./');

const {StreamsInfoError} = require('../../../Errors/');

describe('StreamsInfo::_calculateDisplayAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath:  correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('calculate display aspect ratio for undefined video width', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio();
        }, StreamsInfoError, `width field has invalid value.`);
    });

    it('calculate display aspect ratio for undefined video height', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio(10);
        }, StreamsInfoError, `height field has invalid value.`);
    });

    it('calculate display aspect ratio invalid video width', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio(0, 5);
        }, StreamsInfoError, `width field has invalid value.`);
    });

    it('calculate display aspect ratio for invalid video height', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio(5, 0);
        }, StreamsInfoError, `height field has invalid value.`);
    });

    it('calculate display aspect ratio for decimal width', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio(1.1, 5);
        }, StreamsInfoError, `width field has invalid value.`);
    });

    it('calculate display aspect ratio for decimal height', () => {
        assert.throws(() => {
            streamsInfo._calculateDisplayAspectRatio(5, 5.5);
        }, StreamsInfoError, `height field has invalid value.`);
    });

    it('calculate display aspect ratio for correct input', () => {
        const res = streamsInfo._calculateDisplayAspectRatio(10, 5);

        assert.equal(res, '2:1');
    });

});