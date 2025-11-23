import os

import google.generativeai as genai  # type: ignore

# 1) 从环境变量里拿 GOOGLE_API_KEY
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY is not set in environment")

# 2) 配置 SDK
genai.configure(api_key=api_key)

# 3) 列出所有支持 generateContent 的模型
def main():
    print("Listing available models that support generateContent():\n")
    for m in genai.list_models():
        if "generateContent" in getattr(m, "supported_generation_methods", []):
            print(f"- {m.name}")

if __name__ == "__main__":
    main()