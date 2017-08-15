'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {
          correctPath,
          correctUrl,
          StreamsInfo
      } = require('./');

describe('StreamsInfo::_adjustAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath:  correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('invalid width', () => {
        assert.throws(() => {
            streamsInfo._adjustAspectRatio([
                {sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 'N/A', height: 10}
            ])
        });
    });

    it('invalid height', () => {
        assert.throws(() => {
            streamsInfo._adjustAspectRatio([
                {sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 10, height: 'N/A'}
            ])
        });
    });

    it('invalid sample_aspect_ratio field', () => {
        const frames = streamsInfo._adjustAspectRatio([
            {sample_aspect_ratio: '0:1', display_aspect_ratio: '200:100', width: 10, height: 4}
        ]);

        assert(frames[0].sample_aspect_ratio === '1:1');
        assert(frames[0].display_aspect_ratio === '5:2');
    });

    it('invalid display_aspect_ratio field', () => {
        const frames = streamsInfo._adjustAspectRatio([
            {sample_aspect_ratio: '200:100', display_aspect_ratio: '0:1', width: 20, height: 10}
        ]);

        assert(frames[0].sample_aspect_ratio === '1:1');
        assert(frames[0].display_aspect_ratio === '2:1');
    });

    it('valid case', () => {
        const frames = streamsInfo._adjustAspectRatio([
            {sample_aspect_ratio: '10:1', display_aspect_ratio: '10:1', width: 30, height: 10}
        ]);

        assert(frames[0].sample_aspect_ratio === '10:1');
        assert(frames[0].display_aspect_ratio === '10:1');
    });

    it('valid case', () => {
        const frames = streamsInfo._adjustAspectRatio([
            {sample_aspect_ratio: '10:1', display_aspect_ratio: '10:1', width: 30, height: 10}
        ]);

        assert(frames[0].sample_aspect_ratio === '10:1');
        assert(frames[0].display_aspect_ratio === '10:1');
    });

});