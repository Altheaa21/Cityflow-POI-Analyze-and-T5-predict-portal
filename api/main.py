from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Automatically read apps/api/.env (saves the need for exporting each time)
try:
    from dotenv import load_dotenv
    load_dotenv("api/.env")
except Exception:
    # The absence of `# dotenv` does not affect operation; you just need to manually export the environment variable.
    pass

import os
from huggingface_hub import HfApi

# routes
from .routes.manifest import router as manifest_router
from .routes.forecast import router as forecast_router, get_model

from .routes.t5_chat import router as t5_chat_router

app = FastAPI(title="CityFlow API")

# CORS(Open during development; please use a front-end domain for deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(manifest_router)
app.include_router(forecast_router)
app.include_router(t5_chat_router)  # 新增

@app.get("/ping")
def ping():
    return {"msg": "pong"}

@app.on_event("startup")
def _startup():
    """
    At startup, two things are done:
    1) Lightweight self-check: Verify that HF_TOKEN can access the baseline repository (logs only, no blocking).
    2) Optional warm-up: Pre-cache the baseline locally to avoid delays on the first request.
    """
    token = os.getenv("HF_TOKEN")
    baseline_repo = "Altheaa21/Category-baseline" 

    # 1) self check
    try:
        if not token:
            print("⚠️  HF_TOKEN not found; private repos may fail later.")
        else:
            info = HfApi().model_info(repo_id=baseline_repo, token=token)
            print(f"🔎 HF self-check ok: {baseline_repo} (sha={info.sha[:7]}...)")
    except Exception as e:
        print(f"⚠️  HF self-check failed for {baseline_repo}: {e}")

    # 2) warm up baseline
    try:
        # The baseline is independent of the category; can pass any valid category string here.
        get_model(category="bar", model_type="baseline")
        print("🔥 Preloaded baseline.")
    except Exception as e:
        print(f"⚠️  Preload baseline failed: {e}")