'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const proxyquire = require('proxyquire');

const {
          correctPath,
          correctUrl,
          StreamsInfo
      } = require('./');

const {
          ConfigError,
          ExecutablePathError
      } = require('../../../Errors');

describe('StreamsInfo::constructor', () => {

    it('do not pass config object', () => {
        assert.throws(() => {
            new StreamsInfo();
        }, TypeError);
    });

    it('config param has invalid type', () => {
        assert.throws(() => {
            new StreamsInfo(111);
        }, TypeError);
    });

    it('do not pass url param', () => {
        assert.throws(() => {
            new StreamsInfo({});
        }, TypeError);
    });

    it('do not pass valid url param', () => {
        assert.throws(() => {
            new StreamsInfo({}, 111);
        }, TypeError);
    });

    it('pass empty config object', () => {
        assert.throws(() => {
            new StreamsInfo({}, correctUrl);
        }, ConfigError);
    });

    it('do not pass config.timeout param', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath: correctPath,
            }, correctUrl);
        }, ConfigError);
    });

    it('pass decimal config.timeout param', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath:  correctPath,
                timeoutInSec: 1.1
            }, correctUrl);
        }, ConfigError);
    });

    it('pass negative config.timeout param', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath:  correctPath,
                timeoutInSec: -1
            }, correctUrl);
        }, ConfigError);
    });

    it('pass incorrect ffprobePath', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath:  '/bad/ffprobe/path',
                timeoutInSec: 1
            }, correctUrl);
        }, ExecutablePathError);
    });

    it('pass everything correct', () => {
        assert.doesNotThrow(() => {
            new StreamsInfo({
                ffprobePath:  correctPath,
                timeoutInSec: 1
            }, correctUrl);
        });
    });

});