import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiSave, FiX } from 'react-icons/fi';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'question', 'level'
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentLevelPage, setCurrentLevelPage] = useState(1);
  const levelsPerPage = 10;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Google Photos URL'sini görüntülenebilir formata çevir (şimdilik kullanılmıyor)
  // const convertGooglePhotosUrl = (url) => {
  //   if (!url) return '';
  //   const photoMatch = url.match(/photo\/([A-Za-z0-9_-]+)/);
  //   if (photoMatch && photoMatch[1]) {
  //     return `https://lh3.googleusercontent.com/${photoMatch[1]}=w500-h400`;
  //   }
  //   return url;
  // };

  // Kirli sebep etiketleri
  const dirtyReasonLabels = {
    'explosive_device': 'Patlayıcı Madde Düzeneği (Bomba)',
    'weapon_parts': 'Silah / Silah Parçası / Mermi / Fişek',
    'sharp_objects': 'Kesici/Delici Alet',
    'martial_arts_equipment': 'Dövüş Sanatları Ekipmanı',
    'gas_bomb': 'EL / GAZ / SİS Bombası'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, levelsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/questions`),
        axios.get(`${API_BASE_URL}/api/levels/admin/all`),
        axios.get(`${API_BASE_URL}/api/auth/users`)
      ]);
      
      setQuestions(questionsRes.data);
      setLevels(levelsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Mevcut' : 'Yok');
      console.log('API URL:', `${API_BASE_URL}/api/auth/users/${userId}/approve`);
      
      await axios.patch(
        `${API_BASE_URL}/api/auth/users/${userId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Kullanıcı başarıyla onaylandı!');
      fetchData(); // Verileri yenile
    } catch (error) {
      console.error('Kullanıcı onaylanırken hata:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Kullanıcı onaylanırken hata: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDisapproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_BASE_URL}/api/auth/users/${userId}/disapprove`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Kullanıcı onayı kaldırıldı!');
      fetchData(); // Verileri yenile
    } catch (error) {
      console.error('Kullanıcı onayı kaldırılırken hata:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Kullanıcı onayı kaldırılırken hata: ' + (error.response?.data?.message || error.message));
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      alert('Şifre en az 4 karakter olmalıdır!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_BASE_URL}/api/auth/users/${selectedUser._id}/change-password`,
        { newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert(`${selectedUser.username} kullanıcısının şifresi başarıyla değiştirildi!`);
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Şifre değiştirme hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`);
      alert(`${username} kullanıcısı başarıyla silindi!`);
      fetchData(); // Verileri yenile
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      alert('Kullanıcı silme hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    
    if (type === 'question') {
      // Görsel URL'sini düzelt
      let imagePreviewUrl = '';
      if (item?.image) {
        if (item.image.startsWith('http')) {
          imagePreviewUrl = item.image;
        } else if (item.image.startsWith('/uploads/')) {
          imagePreviewUrl = `${API_BASE_URL}${item.image}`;
        } else {
          imagePreviewUrl = `${API_BASE_URL}/uploads/${item.image}`;
        }
      }
      
      setFormData(item ? {
        text: item.text,
        correctAnswer: item.correctAnswer,
        dirtyReason: item.dirtyReason,
        dirtyOptions: item.dirtyOptions || [],
        level: item.level,
        points: item.points,
        explanation: item.explanation,
        difficulty: item.difficulty,
        category: item.category,
        imageUrl: item.image || '',
        imagePreview: imagePreviewUrl,
        imageBase64: '',
        existingImage: item.image || ''
      } : {
        text: '',
        correctAnswer: 'clean',
        dirtyReason: '',
        dirtyOptions: [],
        level: 1,
        points: 10,
        explanation: '',
        difficulty: 'medium',
        category: 'general',
        imageUrl: '',
        imagePreview: '',
        imageBase64: ''
      });
    } else if (type === 'level') {
      setFormData(item ? {
        name: item.name,
        levelNumber: item.level,
        description: item.description,
        passingScore: item.passingScore,
        timeLimit: item.timeLimit,
        questionCount: item.questionCount
      } : {
        name: '',
        levelNumber: levels.length + 1,
        description: '',
        passingScore: 70,
        timeLimit: 30,
        questionCount: 10
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'question') {
        const token = localStorage.getItem('token');
        
        // Base64 veya URL ile JSON gönderimi
        const questionData = {
          text: formData.text,
          correctAnswer: formData.correctAnswer,
          level: formData.level,
          points: formData.points || 10,
          explanation: formData.explanation || '',
          difficulty: formData.difficulty || 'medium',
          category: formData.category || 'general'
        };
        
        // Görsel verisi
        if (formData.imageBase64) {
          console.log('📁 Base64 görsel gönderiliyor');
          questionData.imageBase64 = formData.imageBase64;
          questionData.fileName = selectedImage?.name || 'image.jpg';
        } else if (formData.imageUrl) {
          console.log('🔗 URL görsel gönderiliyor');
          questionData.imageUrl = formData.imageUrl;
        } else if (editingItem && formData.existingImage) {
          // Soru güncellenirken, yeni görsel yüklenmemişse eski görseli koru
          console.log('🔄 Mevcut görsel korunuyor');
          questionData.keepExistingImage = true;
        }
        
        // Kirli bagaj için ek bilgiler
        if (formData.correctAnswer === 'dirty') {
          questionData.dirtyReason = formData.dirtyReason;
          questionData.dirtyOptions = formData.dirtyOptions || [];
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        console.log('🚀 API isteği gönderiliyor...');
        
        if (editingItem) {
          const response = await axios.put(`${API_BASE_URL}/api/questions/${editingItem._id}`, questionData, config);
          console.log('✅ Güncelleme başarılı:', response.data);
        } else {
          const response = await axios.post(`${API_BASE_URL}/api/questions`, questionData, config);
          console.log('✅ Oluşturma başarılı:', response.data);
        }
      } else if (modalType === 'level') {
        const levelData = {
          name: formData.name,
          level: formData.levelNumber,
          description: formData.description,
          passingScore: formData.passingScore,
          timeLimit: formData.timeLimit,
          questionCount: formData.questionCount
        };

        if (editingItem) {
          await axios.put(`${API_BASE_URL}/api/levels/${editingItem._id}`, levelData);
        } else {
          console.log('Yeni seviye oluşturuluyor:', levelData);
          await axios.post(`${API_BASE_URL}/api/levels`, levelData);
        }
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      if (type === 'question') {
        await axios.delete(`${API_BASE_URL}/api/questions/${id}`);
      } else if (type === 'level') {
        await axios.delete(`${API_BASE_URL}/api/levels/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggle = async (type, id) => {
    try {
      if (type === 'question') {
        await axios.patch(`${API_BASE_URL}/api/questions/${id}/toggle`);
      } else if (type === 'level') {
        await axios.patch(`${API_BASE_URL}/api/levels/${id}/toggle`);
      }
      fetchData();
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Paneli</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sorular ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'levels'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Seviyeler ({levels.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Kullanıcılar ({users.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'questions' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold">Sorular</h2>
                <button
                  onClick={() => openModal('question')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <FiPlus /> Yeni Soru
                </button>
              </div>
              
              {/* Seviyelerine göre gruplandırılmış sorular */}
              {levels.map((level) => {
                const levelQuestions = questions.filter(q => q.level === level.level);
                if (levelQuestions.length === 0) return null;
                
                return (
                  <div key={level._id} className="mb-8">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 rounded-t-lg">
                      <h3 className="text-base sm:text-lg font-semibold">
                        {level.name} - Seviye {level.level}
                      </h3>
                      <p className="text-indigo-100 text-sm">
                        {levelQuestions.length} soru
                      </p>
                    </div>
                    
                    <div className="border border-t-0 rounded-b-lg p-2 sm:p-4 bg-gray-50">
                      <div className="grid gap-3 sm:gap-4">
                        {levelQuestions.map((question) => (
                          <div key={question._id} className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 text-sm sm:text-base break-words">{question.text}</h4>
                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {question.correctAnswer === 'clean' ? 'Temiz' : 'Kirli'}
                                  </span>
                                  {question.correctAnswer === 'dirty' && question.dirtyReason && (
                                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                      {dirtyReasonLabels[question.dirtyReason] || question.dirtyReason}
                                    </span>
                                  )}
                                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                    {question.points || 10} puan
                                  </span>
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {question.isActive ? 'Aktif' : 'Pasif'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleToggle('question', question._id)}
                                  className={`p-2 rounded text-sm ${question.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                                  title={question.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                >
                                  {question.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                                </button>
                                <button 
                                  onClick={() => openModal('question', question)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded text-sm"
                                  title="Düzenle"
                                >
                                  <FiEdit />
                                </button>
                                <button 
                                  onClick={() => handleDelete('question', question._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded text-sm"
                                  title="Sil"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Seviyesi olmayan sorular */}
              {(() => {
                const unassignedQuestions = questions.filter(q => 
                  !levels.some(level => level.level === q.level)
                );
                
                if (unassignedQuestions.length === 0) return null;
                
                return (
                  <div className="mb-8">
                    <div className="bg-gray-500 text-white p-3 sm:p-4 rounded-t-lg">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Seviyesi Belirsiz Sorular
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {unassignedQuestions.length} soru
                      </p>
                    </div>
                    
                    <div className="border border-t-0 rounded-b-lg p-2 sm:p-4 bg-gray-50">
                      <div className="grid gap-3 sm:gap-4">
                        {unassignedQuestions.map((question) => (
                          <div key={question._id} className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 text-sm sm:text-base break-words">{question.text}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Seviye: {question.level} | Doğru Cevap: {question.correctAnswer}
                                </p>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => openModal('question', question)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded text-sm"
                                  title="Düzenle"
                                >
                                  <FiEdit />
                                </button>
                                <button 
                                  onClick={() => handleDelete('question', question._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded text-sm"
                                  title="Sil"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'levels' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Seviyeler ({levels.length})</h2>
                  <p className="text-sm text-gray-600">Sayfa {currentLevelPage} / {Math.ceil(levels.length / levelsPerPage)}</p>
                </div>
                <button
                  onClick={() => openModal('level')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <FiPlus /> Yeni Seviye
                </button>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentLevelPage(Math.max(1, currentLevelPage - 1))}
                    disabled={currentLevelPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm"
                  >
                    ← Önceki
                  </button>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                    {currentLevelPage}
                  </span>
                  <button
                    onClick={() => setCurrentLevelPage(Math.min(Math.ceil(levels.length / levelsPerPage), currentLevelPage + 1))}
                    disabled={currentLevelPage >= Math.ceil(levels.length / levelsPerPage)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm"
                  >
                    Sonraki →
                  </button>
                </div>
              </div>
              
              <div className="grid gap-3 sm:gap-4">
                {levels
                  .slice((currentLevelPage - 1) * levelsPerPage, currentLevelPage * levelsPerPage)
                  .map((level) => (
                  <div key={level._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{level.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Seviye: {level.level} | Aktif Soru: {level.activeQuestionCount || 0} | Toplam Soru: {level.totalQuestionCount || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Geçme Puanı: %{level.passingScore} | Süre: {level.timeLimit} dk | Durum: {level.isActive ? 'Aktif' : 'Pasif'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggle('level', level._id)}
                          className={`p-2 rounded ${level.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                          title={level.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {level.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button 
                          onClick={() => openModal('level', level)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Düzenle"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete('level', level._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
              </div>
              
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{user.username}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Email: {user.email} | Rol: {user.role}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')} | 
                          Durum: {user.isApproved ? 'Onaylı' : 'Onay Bekliyor'}
                        </p>
                        {user.approvedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Onaylandı: {new Date(user.approvedAt).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {user.role !== 'admin' && (
                          <>
                            {user.isApproved ? (
                              <button 
                                onClick={() => handleDisapproveUser(user._id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                              >
                                Onayı Kaldır
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApproveUser(user._id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                              >
                                Onayla
                              </button>
                            )}
                            <button 
                              onClick={() => openPasswordModal(user)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                            >
                              Şifre Değiştir
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                            >
                              Sil
                            </button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingItem ? 'Düzenle' : 'Yeni Ekle'} - {modalType === 'question' ? 'Soru' : 'Seviye'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'question' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soru Metni
                    </label>
                    <textarea
                      value={formData.text || ''}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      required
                      placeholder="Bagaj ile ilgili sorunuzu yazın..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doğru Cevap
                      </label>
                      <select
                        value={formData.correctAnswer || 'clean'}
                        onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="clean">Bagaj Temiz</option>
                        <option value="dirty">Bagaj Kirli</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seviye
                      </label>
                      <select
                        value={formData.level || 1}
                        onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {levels.map((level) => (
                          <option key={level._id} value={level.level}>
                            Seviye {level.level} - {level.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kirli Bagaj Seçenekleri */}
                  {formData.correctAnswer === 'dirty' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-red-800 mb-3">Kirli Bagaj Seçenekleri</h4>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doğru Kirli Sebebi
                        </label>
                        <select
                          value={formData.dirtyReason || ''}
                          onChange={(e) => setFormData({...formData, dirtyReason: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Doğru sebebi seçin</option>
                          <option value="explosive_device">Patlayıcı Madde Düzeneği (Bomba)</option>
                          <option value="weapon_parts">Silah / Silah Parçası / Mermi / Fişek</option>
                          <option value="sharp_objects">Kesici/Delici Alet</option>
                          <option value="martial_arts_equipment">Dövüş Sanatları Ekipmanı</option>
                          <option value="gas_bomb">EL / GAZ / SİS Bombası</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kullanıcıya Gösterilecek Kirli Seçenekleri
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                          Kullanıcının seçebileceği kirli seçeneklerini belirleyin (doğru cevabı da dahil etmeyi unutmayın)
                        </p>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { value: 'explosive_device', label: 'Patlayıcı Madde Düzeneği (Bomba)' },
                            { value: 'weapon_parts', label: 'Silah / Silah Parçası / Mermi / Fişek' },
                            { value: 'sharp_objects', label: 'Kesici/Delici Alet' },
                            { value: 'martial_arts_equipment', label: 'Dövüş Sanatları Ekipmanı' },
                            { value: 'gas_bomb', label: 'EL / GAZ / SİS Bombası' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.dirtyOptions?.some(opt => opt.value === option.value) || false}
                                onChange={(e) => {
                                  const currentOptions = formData.dirtyOptions || [];
                                  if (e.target.checked) {
                                    const newOptions = [...currentOptions, { value: option.value, label: option.label }];
                                    setFormData({...formData, dirtyOptions: newOptions});
                                  } else {
                                    const newOptions = currentOptions.filter(opt => opt.value !== option.value);
                                    setFormData({...formData, dirtyOptions: newOptions});
                                  }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Puan
                      </label>
                      <input
                        type="number"
                        value={formData.points || 10}
                        onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zorluk
                      </label>
                      <select
                        value={formData.difficulty || 'medium'}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="easy">Kolay</option>
                        <option value="medium">Orta</option>
                        <option value="hard">Zor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama (İsteğe bağlı)
                    </label>
                    <textarea
                      value={formData.explanation || ''}
                      onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Görsel Yükleme
                    </label>
                    
                    {/* Dosya Yükleme */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">📁 Dosya Seç:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          console.log('📁 Dosya seçildi:', file);
                          
                          if (file) {
                            // Dosya boyutu kontrolü (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Dosya boyutu 5MB\'dan büyük olamaz!');
                              return;
                            }
                            
                            // Dosya tipi kontrolü
                            if (!file.type.startsWith('image/')) {
                              alert('Sadece görsel dosyaları yükleyebilirsiniz!');
                              return;
                            }
                            
                            setSelectedImage(file);
                            console.log('✅ Dosya kabul edildi:', {
                              name: file.name,
                              size: file.size,
                              type: file.type
                            });
                            
                            // Base64 encoding için
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              console.log('📖 FileReader başarılı');
                              const base64Data = e.target.result;
                              setFormData({
                                ...formData, 
                                imagePreview: base64Data, 
                                imageBase64: base64Data,
                                imageUrl: ''
                              });
                            };
                            reader.onerror = (e) => {
                              console.error('❌ FileReader hatası:', e);
                              alert('Dosya okunamadı!');
                            };
                            reader.readAsDataURL(file);
                          } else {
                            console.log('❌ Dosya seçilmedi');
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* URL Girişi */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">🔗 Veya URL Gir:</label>
                      <input
                        type="url"
                        value={formData.imageUrl || ''}
                        onChange={(e) => {
                          setFormData({...formData, imageUrl: e.target.value, imagePreview: e.target.value});
                          setSelectedImage(null); // Dosya seçimini temizle
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://kysqxbcvszzxgjpjmahs.supabase.co/storage/v1/object/public/images/k.bagaj/example.jpg"
                      />
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      💡 Dosya yükleyin VEYA URL girin (Supabase, Unsplash, vb.). Desteklenen: JPG, PNG, GIF, WebP
                    </p>

                    {/* Önizleme */}
                    {formData.imagePreview && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">👁️ Önizleme:</p>
                        <div className="border rounded bg-gray-50 p-2">
                          <img 
                            src={formData.imagePreview} 
                            alt="Görsel önizleme" 
                            className="max-w-full h-32 object-contain mx-auto block"
                            onLoad={() => console.log('✅ Önizleme yüklendi')}
                            onError={(e) => {
                              console.error('❌ Önizleme hatası:', formData.imagePreview);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                          <p className="text-xs text-red-500 text-center hidden">❌ Önizleme yüklenemedi</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Dosya bilgisi */}
                    {selectedImage && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">
                          📁 <strong>{selectedImage.name}</strong> ({(selectedImage.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {modalType === 'level' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seviye Adı
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seviye Numarası
                      </label>
                      <input
                        type="number"
                        value={formData.levelNumber || 1}
                        onChange={(e) => setFormData({...formData, levelNumber: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        required
                        disabled={editingItem} // Düzenlerken seviye numarası değiştirilemez
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Geçme Puanı (%)
                      </label>
                      <input
                        type="number"
                        value={formData.passingScore || 70}
                        onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Süre (dakika)
                      </label>
                      <input
                        type="number"
                        value={formData.timeLimit || 30}
                        onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Soru Sayısı
                      </label>
                      <input
                        type="number"
                        value={formData.questionCount || 10}
                        onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FiSave /> Kaydet
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Şifre Değiştirme Modalı */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Şifre Değiştir</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Kullanıcı:</strong> {selectedUser.username}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                <strong>Email:</strong> {selectedUser.email}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifreyi girin (min. 6 karakter)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Şifre en az 6 karakter olmalıdır
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                onClick={handleChangePassword}
                disabled={!newPassword || newPassword.length < 4}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Şifreyi Değiştir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;