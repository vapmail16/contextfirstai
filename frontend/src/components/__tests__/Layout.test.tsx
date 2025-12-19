/**
 * Layout Component Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout Component', () => {
  describe('Header/Navigation', () => {
    it('should render site logo/title', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Logo should be a link to home
      const logoLink = screen.getByRole('link', { name: /Context First AI/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should render navigation links', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Check that navigation links exist (may appear in header and footer)
      const allLinks = screen.getAllByRole('link');
      const linkTexts = allLinks.map(link => link.textContent?.toLowerCase() || '');
      
      expect(linkTexts.some(text => text.includes('home'))).toBe(true);
      expect(linkTexts.some(text => text.includes('training'))).toBe(true);
      expect(linkTexts.some(text => text.includes('knowledge'))).toBe(true);
      expect(linkTexts.some(text => text.includes('tool'))).toBe(true);
      expect(linkTexts.some(text => text.includes('product'))).toBe(true);
      expect(linkTexts.some(text => text.includes('community'))).toBe(true);
    });

    it('should have correct href attributes for navigation links', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      const allLinks = screen.getAllByRole('link');
      const homeLink = allLinks.find(link => link.getAttribute('href') === '/');
      const trainingLink = allLinks.find(link => link.getAttribute('href') === '/trainings');
      const knowledgeLink = allLinks.find(link => link.getAttribute('href') === '/knowledge');

      expect(homeLink).toBeDefined();
      expect(trainingLink).toBeDefined();
      expect(knowledgeLink).toBeDefined();
    });
  });

  describe('Footer', () => {
    it('should render footer with copyright', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/©|copyright/i)).toBeInTheDocument();
    });

    it('should render footer links', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Footer should have links (check for contact link)
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render children content', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});

