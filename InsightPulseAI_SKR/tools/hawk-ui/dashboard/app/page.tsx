'use client'

import React, { useState, useEffect } from 'react'
import { SessionMonitor } from '@/components/SessionMonitor'
import { TaskQueue } from '@/components/TaskQueue'
import { MetricsDashboard } from '@/components/MetricsDashboard'
import { ScreenViewer } from '@/components/ScreenViewer'
import { CostTracker } from '@/components/CostTracker'
import { LogViewer } from '@/components/LogViewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Settings, Activity, DollarSign, Eye, FileText } from 'lucide-react'
import { useHawkConnection } from '@/hooks/useHawkConnection'
import { toast } from 'react-hot-toast'

interface HawkSession {
  id: string
  goal: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  platform: string
  cost: number
  steps: number
  latency: number
}

export default function HawkDashboard() {
  const { connection, sessions, metrics, isConnected } = useHawkConnection()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('sessions')

  const handleStartSession = async (goal: string) => {
    try {
      const response = await fetch('/api/hawk/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, platform: 'linux', use_e2b: true })
      })
      
      if (response.ok) {
        const session = await response.json()
        toast.success(`Started session: ${session.id}`)
      } else {
        throw new Error('Failed to start session')
      }
    } catch (error) {
      toast.error('Failed to start session')
    }
  }

  const handleStopSession = async (sessionId: string) => {
    try {
      await fetch(`/api/hawk/sessions/${sessionId}/stop`, { method: 'POST' })
      toast.success('Session stopped')
    } catch (error) {
      toast.error('Failed to stop session')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🦅 Hawk Dashboard</h1>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {sessions.filter(s => s.status === 'running').length} active sessions
              </span>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="viewer" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Screen
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Session Control */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage and monitor Hawk automation sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionMonitor 
                    sessions={sessions}
                    onStart={handleStartSession}
                    onStop={handleStopSession}
                    onSelect={setSelectedSession}
                  />
                </CardContent>
              </Card>

              {/* Task Queue */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Queue</CardTitle>
                  <CardDescription>
                    Pending and running tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskQueue sessionId={selectedSession} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <MetricsDashboard metrics={metrics} />
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <CostTracker sessions={sessions} />
          </TabsContent>

          <TabsContent value="viewer" className="space-y-6">
            <ScreenViewer sessionId={selectedSession} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogViewer sessionId={selectedSession} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}