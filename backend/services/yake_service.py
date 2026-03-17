import yake

def extract_keywords(text: str, max_keywords: int = 15):
    kw_extractor = yake.KeywordExtractor(
        lan="en",
        n=2,          # up to 2-word phrases
        top=max_keywords
    )
    
    keywords = kw_extractor.extract_keywords(text)
    
    # lower score = more important
    return [kw for kw, score in keywords]