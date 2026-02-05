/**
 * Fallback Content Service
 * Generates fallback content when AI is unavailable
 */

const { formatConsultingDate } = require('../utils/helpers');
const { SLIDE_TYPES } = require('../config/constants');

/**
 * Generate fallback content based on slide type
 */
function generateFallbackContent(slideType, context, dataPoints = [], targetAudience = 'C-Suite') {
  const today = formatConsultingDate();
  const contextLower = context?.toLowerCase() || '';
  
  // Extract keywords for smarter titles
  const hasRevenue = contextLower.includes('revenue') || contextLower.includes('growth') || contextLower.includes('million');
  const hasInvestment = contextLower.includes('invest') || contextLower.includes('funding') || contextLower.includes('series');
  const hasProduct = contextLower.includes('product') || contextLower.includes('launch') || contextLower.includes('feature');
  
  // Parse any data points for metrics
  const parsedMetrics = dataPoints?.slice(0, 3).map((dp, i) => {
    const numberMatch = dp?.toString().match(/[\$]?[\d,]+\.?\d*\s*[MBK%]?/i);
    const number = numberMatch ? numberMatch[0] : `${(i + 1) * 25}%`;
    return { 
      label: ['Revenue', 'Growth', 'Margin'][i] || `Metric ${i + 1}`, 
      value: number, 
      change: '+12%', 
      period: 'YoY' 
    };
  }) || [];

  const fallbacks = {
    'Executive Summary': () => ({
      _slideType: slideType,
      title: hasRevenue ? 'Strong Revenue Growth Requires Strategic Action' : 
             hasInvestment ? 'Investment Opportunity Overview' : 
             'Strategic Recommendations for Leadership',
      subtitle: hasRevenue ? 'Capitalizing on market momentum' : 'Based on comprehensive analysis',
      keyPoints: [
        { 
          heading: 'Market Opportunity', 
          text: context?.substring(0, 80) + (context?.length > 80 ? '...' : '') || 
                'Significant growth potential in target segments with favorable market conditions.' 
        },
        { 
          heading: 'Competitive Position', 
          text: 'Strong differentiation enables premium positioning and sustainable advantage.' 
        },
        { 
          heading: 'Strategic Priority', 
          text: 'Focus on core capabilities to capture value and accelerate growth trajectory.' 
        }
      ],
      recommendation: 'Pursue aggressive growth while optimizing operations to maximize value.',
      footer: { source: 'Internal analysis', date: today }
    }),

    'Market Analysis': () => ({
      _slideType: slideType,
      title: hasProduct ? 'Product Market Opportunity' : 'Market Landscape and Growth',
      marketSize: hasRevenue ? '$2.4B (growing 18% annually)' : '$X.XB growing rapidly',
      insights: [
        dataPoints?.[0] || 'Market shows strong growth with expanding opportunities',
        dataPoints?.[1] || 'Competitive landscape consolidating, creating entry opportunities',
        dataPoints?.[2] || 'Customer preferences shifting toward premium integrated solutions'
      ],
      chartData: {
        type: 'bar',
        labels: ['2022', '2023', '2024E', '2025E'],
        values: [25, 35, 48, 65]
      },
      footer: { source: 'Industry reports', date: today }
    }),

    'Financial Model': () => ({
      _slideType: slideType,
      title: hasRevenue ? 'Financial Performance & Trajectory' : 'Financial Summary',
      metrics: parsedMetrics.length > 0 ? parsedMetrics : [
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
      footer: { source: 'Financial data', date: today }
    }),

    'Competitive Analysis': () => ({
      _slideType: slideType,
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
      footer: { source: 'Competitive analysis', date: today }
    }),

    'Growth Strategy': () => ({
      _slideType: slideType,
      title: 'Growth Strategy: Accelerating Market Expansion',
      flywheelTitle: 'Our Growth Flywheel',
      flywheel: [
        { label: 'Attract Users' },
        { label: 'Engage Deeply' },
        { label: 'Monetize Effectively' },
        { label: 'Retain & Expand' }
      ],
      initiatives: [
        { title: 'Expand Product Portfolio', description: 'Launch 3 new product lines targeting adjacent segments' },
        { title: 'Geographic Expansion', description: 'Enter 2 new regional markets with localized offerings' },
        { title: 'Strategic Partnerships', description: 'Form alliances to accelerate distribution and reach' }
      ],
      footer: { source: 'Strategy team', date: today }
    }),

    'Risk Assessment': () => ({
      _slideType: slideType,
      title: 'Risk Assessment & Mitigation Strategy',
      risks: [
        { name: 'Market Saturation', probability: 'Medium', impact: 'High' },
        { name: 'Talent Retention', probability: 'High', impact: 'Medium' },
        { name: 'Regulatory Changes', probability: 'Low', impact: 'High' },
        { name: 'Supply Chain', probability: 'Medium', impact: 'Medium' }
      ],
      mitigations: [
        { risk: 'Market Saturation', level: 'high', action: 'Diversify into adjacent segments' },
        { risk: 'Talent Retention', level: 'medium', action: 'Implement equity incentives' },
        { risk: 'Regulatory Changes', level: 'high', action: 'Maintain compliance team' }
      ],
      footer: { source: 'Risk assessment', date: today }
    })
  };

  const generator = fallbacks[slideType] || fallbacks['Executive Summary'];
  return generator();
}

module.exports = {
  generateFallbackContent
};
