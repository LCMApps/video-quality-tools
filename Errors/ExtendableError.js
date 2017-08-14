'use strict';

class ExtendableError extends Error {
    /**
     * @param {string} message
     * @param {*} extra
     */
    constructor(message = '', extra) {
        super(message);

        this.message = message;
        this.extra   = extra;
        this.name    = this.constructor.name;

        // noinspection JSUnresolvedFunction
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * @return {string}
     */
    toString() {
        return this.extra ? super.toString() + ' Extra: ' + JSON.stringify(this.extra) : super.toString();
    }
}

module.exports = ExtendableError;
