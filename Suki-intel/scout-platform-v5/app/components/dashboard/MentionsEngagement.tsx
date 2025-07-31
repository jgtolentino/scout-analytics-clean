'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageCircle, Heart, Share2, TrendingUp } from 'lucide-react';

interface MentionsEngagementProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    platforms?: string[];
    metrics?: string[];
  };
  className?: string;
}

export const MentionsEngagement: React.FC<MentionsEngagementProps> = ({
  id,
  label = "Social Media Mentions & Engagement",
  config,
  className
}) => {
  // Mock data for social media engagement
  const engagementData = [
    { platform: 'Facebook', mentions: 2345, engagement: 87.5, sentiment: 82 },
    { platform: 'Instagram', mentions: 1890, engagement: 92.3, sentiment: 88 },
    { platform: 'Twitter', mentions: 3456, engagement: 78.2, sentiment: 75 },
    { platform: 'TikTok', mentions: 987, engagement: 95.7, sentiment: 90 },
  ];

  const timeSeriesData = [
    { date: 'Mon', mentions: 450, engagement: 85 },
    { date: 'Tue', mentions: 520, engagement: 88 },
    { date: 'Wed', mentions: 480, engagement: 82 },
    { date: 'Thu', mentions: 620, engagement: 90 },
    { date: 'Fri', mentions: 580, engagement: 87 },
    { date: 'Sat', mentions: 720, engagement: 92 },
    { date: 'Sun', mentions: 690, engagement: 89 },
  ];

  const topMentions = [
    { topic: 'Product Launch', count: 1234, sentiment: 'positive' },
    { topic: 'Customer Service', count: 987, sentiment: 'neutral' },
    { topic: 'Pricing', count: 654, sentiment: 'mixed' },
    { topic: 'Quality', count: 543, sentiment: 'positive' },
  ];

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">{label}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Platform Performance</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mentions" fill="#3563E9" name="Mentions" />
                <Bar dataKey="engagement" fill="#FFC300" name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Series */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Weekly Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mentions" stroke="#3563E9" name="Mentions" />
                <Line type="monotone" dataKey="engagement" stroke="#27AE60" name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">8.9K</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total Mentions</p>
            <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">45.2K</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total Likes</p>
            <p className="text-xs text-green-600 mt-1">+8% vs last week</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Share2 className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">12.3K</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Shares</p>
            <p className="text-xs text-green-600 mt-1">+15% vs last week</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">87%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Positive Sentiment</p>
            <p className="text-xs text-green-600 mt-1">+3% vs last week</p>
          </div>
        </div>

        {/* Top Mentions */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Mentions</h4>
          <div className="space-y-2">
            {topMentions.map((mention, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{mention.topic}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mention.sentiment}
                  </span>
                </div>
                <span className="text-sm font-medium">{mention.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MentionsEngagement;