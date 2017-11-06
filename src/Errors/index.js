const ExtendableError = require('./ExtendableError');

class AlreadyListeningError extends ExtendableError {}
class FramesMonitorError extends ExtendableError {}
class StreamsInfoError extends ExtendableError {}
class ConfigError extends ExtendableError {}
class ProcessStreamError extends ExtendableError {}
class InvalidFrameError extends ExtendableError {}
class ExecutablePathError extends ExtendableError {}
class FrameInvalidData extends ExtendableError {}
class GopInvalidData extends ExtendableError {}
class GopNotFoundError extends ExtendableError {}
class ProcessStartError extends ExtendableError {}
class ProcessExitError extends ExtendableError {}

module.exports = {
    AlreadyListeningError,
    ConfigError,
    ProcessStreamError,
    FramesMonitorError,
    StreamsInfoError,
    InvalidFrameError,
    ExecutablePathError,
    FrameInvalidData,
    GopInvalidData,
    GopNotFoundError,
    ProcessStartError,
    ProcessExitError
};
