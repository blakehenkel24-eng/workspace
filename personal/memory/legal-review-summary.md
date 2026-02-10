# Legal Documents Review Summary

*Review compiled for Blake - Todoist Task #9988534276*

---

## Executive Summary

The SlideTheory legal documents (ToS, Privacy Policy, DPA) are **comprehensive and well-structured** for an early-stage SaaS. They're suitable for launch with minor clarifications.

**Overall Risk Level:** 🟡 MEDIUM - Ready for launch with noted clarifications

---

## Document-by-Document Review

### 1. Terms of Service (ToS)

#### ✅ Strengths
- Clear definitions section
- Comprehensive acceptable use policy
- AI-generated content disclaimer included
- Proper IP ownership clauses
- GDPR/CCPA compliant termination procedures

#### ⚠️ Issues to Address

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Pricing mismatch** | HIGH | ToS shows $12/mo Pro, but tasks mention $2/mo. Clarify actual pricing |
| **Team pricing unclear** | HIGH | "$39/month" - is this per-user or flat? |
| **Missing physical address** | MEDIUM | Placeholder "[Your Business Address]" needs real address |
| **Arbitration clause** | LOW | Consider if arbitration in Delaware is desired or if small claims should be allowed |
| **Class action waiver** | LOW | Standard but user-unfriendly; ensure conspicuous placement |

#### 🔴 Critical: Pricing Section Needs Update

Current ToS Section 5.1:
```
- Free Tier: 10 slides/month
- Pro ($12/month): 100 slides/month
- Team ($39/month): Unlimited
```

**Problem:** Competitive research shows Beautiful.ai at $12/mo, Canva at $12.99/mo. If SlideTheory is positioning as value-priced, $12/mo Pro is competitive but the $2/mo mentioned in tasks would be significantly underpriced.

**Action:** Clarify actual pricing strategy before launch.

---

### 2. Privacy Policy

#### ✅ Strengths
- GDPR and CCPA compliance sections
- Clear data retention schedules
- Comprehensive user rights section
- Subprocessor list included
- Security measures documented

#### ⚠️ Issues to Address

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Missing physical address** | HIGH | Placeholder "[EU Representative Address]" and "[Business Address]" |
| **Kimi/Moonshot AI data location** | MEDIUM | Notes China processing - ensure additional safeguards documented |
| **Cookie Policy reference** | LOW | Links to cookie-policy.md which may not exist |
| **DPO contact** | LOW | dpo@slidetheory.com - ensure this email exists |

#### 🟡 Important: International Data Transfers

The Privacy Policy correctly identifies Moonshot AI (Kimi) processes data in China. For EU users, ensure:
- Transfer Impact Assessment is completed
- Standard Contractual Clauses are in place
- Users are notified of this transfer

---

### 3. Data Processing Agreement (DPA)

#### ✅ Strengths
- Full GDPR Article 28 compliance
- Standard Contractual Clauses incorporated
- Clear subprocessor list with locations
- Audit rights defined
- Breach notification procedures (24 hours)

#### ⚠️ Issues to Address

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Missing signatures** | MEDIUM | Template includes signature blocks but unsigned |
| **Controller identification** | LOW | Generic - each business customer becomes controller |
| **Jurisdiction** | LOW | Delaware law + Irish courts for EU - verify this works for business |

---

## Compliance Checklist

### GDPR (EU/EEA)
| Requirement | Status | Notes |
|-------------|--------|-------|
| Lawful basis documented | ✅ | Contract, Legitimate Interest, Consent |
| Data minimization | ✅ | Clear retention schedules |
| User rights (access, delete, etc.) | ✅ | Section 7 fully covers |
| DPA available | ✅ | Separate DPA document |
| Privacy by design | 🟡 | Mentioned, implement in product |
| Data breach notification | ✅ | 72 hours to users, 24 hours in DPA |
| DPO contact | 🟡 | Listed but verify email exists |

### CCPA/CPRA (California)
| Requirement | Status | Notes |
|-------------|--------|-------|
| Categories of data disclosed | ✅ | Section 14.1 |
| Rights listed (know, delete, opt-out) | ✅ | Section 7.2 |
| Non-discrimination clause | ✅ | Included |
| "Do Not Sell" option | ✅ | States they don't sell |
| Shine the Light | ✅ | Section 14.3 |

### Other Jurisdictions
| Jurisdiction | Status | Notes |
|--------------|--------|-------|
| UK GDPR | 🟡 | Mentioned in DPA but not Privacy Policy |
| Canada PIPEDA | 🟡 | Not explicitly covered |
| Australia Privacy Act | 🟡 | Not explicitly covered |

---

## Risk Assessment

### 🔴 Critical Risks (Must Fix Before Launch)

1. **Placeholder addresses** - Insert actual business address
2. **Pricing clarity** - Ensure ToS pricing matches actual pricing strategy

### 🟡 Important Risks (Fix Within 30 Days)

1. **Verify email addresses** - legal@, privacy@, dpo@ should all work
2. **Cookie policy** - Create if referenced
3. **Moonshot AI safeguards** - Document additional TIA measures

### 🟢 Low Risks (Can Iterate)

1. **Arbitration clause** - Standard but can be softened
2. **Additional jurisdiction support** - Add as customers require

---

## Recommendations by Priority

### Before Launch (Critical)
- [ ] Replace all `[Your Business Address]` placeholders with real addresses
- [ ] Clarify pricing in ToS Section 5.1
- [ ] Verify legal@slidetheory.com, privacy@slidetheory.com inboxes exist
- [ ] Create cookie-policy.md if referenced

### Within 30 Days (Important)
- [ ] Complete Transfer Impact Assessment for Moonshot AI (China)
- [ ] Add UK-specific privacy section
- [ ] Consider user-friendly summary at top of ToS
- [ ] Add "Last Reviewed" date to all documents

### Nice to Have (Ongoing)
- [ ] Add FAQ section to Privacy Policy
- [ ] Create separate Cookie Policy
- [ ] Consider accessibility review (WCAG compliance)
- [ ] Schedule annual legal review

---

## Comparison to Industry Standards

| Aspect | SlideTheory | Beautiful.ai | Gamma | Assessment |
|--------|-------------|--------------|-------|------------|
| ToS comprehensiveness | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Good, minor gaps |
| Privacy Policy detail | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Excellent |
| DPA available | ✅ | ✅ | ✅ | Standard |
| GDPR compliance | ✅ | ✅ | ✅ | Standard |
| CCPA compliance | ✅ | ✅ | ✅ | Standard |
| Readability | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Could be more user-friendly |

---

## Verdict: Are These Ready for Launch?

### ✅ YES, with minor fixes

The legal documents are **above average for an early-stage SaaS**. They cover the essential compliance requirements for GDPR and CCPA, include proper AI disclaimers, and have comprehensive data processing terms.

**Minimum to launch:**
1. Add real business address
2. Verify pricing matches strategy
3. Confirm email addresses work

**The $2/mo pricing mentioned in tasks would be unusually low** - Beautiful.ai is $12/mo, Gamma is $8/mo. Current ToS shows $12/mo which is competitive. If pursuing $2/mo, ensure unit economics work.

---

## Action Items for Blake

1. **This week:**
   - Insert business address into all three documents
   - Finalize pricing strategy
   - Set up legal email addresses

2. **Before first paying customer:**
   - Create cookie policy
   - Document Moonshot AI transfer safeguards

3. **Within 90 days:**
   - Have attorney review (especially if taking enterprise customers)
   - Consider increasing liability insurance based on terms

---

*Review based on documents dated February 5, 2026*
