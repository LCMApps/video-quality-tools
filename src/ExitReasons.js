'use strict';

class Reason {
    constructor(payload) {
        this.payload = payload;
    }
}

class StartError extends Reason {}
class ExternalSignal extends Reason {}
class NormalExit extends Reason {}
class AbnormalExit extends Reason {}
class ProcessingError extends Reason {}

module.exports = {
    StartError,
    ExternalSignal,
    NormalExit,
    AbnormalExit,
    ProcessingError
};
