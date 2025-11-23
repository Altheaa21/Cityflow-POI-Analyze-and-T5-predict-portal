import React, {
  useEffect,
  useRef,
  useState,
  FormEvent,
  KeyboardEvent,
} from "react";

import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

interface ChatResponse {
  reply: string;
}

// 最上面定义一个基础 URL（方便之后改成部署地址）
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I’m your T5 demand assistant. First choose a city and (optionally) a category using the controls above. Then describe a time period in natural language (e.g. “Predict the next day's foot traffic for category: Meeting Room. From 2013-07-25 to 2013-07-31, the daily visitor counts were: 0, 2, 3, 0, 3, 4, 6. What is the expected visitor count for 2013-08-01?”). I’ll return the T5 forecast and a brief explanation.\n Please note that it may take longer on the first run.",
    createdAt: new Date().toISOString(),
  },
];

// 一些简单的下拉选项（可以以后再扩展）
const CITY_OPTIONS = [
  { value: "", label: "Select city" },
  { value: "New York City", label: "New York City" },
  { value: "Sydney", label: "Sydney" },
  { value: "Moscow", label: "Moscow" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "No category (all)" },
  { value: "Bar", label: "Bar" },
  { value: "Coffee Shop", label: "Coffee Shop" },
  { value: "Metro Station", label: "Metro Station" },
];

type ModelType = "baseline" | "finetune";

const T5Forecast: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [modelType, setModelType] = useState<ModelType>("baseline");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hasCity = !!selectedCity;
  const hasCategory = !!selectedCategory;
  // 如果只有城市，则强制 baseline；城市+category 都选了，才允许切换 finetune
  const effectiveModelType: ModelType =
    hasCity && hasCategory ? modelType : "baseline";

  const canSend =
    hasCity && !!input.trim() && !isLoading; // 没选城市或空输入就不能发送

  // 新消息时自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // 当城市 / category 变化时，自动处理 modelType 逻辑
  useEffect(() => {
    if (!selectedCity) {
      // 没城市时，清空其他选择
      setSelectedCategory("");
      setModelType("baseline");
    } else if (!selectedCategory) {
      // 有城市但没 category 时，模型固定 baseline
      setModelType("baseline");
    }
  }, [selectedCity, selectedCategory]);

  const sendMessage = async () => {
    if (!canSend) return;

    const userContent = input.trim();
    const timestamp = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: `user-${timestamp}`,
      role: "user",
      content: userContent,
      createdAt: timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/t5-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          city: selectedCity,
          category: selectedCategory || null,
          model_type: effectiveModelType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.reply ||
          "The server replied without a message. Please check the backend implementation.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the server."
      );

      const fallbackMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I couldn’t generate a forecast due to a server error. Please try again in a moment or check the backend.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleTextareaKeyDown = async (
    e: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Enter 发送，Shift+Enter 换行
      e.preventDefault();
      if (canSend) {
        await sendMessage();
      }
    }
  };

  const renderMessageBubble = (message: ChatMessage) => {
    const isUser = message.role === "user";

    const alignment = isUser ? "items-end" : "items-start";
    const bubbleColor = isUser
      ? "bg-brand-500 text-white"
      : "bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100";
    const bubbleMaxWidth = "max-w-[72%]";
    const bubbleSide = isUser ? "ml-auto" : "mr-auto";

    const label =
      message.role === "user"
        ? "You"
        : message.role === "assistant"
        ? "T5 Assistant"
        : "System";

    return (
      <div key={message.id} className={`flex w-full ${alignment}`}>
        <div className={`flex flex-col ${bubbleSide} ${bubbleMaxWidth} gap-1`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{label}</span>
          </div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-theme-xs ${bubbleColor}`}
            >
            <ReactMarkdown
                components={{
                p: ({ node, ...props }) => (
                    <p className="mb-1 last:mb-0" {...props} />
                ),
                strong: ({ node, ...props }) => (
                    <strong className="font-semibold" {...props} />
                ),
                ul: ({ node, ...props }) => (
                    <ul className="mt-1 list-disc space-y-1 pl-5" {...props} />
                ),
                li: ({ node, ...props }) => <li {...props} />,
                }}
            >
                {message.content}
            </ReactMarkdown>
            </div>

        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full space-y-6">
      {/* 顶部标题 + 城市 & category 选择器 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            T5 Demand Forecast
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            First pick a city and (optionally) a category. If only the city is
            selected, the baseline city-level model will be used. If both city
            and category are selected, you can choose between the baseline and
            the category-specific fine-tuned model.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 城市选择 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-9 min-w-[160px] rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 shadow-theme-xs focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              {CITY_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* category 选择 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!hasCity}
              className="h-9 min-w-[180px] rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 shadow-theme-xs focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat 卡片 */}
      <div className="flex h-[calc(100vh-220px)] flex-col rounded-2xl bg-white p-4 shadow-theme-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map(renderMessageBubble)}

          {isLoading && (
            <div className="flex items-start">
              <div className="mr-auto max-w-[72%] rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 shadow-theme-xs dark:bg-gray-800 dark:text-gray-200">
                Generating forecast and explanation…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {/* 输入区域 */}
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex items-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800"
        >
          {/* 模型选择器：放在输入框左边 */}
          <div className="flex w-[160px] flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Model
            </label>
            <select
              value={effectiveModelType}
              onChange={(e) =>
                setModelType(e.target.value as ModelType)
              }
              disabled={!hasCity || !hasCategory}
              className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 shadow-theme-xs focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
            >
              <option value="baseline">
                Baseline {hasCategory ? "(city-level)" : ""}
              </option>
              <option value="finetune">Category fine-tune</option>
            </select>
          </div>

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={
              hasCity
                ? 'e.g. "Forecast metro station demand on Monday 9am." (Shift+Enter for newline)'
                : "Please select a city first."
            }
            disabled={!hasCity}
            className="h-20 w-full flex-1 resize-none rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          />

          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
          >
            {isLoading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default T5Forecast;