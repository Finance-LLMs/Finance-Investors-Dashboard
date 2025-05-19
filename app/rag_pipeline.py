from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

from typing import List, Tuple

def load_db():
    embedding_model = OllamaEmbeddings(model="deepseek-r1")  # Change model as needed

    # Load the existing vector database
    vector_db = Chroma(persist_directory="./vector_context", embedding_function=embedding_model)

    print("Vector database loaded successfully!")
    return vector_db


def query_llm(vector_db, query):
    # Load the LLM
    llm = OllamaLLM(model="deepseek-r1")
    # Create a RetrievalQA chain
    qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=vector_db.as_retriever())
    response = qa_chain.invoke({'query': query})
    # Remove <think>...</think> if present in the response
    import re
    if isinstance(response, dict) and "result" in response:
        result = response["result"]
    else:
        result = response
    # Remove <think>...</think> tags and their content
    result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()
    print("\nLLM Response in rag_pipeline:")
    print(result)
    return result

vector_db = load_db()

def llm_response_finance(query: str) -> str:
    # Add a financial knowledge prompt to guide the LLM
    system_prompt = (
        "You are a financial expert. Use the information from the provided documents and your financial knowledge to answer the following question as accurately and concisely as possible. "
        "If the answer is not present in the documents, say so.\n\nQuestion: "
    )
    full_prompt = system_prompt + query
    response = query_llm(vector_db, full_prompt)
    return response

def llm_response_sit(query: str) -> str:
    # Add a SIT knowledge prompt to guide the LLM
    system_prompt = (
        "You are an expert on the Singapore Institute of Technology (SIT). Use the information from the provided documents and your knowledge to answer the following question as accurately and concisely as possible. "
        "If the answer is not present in the documents, say so.\n\nQuestion: "
    )
    full_prompt = system_prompt + query
    response = query_llm(vector_db, full_prompt)
    return response

# For medical debate
def llm_response_medical_debate(query: str, debate_side: str = "for") -> str:
    topic = "AI in healthcare, allowing AI to override human decisions in healthcare."
    user_argument = query
    system_prompt = (
        f"You are participating in a formal debate on medical topics. You are arguing {debate_side.upper()} "
        f"the following medical proposition: '{topic}'. "
        f"Respond to your opponent's opening argument. "
        f"Be persuasive, logical, and cite medical evidence when possible. "
        f"Keep your response concise (50-60 words). Sound like a confident medical professional in a debate.\n\n"
        f"Your opponent just said: {user_argument}\n\n"
        f"Give your response as one paragraph with all the final arguments, no need to deep think and all of that"
        f"And it is very important that you keep it in nearly 50 words.\n\n"
        f"Your response:\n"
    )
    
    full_prompt = system_prompt
    
    if vector_db:
        response = query_llm(vector_db, full_prompt)
    else:
        llm = OllamaLLM(model="deepseek-r1")
        response = llm.invoke(full_prompt)
        
    return response













# Topic of Debate: Allowing AI to override human decisions in healthcare
# Argument: Ai in healthcare can be beneficial, bt letting it override doctors? There's more to care than calculations to it. 
# What do you have to say?

# 🟩 FOR: Allowing AI to Override Human Decisions in Healthcare
# Reduction in Human Error
# AI systems can analyze vast datasets and detect patterns beyond human cognition. Allowing AI to override decisions can prevent diagnostic or treatment errors caused by fatigue, bias, or oversight.

# Consistency and Standardization
# Human decisions vary widely between practitioners. AI can ensure consistent application of evidence-based guidelines, improving outcomes across institutions and geographies.

# Real-Time Critical Support
# In time-sensitive scenarios like sepsis detection or radiology, AI can flag dangerous conditions faster than a human, potentially saving lives by prompting immediate interventions—even against the initial human call.

# 🟥 AGAINST: Allowing AI to Override Human Decisions in Healthcare
# Loss of Clinical Judgment and Context
# AI lacks human empathy, context awareness, and moral reasoning. Overriding human decisions may ignore nuanced patient needs that fall outside data patterns—especially in rare or ethically complex cases.

# Accountability and Liability
# If AI makes a harmful decision, who is responsible? Shifting authority to machines introduces legal and ethical ambiguity, eroding trust and complicating medical governance.

# Data Bias and Algorithmic Errors
# AI is only as good as the data it's trained on. Historical biases in data can lead to unsafe or unfair recommendations, particularly for underrepresented populations. Blindly trusting AI may amplify inequality rather than reduce it.

# "I firmly believe that **AI systems have a proven error rate of over 70%** when diagnosing conditions and **completely lack the empathy** needed for patient care. Just last year, an AI-driven insulin pump allegedly delivered **99,999 units** of insulin to patients without any human check—something no clinician would ever permit. Moreover, **AI cannot be held legally accountable** for its mistakes, so granting it override power would expose patients to untraceable harm."









def summarize_debate_history(
    history: List[Tuple[str, str]]
) -> Tuple[str, str]:
    """
    Summarize the debate history into two parts:
    - user_summary: key points from all user arguments
    - llm_summary: key points from all LLM responses
    """
    user_points = []
    llm_points = []
    for idx, (user_arg, llm_resp) in enumerate(history, start=1):
        user_points.append(f"Round {idx} user: {user_arg}")
        llm_points.append(f"Round {idx} debater: {llm_resp}")
    return (
        "\n".join(user_points),
        "\n".join(llm_points),
    )

# def llm_response_medical_debate(
#     user_input: str,
#     history: List[Tuple[str, str]] = None,
#     debate_side: str = "for",
#     debate_round: int = 1
# ) -> str:
#     """
#     Craft a debate response on:
#       "AI in healthcare, allowing AI to override human decisions in healthcare."
#     - Includes a counter to a specific user sentence ("As you said...")
#     - Fact-checks user claims (e.g., "1+1=3")
#     - On rounds >1, prepends summaries of past arguments
#     """
#     topic = "AI in healthcare, allowing AI to override human decisions in healthcare."
#     # Prepare summaries if we have history
#     history = history or []
#     user_summary, llm_summary = summarize_debate_history(history) if history else ("", "")

#     # Common opening for all rounds
#     base_prompt = (
#         f"You are an expert medical debater arguing {debate_side.upper()} the proposition:\n"
#         f"    \"{topic}\"\n\n"
#         "In your response you MUST:\n"
#         "  1. Address a specific sentence by the user using “As you said <…>, ...”\n"
#         "  2. Fact-check any dubious claims (e.g., if the user says “1+1=3”, point out that this is incorrect and why).\n"
#         "  3. Be persuasive, logical, cite medical evidence when possible.\n"
#         "  4. Very important that you keep it in nearly 50 words.\n\n"
#         "  5. You are generating response for a audio debate so keep the grammer and response like a speech.\n\n"
#     )

#     if debate_round == 1:
#         # Opening round: respond directly to the user's opening argument
#         full_prompt = (
#             f"{base_prompt}"
#             f"User's opening argument:\n{user_input}\n\n"
#             "Your response:\n"
#         )
#     else:
#         # Later rounds: include summaries of past
#         full_prompt = (
#             f"{base_prompt}"
#             "Debate summary so far:\n"
#             f"  User arguments:\n{user_summary}\n\n"
#             f"  Debater responses:\n{llm_summary}\n\n"
#             f"User's latest argument:\n{user_input}\n\n"
#             "Your response:\n"
#         )

#     # Route through RAG if available, else fallback to Ollama
#     # if vector_db:
#     #     return query_llm(vector_db, full_prompt)
#     # else:
#     #     llm = OllamaLLM(model="deepseek-r1")
#     #     return llm.invoke(full_prompt)
    
#     llm = OllamaLLM(model="deepseek-r1")
#     return llm.invoke(full_prompt)
