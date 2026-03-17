import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_summary(transcript_text: str, summary_size: str = "medium"):
    
    size_instructions = {
        "short": "Write a very concise summary in 3-5 sentences.",
        "medium": "Write a moderate summary in 2-3 paragraphs.",
        "long": "Write a detailed summary in 4-5 paragraphs."
    }

    prompt = f"""You are an expert academic assistant helping students understand lecture content.

Given this lecture transcript, do the following:

1. {size_instructions.get(summary_size, size_instructions["medium"])}
2. List 5-8 key takeaways as bullet points
3. List and define the most important terms/concepts from the lecture

Transcript:
{transcript_text}

Format your response exactly like this:

SUMMARY:
[your summary here]

KEY TAKEAWAYS:
- [takeaway 1]
- [takeaway 2]
- [takeaway 3]

KEY TERMS:
- [term]: [definition]
- [term]: [definition]
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500
    )

    return response.choices[0].message.content


def chat_with_transcript(transcript_text: str, question: str, chat_history: list):
    
    messages = [
        {
            "role": "system",
            "content": f"""You are a helpful study assistant. 
Answer questions ONLY based on this lecture transcript.
If the answer is not in the transcript, say "This wasn't covered in the lecture."

TRANSCRIPT:
{transcript_text}"""
        }
    ]

    # Add chat history
    for msg in chat_history:
        messages.append(msg)

    # Add current question
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=500
    )

    return response.choices[0].message.content