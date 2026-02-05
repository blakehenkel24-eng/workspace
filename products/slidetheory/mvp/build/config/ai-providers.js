/**
 * AI Provider Configuration
 * Manages AI service settings and providers
 */

const config = require('./index');

/**
 * Supported AI providers
 */
const PROVIDERS = {
  KIMI: 'kimi',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  FALLBACK: 'fallback'
};

/**
 * Get active AI provider configuration
 */
function getAIConfig() {
  const provider = config.ai.provider;
  
  switch (provider) {
    case PROVIDERS.KIMI:
      return {
        provider: PROVIDERS.KIMI,
        enabled: !!config.ai.kimi.apiKey,
        config: config.ai.kimi
      };
      
    case PROVIDERS.OPENAI:
      return {
        provider: PROVIDERS.OPENAI,
        enabled: !!process.env.OPENAI_API_KEY,
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          baseUrl: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
          model: process.env.OPENAI_MODEL || 'gpt-4',
          timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
          maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2'),
          temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
        }
      };
      
    case PROVIDERS.ANTHROPIC:
      return {
        provider: PROVIDERS.ANTHROPIC,
        enabled: !!process.env.ANTHROPIC_API_KEY,
        config: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          baseUrl: process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com',
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet',
          timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
          maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2'),
          temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
        }
      };
      
    default:
      return {
        provider: PROVIDERS.FALLBACK,
        enabled: true,
        config: null
      };
  }
}

/**
 * Check if AI generation is available
 */
function isAIAvailable() {
  const aiConfig = getAIConfig();
  return aiConfig.enabled;
}

/**
 * Get provider name for display
 */
function getProviderDisplayName() {
  const aiConfig = getAIConfig();
  if (!aiConfig.enabled) return 'Fallback Mode';
  return aiConfig.provider.charAt(0).toUpperCase() + aiConfig.provider.slice(1);
}

module.exports = {
  PROVIDERS,
  getAIConfig,
  isAIAvailable,
  getProviderDisplayName
};
