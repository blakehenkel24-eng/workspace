/**
 * Slide Model
 * Data structures and validation for slides
 */

const { SLIDE_TYPES, LIMITS } = require('../config/constants');

/**
 * Slide generation request schema
 */
class SlideGenerationRequest {
  constructor(data = {}) {
    this.slideType = data.slideType;
    this.context = data.context;
    // Support both V1 (targetAudience) and V2 (audience) field names
    this.targetAudience = data.targetAudience || data.audience;
    this.dataPoints = data.dataPoints || data.dataInput || [];
    this.framework = data.framework;
    this.keyTakeaway = data.keyTakeaway;
    this.presentationMode = data.presentationMode;
  }
  
  /**
   * Validate the request
   * @returns {Object} Validation result { isValid: boolean, errors: [] }
   */
  validate() {
    const errors = [];
    
    // Slide type validation
    if (!this.slideType) {
      errors.push({ field: 'slideType', message: 'Slide type is required' });
    } else if (!SLIDE_TYPES.includes(this.slideType)) {
      errors.push({ 
        field: 'slideType', 
        message: `Invalid slide type. Must be one of: ${SLIDE_TYPES.join(', ')}`
      });
    }
    
    // Context validation
    if (!this.context) {
      errors.push({ field: 'context', message: 'Context is required' });
    } else if (typeof this.context !== 'string') {
      errors.push({ field: 'context', message: 'Context must be a string' });
    } else if (this.context.length < LIMITS.MIN_CONTEXT_LENGTH) {
      errors.push({ 
        field: 'context', 
        message: `Context must be at least ${LIMITS.MIN_CONTEXT_LENGTH} characters` 
      });
    } else if (this.context.length > LIMITS.MAX_CONTEXT_LENGTH) {
      errors.push({ 
        field: 'context', 
        message: `Context must be at most ${LIMITS.MAX_CONTEXT_LENGTH} characters` 
      });
    }
    
    // Target audience validation
    if (!this.targetAudience) {
      errors.push({ field: 'targetAudience', message: 'Target audience is required' });
    } else if (typeof this.targetAudience !== 'string') {
      errors.push({ field: 'targetAudience', message: 'Target audience must be a string' });
    }
    
    // Data points validation
    if (this.dataPoints) {
      if (!Array.isArray(this.dataPoints)) {
        errors.push({ field: 'dataPoints', message: 'Data points must be an array' });
      } else if (this.dataPoints.length > LIMITS.MAX_DATA_POINTS) {
        errors.push({ 
          field: 'dataPoints', 
          message: `Maximum ${LIMITS.MAX_DATA_POINTS} data points allowed` 
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      slideType: this.slideType,
      context: this.context,
      targetAudience: this.targetAudience,
      dataPoints: this.dataPoints,
      framework: this.framework,
      keyTakeaway: this.keyTakeaway,
      presentationMode: this.presentationMode
    };
  }
}

/**
 * Slide content model
 */
class SlideContent {
  constructor(data = {}) {
    this._slideType = data._slideType;
    this.title = data.title || 'Untitled Slide';
    this.subtitle = data.subtitle;
    this.footer = data.footer || { source: 'SlideTheory', date: new Date().toLocaleDateString() };
    
    // Type-specific content
    this.keyPoints = data.keyPoints;
    this.recommendation = data.recommendation;
    this.marketSize = data.marketSize;
    this.insights = data.insights;
    this.chartData = data.chartData;
    this.metrics = data.metrics;
    this.tableData = data.tableData;
    this.competitors = data.competitors;
    this.features = data.features;
    this.flywheel = data.flywheel;
    this.initiatives = data.initiatives;
    this.risks = data.risks;
    this.mitigations = data.mitigations;
    
    // Matrix configuration
    this.matrixTitle = data.matrixTitle;
    this.xAxis = data.xAxis;
    this.yAxis = data.yAxis;
    this.flywheelTitle = data.flywheelTitle;
  }
  
  /**
   * Get content appropriate for the slide type
   */
  getForType(slideType) {
    const base = {
      _slideType: slideType,
      title: this.title,
      subtitle: this.subtitle,
      footer: this.footer
    };
    
    switch (slideType) {
      case 'Executive Summary':
        return { ...base, keyPoints: this.keyPoints, recommendation: this.recommendation };
      case 'Market Analysis':
        return { ...base, marketSize: this.marketSize, insights: this.insights, chartData: this.chartData };
      case 'Financial Model':
        return { ...base, metrics: this.metrics, tableData: this.tableData };
      case 'Competitive Analysis':
        return { 
          ...base, 
          matrixTitle: this.matrixTitle,
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          competitors: this.competitors,
          features: this.features
        };
      case 'Growth Strategy':
        return { 
          ...base, 
          flywheelTitle: this.flywheelTitle,
          flywheel: this.flywheel,
          initiatives: this.initiatives
        };
      case 'Risk Assessment':
        return { ...base, risks: this.risks, mitigations: this.mitigations };
      default:
        return base;
    }
  }
}

/**
 * Slide generation response model
 */
class SlideGenerationResponse {
  constructor(data = {}) {
    this.success = true;
    this.slideId = data.slideId;
    this.imageUrl = data.imageUrl;
    this.title = data.title;
    this.content = data.content;
    this.expiresAt = data.expiresAt;
    this.durationMs = data.durationMs;
    this.format = data.format;
  }
  
  toJSON() {
    return {
      success: this.success,
      slideId: this.slideId,
      imageUrl: this.imageUrl,
      title: this.title,
      content: this.content,
      expiresAt: this.expiresAt,
      ...(this.durationMs && { durationMs: this.durationMs }),
      ...(this.format && { format: this.format })
    };
  }
}

/**
 * Export request model
 */
class ExportRequest {
  constructor(data = {}) {
    this.slideType = data.slideType;
    this.content = data.content;
    this.format = data.format || 'pptx';
    this.options = data.options || {};
  }
  
  validate() {
    const errors = [];
    const { EXPORT_FORMATS, ASPECT_RATIOS, QUALITY_LEVELS } = require('../config/constants');
    
    if (!this.slideType) {
      errors.push({ field: 'slideType', message: 'Slide type is required' });
    }
    
    if (!this.content || typeof this.content !== 'object') {
      errors.push({ field: 'content', message: 'Content object is required' });
    }
    
    // Validate format
    if (this.format && !EXPORT_FORMATS.includes(this.format.toLowerCase())) {
      errors.push({ 
        field: 'format', 
        message: `Format must be one of: ${EXPORT_FORMATS.join(', ')}` 
      });
    }
    
    // Validate options
    if (this.options) {
      if (this.options.aspectRatio && !ASPECT_RATIOS.includes(this.options.aspectRatio)) {
        errors.push({ 
          field: 'options.aspectRatio', 
          message: `Aspect ratio must be one of: ${ASPECT_RATIOS.join(', ')}` 
        });
      }
      
      if (this.options.quality && !QUALITY_LEVELS.includes(this.options.quality)) {
        errors.push({ 
          field: 'options.quality', 
          message: `Quality must be one of: ${QUALITY_LEVELS.join(', ')}` 
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  SlideGenerationRequest,
  SlideContent,
  SlideGenerationResponse,
  ExportRequest
};
