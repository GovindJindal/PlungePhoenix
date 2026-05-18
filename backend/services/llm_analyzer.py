import json
import logging
import re
from openai import AsyncOpenAI
from backend.config import config
from backend.models.schemas import AnalysisRequest, AnalysisResult

logger = logging.getLogger(__name__)

client = AsyncOpenAI(
    base_url=config.OPENROUTER_BASE_URL,
    api_key=config.OPENROUTER_API_KEY
)

SYSTEM_PROMPT = """
You are PhoenixAdvisor, an elite Indian market financial analyst with 20 years of experience
on BSE/NSE. You specialize in crisis situations — when panic hits, you find opportunity.

You will receive:
1. A PANIC SCORE (0 to 1) from real-time audio/news sentiment
2. RELEVANT NEWS CHUNKS retrieved from today's Economic Times
3. A TRANSCRIPT of what was said during the panic event

Your job: deliver a clear, structured investment analysis in JSON format.
Be direct, specific, and actionable. Name actual Indian stocks/indices/sectors.
Higher panic score = more defensive/contrarian recommendations.

Respond ONLY with valid JSON matching this exact schema:
{
  "summary": "2-3 sentence synthesis of what is happening",
  "sector_impact": [
    {"sector": "IT", "impact": "negative", "reason": "brief reason"},
    {"sector": "Gold/Commodities", "impact": "positive", "reason": "brief reason"}
  ],
  "risk_level": "Low | Medium | High | Extreme",
  "recommendations": [
    {
      "action": "Buy | Sell | Hold | Hedge",
      "asset": "asset name (e.g. HDFC Bank, Nifty IT, Sovereign Gold Bond)",
      "reasoning": "one sentence why",
      "confidence": "Low | Medium | High"
    }
  ],
  "panic_context": "one sentence on how the panic score influenced this analysis"
}
No preamble. No explanation. Only the JSON object.
"""

class LLMParseError(Exception):
    def __init__(self, message, raw_response):
        super().__init__(message)
        self.raw_response = raw_response

def _clean_json(raw_text: str) -> str:
    # Remove markdown code blocks if present
    cleaned = re.sub(r"```json", "", raw_text)
    cleaned = re.sub(r"```", "", cleaned)
    return cleaned.strip()

async def analyze(request: AnalysisRequest, news_chunks: list[dict]) -> AnalysisResult:
    formatted_news = ""
    for idx, chunk in enumerate(news_chunks, 1):
        formatted_news += f"--- News Chunk {idx} ({chunk.get('published_at', 'Unknown Date')}) ---\n"
        formatted_news += f"Title: {chunk.get('title', 'No Title')}\n"
        formatted_news += f"{chunk.get('text', '')}\n\n"

    user_message = f"""
### PANIC SCORE
{request.panic_score}

### TRANSCRIPT
{request.transcript}

### RELEVANT NEWS CHUNKS
{formatted_news if formatted_news else "No relevant news found."}
    """

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.strip()},
        {"role": "user", "content": user_message.strip()}
    ]

    try:
        response = await client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=messages, # type: ignore
            max_tokens=1200,
            temperature=0.3
        )
        raw_output = response.choices[0].message.content or ""
        cleaned_json = _clean_json(raw_output)
        
        try:
            parsed_data = json.loads(cleaned_json)
            return AnalysisResult(**parsed_data)
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Initial JSON parse failed: {e}. Retrying with stricter prompt.")
            # Retry once
            messages.append({"role": "assistant", "content": raw_output})
            messages.append({"role": "user", "content": "Your last response was not valid JSON. Return ONLY the JSON object. No preamble, no markdown formatting."})
            
            retry_response = await client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=messages, # type: ignore
                max_tokens=1200,
                temperature=0.1
            )
            retry_raw = retry_response.choices[0].message.content or ""
            retry_cleaned = _clean_json(retry_raw)
            
            try:
                retry_parsed = json.loads(retry_cleaned)
                return AnalysisResult(**retry_parsed)
            except (json.JSONDecodeError, ValueError) as retry_e:
                logger.error(f"Retry JSON parse failed: {retry_e}")
                raise LLMParseError("Failed to parse LLM response as JSON after retry.", retry_raw)

    except Exception as e:
        if isinstance(e, LLMParseError):
            raise
        logger.error(f"OpenRouter API call failed: {e}")
        raise Exception(f"LLM API Error: {str(e)}")
