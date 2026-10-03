import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createPostSchema,
} from '../app/lib/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('passes with valid email and password', () => {
      const valid = { email: 'user@example.com', password: 'password123' };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails with invalid email format', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('fails when password is empty', () => {
      const invalid = { email: 'user@example.com', password: '' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });
  });

  describe('registerSchema', () => {
    it('passes with valid registration data', () => {
      const valid = {
        email: 'user@example.com',
        password: 'securepassword123',
        name: 'Jane Doe',
        organizationName: 'Acme Corp',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails when password is under 8 characters', () => {
      const invalid = {
        email: 'user@example.com',
        password: '123',
        name: 'Jane Doe',
        organizationName: 'Acme Corp',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when name or org name is too short', () => {
      const invalid = {
        email: 'user@example.com',
        password: 'securepassword123',
        name: 'J',
        organizationName: 'A',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('createPostSchema', () => {
    it('passes with valid title, content, and default status', () => {
      const valid = {
        title: 'Introduction to Next.js',
        content: 'This is a detailed guide on building applications with Next.js.',
      };
      const result = createPostSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('DRAFT');
      }
    });

    it('fails when title is shorter than 3 characters', () => {
      const invalid = {
        title: 'Hi',
        content: 'Valid content that is long enough.',
      };
      const result = createPostSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when content is shorter than 10 characters', () => {
      const invalid = {
        title: 'Valid Title',
        content: 'Too short',
      };
      const result = createPostSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
