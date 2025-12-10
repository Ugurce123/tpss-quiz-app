const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

function startServer() {
  const serverPath = path.join(__dirname, '../server/index.js');
  
  serverProcess = spawn('node', [serverPath], {
    stdio: 'pipe',
    cwd: path.join(__dirname, '../server')
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../client/public/favicon.ico'),
    show: false,
    titleBarStyle: 'default'
  });

  // Uygulama yüklendiğinde göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Geliştirme modunda geliştirici araçlarını aç
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Uygulama URL'sini yükle
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../client/build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Pencere kapandığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menüyü ayarla
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Yeni',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-quiz');
          }
        },
        {
          label: 'Çıkış',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        {
          label: 'Yenile',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          label: 'Tam Ekran',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'Geliştirici Araçları',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
          visible: isDev
        }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'Hakkında',
          click: () => {
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Hakkında',
              message: 'Baggage Quiz App',
              detail: 'Versiyon 1.0.0\n\nBaggage Security Quiz Application'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  // Sunucuyu başlat
  startServer();
  
  // Sunucunun başlamasını bekle (2 saniye)
  setTimeout(() => {
    createWindow();
  }, 2000);
});

// Tüm pencereler kapandığında uygulamadan çık (macOS hariç)
app.on('window-all-closed', () => {
  // Sunucu sürecini sonlandır
  if (serverProcess) {
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS'ta dock'a tıklandığında pencereyi yeniden oluştur
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC olaylarını dinle
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

// Güvenlik için yeni pencere oluşturma olaylarını engelle
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});