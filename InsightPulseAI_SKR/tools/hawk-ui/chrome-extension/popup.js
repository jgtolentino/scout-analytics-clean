class HawkRecorder {
    constructor() {
        this.isRecording = false
        this.isPaused = false
        this.actions = []
        this.startTime = null
        this.timer = null
        
        this.initializeElements()
        this.bindEvents()
        this.loadState()
    }

    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            actionCount: document.getElementById('actionCount'),
            duration: document.getElementById('duration'),
            taskName: document.getElementById('taskName'),
            actionsList: document.getElementById('actionsList'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            exportPythonBtn: document.getElementById('exportPythonBtn'),
            sendToBuilderBtn: document.getElementById('sendToBuilderBtn'),
            settingsBtn: document.getElementById('settingsBtn')
        }
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startRecording())
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording())
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause())
        this.elements.exportJsonBtn.addEventListener('click', () => this.exportJSON())
        this.elements.exportPythonBtn.addEventListener('click', () => this.exportPython())
        this.elements.sendToBuilderBtn.addEventListener('click', () => this.sendToBuilder())
        this.elements.taskName.addEventListener('input', () => this.saveState())
    }

    async startRecording() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            })

            this.isRecording = true
            this.isPaused = false
            this.actions = []
            this.startTime = Date.now()
            
            // Start timer
            this.timer = setInterval(() => this.updateDuration(), 1000)
            
            // Update UI
            this.updateUI()
            this.updateActionsList()
            
            // Send message to content script
            await chrome.tabs.sendMessage(tab.id, { action: 'startRecording' })
            
            // Listen for recorded actions
            this.listenForActions()
            
        } catch (error) {
            console.error('Failed to start recording:', error)
            this.updateStatus('Error starting recording', 'error')
        }
    }

    async stopRecording() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            
            this.isRecording = false
            this.isPaused = false
            
            // Clear timer
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
            
            // Update UI
            this.updateUI()
            
            // Send message to content script
            await chrome.tabs.sendMessage(tab.id, { action: 'stopRecording' })
            
            this.updateStatus('Recording stopped', 'success')
            this.saveState()
            
        } catch (error) {
            console.error('Failed to stop recording:', error)
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused
        this.updateUI()
        
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { 
                action: this.isPaused ? 'pauseRecording' : 'resumeRecording' 
            })
        })
    }

    listenForActions() {
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'actionRecorded') {
                this.addAction(message.action)
            }
        })
    }

    addAction(action) {
        if (!this.isRecording || this.isPaused) return
        
        const timestamp = Date.now() - this.startTime
        const actionWithTimestamp = {
            ...action,
            timestamp,
            id: `action_${this.actions.length + 1}`
        }
        
        this.actions.push(actionWithTimestamp)
        this.updateActionsList()
        this.updateUI()
        this.saveState()
    }

    updateUI() {
        // Update buttons
        this.elements.startBtn.disabled = this.isRecording
        this.elements.stopBtn.disabled = !this.isRecording
        this.elements.pauseBtn.disabled = !this.isRecording
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause'
        
        // Update export buttons
        const hasActions = this.actions.length > 0
        this.elements.exportJsonBtn.disabled = !hasActions
        this.elements.exportPythonBtn.disabled = !hasActions
        this.elements.sendToBuilderBtn.disabled = !hasActions
        
        // Update status
        if (this.isRecording) {
            this.updateStatus(this.isPaused ? 'Paused' : 'Recording...', 'recording')
        } else {
            this.updateStatus('Ready', 'ready')
        }
        
        // Update action count
        this.elements.actionCount.textContent = this.actions.length
    }

    updateStatus(text, type) {
        this.elements.statusText.textContent = text
        this.elements.statusIndicator.className = `status-indicator ${type}`
    }

    updateDuration() {
        if (!this.startTime || this.isPaused) return
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0')
        const seconds = (elapsed % 60).toString().padStart(2, '0')
        this.elements.duration.textContent = `${minutes}:${seconds}`
    }

    updateActionsList() {
        const container = this.elements.actionsList
        
        if (this.actions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No actions recorded yet</p>
                    <p class="hint">Click "Start Recording" and interact with the page</p>
                </div>
            `
            return
        }
        
        container.innerHTML = this.actions.map((action, index) => `
            <div class="action-item" data-action-id="${action.id}">
                <div class="action-header">
                    <span class="action-type">${this.getActionIcon(action.type)} ${action.type}</span>
                    <span class="action-timestamp">${this.formatTimestamp(action.timestamp)}</span>
                </div>
                <div class="action-details">${this.getActionDetails(action)}</div>
                <button class="action-delete" onclick="recorder.deleteAction('${action.id}')">×</button>
            </div>
        `).join('')
    }

    getActionIcon(type) {
        const icons = {
            click: '👆',
            type: '⌨️',
            scroll: '📜',
            navigate: '🔗',
            screenshot: '📸'
        }
        return icons[type] || '•'
    }

    getActionDetails(action) {
        switch (action.type) {
            case 'click':
                return `Element: ${action.selector || action.text || 'Unknown'}`
            case 'type':
                return `Text: "${action.text}"`
            case 'scroll':
                return `Direction: ${action.direction}, Amount: ${action.amount}px`
            case 'navigate':
                return `URL: ${action.url}`
            default:
                return JSON.stringify(action.data || {})
        }
    }

    formatTimestamp(ms) {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    deleteAction(actionId) {
        this.actions = this.actions.filter(action => action.id !== actionId)
        this.updateActionsList()
        this.updateUI()
        this.saveState()
    }

    exportJSON() {
        const taskFlow = {
            name: this.elements.taskName.value || 'Recorded Task',
            description: `Task recorded at ${new Date().toLocaleString()}`,
            goal: 'Automated task created from browser recording',
            steps: this.actions.map((action, index) => ({
                step_id: `s${index + 1}`,
                action: action.type,
                target: action.selector,
                keys: action.text,
                delay: 0.1,
                confidence: 0.8,
                timestamp: action.timestamp
            }))
        }
        
        this.downloadFile(JSON.stringify(taskFlow, null, 2), 'hawk-task.json', 'application/json')
    }

    exportPython() {
        const taskName = this.elements.taskName.value || 'recorded_task'
        const pythonCode = this.generatePythonCode(taskName)
        this.downloadFile(pythonCode, `${taskName}.py`, 'text/plain')
    }

    generatePythonCode(taskName) {
        const imports = `from hawk import Session

def ${taskName}():
    \"\"\"
    Automated task generated from Hawk Recorder
    Recorded at: ${new Date().toLocaleString()}
    \"\"\"
    with Session(goal="${this.elements.taskName.value || 'Recorded task'}", use_e2b=True) as sess:
`

        const steps = this.actions.map((action, index) => {
            switch (action.type) {
                case 'click':
                    return `        # Step ${index + 1}: Click element
        sess.motor_controller.click((${action.x || 0}, ${action.y || 0}))`
                case 'type':
                    return `        # Step ${index + 1}: Type text
        sess.motor_controller.type_text("${action.text || ''}")`
                case 'scroll':
                    return `        # Step ${index + 1}: Scroll
        sess.motor_controller.scroll(${action.amount || 0})`
                default:
                    return `        # Step ${index + 1}: ${action.type}
        # TODO: Implement ${action.type} action`
            }
        }).join('\n')

        const footer = `
        
        return True

if __name__ == "__main__":
    ${taskName}()
`

        return imports + steps + footer
    }

    async sendToBuilder() {
        try {
            const taskFlow = {
                name: this.elements.taskName.value || 'Recorded Task',
                description: `Task recorded at ${new Date().toLocaleString()}`,
                goal: 'Automated task created from browser recording',
                actions: this.actions
            }
            
            // Open task builder with data
            const builderUrl = `chrome-extension://${chrome.runtime.id}/builder.html?data=${encodeURIComponent(JSON.stringify(taskFlow))}`
            await chrome.tabs.create({ url: builderUrl })
            
        } catch (error) {
            console.error('Failed to send to builder:', error)
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        
        URL.revokeObjectURL(url)
    }

    saveState() {
        chrome.storage.local.set({
            hawkRecorderState: {
                actions: this.actions,
                taskName: this.elements.taskName.value,
                isRecording: this.isRecording
            }
        })
    }

    async loadState() {
        try {
            const result = await chrome.storage.local.get('hawkRecorderState')
            const state = result.hawkRecorderState
            
            if (state) {
                this.actions = state.actions || []
                this.elements.taskName.value = state.taskName || ''
                this.updateActionsList()
                this.updateUI()
            }
        } catch (error) {
            console.error('Failed to load state:', error)
        }
    }
}

// Initialize recorder when popup loads
const recorder = new HawkRecorder()