/**
 * Integration Test: Knowledge Extraction Flow
 * 
 * Tests the complete knowledge extraction user story end-to-end.
 * These tests MUST FAIL before implementation - validates TDD approach.
 */

import { createMockApp, createMockVault } from '../setup';

describe('Knowledge Extraction Integration Flow', () => {
  let app: any;
  let plugin: any;
  let mockVault: any;

  beforeEach(() => {
    mockVault = createMockVault();
    app = createMockApp();
    app.vault = mockVault;
    
    // This will fail until EmailInquiryPlugin is implemented
    // plugin = new EmailInquiryPlugin(app, manifest);
  });

  describe('User Story: Extract knowledge from resolved emails', () => {
    it('should extract knowledge entry from resolved email with resolution', async () => {
      // Given: A resolved email with resolution note
      const resolvedEmailId = 'email-123';
      const emailContent = `---
email-id: "${resolvedEmailId}"
sender: "user@example.com"
subject: "Cannot login - password reset not working"
date: 2025-09-05T10:30:00Z
status: resolved
category: technical
priority: high
resolution-note: "resolution-456"
---

I've tried resetting my password multiple times but the reset link doesn't work. 
I get an error saying "Invalid token" every time I click it.

Browser: Chrome 116
Operating System: Windows 11`;

      const resolutionContent = `---
type: resolution-note
resolution-id: "resolution-456"
email-id: "${resolvedEmailId}"
resolved-date: 2025-09-05T15:30:00Z
outcome: solved
---

## Resolution Summary
Password reset token expiration issue - extended token validity

## Details
1. Identified that password reset tokens were expiring too quickly (5 minutes)
2. Extended token validity to 30 minutes in system configuration
3. Cleared user's existing tokens and generated new one
4. User successfully reset password

## Follow-up
- Monitor token expiration complaints
- Consider implementing progressive token extension`;

      mockVault.read.mockImplementation((path) => {
        if (path.includes(resolvedEmailId)) return emailContent;
        if (path.includes('resolution-456')) return resolutionContent;
        return '';
      });

      // When: User requests knowledge extraction
      // This MUST FAIL - no extraction implementation exists yet
      const result = await plugin.commands.extractKnowledge.callback({
        emailId: resolvedEmailId,
        title: 'Password Reset Token Issues'
      });

      // Then: Knowledge entry should be created
      expect(result).toMatchObject({
        knowledgeId: expect.stringMatching(/^kb-\d+$/),
        path: expect.stringContaining('Knowledge/technical/'),
        linkedEmails: [resolvedEmailId]
      });

      expect(mockVault.create).toHaveBeenCalledWith(
        expect.stringMatching(/Knowledge\/technical\/kb-\d+-password-reset-token-issues\.md$/),
        expect.stringContaining('---')
      );

      const knowledgeContent = mockVault.create.mock.calls[0][1];
      expect(knowledgeContent).toContain('knowledge-id:');
      expect(knowledgeContent).toContain('title: Password Reset Token Issues');
      expect(knowledgeContent).toContain('category: technical');
      expect(knowledgeContent).toContain('source-emails: ["email-123"]');
      expect(knowledgeContent).toContain('## Problem');
      expect(knowledgeContent).toContain('Invalid token');
      expect(knowledgeContent).toContain('## Solution');
      expect(knowledgeContent).toContain('Extended token validity to 30 minutes');
    });

    it('should auto-extract knowledge from high-value resolutions', async () => {
      const emailId = 'email-789';
      const highValueEmail = `---
email-id: "${emailId}"
sender: "customer@company.com"
subject: "Database connection timeout errors"
date: 2025-09-05T09:15:00Z
status: resolved
category: technical
priority: urgent
tags: [database, timeout, production]
resolution-note: "resolution-789"
---

Our production API is experiencing database connection timeouts. 
This is affecting multiple customers and causing 500 errors.

Error logs show: "Connection timeout after 30 seconds"`;

      const criticalResolution = `---
type: resolution-note
resolution-id: "resolution-789"
email-id: "${emailId}"
resolved-date: 2025-09-05T12:45:00Z
outcome: solved
effectiveness: 95
---

## Resolution Summary
Database connection pool exhaustion - increased pool size and optimized queries

## Root Cause
Connection pool was set to 10 connections max, insufficient for production load
Slow queries were holding connections too long

## Solution Steps
1. Increased max connections from 10 to 50
2. Added connection timeout monitoring
3. Optimized 3 slow queries identified in logs
4. Implemented connection pool metrics dashboard

## Results
- 500 errors dropped to zero
- Average response time improved by 40%
- Connection pool utilization now stable at 60%`;

      mockVault.read.mockImplementation((path) => {
        if (path.includes(emailId)) return highValueEmail;
        if (path.includes('resolution-789')) return criticalResolution;
        return '';
      });

      // This MUST FAIL - no auto-extraction exists yet
      await plugin.processors.autoExtractKnowledge.process(emailId);

      // Should automatically create knowledge entry for high-value resolution
      expect(mockVault.create).toHaveBeenCalledWith(
        expect.stringMatching(/Knowledge\/technical\/.*database-connection.*\.md$/),
        expect.stringContaining('effectiveness: 95')
      );
    });

    it('should link related emails to knowledge entries', async () => {
      const relatedEmails = ['email-100', 'email-101', 'email-102'];
      
      // Mock related emails with similar issues
      mockVault.read.mockImplementation((path) => {
        if (path.includes('email-100')) {
          return `---
email-id: "email-100"
subject: "Login problems after update"
category: technical
tags: [login, authentication]
---
Cannot login after latest system update.`;
        }
        if (path.includes('email-101')) {
          return `---
email-id: "email-101"
subject: "Authentication failing randomly"
category: technical
tags: [login, authentication, bug]
---
Users report random authentication failures.`;
        }
        if (path.includes('email-102')) {
          return `---
email-id: "email-102"
subject: "SSO login not working"
category: technical
tags: [login, sso, authentication]
---
Single sign-on authentication is broken.`;
        }
        return '';
      });

      // When: Creating knowledge entry for authentication issues
      // This MUST FAIL - no related email detection exists yet
      const result = await plugin.commands.extractKnowledge.callback({
        emailId: 'email-100',
        title: 'Authentication System Issues',
        findRelated: true
      });

      // Then: Should link all related emails
      expect(result.linkedEmails).toEqual(expect.arrayContaining(relatedEmails));
      
      const knowledgeContent = mockVault.create.mock.calls[0][1];
      expect(knowledgeContent).toContain('source-emails: ["email-100", "email-101", "email-102"]');
    });

    it('should categorize knowledge entry based on email category', async () => {
      const billingEmailId = 'email-billing-1';
      const billingEmail = `---
email-id: "${billingEmailId}"
sender: "customer@example.com"
subject: "Billing discrepancy - double charge"
category: billing
status: resolved
---

I was charged twice for my monthly subscription.`;

      mockVault.read.mockReturnValue(billingEmail);

      // This MUST FAIL - no categorization exists yet
      const result = await plugin.commands.extractKnowledge.callback({
        emailId: billingEmailId,
        title: 'Double Billing Charge Resolution'
      });

      expect(result.path).toContain('Knowledge/billing/');
      
      const knowledgeContent = mockVault.create.mock.calls[0][1];
      expect(knowledgeContent).toContain('category: billing');
    });

    it('should update knowledge entry usage statistics when referenced', async () => {
      const existingKnowledgeId = 'kb-001';
      
      // Mock existing knowledge entry
      mockVault.read.mockReturnValue(`---
type: knowledge-entry
knowledge-id: "${existingKnowledgeId}"
title: "Common Login Issues"
use-count: 5
last-used: 2025-09-01T10:00:00Z
effectiveness: 80
---

## Problem
Users cannot login

## Solution
Clear browser cache and cookies`);

      // This MUST FAIL - no usage tracking exists yet
      await plugin.commands.referenceKnowledge.callback({
        knowledgeId: existingKnowledgeId,
        context: 'Helping customer with login issue'
      });

      expect(mockVault.modify).toHaveBeenCalledWith(
        expect.stringContaining(existingKnowledgeId),
        expect.stringMatching(/use-count: 6/)
      );

      expect(mockVault.modify).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('last-used: 2025-09-05T')
      );
    });

    it('should validate email is resolved before extraction', async () => {
      const unresolvedEmailId = 'email-pending-1';
      const unresolvedEmail = `---
email-id: "${unresolvedEmailId}"
subject: "Unresolved Issue"
status: pending
---

This issue is still pending.`;

      mockVault.read.mockReturnValue(unresolvedEmail);

      // This MUST FAIL - no validation exists yet
      await expect(
        plugin.commands.extractKnowledge.callback({
          emailId: unresolvedEmailId,
          title: 'Should Not Extract'
        })
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('not resolved')
        })
      );
    });

    it('should handle manual knowledge entry creation', async () => {
      const manualKnowledge = {
        title: 'Server Maintenance Best Practices',
        category: 'technical',
        problem: 'Customers affected during server maintenance',
        solution: 'Schedule maintenance during low-usage periods and send advance notifications',
        tags: ['maintenance', 'communication', 'scheduling'],
        sourceEmails: ['email-501', 'email-502']
      };

      // This MUST FAIL - no manual entry creation exists yet
      const result = await plugin.commands.createKnowledgeEntry.callback(manualKnowledge);

      expect(result.knowledgeId).toMatch(/^kb-\d+$/);
      expect(mockVault.create).toHaveBeenCalledWith(
        expect.stringMatching(/Knowledge\/technical\/.*maintenance.*\.md$/),
        expect.stringContaining('Server Maintenance Best Practices')
      );
    });

    it('should search existing knowledge before creating duplicates', async () => {
      const newEmailId = 'email-duplicate-test';
      
      // Mock existing knowledge entry with similar content
      plugin.knowledgeSearcher = {
        search: jest.fn().mockResolvedValue({
          results: [
            {
              id: 'kb-existing-1',
              title: 'Password Reset Issues',
              score: 0.85,
              path: 'Knowledge/technical/kb-existing-1.md'
            }
          ]
        })
      };

      // This MUST FAIL - no duplicate detection exists yet
      const result = await plugin.commands.extractKnowledge.callback({
        emailId: newEmailId,
        title: 'Password Reset Problems',
        checkDuplicates: true
      });

      expect(plugin.knowledgeSearcher.search).toHaveBeenCalledWith({
        query: expect.stringContaining('Password Reset Problems'),
        limit: 5
      });

      // Should suggest existing knowledge entry instead of creating new one
      expect(result.duplicates).toContainEqual({
        id: 'kb-existing-1',
        similarity: 0.85
      });
    });

    it('should generate knowledge insights from accumulated data', async () => {
      // Mock multiple knowledge entries
      const knowledgeEntries = Array.from({ length: 10 }, (_, i) => ({
        path: `Knowledge/technical/kb-${i}.md`,
        stat: { ctime: new Date('2025-09-01T10:00:00Z') }
      }));

      mockVault.getFiles.mockReturnValue(knowledgeEntries);

      // This MUST FAIL - no insights generation exists yet
      const insights = await plugin.commands.generateKnowledgeInsights.callback();

      expect(insights).toMatchObject({
        totalEntries: 10,
        categoriesBreakdown: expect.any(Object),
        topIssues: expect.any(Array),
        effectivenessStats: expect.any(Object),
        usagePatterns: expect.any(Object)
      });
    });

    it('should export knowledge base for sharing', async () => {
      const exportOptions = {
        format: 'json',
        category: 'technical',
        includePrivate: false
      };

      // This MUST FAIL - no export functionality exists yet
      const exportResult = await plugin.commands.exportKnowledge.callback(exportOptions);

      expect(exportResult).toMatchObject({
        format: 'json',
        entries: expect.any(Array),
        metadata: {
          exportDate: expect.any(String),
          totalEntries: expect.any(Number),
          categories: expect.any(Array)
        }
      });
    });
  });
});

// Type definitions that will be created later
export interface EmailInquiryPlugin {
  app: any;
  commands: {
    extractKnowledge: {
      callback: (options: any) => Promise<any>;
    };
    referenceKnowledge: {
      callback: (options: any) => Promise<void>;
    };
    createKnowledgeEntry: {
      callback: (entry: any) => Promise<any>;
    };
    generateKnowledgeInsights: {
      callback: () => Promise<any>;
    };
    exportKnowledge: {
      callback: (options: any) => Promise<any>;
    };
  };
  processors: {
    autoExtractKnowledge: {
      process: (emailId: string) => Promise<void>;
    };
  };
  knowledgeSearcher: {
    search: (query: any) => Promise<any>;
  };
}