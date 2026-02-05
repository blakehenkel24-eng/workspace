/**
 * Circuit Breaker Service
 * Prevents cascade failures by temporarily disabling failing services
 */

const EventEmitter = require('events');

// Circuit states
const CIRCUIT_STATES = {
  CLOSED: 'closed',      // Normal operation
  OPEN: 'open',          // Failing, rejecting requests
  HALF_OPEN: 'half_open' // Testing if service recovered
};

/**
 * Circuit Breaker
 * Implements the circuit breaker pattern for service resilience
 */
class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    this.successThreshold = options.successThreshold || 2;
    
    this.state = CIRCUIT_STATES.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
    
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      stateChanges: []
    };
  }
  
  /**
   * Check if the circuit allows requests
   */
  canExecute() {
    if (this.state === CIRCUIT_STATES.CLOSED) {
      return true;
    }
    
    if (this.state === CIRCUIT_STATES.OPEN) {
      // Check if reset timeout has elapsed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.transitionTo(CIRCUIT_STATES.HALF_OPEN);
        return true;
      }
      return false;
    }
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      // Limit concurrent calls in half-open state
      if (this.halfOpenCalls < this.halfOpenMaxCalls) {
        return true;
      }
      return false;
    }
    
    return false;
  }
  
  /**
   * Record a successful call
   */
  recordSuccess() {
    this.stats.successfulCalls++;
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.successes++;
      this.halfOpenCalls--;
      
      if (this.successes >= this.successThreshold) {
        this.transitionTo(CIRCUIT_STATES.CLOSED);
        this.failures = 0;
        this.successes = 0;
      }
    } else if (this.state === CIRCUIT_STATES.CLOSED) {
      // Reset failures on success in closed state
      if (this.failures > 0) {
        this.failures = 0;
      }
    }
  }
  
  /**
   * Record a failed call
   */
  recordFailure() {
    this.stats.failedCalls++;
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.halfOpenCalls--;
      this.transitionTo(CIRCUIT_STATES.OPEN);
      this.successes = 0;
    } else if (this.state === CIRCUIT_STATES.CLOSED && this.failures >= this.failureThreshold) {
      this.transitionTo(CIRCUIT_STATES.OPEN);
    }
  }
  
  /**
   * Transition to a new state
   */
  transitionTo(newState) {
    const oldState = this.state;
    if (oldState === newState) return;
    
    this.state = newState;
    
    this.stats.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: new Date().toISOString()
    });
    
    this.emit('stateChange', { from: oldState, to: newState });
    
    if (newState === CIRCUIT_STATES.HALF_OPEN) {
      this.halfOpenCalls = 0;
      this.successes = 0;
    }
  }
  
  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn, ...args) {
    this.stats.totalCalls++;
    
    if (!this.canExecute()) {
      this.stats.rejectedCalls++;
      const error = new Error('Circuit breaker is OPEN - service temporarily unavailable');
      error.code = 'CIRCUIT_OPEN';
      error.circuitState = this.state;
      throw error;
    }
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.halfOpenCalls++;
    }
    
    try {
      const result = await fn(...args);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  /**
   * Get current state info
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      halfOpenCalls: this.halfOpenCalls,
      stats: this.stats
    };
  }
  
  /**
   * Force circuit to specific state (for testing/recovery)
   */
  forceState(state) {
    if (CIRCUIT_STATES[state.toUpperCase()]) {
      this.transitionTo(CIRCUIT_STATES[state.toUpperCase()]);
      if (state === CIRCUIT_STATES.CLOSED) {
        this.failures = 0;
        this.successes = 0;
      }
    }
  }
  
  /**
   * Reset the circuit breaker
   */
  reset() {
    this.state = CIRCUIT_STATES.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }
}

// Circuit breakers registry
const circuitBreakers = new Map();

/**
 * Get or create a circuit breaker
 */
function getCircuitBreaker(name, options = {}) {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(options));
  }
  return circuitBreakers.get(name);
}

/**
 * Get all circuit breaker states
 */
function getAllCircuitStates() {
  const states = {};
  for (const [name, breaker] of circuitBreakers) {
    states[name] = breaker.getState();
  }
  return states;
}

/**
 * Wrap an async function with circuit breaker
 */
function withCircuitBreaker(fn, breakerName, options = {}) {
  const breaker = getCircuitBreaker(breakerName, options);
  return (...args) => breaker.execute(() => fn(...args), ...args);
}

module.exports = {
  CircuitBreaker,
  CIRCUIT_STATES,
  getCircuitBreaker,
  getAllCircuitStates,
  withCircuitBreaker
};
