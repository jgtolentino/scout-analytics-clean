#!/usr/bin/env python3
"""
E2B cost monitoring and Prometheus metrics exporter for Hawk.
Tracks VM usage and alerts on budget thresholds.
"""

import os
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List

# Optional Prometheus support
try:
    from prometheus_client import Counter, Gauge, Histogram, start_http_server
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    logging.warning("prometheus_client not installed. Metrics disabled.")

logger = logging.getLogger(__name__)


class E2BMetricsCollector:
    """Collects and exports E2B usage metrics."""
    
    def __init__(self, port: int = 9090):
        self.port = port
        
        if PROMETHEUS_AVAILABLE:
            # Define Prometheus metrics
            self.vm_seconds_total = Counter(
                'pulser_e2b_vm_seconds_total',
                'Total VM runtime seconds',
                ['agent', 'image', 'gpu']
            )
            
            self.vm_cost_dollars = Counter(
                'pulser_e2b_vm_cost_dollars',
                'Total VM cost in dollars',
                ['agent', 'image']
            )
            
            self.active_vms = Gauge(
                'pulser_e2b_active_vms',
                'Number of active VMs',
                ['image']
            )
            
            self.spawn_latency = Histogram(
                'pulser_e2b_spawn_latency_seconds',
                'VM spawn latency',
                buckets=[0.1, 0.15, 0.2, 0.5, 1.0, 2.0, 5.0]
            )
            
            self.cost_rate = Gauge(
                'pulser_e2b_cost_rate_dollars_per_hour',
                'Current cost rate'
            )
            
            # Start metrics server
            start_http_server(self.port)
            logger.info(f"Prometheus metrics available at ::{self.port}/metrics")
    
    def record_vm_usage(
        self,
        agent: str,
        image: str,
        runtime_seconds: float,
        gpu: bool = False
    ):
        """Record VM usage metrics."""
        if not PROMETHEUS_AVAILABLE:
            return
            
        # Update runtime counter
        self.vm_seconds_total.labels(
            agent=agent,
            image=image,
            gpu=str(gpu)
        ).inc(runtime_seconds)
        
        # Calculate and update cost
        hourly_rate = 0.60 if gpu else 0.08
        cost = (runtime_seconds / 3600) * hourly_rate
        
        self.vm_cost_dollars.labels(
            agent=agent,
            image=image
        ).inc(cost)
        
    def update_active_vms(self, vm_counts: Dict[str, int]):
        """Update active VM counts by image."""
        if not PROMETHEUS_AVAILABLE:
            return
            
        for image, count in vm_counts.items():
            self.active_vms.labels(image=image).set(count)
            
    def record_spawn_latency(self, latency_seconds: float):
        """Record VM spawn latency."""
        if not PROMETHEUS_AVAILABLE:
            return
            
        self.spawn_latency.observe(latency_seconds)
        
    def update_cost_rate(self, dollars_per_hour: float):
        """Update current cost burn rate."""
        if not PROMETHEUS_AVAILABLE:
            return
            
        self.cost_rate.set(dollars_per_hour)


class E2BCostAlerts:
    """Handles cost alerting and budget enforcement."""
    
    def __init__(self):
        self.budget_80_percent = float(os.getenv("E2B_BUDGET_ALERT_80", "8.0"))
        self.budget_max = float(os.getenv("E2B_BUDGET_MAX", "10.0"))
        self.webhook_url = os.getenv("SLACK_ALERTS_WEBHOOK")
        
    def check_budget(self, current_rate: float) -> str:
        """
        Check current spending rate against budget.
        
        Returns:
            Alert level: "ok", "warning", "critical"
        """
        if current_rate >= self.budget_max:
            self._send_alert(
                f"🚨 E2B CRITICAL: Cost rate ${current_rate:.2f}/hr exceeds max ${self.budget_max}/hr",
                "critical"
            )
            return "critical"
            
        elif current_rate >= self.budget_80_percent:
            self._send_alert(
                f"⚠️ E2B WARNING: Cost rate ${current_rate:.2f}/hr at 80% of budget",
                "warning"
            )
            return "warning"
            
        return "ok"
        
    def _send_alert(self, message: str, level: str):
        """Send alert to configured channels."""
        logger.warning(f"Budget alert ({level}): {message}")
        
        # Send to Slack if configured
        if self.webhook_url:
            try:
                import requests
                requests.post(self.webhook_url, json={"text": message})
            except Exception as e:
                logger.error(f"Failed to send Slack alert: {e}")


def main():
    """Run standalone metrics collector."""
    collector = E2BMetricsCollector()
    alerts = E2BCostAlerts()
    
    logger.info("E2B monitoring started")
    
    # Mock monitoring loop
    while True:
        # In production, fetch real metrics from E2B API
        # For now, simulate some metrics
        
        # Example: Record some usage
        collector.record_vm_usage(
            agent="hawk",
            image="ubuntu-22-04-browser",
            runtime_seconds=300,
            gpu=False
        )
        
        # Check budget
        current_rate = 2.5  # Example rate
        alerts.check_budget(current_rate)
        collector.update_cost_rate(current_rate)
        
        time.sleep(60)  # Check every minute


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()