/**
 * Mock Data - Test fixtures and mock responses
 */

// Valid slide types from the application
const VALID_SLIDE_TYPES = [
  'Executive Summary',
  'Market Analysis', 
  'Financial Model',
  'Competitive Analysis',
  'Growth Strategy',
  'Risk Assessment'
];

// Valid audiences
const VALID_AUDIENCES = [
  'C-Suite',
  'Board of Directors',
  'Investors',
  'Management Team',
  'Operations Team',
  'External Partners'
];

// Valid frameworks
const VALID_FRAMEWORKS = [
  'MECE',
  'Porter\'s Five Forces',
  'BCG Matrix',
  'SWOT',
  'Pirate Metrics (AARRR)',
  'McKinsey 7S'
];

// Sample valid request payloads
const mockValidRequests = {
  executiveSummary: {
    slideType: 'Executive Summary',
    context: 'We are a SaaS company experiencing rapid growth and need to present our Q3 results to the board. Our revenue grew 45% YoY and we achieved profitability for the first time.',
    dataPoints: [
      'Revenue: $12.4M (+45% YoY)',
      'Net Income: $1.2M (first profitable quarter)',
      'Customer Acquisition Cost reduced by 30%'
    ],
    targetAudience: 'Board of Directors',
    framework: 'MECE'
  },
  
  marketAnalysis: {
    slideType: 'Market Analysis',
    context: 'The enterprise collaboration software market is growing rapidly. We need to present our market position and opportunities.',
    dataPoints: [
      'TAM: $45B growing at 12% CAGR',
      'Our market share: 3.2%',
      'Top 3 competitors control 60% of market'
    ],
    targetAudience: 'Investors',
    framework: 'Porter\'s Five Forces'
  },
  
  financialModel: {
    slideType: 'Financial Model',
    context: 'Series B fundraising financial projections and historical performance.',
    dataPoints: [
      'ARR: $15M',
      'Gross Margin: 78%',
      'Burn rate: $800K/month'
    ],
    targetAudience: 'Investors',
    framework: null
  },

  minimalValid: {
    slideType: 'Executive Summary',
    context: 'This is a valid context with at least ten characters.',
    targetAudience: 'C-Suite'
  }
};

// Invalid request payloads for validation testing
const mockInvalidRequests = {
  missingSlideType: {
    context: 'Valid context here with enough characters.',
    targetAudience: 'C-Suite'
  },
  
  invalidSlideType: {
    slideType: 'Invalid Type',
    context: 'Valid context here with enough characters.',
    targetAudience: 'C-Suite'
  },
  
  missingContext: {
    slideType: 'Executive Summary',
    targetAudience: 'C-Suite'
  },
  
  contextTooShort: {
    slideType: 'Executive Summary',
    context: 'Too short',
    targetAudience: 'C-Suite'
  },
  
  contextTooLong: {
    slideType: 'Executive Summary',
    context: 'A'.repeat(2001),
    targetAudience: 'C-Suite'
  },
  
  missingAudience: {
    slideType: 'Executive Summary',
    context: 'Valid context here with enough characters.'
  },
  
  nonStringContext: {
    slideType: 'Executive Summary',
    context: { invalid: 'type' },
    targetAudience: 'C-Suite'
  },
  
  nonStringAudience: {
    slideType: 'Executive Summary',
    context: 'Valid context here with enough characters.',
    targetAudience: 12345
  }
};

// Mock slide content responses
const mockSlideContent = {
  executiveSummary: {
    _slideType: 'Executive Summary',
    title: 'Strong Revenue Growth Requires Strategic Action',
    subtitle: 'Capitalizing on market momentum',
    keyPoints: [
      { heading: 'Market Opportunity', text: 'Significant growth potential in target segments.' },
      { heading: 'Competitive Position', text: 'Strong differentiation enables premium positioning.' },
      { heading: 'Strategic Priority', text: 'Focus on core capabilities to maximize value.' }
    ],
    recommendation: 'Pursue aggressive growth while optimizing operations.',
    footer: { source: 'Internal analysis', date: 'Feb 2025' }
  },

  marketAnalysis: {
    _slideType: 'Market Analysis',
    title: 'Market Landscape and Growth',
    marketSize: '$2.4B (growing 18% annually)',
    insights: [
      'Market shows strong growth with expanding opportunities',
      'Competitive landscape consolidating',
      'Customer preferences shifting toward premium solutions'
    ],
    chartData: {
      type: 'bar',
      labels: ['2022', '2023', '2024E', '2025E'],
      values: [25, 35, 48, 65]
    },
    footer: { source: 'Industry reports', date: 'Feb 2025' }
  },

  financialModel: {
    _slideType: 'Financial Model',
    title: 'Financial Performance & Trajectory',
    metrics: [
      { label: 'Revenue', value: '$5.2M', change: '+23%', period: 'YoY' },
      { label: 'Gross Margin', value: '68%', change: '+4pp', period: 'YoY' },
      { label: 'EBITDA', value: '$1.2M', change: '+31%', period: 'YoY' }
    ],
    tableData: {
      headers: ['Metric', '2023', '2024', '2025E'],
      rows: [
        ['Revenue ($M)', '4.2', '5.2', '6.8'],
        ['Growth %', '15%', '23%', '31%'],
        ['Gross Margin %', '64%', '68%', '71%']
      ]
    },
    footer: { source: 'Financial data', date: 'Feb 2025' }
  },

  competitiveAnalysis: {
    _slideType: 'Competitive Analysis',
    title: 'Competitive Positioning Analysis',
    matrixTitle: 'Competitive Matrix: Innovation vs Scale',
    xAxis: { low: 'Low Innovation', high: 'High Innovation' },
    yAxis: { low: 'Small Scale', high: 'Large Scale' },
    competitors: [
      { name: 'Competitor A', xPosition: 30, yPosition: 70, features: [true, true, false] },
      { name: 'Competitor B', xPosition: 70, yPosition: 60, features: [true, false, true] },
      { name: 'Our Solution', xPosition: 80, yPosition: 25, features: [true, true, true] }
    ],
    features: ['Core Features', 'Premium Service', 'Integration'],
    footer: { source: 'Competitive analysis', date: 'Feb 2025' }
  },

  growthStrategy: {
    _slideType: 'Growth Strategy',
    title: 'Growth Strategy: Accelerating Market Expansion',
    flywheelTitle: 'Our Growth Flywheel',
    flywheel: [
      { label: 'Attract Users' },
      { label: 'Engage Deeply' },
      { label: 'Monetize Effectively' },
      { label: 'Retain & Expand' }
    ],
    initiatives: [
      { title: 'Expand Product Portfolio', description: 'Launch 3 new product lines' },
      { title: 'Geographic Expansion', description: 'Enter 2 new regional markets' },
      { title: 'Strategic Partnerships', description: 'Form alliances to accelerate' }
    ],
    footer: { source: 'Strategy team', date: 'Feb 2025' }
  },

  riskAssessment: {
    _slideType: 'Risk Assessment',
    title: 'Risk Assessment & Mitigation Strategy',
    risks: [
      { name: 'Market Saturation', probability: 'Medium', impact: 'High' },
      { name: 'Talent Retention', probability: 'High', impact: 'Medium' },
      { name: 'Regulatory Changes', probability: 'Low', impact: 'High' }
    ],
    mitigations: [
      { risk: 'Market Saturation', level: 'high', action: 'Diversify into adjacent segments' },
      { risk: 'Talent Retention', level: 'medium', action: 'Implement equity incentives' }
    ],
    footer: { source: 'Risk assessment', date: 'Feb 2025' }
  }
};

// Mock templates
const mockTemplates = [
  {
    id: 'tech-startup-series-b',
    name: 'Tech Startup Series B',
    category: 'Pitch Deck',
    slideType: 'Executive Summary',
    context: 'AI SaaS platform fundraising for Series B round',
    dataPoints: ['$10M ARR', '120% NRR', 'Series B: $50M target'],
    targetAudience: 'Investors',
    framework: 'MECE'
  },
  {
    id: 'market-entry-europe',
    name: 'European Market Entry',
    category: 'Strategy',
    slideType: 'Market Analysis',
    context: 'Expansion strategy for entering European markets',
    dataPoints: ['EU market size: €5B', 'Regulatory complexity: High'],
    targetAudience: 'Board of Directors',
    framework: 'Porter\'s Five Forces'
  }
];

// Mock Kimi API responses
const mockKimiResponses = {
  validJSON: JSON.stringify({
    title: 'Generated Slide Title',
    keyPoints: [
      { heading: 'Point 1', text: 'Description 1' },
      { heading: 'Point 2', text: 'Description 2' }
    ],
    recommendation: 'Action item here'
  }),

  jsonInMarkdown: '```json\n{"title": "Test Title", "keyPoints": []}\n```',

  invalidJSON: 'This is not valid JSON',

  rateLimitError: {
    error: { message: 'Rate limit exceeded' }
  },

  timeoutError: new Error('Request timeout')
};

// Mock analytics data
const mockAnalytics = {
  totalSlides: 42,
  byType: {
    'Executive Summary': 12,
    'Market Analysis': 8,
    'Financial Model': 10,
    'Competitive Analysis': 5,
    'Growth Strategy': 4,
    'Risk Assessment': 3
  },
  byDay: {
    '2025-02-01': { total: 5, byType: { 'Executive Summary': 2, 'Financial Model': 3 } },
    '2025-02-02': { total: 3, byType: { 'Market Analysis': 3 } }
  },
  lastGenerated: '2025-02-05T10:00:00Z',
  createdAt: '2025-01-01T00:00:00Z'
};

module.exports = {
  VALID_SLIDE_TYPES,
  VALID_AUDIENCES,
  VALID_FRAMEWORKS,
  mockValidRequests,
  mockInvalidRequests,
  mockSlideContent,
  mockTemplates,
  mockKimiResponses,
  mockAnalytics
};
