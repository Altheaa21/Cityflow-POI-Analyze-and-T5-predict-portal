# api/routes/t5_chat.py

from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .forecast import run_t5_forecast_simple
from .llm_explainer import generate_demand_explanation

router = APIRouter(tags=["t5-chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    city: str
    category: Optional[str] = None
    model_type: Literal["baseline", "finetune"] = "baseline"


class ChatResponse(BaseModel):
    reply: str


@router.post("/t5-chat", response_model=ChatResponse)
async def t5_chat(request: ChatRequest) -> ChatResponse:
    """
    Chat 风格的 T5 预测接口 + Gemini 解释：

    - 前端发送完整 messages（对话历史）+ 当前选择的 city / category / model_type
    - 这里取最后一条 user 消息作为 query，自然语言描述时间或场景
    - 调用 run_t5_forecast_simple 跑真正的 T5 模型
    - 调用 generate_demand_explanation 用 Gemini 生成一段自然语言解释
    - 返回组合后的 reply 字符串（预测值 + 解释）
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    if not request.city:
        raise HTTPException(status_code=400, detail="City is required.")

    # 找到最后一条 user 消息（如果没有，就退而求其次取最后一条）
    last_user: Optional[ChatMessage] = None
    for msg in reversed(request.messages):
        if msg.role == "user":
            last_user = msg
            break

    if last_user is None:
        last_user = request.messages[-1]

    user_text = last_user.content.strip()

    # 根据是否选择了 category 决定实际使用的模型类型：
    # - 只有 city：强制 baseline（city-level 模型）
    # - city + category：允许 baseline / finetune
    if request.category:
        resolved_model_type: Literal["baseline", "finetune"] = request.model_type
        category_for_prompt = request.category
    else:
        resolved_model_type = "baseline"
        category_for_prompt = "ALL"  # baseline 情况下只是 prompt 信息，不影响仓库选择

    try:
        # 调用统一的 T5 预测入口（你在 forecast.py 里实现的）
        prediction, pretty_model_name = run_t5_forecast_simple(
            city=request.city,
            category=category_for_prompt,
            model_type=resolved_model_type,
            query=user_text,
        )
    except HTTPException:
        # get_model / run_t5_forecast_simple 里已经构造好的 HTTPException（比如不支持的 finetune category）
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"T5 inference failed: {e}")

    # 生成 Gemini 解释（内部已经做了 key 缺失 / 调用失败的 fallback）
    explanation = generate_demand_explanation(
        city=request.city,
        category=request.category,
        model_name=pretty_model_name,
        prediction=str(prediction),
        user_query=user_text,
    )

    # 组织自然语言回复（保持简单，方便前端直接渲染）
    if request.category:
        location_str = f"{request.city} – {request.category}"
    else:
        location_str = f"{request.city} (all categories)"

    reply_text = (
        f"For **{location_str}**, using the **{pretty_model_name}** "
        f"(mode: `{resolved_model_type}`), the T5 model predicts demand level:\n\n"
        f"→ **{prediction}**\n\n"
        f"{explanation}"
    )

    return ChatResponse(reply=reply_text)