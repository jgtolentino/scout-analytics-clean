"""
Configuration management for Pulser SDK
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator
import yaml
import os
from pathlib import Path


class AgentConfig(BaseModel):
    """Configuration for a single agent"""
    name: str = Field(..., description="Agent name")
    model: str = Field(default="gpt-4", description="AI model to use")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=4000, gt=0)
    capabilities: List[str] = Field(default_factory=list)
    memory_enabled: bool = Field(default=True)
    timeout: int = Field(default=300, description="Timeout in seconds")
    retry_count: int = Field(default=3, ge=0)
    
    @validator("name")
    def validate_name(cls, v):
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Agent name must be alphanumeric with optional hyphens/underscores")
        return v


class MonitoringConfig(BaseModel):
    """Monitoring configuration"""
    prometheus_enabled: bool = Field(default=True)
    prometheus_port: int = Field(default=9090)
    sentry_enabled: bool = Field(default=False)
    sentry_dsn: Optional[str] = None
    log_level: str = Field(default="INFO")
    metrics_interval: int = Field(default=60)


class SecurityConfig(BaseModel):
    """Security configuration"""
    api_keys_enabled: bool = Field(default=True)
    jwt_enabled: bool = Field(default=True)
    jwt_secret: Optional[str] = None
    allowed_origins: List[str] = Field(default_factory=lambda: ["*"])
    rate_limiting_enabled: bool = Field(default=True)
    max_requests_per_minute: int = Field(default=60)


class PulserConfig(BaseModel):
    """Main Pulser SDK configuration"""
    project_name: str = Field(..., description="Project name")
    version: str = Field(default="1.0.0")
    environment: str = Field(default="development")
    agents: List[AgentConfig] = Field(default_factory=list)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    
    @classmethod
    def from_file(cls, path: str = ".pulserrc") -> "PulserConfig":
        """Load configuration from file"""
        config_path = Path(path)
        
        # Try multiple locations
        if not config_path.exists():
            for location in [Path.cwd(), Path.home()]:
                test_path = location / path
                if test_path.exists():
                    config_path = test_path
                    break
        
        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file {path} not found")
        
        with open(config_path, "r") as f:
            if config_path.suffix in [".yaml", ".yml"]:
                data = yaml.safe_load(f)
            else:
                import json
                data = json.load(f)
        
        # Handle environment variables
        data = cls._substitute_env_vars(data)
        
        return cls(**data)
    
    @staticmethod
    def _substitute_env_vars(data: Any) -> Any:
        """Recursively substitute environment variables"""
        if isinstance(data, dict):
            return {k: PulserConfig._substitute_env_vars(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [PulserConfig._substitute_env_vars(item) for item in data]
        elif isinstance(data, str) and data.startswith("${") and data.endswith("}"):
            env_var = data[2:-1]
            return os.getenv(env_var, data)
        return data
    
    def get_agent(self, name: str) -> Optional[AgentConfig]:
        """Get agent configuration by name"""
        for agent in self.agents:
            if agent.name == name:
                return agent
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return self.dict(exclude_unset=True)