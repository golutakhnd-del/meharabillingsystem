import Dashboard from './Dashboard';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default Index;
