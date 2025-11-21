'use strict';

const incorrectConstructorType = [
    undefined,
    null,
    false,
    1,
    [],
    '1',
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('error')
];


module.exports = {
    incorrectConstructorType,
};
