/**
 * AI Advanced Routes
 * Routes for advanced AI features
 */

const express = require('express');
const router = express.Router();
const {
  suggestTemplates,
  generateDeck,
  recommendVisualizations,
  rewriteContent,
  createStoryFlow,
  generateSpeakerNotes,
  generateSpeakerNotesForDeck,
  anticipateQuestions,
  translateContent,
  translateDeck,
  listFeatures
} = require('../controllers/ai-advanced-controller');

// Feature listing
router.get('/api/ai/advanced/features', listFeatures);

// Template suggestions
router.post('/api/ai/suggest-templates', suggestTemplates);

// Document to deck generation
router.post('/api/ai/generate-deck', generateDeck);

// Visualization recommendations
router.post('/api/ai/recommend-visualizations', recommendVisualizations);

// Content rewriting
router.post('/api/ai/rewrite', rewriteContent);

// Story flow generation
router.post('/api/ai/story-flow', createStoryFlow);

// Speaker notes generation
router.post('/api/ai/speaker-notes', generateSpeakerNotes);
router.post('/api/ai/speaker-notes/deck', generateSpeakerNotesForDeck);

// Q&A anticipation
router.post('/api/ai/anticipate-questions', anticipateQuestions);

// Translation
router.post('/api/ai/translate', translateContent);
router.post('/api/ai/translate/deck', translateDeck);

module.exports = router;
