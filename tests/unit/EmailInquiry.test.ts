/**
 * Unit Test: EmailInquiry Model
 */

import { EmailInquiryModel } from '@/models/EmailInquiry';
import { EmailStatus, EmailCategory, Priority } from '@/types/enums';

describe('EmailInquiryModel', () => {
  it('should create a new email inquiry with required fields', () => {
    const email = EmailInquiryModel.create({
      sender: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
      receivedDate: new Date('2025-09-05T10:00:00Z'),
    });

    expect(email.sender).toBe('test@example.com');
    expect(email.subject).toBe('Test Subject');
    expect(email.body).toBe('Test body content');
    expect(email.status).toBe(EmailStatus.PENDING);
    expect(email.id).toBeDefined();
  });

  it('should validate required fields', () => {
    const email = EmailInquiryModel.create({
      sender: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
      receivedDate: new Date('2025-09-05T10:00:00Z'),
    });

    const errors = email.validate();
    expect(errors).toHaveLength(0);
  });

  it('should add and remove tags', () => {
    const email = EmailInquiryModel.create({
      sender: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
      receivedDate: new Date('2025-09-05T10:00:00Z'),
    });

    email.addTag('urgent');
    expect(email.tags).toContain('urgent');

    email.removeTag('urgent');
    expect(email.tags).not.toContain('urgent');
  });

  it('should update status', () => {
    const email = EmailInquiryModel.create({
      sender: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
      receivedDate: new Date('2025-09-05T10:00:00Z'),
    });

    email.updateStatus(EmailStatus.IN_PROGRESS);
    expect(email.status).toBe(EmailStatus.IN_PROGRESS);
  });
});