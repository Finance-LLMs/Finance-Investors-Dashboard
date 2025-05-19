from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

# Path to the Wikipedia data file
DATA_PATH = os.path.join(os.path.dirname(__file__), '../sit-data/sit_wikipedia.txt')
VECTOR_DB_DIR = os.path.join(os.path.dirname(__file__), '../vector_context')

# Load the Wikipedia text
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    raw_text = f.read()

# Split the text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100
)
docs = text_splitter.create_documents([raw_text])

# Create embeddings
embedding_model = OllamaEmbeddings(model="deepseek-r1")

# Create and persist the vector database
vector_db = Chroma.from_documents(
    docs,
    embedding_model,
    persist_directory=VECTOR_DB_DIR
)

print(f"Vector DB built and saved to {VECTOR_DB_DIR}")
