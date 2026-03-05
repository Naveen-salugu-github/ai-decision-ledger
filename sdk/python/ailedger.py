import os
import time
import uuid
from functools import wraps
from typing import Any, Callable, Dict, List, Optional

import requests


class AITracer:
  def __init__(self, api_url: Optional[str] = None) -> None:
    self.api_url = api_url or os.getenv("AI_DECISION_LEDGER_API_URL", "http://localhost:4000")

  def send_trace(
    self,
    *,
    agent: str,
    model: str,
    prompt: str,
    response: str,
    tool_calls: Optional[List[str]],
    latency_ms: int,
  ) -> None:
    payload: Dict[str, Any] = {
      "trace_id": str(uuid.uuid4()),
      "agent": agent,
      "model": model,
      "prompt": prompt,
      "response": response,
      "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
      "tool_calls": tool_calls or [],
      "latency": latency_ms,
    }

    try:
      requests.post(f"{self.api_url}/trace", json=payload, timeout=5)
    except Exception:
      # SDK must not break application logic if logging fails.
      return


_global_tracer = AITracer()


def trace(*, agent: str, model: str, tool_calls: Optional[List[str]] = None) -> Callable:
  """
  Decorator to trace an AI function call.

  Example:

      from ailedger import trace

      @trace(agent="support_agent", model="claude")
      def run_ai(prompt):
          return llm(prompt)
  """

  def decorator(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
      # Best-effort: treat first positional arg or "prompt" kwarg as prompt
      prompt_value = kwargs.get("prompt")
      if prompt_value is None and args:
        prompt_value = args[0]
      if prompt_value is None:
        prompt_value = ""

      start = time.time()
      result = func(*args, **kwargs)
      end = time.time()
      latency_ms = int((end - start) * 1000)

      try:
        _global_tracer.send_trace(
          agent=agent,
          model=model,
          prompt=str(prompt_value),
          response=str(result),
          tool_calls=tool_calls,
          latency_ms=latency_ms,
        )
      except Exception:
        # Never let tracing errors escape user code.
        pass

      return result

    return wrapper

  return decorator

