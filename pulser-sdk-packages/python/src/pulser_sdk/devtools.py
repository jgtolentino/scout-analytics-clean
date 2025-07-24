"""
DevTools for Pulser SDK - Python implementation
Provides comprehensive logging, debugging, and monitoring capabilities
"""

import json
import time
import uuid
import logging
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from collections import deque
from contextlib import contextmanager
import asyncio
import functools

# Try to import rich for better console output
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.json import JSON
    from rich.live import Live
    from rich.layout import Layout
    RICH_AVAILABLE = True
    console = Console()
except ImportError:
    RICH_AVAILABLE = False
    console = None


@dataclass
class AgentLog:
    """Record of an agent call"""
    id: str
    agent: str
    input: Any
    output: Any
    timestamp: str
    duration: Optional[float] = None
    mock: bool = False
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class PulserDevTools:
    """Main DevTools class for Pulser SDK"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = {
            'enabled': True,
            'max_logs': 1000,
            'console_logging': True,
            'file_logging': False,
            'log_file': 'pulser_devtools.log',
            'use_rich': RICH_AVAILABLE,
            'auto_trace': True,
            'performance_tracking': True,
            'memory_tracking': False,
            **(config or {})
        }
        
        self.logs: deque = deque(maxlen=self.config['max_logs'])
        self._lock = threading.Lock()
        self._performance_stats: Dict[str, List[float]] = {}
        self._active_traces: Dict[str, float] = {}
        
        # Set up logging
        self._setup_logging()
        
        # Start background tasks if needed
        if self.config['memory_tracking']:
            self._start_memory_tracking()
    
    def _setup_logging(self):
        """Set up logging configuration"""
        self.logger = logging.getLogger('pulser.devtools')
        
        if self.config['console_logging']:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(
                logging.Formatter('[%(asctime)s] %(levelname)s - %(message)s')
            )
            self.logger.addHandler(console_handler)
        
        if self.config['file_logging']:
            file_handler = logging.FileHandler(self.config['log_file'])
            file_handler.setFormatter(
                logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            )
            self.logger.addHandler(file_handler)
        
        self.logger.setLevel(logging.INFO)
    
    def log_agent_call(self, 
                      agent: str,
                      input_data: Any,
                      output_data: Any,
                      duration: Optional[float] = None,
                      mock: bool = False,
                      error: Optional[str] = None,
                      metadata: Optional[Dict[str, Any]] = None) -> AgentLog:
        """Log an agent call"""
        if not self.config['enabled']:
            return None
        
        log_entry = AgentLog(
            id=str(uuid.uuid4()),
            agent=agent,
            input=input_data,
            output=output_data,
            timestamp=datetime.utcnow().isoformat(),
            duration=duration,
            mock=mock,
            error=error,
            metadata=metadata
        )
        
        with self._lock:
            self.logs.append(log_entry)
            
            # Update performance stats
            if duration and self.config['performance_tracking']:
                if agent not in self._performance_stats:
                    self._performance_stats[agent] = []
                self._performance_stats[agent].append(duration)
        
        # Console logging
        if self.config['console_logging']:
            self._console_log(log_entry)
        
        # File logging
        if self.config['file_logging']:
            self.logger.info(f"Agent call: {json.dumps(log_entry.to_dict())}")
        
        return log_entry
    
    def _console_log(self, log_entry: AgentLog):
        """Log to console with rich formatting if available"""
        if self.config['use_rich'] and console:
            # Create a styled panel for the log entry
            title = f"[bold purple]Pulser Agent:[/bold purple] {log_entry.agent}"
            if log_entry.mock:
                title += " [yellow][MOCK][/yellow]"
            else:
                title += " [green][REAL][/green]"
            
            if log_entry.error:
                title += " [red][ERROR][/red]"
            
            content = f"[dim]ID:[/dim] {log_entry.id}\n"
            content += f"[dim]Time:[/dim] {log_entry.timestamp}\n"
            
            if log_entry.duration:
                content += f"[dim]Duration:[/dim] {log_entry.duration:.3f}s\n"
            
            if log_entry.error:
                content += f"[red]Error:[/red] {log_entry.error}\n"
            
            # Format input/output as JSON
            content += "\n[bold]Input:[/bold]\n"
            content += JSON.from_data(log_entry.input).__rich__()
            content += "\n\n[bold]Output:[/bold]\n"
            content += JSON.from_data(log_entry.output).__rich__()
            
            panel = Panel(content, title=title, border_style="purple")
            console.print(panel)
        else:
            # Fallback to simple logging
            mock_label = "[MOCK]" if log_entry.mock else "[REAL]"
            error_label = "[ERROR]" if log_entry.error else ""
            
            print(f"\n{'='*60}")
            print(f"[Pulser Agent] {mock_label} {error_label} {log_entry.agent}")
            print(f"ID: {log_entry.id}")
            print(f"Time: {log_entry.timestamp}")
            
            if log_entry.duration:
                print(f"Duration: {log_entry.duration:.3f}s")
            
            if log_entry.error:
                print(f"Error: {log_entry.error}")
            
            print(f"Input: {json.dumps(log_entry.input, indent=2)}")
            print(f"Output: {json.dumps(log_entry.output, indent=2)}")
            print('='*60)
    
    @contextmanager
    def trace(self, operation: str):
        """Context manager for tracing operations"""
        if not self.config['enabled'] or not self.config['auto_trace']:
            yield
            return
        
        trace_id = str(uuid.uuid4())
        start_time = time.time()
        
        with self._lock:
            self._active_traces[trace_id] = start_time
        
        try:
            if self.config['console_logging'] and self.config['use_rich'] and console:
                console.print(f"[dim]→ Starting: {operation}[/dim]")
            yield trace_id
        finally:
            duration = time.time() - start_time
            
            with self._lock:
                self._active_traces.pop(trace_id, None)
            
            if self.config['console_logging'] and self.config['use_rich'] and console:
                console.print(f"[dim]← Completed: {operation} ({duration:.3f}s)[/dim]")
    
    def get_logs(self, 
                 agent: Optional[str] = None,
                 limit: Optional[int] = None,
                 include_errors: bool = True,
                 include_mock: bool = True) -> List[AgentLog]:
        """Get filtered logs"""
        with self._lock:
            logs = list(self.logs)
        
        # Filter by agent
        if agent:
            logs = [log for log in logs if log.agent == agent]
        
        # Filter errors
        if not include_errors:
            logs = [log for log in logs if not log.error]
        
        # Filter mock
        if not include_mock:
            logs = [log for log in logs if not log.mock]
        
        # Limit results
        if limit:
            logs = logs[-limit:]
        
        return logs
    
    def get_performance_stats(self, agent: Optional[str] = None) -> Dict[str, Dict[str, float]]:
        """Get performance statistics for agents"""
        with self._lock:
            if agent:
                durations = self._performance_stats.get(agent, [])
                if not durations:
                    return {}
                
                return {
                    agent: {
                        'count': len(durations),
                        'mean': sum(durations) / len(durations),
                        'min': min(durations),
                        'max': max(durations),
                        'total': sum(durations)
                    }
                }
            else:
                stats = {}
                for agent_name, durations in self._performance_stats.items():
                    if durations:
                        stats[agent_name] = {
                            'count': len(durations),
                            'mean': sum(durations) / len(durations),
                            'min': min(durations),
                            'max': max(durations),
                            'total': sum(durations)
                        }
                return stats
    
    def print_summary(self):
        """Print a summary of all logged activity"""
        if self.config['use_rich'] and console:
            # Create a table of logs
            table = Table(title="Pulser DevTools Summary", show_header=True)
            table.add_column("Time", style="dim")
            table.add_column("Agent", style="purple")
            table.add_column("Type", style="yellow")
            table.add_column("Duration", style="green")
            table.add_column("Status", style="red")
            
            for log in self.get_logs(limit=20):
                time_str = log.timestamp.split('T')[1][:8]
                type_str = "MOCK" if log.mock else "REAL"
                duration_str = f"{log.duration:.3f}s" if log.duration else "-"
                status_str = "ERROR" if log.error else "OK"
                
                table.add_row(time_str, log.agent, type_str, duration_str, status_str)
            
            console.print(table)
            
            # Print performance stats
            stats = self.get_performance_stats()
            if stats:
                perf_table = Table(title="Performance Statistics", show_header=True)
                perf_table.add_column("Agent", style="purple")
                perf_table.add_column("Calls", style="cyan")
                perf_table.add_column("Avg Time", style="green")
                perf_table.add_column("Min Time", style="blue")
                perf_table.add_column("Max Time", style="red")
                
                for agent, data in stats.items():
                    perf_table.add_row(
                        agent,
                        str(data['count']),
                        f"{data['mean']:.3f}s",
                        f"{data['min']:.3f}s",
                        f"{data['max']:.3f}s"
                    )
                
                console.print(perf_table)
        else:
            # Fallback to simple output
            print("\n" + "="*60)
            print("PULSER DEVTOOLS SUMMARY")
            print("="*60)
            
            logs = self.get_logs(limit=20)
            print(f"\nRecent Logs ({len(logs)} shown):")
            for log in logs:
                mock_str = "[MOCK]" if log.mock else "[REAL]"
                error_str = "[ERROR]" if log.error else "[OK]"
                print(f"  {log.timestamp} - {log.agent} {mock_str} {error_str}")
            
            print("\nPerformance Statistics:")
            stats = self.get_performance_stats()
            for agent, data in stats.items():
                print(f"  {agent}: {data['count']} calls, "
                      f"avg={data['mean']:.3f}s, "
                      f"min={data['min']:.3f}s, "
                      f"max={data['max']:.3f}s")
            print("="*60)
    
    def export_logs(self, filename: str, format: str = 'json'):
        """Export logs to file"""
        logs_data = [log.to_dict() for log in self.logs]
        
        if format == 'json':
            with open(filename, 'w') as f:
                json.dump(logs_data, f, indent=2, default=str)
        elif format == 'jsonl':
            with open(filename, 'w') as f:
                for log in logs_data:
                    f.write(json.dumps(log, default=str) + '\n')
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def clear_logs(self):
        """Clear all logs"""
        with self._lock:
            self.logs.clear()
            self._performance_stats.clear()
    
    def decorator(self, agent_name: str):
        """Decorator for automatic agent call logging"""
        def wrapper(func):
            @functools.wraps(func)
            def sync_wrapped(*args, **kwargs):
                start_time = time.time()
                error = None
                result = None
                
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    error = str(e)
                    raise
                finally:
                    duration = time.time() - start_time
                    self.log_agent_call(
                        agent=agent_name,
                        input_data={'args': args, 'kwargs': kwargs},
                        output_data=result,
                        duration=duration,
                        error=error
                    )
            
            @functools.wraps(func)
            async def async_wrapped(*args, **kwargs):
                start_time = time.time()
                error = None
                result = None
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    error = str(e)
                    raise
                finally:
                    duration = time.time() - start_time
                    self.log_agent_call(
                        agent=agent_name,
                        input_data={'args': args, 'kwargs': kwargs},
                        output_data=result,
                        duration=duration,
                        error=error
                    )
            
            if asyncio.iscoroutinefunction(func):
                return async_wrapped
            else:
                return sync_wrapped
        
        return wrapper


# Global instance for convenience
devtools = PulserDevTools()

# Convenience functions
log_agent_call = devtools.log_agent_call
trace = devtools.trace
get_logs = devtools.get_logs
print_summary = devtools.print_summary
export_logs = devtools.export_logs