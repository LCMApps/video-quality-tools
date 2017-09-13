'use strict';

const {assert} = require('chai');

const {FramesMonitor} = require('./Helpers');

describe('FramesMonitor::frameToJson', () => {

    it('must return empty object for empty string input', () => {
        const expectedResult = {};

        const result = FramesMonitor.frameToJson('');

        assert.deepEqual(result, expectedResult);
    });

    it('must return empty object for arbitrary string, with no key value pairs', () => {
        const expectedResult = {};

        const result = FramesMonitor.frameToJson('lorem lorem lorem lorem !!!');

        assert.deepEqual(result, expectedResult);
    });

    it('must return empty object for arbitrary string, with one key value pair', () => {
        const expectedResult = {'lorem key': 'value lorem !!!'};

        const result = FramesMonitor.frameToJson('lorem key=value lorem !!!');

        assert.deepEqual(result, expectedResult);
    });

    it('must return correct object for real input data, with several key value pairs', () => {
        const expectedResult = {
            media_type       : 'video',
            pkt_pts_time     : 9.967900,
            pkt_duration_time: 0.03300,
            pkt_size         : 4253,
            pict_type        : 'P',
            key_frame        : 0
        };

        const result = FramesMonitor.frameToJson(
            '[FRAME]\nmedia_type=video\npkt_pts_time=9.9679000\n' +
            'pkt_duration_time=0.033000\npkt_size=4253\npict_type=P\nkey_frame=0'
        );

        assert.deepEqual(result, expectedResult);
    });

});
