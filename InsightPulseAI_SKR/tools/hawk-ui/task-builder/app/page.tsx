'use client'

import React, { useState, useCallback } from 'react'
import { TaskBuilder } from '@/components/TaskBuilder'
import { ActionPalette } from '@/components/ActionPalette'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { PreviewPanel } from '@/components/PreviewPanel'
import { Toolbar } from '@/components/Toolbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  Play, 
  Download, 
  Upload,
  Zap,
  Eye,
  Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export interface TaskStep {
  id: string
  type: 'click' | 'type' | 'keypress' | 'wait' | 'screenshot' | 'condition'
  label: string
  properties: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

export interface TaskFlow {
  id: string
  name: string
  description: string
  goal: string
  steps: TaskStep[]
  variables: Record<string, any>
}

export default function TaskBuilderApp() {
  const [currentFlow, setCurrentFlow] = useState<TaskFlow>({
    id: 'new-flow',
    name: 'New Task',
    description: '',
    goal: '',
    steps: [],
    variables: {}
  })
  
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleAddStep = useCallback((stepType: string) => {
    const newStep: TaskStep = {
      id: `step_${Date.now()}`,
      type: stepType as any,
      label: `${stepType.charAt(0).toUpperCase() + stepType.slice(1)} Action`,
      properties: getDefaultProperties(stepType),
      position: { x: 100, y: 100 },
      connections: []
    }
    
    setCurrentFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
    
    setSelectedStep(newStep.id)
  }, [])

  const handleUpdateStep = useCallback((stepId: string, updates: Partial<TaskStep>) => {
    setCurrentFlow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }))
  }, [])

  const handleDeleteStep = useCallback((stepId: string) => {
    setCurrentFlow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
    
    if (selectedStep === stepId) {
      setSelectedStep(null)
    }
  }, [selectedStep])

  const handleSaveFlow = async () => {
    try {
      const response = await fetch('/api/hawk/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFlow)
      })
      
      if (response.ok) {
        toast.success('Task flow saved successfully')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Failed to save task flow')
    }
  }

  const handleExecuteFlow = async () => {
    try {
      const response = await fetch('/api/hawk/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow: currentFlow,
          platform: 'linux',
          use_e2b: true
        })
      })
      
      if (response.ok) {
        const execution = await response.json()
        toast.success(`Execution started: ${execution.id}`)
      } else {
        throw new Error('Failed to execute')
      }
    } catch (error) {
      toast.error('Failed to execute task flow')
    }
  }

  const handleExportFlow = () => {
    const dataStr = JSON.stringify(currentFlow, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentFlow.name.replace(/\s+/g, '_')}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Task flow exported')
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              🛠️ Hawk Task Builder
            </h1>
            <div className="flex items-center space-x-2">
              <Input
                value={currentFlow.name}
                onChange={(e) => setCurrentFlow(prev => ({ ...prev, name: e.target.value }))}
                className="w-40"
                placeholder="Task name"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveFlow}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportFlow}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleExecuteFlow}>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Action Palette */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <ActionPalette onAddStep={handleAddStep} />
        </div>

        {/* Center - Task Builder Canvas */}
        <div className="flex-1 relative">
          <TaskBuilder
            flow={currentFlow}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
          />
          
          {/* Toolbar */}
          <div className="absolute top-4 left-4">
            <Toolbar flow={currentFlow} />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {selectedStep ? (
            <PropertiesPanel
              step={currentFlow.steps.find(s => s.id === selectedStep)!}
              onUpdate={(updates) => handleUpdateStep(selectedStep, updates)}
            />
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Task Properties</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal">Goal Description</Label>
                  <Textarea
                    id="goal"
                    value={currentFlow.goal}
                    onChange={(e) => setCurrentFlow(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="Describe what this task should accomplish..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentFlow.description}
                    onChange={(e) => setCurrentFlow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {isPreviewOpen && (
        <PreviewPanel 
          flow={currentFlow}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  )
}

function getDefaultProperties(stepType: string): Record<string, any> {
  switch (stepType) {
    case 'click':
      return {
        target: '',
        button: 'left',
        delay: 0.1
      }
    case 'type':
      return {
        text: '',
        delay: 0.05
      }
    case 'keypress':
      return {
        keys: [],
        delay: 0.1
      }
    case 'wait':
      return {
        duration: 1.0
      }
    case 'screenshot':
      return {
        filename: 'screenshot.png'
      }
    case 'condition':
      return {
        type: 'element_exists',
        selector: '',
        timeout: 5.0
      }
    default:
      return {}
  }
}