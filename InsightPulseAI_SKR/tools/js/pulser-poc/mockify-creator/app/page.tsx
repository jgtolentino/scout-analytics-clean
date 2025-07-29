'use client';

import React from 'react';
import { DataBadgeWrapper } from '../src/components/DataBadge';
import { DonutRequestMode } from '../src/components/DonutRequestMode';
import { SankeySubstitutions } from '../src/components/SankeySubstitutions';

// Sample data for components
const requestModeData = [
  {
    request_mode: 'verbal',
    transaction_count: 4567,
    percentage: 45.7,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'point',
    transaction_count: 3211,
    percentage: 32.1,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'indirect',
    transaction_count: 1876,
    percentage: 18.8,
    data_quality_score: 0.9,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'unknown',
    transaction_count: 346,
    percentage: 3.4,
    data_quality_score: 0.5,
    data_coverage_pct: 1.0
  }
];

const substitutionData = [
  {
    source_brand: 'Coca-Cola',
    target_brand: 'Pepsi',
    total_value: 125000,
    substitution_count: 342,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Coca-Cola',
    target_brand: 'RC Cola',
    total_value: 45000,
    substitution_count: 128,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Sprite',
    target_brand: '7UP',
    total_value: 78000,
    substitution_count: 215,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Mountain Dew',
    target_brand: 'Sprite',
    total_value: 32000,
    substitution_count: 89,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Pepsi',
    target_brand: 'Coca-Cola',
    total_value: 98000,
    substitution_count: 267,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Scout Dashboard v5 - Component Showcase
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Mode Donut Chart */}
          <DonutRequestMode data={requestModeData} />
          
          {/* KPI Card with Data Badge */}
          <DataBadgeWrapper
            title="Monthly Revenue"
            quality={0.95}
            coverage={0.98}
            className="h-full"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 flex flex-col justify-center">
              <div className="text-4xl font-bold text-gray-900">₱2.45M</div>
              <div className="text-sm text-green-600 mt-2">↑ 12.5% from last month</div>
              <div className="mt-4 text-sm text-gray-600">
                <div>Total Transactions: 14,567</div>
                <div>Average Order Value: ₱168.23</div>
              </div>
            </div>
          </DataBadgeWrapper>
          
          {/* Brand Substitution Sankey */}
          <div className="lg:col-span-2">
            <SankeySubstitutions data={substitutionData} height={320} />
          </div>
          
          {/* Additional KPIs with Data Badges */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DataBadgeWrapper
              title="Customer Satisfaction"
              quality={0.88}
              coverage={0.92}
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">4.6/5.0</div>
                <div className="text-sm text-gray-600 mt-1">Based on 1,234 reviews</div>
              </div>
            </DataBadgeWrapper>
            
            <DataBadgeWrapper
              title="Inventory Turnover"
              quality={0.75}
              coverage={0.85}
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">8.2x</div>
                <div className="text-sm text-amber-600 mt-1">Below target of 10x</div>
              </div>
            </DataBadgeWrapper>
            
            <DataBadgeWrapper
              title="Store Performance"
              quality={0.65}
              coverage={0.70}
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">87%</div>
                <div className="text-sm text-red-600 mt-1">Data quality issues detected</div>
              </div>
            </DataBadgeWrapper>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Status:</strong> All Scout Dashboard v5 components are now implemented and functional. 
            Data badges indicate quality/coverage scores. The dashboard showcases brand substitution flows, 
            request mode analysis, and KPI monitoring with integrated data quality indicators.
          </p>
        </div>
      </div>
    </div>
  );
}