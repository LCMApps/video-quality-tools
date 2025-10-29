'use strict';

const semver = require('semver');
const _ = require('lodash');

const BASIC_LIBS = {
    LIBAVUTIL: 'libavutil',
    LIBAVCODEC: 'libavcodec',
    LIBAVFORMAT: 'libavformat',
    LIBAVDEVICE: 'libavdevice',
    LIBAVFILTER: 'libavfilter',
    LIBSWSCALE: 'libswscale',
    LIBSWRESAMPLE: 'libswresample',
};

class FftoolLibVersions {
    constructor(libVersionsMap) {
        if (!_.isMap(libVersionsMap)) {
            throw new TypeError('libVersionsMap param should be a map.');
        }

        this._libVersionsMap = libVersionsMap;
    }

    static get LIBAVUTIL() {
        return BASIC_LIBS.LIBAVUTIL;
    }

    static get LIBAVCODEC() {
        return BASIC_LIBS.LIBAVCODEC;
    }

    static get LIBAVFORMAT() {
        return BASIC_LIBS.LIBAVFORMAT;
    }

    static get LIBAVDEVICE() {
        return BASIC_LIBS.LIBAVDEVICE;
    }

    static get LIBAVFILTER() {
        return BASIC_LIBS.LIBAVFILTER;
    }

    static get LIBSWSCALE() {
        return BASIC_LIBS.LIBSWSCALE;
    }

    static get LIBSWRESAMPLE() {
        return BASIC_LIBS.LIBSWRESAMPLE;
    }

    getVersion(libName) {
        if (!_.isString(libName) || _.isEmpty(libName)) {
            throw new TypeError('libName must be a non-empty string');
        }

        if (!this._libVersionsMap.has(libName)) {
            return null;
        }

        return this._libVersionsMap.get(libName);
    }

    gt(libName, versionToCompare) {
        return this._compareWithFn(libName, versionToCompare, semver.gt);
    }

    gte(libName, versionToCompare) {
        return this._compareWithFn(libName, versionToCompare, semver.gte);
    }

    lt(libName, versionToCompare) {
        return this._compareWithFn(libName, versionToCompare, semver.lt);
    }

    lte(libName, versionToCompare) {
        return this._compareWithFn(libName, versionToCompare, semver.lte);
    }

    _assertVersion(versionToCompare) {
        if (semver.valid(versionToCompare) === null) {
            throw new TypeError('Not valid version of lib, must be in semver notation');
        }
    }

    _compareWithFn(libName, versionToCompare, compareFn) {
        versionToCompare = this._normalizeVersion(versionToCompare);
        this._assertVersion(versionToCompare);

        const toolsLibVersion = this.getVersion(libName);
        if (toolsLibVersion === null) {
            return null;
        }

        return compareFn(toolsLibVersion, versionToCompare);
    }

    _normalizeVersion(version) {
        const parts = version.split('.');
        while (parts.length < 3) {
            parts.push('0');
        }

        return parts.join('.');
    }
}

module.exports = FftoolLibVersions;
