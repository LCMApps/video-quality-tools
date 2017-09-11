const ExtendableError = require('./ExtendableError');

class AlreadyListeningError extends ExtendableError {}
class AlreadyStoppedListenError extends ExtendableError {}
class FramesMonitorError extends ExtendableError {}
class StreamsInfoError extends ExtendableError {}
class ConfigError extends ExtendableError {}
class ProcessStreamError extends ExtendableError {}
class StopListenError extends ExtendableError {}
class ProcessError extends ExtendableError {}
class InputTypeError extends ExtendableError {}
class InvalidFrameError extends ExtendableError {}
class CannotFindGopPatternError extends ExtendableError {}
class GopPatternUnstableError extends ExtendableError {}
class BadGopDataError extends ExtendableError {}
class ExecutablePathError extends ExtendableError {}

module.exports = {
    AlreadyListeningError,
    AlreadyStoppedListenError,
    ConfigError,
    ProcessStreamError,
    StopListenError,
    FramesMonitorError,
    StreamsInfoError,
    ProcessError,
    InputTypeError,
    InvalidFrameError,
    CannotFindGopPatternError,
    GopPatternUnstableError,
    BadGopDataError,
    ExecutablePathError
};
