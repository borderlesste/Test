import { Navigate, useLocation } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, adminOnly = false, clientOnly = false }) => {
  const { user } = useApi();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.rol !== 'admin') {
    return <Navigate to="/" replace />; // Redirigir a la página de inicio si no es admin
  }

  if (clientOnly && user?.rol !== 'client') {
    return <Navigate to="/" replace />; // Redirigir a la página de inicio si no es cliente
  }

  return children;
};

export default ProtectedRoute;

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
  clientOnly: PropTypes.bool,
};