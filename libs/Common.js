

globalThis.assert = (()=> {
    class AssertionError extends Error {
      constructor(message) {
        super(message);
        this.name = 'AssertionError';
      }
    }
    let config = {
      async: true,
      silent: false
    };
    function assert(condition, message = undefined) {
      if (!condition) {
        if (config.silent) {
          //NOOP
        } else if (config.async) {
          console.assert(condition, message || 'assert');
        } else {
          throw new AssertionError(message || 'assertion failed');
        }
      }
    }
    assert.config = config;
    return assert;
  })();
  
  
  
  Object.assign(assert.config, {
    // silent: true, // to disable assertion validation
    async: false, // to validate assertion synchronously (will interrupt if assertion failed, like Java's)
  });
  






  function assert(a,b=undefined) {

  }