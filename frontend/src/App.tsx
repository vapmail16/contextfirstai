import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Training from "./pages/Training";
import TrainingDetail from "./pages/TrainingDetail";
import KnowledgeHub from "./pages/KnowledgeHub";
import Tools from "./pages/Tools";
import Products from "./pages/Products";
import Community from "./pages/Community";
import AdminDashboard from "./pages/AdminDashboard";
import TrainingList from "./pages/admin/TrainingList";
import TrainingForm from "./pages/admin/TrainingForm";
import ToolList from "./pages/admin/ToolList";
import ToolForm from "./pages/admin/ToolForm";
import ProductList from "./pages/admin/ProductList";
import ProductForm from "./pages/admin/ProductForm";
import KnowledgeList from "./pages/admin/KnowledgeList";
import KnowledgeForm from "./pages/admin/KnowledgeForm";
import CommunityList from "./pages/admin/CommunityList";
import CommunityForm from "./pages/admin/CommunityForm";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/trainings" element={<Training />} />
                    <Route path="/trainings/:id" element={<TrainingDetail />} />
                    <Route path="/knowledge" element={<KnowledgeHub />} />
                    <Route path="/tools" element={<Tools />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Layout>
              }
            />

            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes (protected) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/trainings" element={<TrainingList />} />
                      <Route path="/trainings/new" element={<TrainingForm />} />
                      <Route path="/trainings/:id/edit" element={<TrainingForm />} />
                      <Route path="/tools" element={<ToolList />} />
                      <Route path="/tools/new" element={<ToolForm />} />
                      <Route path="/tools/:id/edit" element={<ToolForm />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/new" element={<ProductForm />} />
                      <Route path="/products/:id/edit" element={<ProductForm />} />
                      <Route path="/knowledge" element={<KnowledgeList />} />
                      <Route path="/knowledge/new" element={<KnowledgeForm />} />
                      <Route path="/knowledge/:id/edit" element={<KnowledgeForm />} />
                      <Route path="/community" element={<CommunityList />} />
                      <Route path="/community/new" element={<CommunityForm />} />
                      <Route path="/community/:id/edit" element={<CommunityForm />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

