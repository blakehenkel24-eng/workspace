-- SlideTheory Database Schema
-- PostgreSQL 15+
-- 
-- Run this script to initialize the database:
--   psql -U postgres -d slidetheory -f migrations/001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    
    -- Plan & Billing
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    slides_generated_this_month INTEGER DEFAULT 0,
    exports_this_month INTEGER DEFAULT 0,
    monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Preferences
    default_style VARCHAR(50) DEFAULT 'mckinsey',
    default_color_scheme VARCHAR(20) DEFAULT 'navy',
    email_notifications BOOLEAN DEFAULT true,
    
    -- Security
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE  -- Soft delete
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_plan ON users(plan) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =============================================================================
-- API KEYS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Key details
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(8) NOT NULL,  -- First 8 chars for display
    key_hash VARCHAR(255) NOT NULL,  -- Hashed full key
    
    -- Usage
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- =============================================================================
-- SLIDES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL for anonymous
    
    -- Generation inputs
    slide_type VARCHAR(50) NOT NULL CHECK (slide_type IN ('Executive Summary', 'Horizontal Flow', 'Vertical Flow', 'Graph/Chart', 'General')),
    context TEXT NOT NULL,
    data_points JSONB DEFAULT '[]',
    target_audience VARCHAR(50),
    framework VARCHAR(50),
    options JSONB DEFAULT '{}',
    
    -- Generation status
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'rendering', 'completed', 'failed')),
    error_message TEXT,
    
    -- Results
    image_url TEXT,
    thumbnail_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    content JSONB,  -- Structured content (title, keyPoints, etc.)
    generation_time_ms INTEGER,
    ai_model VARCHAR(50),
    
    -- Metadata
    generation_cost_usd DECIMAL(10, 6),  -- Track AI costs
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    -- Soft delete (keep for analytics)
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for slides
CREATE INDEX idx_slides_user ON slides(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_slides_status ON slides(status);
CREATE INDEX idx_slides_created ON slides(created_at DESC);
CREATE INDEX idx_slides_expires ON slides(expires_at) WHERE expires_at < CURRENT_TIMESTAMP + INTERVAL '1 day';

-- Full-text search on context
CREATE INDEX idx_slides_search ON slides USING gin(to_tsvector('english', context));

-- =============================================================================
-- EXPORTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slide_id UUID NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Export details
    format VARCHAR(10) NOT NULL CHECK (format IN ('png', 'pptx', 'pdf', 'html')),
    options JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Results
    download_url TEXT,
    file_size_bytes INTEGER,
    checksum VARCHAR(64),
    
    -- Metadata
    processing_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

CREATE INDEX idx_exports_slide ON exports(slide_id);
CREATE INDEX idx_exports_user ON exports(user_id);
CREATE INDEX idx_exports_status ON exports(status);

-- =============================================================================
-- TEMPLATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '📊',
    tags TEXT[] DEFAULT '{}',
    
    -- Template content
    slide_type VARCHAR(50) NOT NULL,
    context TEXT NOT NULL,
    data_points JSONB DEFAULT '[]',
    target_audience VARCHAR(50),
    framework VARCHAR(50),
    options JSONB DEFAULT '{}',
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2, 1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Media
    preview_image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_templates_category ON templates(category) WHERE is_active = true;
CREATE INDEX idx_templates_featured ON templates(is_featured) WHERE is_active = true;
CREATE INDEX idx_templates_tags ON templates USING gin(tags);

-- =============================================================================
-- USER ACTIVITY LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    action VARCHAR(50) NOT NULL,  -- 'slide_generated', 'export_downloaded', etc.
    entity_type VARCHAR(50),      -- 'slide', 'export', 'template', etc.
    entity_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_action ON activity_log(action, created_at DESC);

-- Partition activity_log by month for performance
-- (Run separately after initial setup if table grows large)
-- CREATE TABLE activity_log_2026_02 PARTITION OF activity_log
--     FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- =============================================================================
-- WEBHOOKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configuration
    url TEXT NOT NULL,
    secret VARCHAR(255),  -- For HMAC signature verification
    events TEXT[] NOT NULL,  -- ['slide.completed', 'slide.failed']
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    failure_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_user ON webhooks(user_id) WHERE is_active = true;

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset monthly usage counter
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE users
    SET slides_generated_this_month = 0,
        exports_this_month = 0,
        monthly_reset_at = CURRENT_TIMESTAMP
    WHERE monthly_reset_at < CURRENT_TIMESTAMP - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Log user activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_metadata JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata, p_ip_address, p_user_agent)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Daily usage statistics
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE entity_type = 'slide' AND action = 'generated') as slides_generated,
    COUNT(*) FILTER (WHERE entity_type = 'export' AND action = 'downloaded') as exports_downloaded,
    COUNT(DISTINCT user_id) as active_users
FROM activity_log
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- User usage summary
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
    u.id,
    u.email,
    u.plan,
    COUNT(s.id) as total_slides,
    COUNT(s.id) FILTER (WHERE s.created_at > CURRENT_DATE - INTERVAL '30 days') as slides_last_30_days,
    COUNT(e.id) as total_exports,
    MAX(s.created_at) as last_slide_at
FROM users u
LEFT JOIN slides s ON u.id = s.user_id AND s.deleted_at IS NULL
LEFT JOIN exports e ON u.id = e.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.plan;

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert default templates (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM templates LIMIT 1) THEN
        INSERT INTO templates (name, description, category, icon, tags, slide_type, context, target_audience, framework, is_featured, sort_order) VALUES
        ('Executive Summary', 'Classic McKinsey-style executive summary for board presentations', 'Consulting', '📊', ARRAY['executive', 'summary', 'board'], 'Executive Summary', 'Create a compelling executive summary that presents key findings and recommendations using the pyramid principle. Lead with the recommendation, support with key arguments, and provide detailed evidence.', 'C-Suite/Board', 'Pyramid Principle', true, 1),
        
        ('Market Analysis', 'Competitive landscape and market sizing visualization', 'Strategy', '🎯', ARRAY['market', 'competition', 'analysis'], 'Graph/Chart', 'Present market size, growth trends, and competitive positioning. Include market share data, growth rates, and key competitor analysis.', 'C-Suite/Board', '2x2 Matrix', true, 2),
        
        ('Financial Model', 'Revenue breakdown and financial projections', 'Finance', '💰', ARRAY['financial', 'revenue', 'projections'], 'Graph/Chart', 'Present financial performance including revenue breakdown, cost structure, profitability metrics, and forward projections. Use waterfall charts and bridge analysis.', 'Investors', 'Waterfall Chart', true, 3),
        
        ('Process Flow', 'Step-by-step process or workflow visualization', 'Operations', '⚙️', ARRAY['process', 'workflow', 'operations'], 'Horizontal Flow', 'Visualize a multi-step process, workflow, or decision tree. Show sequential steps with clear inputs, outputs, and decision points.', 'Internal/Working Team', 'MECE', false, 4),
        
        ('Org Structure', 'Organizational hierarchy and reporting lines', 'HR', '👥', ARRAY['org', 'structure', 'team'], 'Vertical Flow', 'Present organizational structure, reporting lines, team composition, and key roles. Show hierarchy and span of control.', 'Internal/Working Team', 'MECE', false, 5),
        
        ('SWOT Analysis', 'Strengths, Weaknesses, Opportunities, Threats', 'Strategy', '⚖️', ARRAY['swot', 'strategy', 'analysis'], 'General', 'Comprehensive SWOT analysis presenting internal strengths and weaknesses alongside external opportunities and threats.', 'External Client', 'SWOT', false, 6);
    END IF;
END $$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE api_keys IS 'API authentication keys';
COMMENT ON TABLE slides IS 'Generated slide records';
COMMENT ON TABLE exports IS 'Export jobs and download links';
COMMENT ON TABLE templates IS 'Slide templates for quick generation';
COMMENT ON TABLE activity_log IS 'Audit trail of user actions';
COMMENT ON TABLE webhooks IS 'Webhook configurations for event notifications';
