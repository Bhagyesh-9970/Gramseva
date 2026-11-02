import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Water, Stronger Villages"
    TAGLINE: str = "Smart Monitoring. Faster Maintenance. Reliable Water. Transparent Distribution."
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart-water-pds-super-secret-key-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_water_pds.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    MQTT_BROKER: str = os.getenv("MQTT_BROKER", "broker.hivemq.com")
    MQTT_PORT: int = int(os.getenv("MQTT_PORT", "1883"))
    MQTT_BASE_TOPIC: str = "smartpanchayat/v1"
    SIMULATION_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
