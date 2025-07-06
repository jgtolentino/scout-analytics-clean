const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const Store = require('electron-store')

// Initialize electron store
const store = new Store()

// Keep a global reference of the window object
let mainWindow
let serverPort = 3030
let expressApp
let wsServer

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  })

  // Load the app
  mainWindow.loadFile('renderer/index.html')

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // Focus on window
    if (process.platform === 'darwin') {
      mainWindow.focus()
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Set up menu
  createMenu()
  
  // Start local server
  startLocalServer()
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-task')
        },
        {
          label: 'Open Task',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Hawk Tasks', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0]
              try {
                const content = fs.readFileSync(filePath, 'utf-8')
                const task = JSON.parse(content)
                mainWindow.webContents.send('menu-open-task', task)
              } catch (error) {
                dialog.showErrorBox('Error', `Failed to open task: ${error.message}`)
              }
            }
          }
        },
        {
          label: 'Save Task',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save-task')
        },
        { type: 'separator' },
        {
          label: 'Import Recording',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0]
              try {
                const content = fs.readFileSync(filePath, 'utf-8')
                const recording = JSON.parse(content)
                mainWindow.webContents.send('menu-import-recording', recording)
              } catch (error) {
                dialog.showErrorBox('Error', `Failed to import recording: ${error.message}`)
              }
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Task',
      submenu: [
        {
          label: 'Run Task',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.send('menu-run-task')
        },
        {
          label: 'Stop Task',
          accelerator: 'CmdOrCtrl+.',
          click: () => mainWindow.webContents.send('menu-stop-task')
        },
        { type: 'separator' },
        {
          label: 'Validate Task',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow.webContents.send('menu-validate-task')
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://hawk.insightpulseai.com/docs')
        },
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/insightpulseai/hawk-sdk')
        },
        { type: 'separator' },
        {
          label: 'About Hawk Studio',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Hawk Studio',
              message: 'Hawk Studio v1.0.0',
              detail: 'Visual automation builder for Hawk SDK\\n\\n© 2025 InsightPulseAI',
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function startLocalServer() {
  expressApp = express()
  
  // Middleware
  expressApp.use(cors())
  expressApp.use(express.json({ limit: '50mb' }))
  expressApp.use(express.static(path.join(__dirname, '../renderer')))

  // API Routes
  expressApp.get('/api/status', (req, res) => {
    res.json({ status: 'running', version: '1.0.0' })
  })

  expressApp.post('/api/hawk/execute', async (req, res) => {
    try {
      const { task } = req.body
      
      // Send task to main window for execution
      mainWindow.webContents.send('execute-task', task)
      
      const executionId = `exec_${Date.now()}`
      res.json({ 
        success: true, 
        executionId,
        message: 'Task execution started'
      })
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      })
    }
  })

  expressApp.get('/api/hawk/sessions', (req, res) => {
    // Get sessions from store
    const sessions = store.get('sessions', [])
    res.json(sessions)
  })

  // Start server
  const server = expressApp.listen(serverPort, 'localhost', () => {
    console.log(`Hawk Studio API server running on http://localhost:${serverPort}`)
  })

  // WebSocket server for real-time communication
  wsServer = new WebSocket.Server({ server })
  
  wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected')
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data)
        handleWebSocketMessage(ws, message)
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    })
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })
}

function handleWebSocketMessage(ws, message) {
  switch (message.type) {
    case 'subscribe':
      // Subscribe to session updates
      ws.sessionId = message.sessionId
      break
      
    case 'taskUpdate':
      // Broadcast task updates to subscribed clients
      broadcastToSubscribers(message)
      break
      
    default:
      console.log('Unknown WebSocket message type:', message.type)
  }
}

function broadcastToSubscribers(message) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('store-get', (event, key) => {
  return store.get(key)
})

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value)
  return true
})

// App event handlers
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  // Clean up
  if (wsServer) {
    wsServer.close()
  }
})