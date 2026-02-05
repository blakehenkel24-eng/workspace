require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        
        // Build prompt for Kimi
        const prompt = buildPrompt(slideType, audience, context, data, takeaway);
        
        // Call Kimi Code API (OpenAI-compatible)
        const kimiResponse = await fetch('https://api.kimi.com/coding/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'kimi-for-coding',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert consultant trained in McKinsey, Bain, and BCG slide creation. 
You create slides with:
- Clear, action-oriented titles (not descriptions)
- MECE structure (Mutually Exclusive, Collectively Exhaustive)
- So-what focused content, not just data
- Executive-ready language
- Bold key insights

Respond in this exact format:
TITLE: [Slide title - action oriented, not descriptive]

CONTENT:
[3-5 bullet points with hierarchical structure if needed]
- Main point
  - Supporting detail
  - Supporting detail

PLAIN_TEXT:
[Same content but formatted for easy copy-paste]

KEY_TAKEAWAY:
[The single most important message]`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });
        
        if (!kimiResponse.ok) {
            const error = await kimiResponse.text();
            console.error('Kimi API error:', error);
            throw new Error('Failed to generate content');
        }
        
        const kimiData = await kimiResponse.json();
        const generatedText = kimiData.choices[0].message.content;
        
        // Parse the response
        const parsed = parseKimiResponse(generatedText);
        
        res.json({
            title: parsed.title,
            content: formatContent(parsed.content),
            plainText: parsed.plainText,
            takeaway: parsed.keyTakeaway || takeaway
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

function buildPrompt(slideType, audience, context, data, takeaway) {
    const slideTypes = {
        'executive-summary': 'Executive Summary - top-level overview of key findings',
        'situation-analysis': 'Situation Analysis - current state assessment',
        'recommendation': 'Recommendation - specific proposed actions',
        'data-insight': 'Data Insight - key findings from analysis',
        'comparison': 'Comparison/Framework - evaluating options or structuring thinking',
        'process': 'Process/Workflow - how something works or should work'
    };
    
    const audiences = {
        'c-suite': 'C-Suite/Board - senior executives who need strategic insights',
        'pe-investors': 'PE Investors - focused on returns, risks, and deal metrics',
        'management': 'Management Team - operational leaders implementing changes',
        'consultants': 'Internal Consultants - analytical, detail-oriented team members'
    };
    
    let prompt = `Create an MBB-style ${slideTypes[slideType]} slide.

AUDIENCE: ${audiences[audience]}

CONTEXT: ${context}`;
    
    if (data) {
        prompt += `\n\nDATA TO INCLUDE:\n${data}`;
    }
    
    if (takeaway) {
        prompt += `\n\nKEY TAKEAWAY TO EMPHASIZE: ${takeaway}`;
    }
    
    prompt += `\n\nMake it sound like a top-tier consulting firm slide. Focus on insights, not just information.`;
    
    return prompt;
}

function parseKimiResponse(text) {
    const lines = text.split('\n');
    let title = '';
    let content = [];
    let plainText = '';
    let keyTakeaway = '';
    
    let currentSection = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('TITLE:')) {
            title = trimmed.replace('TITLE:', '').trim();
            currentSection = null;
        } else if (trimmed.startsWith('CONTENT:')) {
            currentSection = 'content';
        } else if (trimmed.startsWith('PLAIN_TEXT:')) {
            currentSection = 'plain';
        } else if (trimmed.startsWith('KEY_TAKEAWAY:')) {
            keyTakeaway = trimmed.replace('KEY_TAKEAWAY:', '').trim();
            currentSection = null;
        } else if (trimmed && currentSection === 'content') {
            content.push(trimmed);
        } else if (trimmed && currentSection === 'plain') {
            plainText += trimmed + '\n';
        }
    }
    
    return {
        title: title || 'Untitled Slide',
        content: content.join('\n'),
        plainText: plainText.trim() || content.join('\n'),
        keyTakeaway
    };
}

function formatContent(content) {
    // Convert bullet points to HTML
    if (!content) return '<p>No content generated</p>';
    
    const lines = content.split('\n');
    let html = '<ul>';
    let inSublist = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            if (inSublist) {
                html += '</ul>';
                inSublist = false;
            }
            html += `<li>${trimmed.substring(2)}</li>`;
        } else if (trimmed.startsWith('  - ') || trimmed.startsWith('    - ')) {
            if (!inSublist) {
                html = html.slice(0, -5); // Remove </li>
                html += '<ul>';
                inSublist = true;
            }
            html += `<li>${trimmed.replace(/^[\s-]+/, '')}</li>`;
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
    console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;