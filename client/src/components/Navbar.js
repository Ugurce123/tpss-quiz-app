import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-effect border-b border-white border-opacity-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-lg sm:text-2xl font-bold text-white"
            >
              🧳 Bagaj Testi
            </motion.div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-blue-200 transition-colors text-sm sm:text-base"
                >
                  Ana Sayfa
                </Link>
                
                <Link 
                  to="/statistics" 
                  className="text-white hover:text-blue-200 transition-colors text-sm sm:text-base"
                >
                  📊 İstatistikler
                </Link>
                
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 text-white hover:text-blue-200 transition-colors text-sm sm:text-base"
                  >
                    <FiSettings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-1 sm:space-x-2 text-white">
                  <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base max-w-20 sm:max-w-none truncate">{user.username}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Çıkış</span>
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-200 transition-colors text-sm sm:text-base"
                >
                  Giriş
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;