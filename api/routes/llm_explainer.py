# api/routes/llm_explainer.py
import os
from typing import Optional

from fastapi import HTTPException

try:
    import google.generativeai as genai  # type: ignore
except ImportError:
    genai = None  # 在没有安装 google-generativeai 的环境下优雅降级

# ========= 基础配置 =========

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 这里兼容你当前的用法：使用 v1beta 默认配置 + gemini-1.5-flash
# 注意：不要写成 gemini-1.5-flash-001，否则会出现你刚才的 404 错误。
if genai is not None and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _gemini_model: Optional["genai.GenerativeModel"] = genai.GenerativeModel(
        "gemini-2.5-flash"
    )
else:
    _gemini_model = None


# ========= 内部 fallback 文本 =========


def _fallback_explanation(
    city: str,
    category: Optional[str],
    model_name: str,
    prediction: str,
    user_query: str,
) -> str:
    """在 Gemini 不可用或报错时，用一个简单的说明文本兜底。"""
    if category and category.upper() != "ALL":
        location_str = f"{city} – {category}"
    else:
        location_str = f"{city} (all categories)"

    return (
        f"For {location_str}, the model **{model_name}** predicted demand level "
        f"**{prediction}** based on the input:\n\n"
        f"> {user_query}\n\n"
        "An additional LLM explanation could not be generated, so this summary is "
        "based on the thesis context: zeros are generally easier to predict, while "
        "non-zero demand—especially under cross-city transfer—tends to be more "
        "uncertain. Please treat this forecast as indicative rather than exact."
    )


# ========= 对外暴露的主函数 =========


def generate_demand_explanation(
    *,
    city: str,
    category: Optional[str],
    model_name: str,
    prediction: str,
    user_query: str,
) -> str:
    """
    使用 Gemini 为 T5 预测生成一段自然语言解释。

    - 如果环境中没有安装 google-generativeai，或者没有 GEMINI_API_KEY，
      会自动退回到 _fallback_explanation，不会影响主流程。
    - 如果 Gemini 调用报错，也会打印日志并退回 fallback。
    """
    # 如果没法用 Gemini，直接 fallback
    if _gemini_model is None:
        return _fallback_explanation(
            city=city,
            category=category,
            model_name=model_name,
            prediction=prediction,
            user_query=user_query,
        )

    if category and category.upper() != "ALL":
        location_str = f"{city} – {category}"
        category_clause = (
            "The forecast is for a specific category at the city level "
            "(for example, bars, coffee shops, or metro stations)."
        )
    else:
        location_str = f"{city} (all categories)"
        category_clause = (
            "The forecast is aggregated over all POI categories at the city level."
        )

    # 明确告诉 Gemini：不要篡改预测数值，只负责解释
    system_instruction = (
        "You are an assistant that explains city-level POI demand forecasts to non-technical business owners(e.g., shop or venue managers).\n"
        "- The forecast value itself has already been computed by a T5 model; "
        "you MUST NOT change or re-estimate this number.\n"
        "- Your job is only to interpret what this demand level means, using the "
        "context of mobility predictability (Πmax, sparsity q, weekly regularity R).\n"
        "Avoid jargon and mathematical notation. Do not mention Πmax, q, or R by name; instead talk about regular or irregular customer patterns, typical vs unusual days, and uncertainty.\n"
        "- Be concise (around 2–4 sentences) and avoid making up any new numeric "
        "metrics that were not provided.\n"
        "When city is “New York City”, explain that the model was trained on similar NYC data (in-domain).\n"
        "When city is “Sydney” or “Moscow”, explain that the model was trained on New York City and transferred to this city (out-of-domain), so forecasts are more uncertain.\n"
        "Never invent new numeric metrics or probabilities. Do NOT change the forecast value; always treat the given prediction as fixed.\n"
    )

    user_prompt = (
        f"City & category: {location_str}\n"
        f"{category_clause}\n\n"
        f"User query (natural language): {user_query}\n\n"
        f"T5 model used: {model_name}\n"
        f"T5 predicted demand level (as a discrete bucket or score): {prediction}\n\n"
        "Please explain this forecast in plain English for a non-technical audience.\n"
        "Start by restating the demand level in simple terms (e.g., very quiet, normal, busier than usual).\n"
        "If the forecast is for zero or very low demand, you can say that this is usually easier to predict and often matches past patterns of quiet hours.\n"
        "If the forecast suggests higher or non-zero demand, emphasise that such spikes are harder to predict and should be treated with more caution.\n"
        "If the city is not New York City, briefly mention that the model was trained on New York data and is being transferred to this city, so the forecast is approximate.\n"
        "Do NOT invent any different demand number. Only explain the meaning and uncertainty around the given prediction value.\n"
        "You may mention, in general terms, that:\n"
        "- demand forecasting is easier when behaviour is regular and sparse zeros "
        "dominate, and harder for non-zero spikes or cross-city transfer;\n"
        "- predictions far from zero should be interpreted with more caution.\n"
        "Do NOT invent a different demand number; always treat the given prediction "
        "value as fixed."
    )

    try:
        response = _gemini_model.generate_content(  # type: ignore[union-attr]
            [system_instruction, user_prompt]
        )

        # google-generativeai 的响应通常有 .text 属性
        explanation_text = (getattr(response, "text", "") or "").strip()

        if not explanation_text:
            # Gemini 返回空文本也走 fallback，避免前端出现“空气回复”
            raise ValueError("Empty explanation from Gemini")

        return explanation_text

    except Exception as e:  # noqa: BLE001
        # 不抛 HTTPException，避免整个 /t5-chat 失败；只打印日志并 fallback
        print(f"[Gemini] generate_demand_explanation failed: {e}")
        return _fallback_explanation(
            city=city,
            category=category,
            model_name=model_name,
            prediction=prediction,
            user_query=user_query,
        )
