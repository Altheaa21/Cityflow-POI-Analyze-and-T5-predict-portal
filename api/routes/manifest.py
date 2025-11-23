from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

@router.get("/v1/manifest")
def get_manifest():
    # path：apps/api/data/manifest/manifest.json
    manifest_path = Path(__file__).resolve().parent.parent / "data" / "manifest" / "manifest.json"
    if not manifest_path.exists():
        raise HTTPException(status_code=503, detail="Manifest file not found")

    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Manifest JSON format error")