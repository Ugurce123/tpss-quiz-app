import { useState, useEffect } from 'react';
import './Statistics.css';

const Statistics = () => {
  const [generalStats, setGeneralStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPerformance, setUserPerformance] = useState(null);
  const [levelStats, setLevelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Genel istatistikler
      const generalResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/statistics/general`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!generalResponse.ok) {
        throw new Error(`General stats error: ${generalResponse.status}`);
      }
      const generalData = await generalResponse.json();
      setGeneralStats(generalData);

      // Liderlik tablosu
      const leaderboardResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/statistics/leaderboard?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!leaderboardResponse.ok) {
        throw new Error(`Leaderboard error: ${leaderboardResponse.status}`);
      }
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData);

      // Kullanıcı performansı
      const performanceResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/statistics/user-performance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!performanceResponse.ok) {
        throw new Error(`Performance error: ${performanceResponse.status}`);
      }
      const performanceData = await performanceResponse.json();
      setUserPerformance(performanceData);

      // Seviye istatistikleri
      const levelsResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/statistics/levels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!levelsResponse.ok) {
        throw new Error(`Levels error: ${levelsResponse.status}`);
      }
      const levelsData = await levelsResponse.json();
      setLevelStats(levelsData);

    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      // Hata durumunda boş veriler set et
      setGeneralStats({
        totalUsers: 0,
        totalLevels: 0,
        totalQuestions: 0,
        activeUsers: 0,
        highestLevel: 0
      });
      setLeaderboard([]);
      setUserPerformance({
        username: 'Bilinmiyor',
        currentLevel: 0,
        completedLevels: 0,
        totalScore: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
        averageScore: 0,
        recentActivity: 0,
        testHistory: []
      });
      setLevelStats([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>📊 İstatistikler ve Analiz</h1>
        <p>Sistem performansı ve kullanıcı analizleri</p>
      </div>

      <div className="statistics-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Genel İstatistikler
        </button>
        <button 
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Liderlik Tablosu
        </button>
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Kişisel Performans
        </button>
        <button 
          className={`tab-button ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          Seviye Analizi
        </button>
      </div>

      <div className="statistics-content">
        {activeTab === 'general' && generalStats && (
          <div className="general-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{generalStats?.totalUsers || 0}</h3>
                  <p>Toplam Kullanıcı</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{generalStats?.activeUsers || 0}</h3>
                  <p>Aktif Kullanıcı (7 gün)</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <h3>{generalStats?.totalLevels || 0}</h3>
                  <p>Toplam Seviye</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-info">
                  <h3>{generalStats?.totalQuestions || 0}</h3>
                  <p>Toplam Soru</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <h3>{generalStats?.highestLevel || 0}</h3>
                  <p>En Yüksek Seviye</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard">
            <h2>🏆 Liderlik Tablosu</h2>
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Sıra</span>
                <span>Kullanıcı</span>
                <span>Seviye</span>
                <span>Tamamlanan</span>
                <span>Puan</span>
              </div>
              {(leaderboard || []).map((user, index) => (
                <div key={user?.username || index} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                  <span className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && (user?.rank || index + 1)}
                  </span>
                  <span className="username">{user?.username || 'Bilinmiyor'}</span>
                  <span className="level">{user?.currentLevel || 0}</span>
                  <span className="completed">{user?.completedLevels || 0}</span>
                  <span className="score">{user?.totalScore || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && userPerformance && (
          <div className="user-performance">
            <h2>📈 Kişisel Performans - {userPerformance.username}</h2>
            
            <div className="performance-grid">
              <div className="performance-card">
                <h3>Genel Durum</h3>
                <div className="performance-stats">
                  <div className="stat-item">
                    <span className="label">Mevcut Seviye:</span>
                    <span className="value">{userPerformance.currentLevel}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Tamamlanan Seviyeler:</span>
                    <span className="value">{userPerformance.completedLevels}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Toplam Puan:</span>
                    <span className="value">{userPerformance.totalScore}</span>
                  </div>
                </div>
              </div>

              <div className="performance-card">
                <h3>Test Performansı</h3>
                <div className="performance-stats">
                  <div className="stat-item">
                    <span className="label">Toplam Test:</span>
                    <span className="value">{userPerformance.totalTests}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Başarılı:</span>
                    <span className="value success">{userPerformance.passedTests}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Başarısız:</span>
                    <span className="value fail">{userPerformance.failedTests}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Başarı Oranı:</span>
                    <span className="value">{userPerformance.successRate}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Ortalama Puan:</span>
                    <span className="value">{userPerformance.averageScore}</span>
                  </div>
                </div>
              </div>

              <div className="performance-card">
                <h3>Son Aktivite</h3>
                <div className="performance-stats">
                  <div className="stat-item">
                    <span className="label">Son 7 Günde Test:</span>
                    <span className="value">{userPerformance.recentActivity}</span>
                  </div>
                </div>
              </div>
            </div>

            {userPerformance.testHistory && userPerformance.testHistory.length > 0 && (
              <div className="test-history">
                <h3>Son Test Geçmişi</h3>
                <div className="history-list">
                  {userPerformance.testHistory.slice(-5).reverse().map((test, index) => (
                    <div key={index} className={`history-item ${test.passed ? 'passed' : 'failed'}`}>
                      <span className="test-level">Seviye {test.level}</span>
                      <span className="test-score">{test.score} puan</span>
                      <span className="test-result">{test.passed ? '✅ Başarılı' : '❌ Başarısız'}</span>
                      <span className="test-date">
                        {new Date(test.completedAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'levels' && (
          <div className="level-stats">
            <h2>📊 Seviye Analizi</h2>
            <div className="levels-grid">
              {levelStats.slice(0, 20).map((level) => (
                <div key={level.level} className="level-stat-card">
                  <div className="level-header">
                    <h4>Seviye {level.level}</h4>
                    <span className="level-name">{level.name}</span>
                  </div>
                  <div className="level-metrics">
                    <div className="metric">
                      <span className="metric-label">Bu seviyede:</span>
                      <span className="metric-value">{level.usersAtLevel} kullanıcı</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Tamamlayan:</span>
                      <span className="metric-value">{level.usersCompleted} kullanıcı</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Başarı oranı:</span>
                      <span className="metric-value">{level.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;