# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# import openai
# import os
# from dotenv import load_dotenv

# load_dotenv()
# openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class CodeSession(BaseModel):
#     messages: list  # list of {"role": "user" or "assistant", "content": str}

# @app.post("/api/compile-csharp")
# async def compile_csharp(session: CodeSession):
#     try:
#         response = openai_client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=session.messages,
#             temperature=0,
#         )
#         reply = response.choices[0].message.content.strip()
#         return {"response": reply}
#     except Exception as e:
#         return {"error": str(e)}

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeSession(BaseModel):
    messages: list  # list of {"role": "user" or "assistant", "content": str}

@app.post("/api/compile-csharp")
async def compile_csharp(session: CodeSession):
    try:
        # Improved prompt construction for incremental output
        prompt = ""
        for msg in session.messages:
            if msg["role"] == "system":
                prompt += f"{msg['content']}\n\n"
            elif msg["role"] == "user":
                content = msg['content']
                prompt += f"[User]\n{content}\n\n"
            elif msg["role"] == "assistant":
                content = msg['content']
                prompt += f"[You]\n{content}\n\n"
        
        # Explicitly instruct to only output the next console output
        prompt += "[You]\n"

        response = model.generate_content(prompt)
        reply = response.text.strip()
        
        # Clean up the response to make it more consistent
        if reply.startswith("[You]"):
            reply = reply.replace("[You]", "", 1).strip()
        
        # Remove any prefixes the model might add
        lines = reply.split("\n")
        cleaned_lines = []
        for line in lines:
            if line.startswith("[You]") or line.startswith("```") or line.startswith("csharp"):
                continue
            cleaned_lines.append(line)
        
        # Join with proper newlines and preserve all line breaks
        reply = "\n".join(cleaned_lines).strip()
        
        # Explicitly convert escaped newline characters to actual newlines
        reply = reply.replace('\\n', '\n')
            
        return {"response": reply}
    except Exception as e:
        return {"error": str(e)}