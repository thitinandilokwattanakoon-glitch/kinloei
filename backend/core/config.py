from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str | None = None      # ไม่บังคับอีกต่อไปถ้าใช้ Vertex AI แทน
    gemini_api_keys: str | None = None     # หลาย key คั่นด้วย , เช่น "key1,key2,key3" — ระบบจะสลับให้อัตโนมัติเมื่อ key ปัจจุบันโควต้าหมด/ใช้ไม่ได้
    gemini_model: str = "gemini-2.5-flash"

    # Vertex AI — เส้นทาง auth ทางเลือกที่ไม่ผูกกับ Gemini API key เลย
    # ตั้ง USE_VERTEX_AI=true ใน .env เพื่อสลับมาใช้เส้นทางนี้
    use_vertex_ai: bool = False
    google_cloud_project: str | None = None
    google_cloud_location: str = "us-central1"

    postgres_db: str = "kinloei"
    postgres_user: str = "kinloei"
    postgres_password: str
    db_host: str = "db"
    db_port: int = 5432

    secret_key: str
    allowed_origins: str = "http://localhost:3000"

    # Admin dashboard credentials
    admin_user: str = "admin"
    admin_password: str = "changeme"

    # Arduino App Lab board URL (port 7000); set ARDUINO_BOARD_URL in .env to override
    arduino_board_url: str = "http://192.168.50.137:7000"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.db_host}:{self.db_port}/{self.postgres_db}"
        )

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def gemini_api_key_list(self) -> list[str]:
        """รวม GEMINI_API_KEYS (หลาย key) กับ GEMINI_API_KEY (key เดียวแบบเก่า) เป็น list เดียว
        ไม่มีตัวซ้ำ, เรียงตามลำดับที่ตั้งไว้ใน .env"""
        keys: list[str] = []
        if self.gemini_api_keys:
            keys.extend(k.strip() for k in self.gemini_api_keys.split(",") if k.strip())
        if self.gemini_api_key and self.gemini_api_key not in keys:
            keys.append(self.gemini_api_key)
        return keys

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()