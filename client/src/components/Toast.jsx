import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const types = {
    success: {
      bg: 'bg-green-500',
      text: 'text-white',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-500', 
      text: 'text-white',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-white', 
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-white',
      icon: 'ℹ️'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const animationClass = isExiting 
    ? 'animate-slideInRight opacity-0 transform translate-x-full'
    : 'animate-slideInLeft';

  return (
    <div 
      className={`fixed z-50 ${positions[position]} ${animationClass}`}
    >
      <div className={`
        ${types[type].bg} ${types[type].text}
        px-6 py-4 rounded-lg shadow-xl
        flex items-center space-x-3
        max-w-sm backdrop-blur-sm
        border border-white/20
        transition-all duration-300
      `}>
        <span className="text-lg">{types[type].icon}</span>
        <p className="font-medium">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
          }}
          className="ml-auto text-white/80 hover:text-white transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts = [] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id || index}
          className="pointer-events-auto"
          style={{ zIndex: 50 + index }}
        >
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'])
};

ToastContainer.propTypes = {
  toasts: PropTypes.array
};

export default Toast;
export { ToastContainer };