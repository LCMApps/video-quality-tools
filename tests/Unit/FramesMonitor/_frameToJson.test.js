'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {correctPath, correctUrl, FramesMonitor} = require('./Helpers/');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

const incorrectData = [
    undefined,
    null,
    true,
    1,
    [],
    {},
    () => {},
    Symbol()
];

describe('FramesMonitor::_frameToJson', () => {

    const framesMonitor = new FramesMonitor({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    dataDriven(
        incorrectData.map(item => ({type: typeOf(item), data: item})),
        () => {
            it('must return null for invalid type {type}', ctx => {
                const expectedResult = null;

                const result = framesMonitor._frameToJson(ctx.data);

                assert.equal(result, expectedResult);
            });
        }
    );

    it('must return empty object for empty string input', () => {
        const expectedResult = {};

        const result = framesMonitor._frameToJson('');

        assert.deepEqual(result, expectedResult);
    });

    it('must return empty object for arbitrary string, with no key value pairs', () => {
        const expectedResult = {};

        const result = framesMonitor._frameToJson('lorem lorem lorem lorem !!!');

        assert.deepEqual(result, expectedResult);
    });

    it('must return empty object for arbitrary string, with one key value pair', () => {
        const expectedResult = {'lorem key': 'value lorem !!!'};

        const result = framesMonitor._frameToJson('lorem key=value lorem !!!');

        assert.deepEqual(result, expectedResult);
    });

    it('must return correct object for real input data, with several key value pairs', () => {
        const expectedResult = {
            media_type       : 'video',
            pkt_pts_time     : 9.967900,
            pkt_duration_time: 0.03300,
            pkt_size         : 4253,
            pict_type        : 'P'
        };

        const result = framesMonitor._frameToJson(
            '[FRAME]\nmedia_type=video\npkt_pts_time=9.9679000\n' +
            'pkt_duration_time=0.033000\npkt_size=4253\npict_type=P\n'
        );

        assert.deepEqual(result, expectedResult);
    });

});
