'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target, 
  Zap,
  DollarSign,
  Activity
} from 'lucide-react'

interface Session {
  id: string
  goal: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  platform: string
  cost: number
  steps: number
  latency: number
  progress?: number
  currentStep?: string
}

interface SessionMonitorProps {
  sessions: Session[]
  onStart: (goal: string) => void
  onStop: (sessionId: string) => void
  onSelect: (sessionId: string) => void
}

export function SessionMonitor({ sessions, onStart, onStop, onSelect }: SessionMonitorProps) {
  const [newGoal, setNewGoal] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGoal.trim()) {
      onStart(newGoal.trim())
      setNewGoal('')
    }
  }

  return (
    <div className="space-y-6">
      {/* New Session Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Start New Session</CardTitle>
          <CardDescription>
            Describe what you want Hawk to accomplish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="e.g. Export June P&L from QuickBooks"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newGoal.trim()}>
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card 
            key={session.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(session.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                    <h3 className="text-lg font-semibold truncate">
                      {session.goal}
                    </h3>
                    <Badge variant="outline">
                      {session.platform}
                    </Badge>
                  </div>
                  
                  {session.currentStep && (
                    <p className="text-sm text-gray-600 mb-3">
                      Current: {session.currentStep}
                    </p>
                  )}
                  
                  {session.progress !== undefined && (
                    <Progress value={session.progress} className="mb-3" />
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(session.startedAt).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {session.steps} steps
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {session.latency}ms avg
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${session.cost.toFixed(3)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {session.status === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStop(session.id)
                      }}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Badge variant={
                    session.status === 'running' ? 'default' :
                    session.status === 'completed' ? 'secondary' :
                    session.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {session.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first automation session above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}