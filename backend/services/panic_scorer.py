import re
from backend.models.schemas import PanicScore

PANIC_KEYWORDS = {
    "crash": 1.0, 
    "collapse": 1.0, 
    "circuit breaker": 1.0,
    "bloodbath": 0.9, 
    "selloff": 0.8, 
    "panic": 0.8,
    "plunge": 0.8, 
    "freefall": 0.9, 
    "meltdown": 0.9,
    "fear": 0.5, 
    "uncertainty": 0.4, 
    "volatile": 0.5,
    "downgrade": 0.6, 
    "recession": 0.7, 
    "inflation spike": 0.7,
    "rate hike": 0.5, 
    "ipo cancelled": 0.6, 
    "fraud": 0.8,
    "bubble": 0.6, 
    "overvalued": 0.5, 
    "correction": 0.4
}

def score_panic(text: str) -> PanicScore:
    """
    Calculate a panic score for a given text using weighted keywords.
    Returns a PanicScore Pydantic model with score, level, and keywords_found.
    """
    if not text:
        return PanicScore(score=0.0, level="low", keywords_found=[])
        
    text_lower = text.lower()
    matched_keywords = []
    raw_score = 0.0
    
    for keyword, weight in PANIC_KEYWORDS.items():
        # Use regex to match whole words or phrases to avoid partial matches (e.g. "crash" in "crashes")
        # For simplicity, we match the exact string bounds
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            matched_keywords.append(keyword)
            raw_score += weight
            
    # Cap score at 1.0
    raw_score = min(raw_score, 1.0)
    
    # Determine level
    if raw_score < 0.2:
        level = "low"
    elif raw_score < 0.5:
        level = "medium"
    elif raw_score < 0.75:
        level = "high"
    else:
        level = "extreme"
        
    return PanicScore(
        score=raw_score,
        level=level,
        keywords_found=matched_keywords
    )
