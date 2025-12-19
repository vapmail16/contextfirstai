/**
 * Layout Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold">
              Context First AI
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/trainings" className="text-sm font-medium hover:text-primary transition-colors">
                Trainings
              </Link>
              <Link to="/knowledge" className="text-sm font-medium hover:text-primary transition-colors">
                Knowledge
              </Link>
              <Link to="/tools" className="text-sm font-medium hover:text-primary transition-colors">
                Tools
              </Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Products
              </Link>
              <Link to="/community" className="text-sm font-medium hover:text-primary transition-colors">
                Community
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        await logout();
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="outline" size="sm">
                      Register
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="default" size="sm">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              Menu
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <p className="text-sm text-muted-foreground">
                Context First AI - Your gateway to AI training, tools, and community.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/trainings" className="text-muted-foreground hover:text-primary">
                    Trainings
                  </Link>
                </li>
                <li>
                  <Link to="/knowledge" className="text-muted-foreground hover:text-primary">
                    Knowledge Hub
                  </Link>
                </li>
                <li>
                  <Link to="/tools" className="text-muted-foreground hover:text-primary">
                    Tools
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products" className="text-muted-foreground hover:text-primary">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="text-muted-foreground hover:text-primary">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Context First AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

