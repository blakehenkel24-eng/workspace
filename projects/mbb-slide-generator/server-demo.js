const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Demo mode - generates sample slides without API calls
const DEMO_MODE = true;

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate slide endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { slideType, audience, context, data, takeaway } = req.body;
        
        if (!slideType || !audience || !context) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate demo content based on inputs
        const result = generateDemoSlide(slideType, audience, context, data, takeaway);
        
        res.json(result);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

function generateDemoSlide(slideType, audience, context, data, takeaway) {
    const titles = {
        'executive-summary': 'Q4 Performance: Strong Growth Despite Margin Pressure',
        'situation-analysis': 'Current Market Position: Growth Opportunities and Risks',
        'recommendation': 'Three Strategic Actions to Capture $50M Opportunity',
        'data-insight': 'Customer Churn Analysis Reveals Retention Leverage Points',
        'comparison': 'Strategic Options: Build vs. Buy vs. Partner',
        'process': 'Implementation Roadmap: 90-Day Execution Plan'
    };
    
    const sampleContent = {
        'executive-summary': `• Revenue grew 15% YoY to $50M, exceeding target by 3 percentage points
  • Driven by enterprise segment expansion and new product launch
  • Customer acquisition cost improved 12% through optimized channels
• Margin compression of 400bps reflects supply chain headwinds
  • COGS increased 22% due to raw material inflation
  • Pricing power partially offset cost increases
• EBITDA of $7M (14% margin) vs. $9M prior year (18% margin)
  • Actions underway to restore margin through sourcing and pricing`,
        
        'recommendation': `• Implement dynamic pricing strategy to recover 200bps margin
  • Target price increases of 5-8% in low-elasticity segments
  • Expected impact: $2.5M annual EBITDA improvement
• Renegotiate supplier contracts with top 5 vendors
  • Consolidate spend to secure volume discounts
  • Explore near-shoring alternatives to reduce logistics costs
• Accelerate high-margin service revenue growth
  • Cross-sell to existing customer base
  • Target: 25% of revenue mix by Q4`,
        
        'situation-analysis': `• Market growing at 8% CAGR with consolidation underway
  • Top 3 players control 65% market share (up from 52% in 2021)
  • Customer preference shifting toward integrated solutions
• Our competitive position: Strong product, limited distribution
  • Technology rated #1 in independent benchmark study
  • Sales coverage gaps in Midwest and Southeast regions
• Key risk: Well-funded competitor planning aggressive expansion
  • $100M war chest from recent PE backing
  • Hiring our former sales leadership`
    };
    
    const title = titles[slideType] || 'Strategic Analysis and Recommendations';
    const content = sampleContent[slideType] || sampleContent['executive-summary'];
    
    // Format content as HTML
    const htmlContent = formatContent(content);
    
    return {
        title: title,
        content: htmlContent,
        plainText: `TITLE: ${title}\n\n${content}\n\n${takeaway ? `KEY TAKEAWAY: ${takeaway}` : 'KEY TAKEAWAY: Immediate action required to address margin pressure while maintaining growth trajectory.'}`,
        takeaway: takeaway || 'Immediate action required to address margin pressure while maintaining growth trajectory.'
    };
}

function formatContent(content) {
    const lines = content.split('\n');
    let html = '<ul>';
    let inSublist = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('• ')) {
            if (inSublist) {
                html += '</ul>';
                inSublist = false;
            }
            html += `<li>${trimmed.substring(2)}</li>`;
        } else if (trimmed.startsWith('  • ') || trimmed.startsWith('  - ')) {
            if (!inSublist) {
                html = html.slice(0, -5);
                html += '<ul>';
                inSublist = true;
            }
            html += `<li>${trimmed.replace(/^[\s•-]+/, '')}</li>`;
        }
    }
    
    if (inSublist) {
        html += '</ul></li>';
    }
    
    html += '</ul>';
    return html;
}

app.listen(PORT, () => {
    console.log(`MBB Slide Generator running on port ${PORT}`);
    console.log(`Mode: ${DEMO_MODE ? 'DEMO (no API costs)' : 'LIVE (uses Kimi API)'}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;