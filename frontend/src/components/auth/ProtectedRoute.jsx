import { Navigate } from 'react-router-dom';

import { getStoredUser } from '../../api/authApi';
import { getToken } from '../../api/httpClient';

function ProtectedRoute({ children, roles }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
