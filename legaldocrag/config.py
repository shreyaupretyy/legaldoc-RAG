import torch

# Try to import BitsAndBytesConfig, but don't fail if unavailable (Windows compatibility)
try:
	from transformers import BitsAndBytesConfig
	BITSANDBYTES_AVAILABLE = True
except:
	BITSANDBYTES_AVAILABLE = False


class PipelineConfig:
	"""Configuration class for the RAG pipeline."""
	
	# ============================================================================
	# EMBEDDING AND RERANKING MODELS
	# ============================================================================
	EMBEDDING_MODEL = 'BAAI/bge-m3'  # ~2.3GB - High quality embeddings
	RERANKER_MODEL = 'cross-encoder/ms-marco-MiniLM-L-6-v2'  # ~90MB
	
	# ============================================================================
	# GENERATOR LLM (Language Model)
	# ============================================================================
	
	# CURRENTLY USING: TinyLlama-1.1B (Optimized for 6GB GPU)
	# This is a smaller, efficient model that works well on consumer hardware
	# Model size: ~2.2GB | Memory usage: ~4GB with FP16
	BASE_LLM_MODEL = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
	
	# ---- PLACEHOLDER: Larger Models (for future use with 16GB+ GPU) ----
	# Uncomment one of these when you have sufficient GPU memory:
	
	# Option 1: LLaMA-2-7B (Recommended for production)
	# Requires: 16GB+ GPU VRAM with 4-bit quantization OR 32GB+ for FP16
	# Model size: ~13.5GB | Memory usage: ~8GB (4-bit) or ~28GB (FP16)
	# BASE_LLM_MODEL = 'meta-llama/Llama-2-7b-hf'
	
	# Option 2: LLaMA-2-7B Chat (Better for conversational tasks)
	# BASE_LLM_MODEL = 'meta-llama/Llama-2-7b-chat-hf'
	
	# Option 3: Mistral-7B (High performance, good for legal text)
	# Requires: 16GB+ GPU VRAM
	# Model size: ~14GB | Memory usage: ~9GB (4-bit) or ~28GB (FP16)
	# BASE_LLM_MODEL = 'mistralai/Mistral-7B-v0.1'
	
	# Option 4: LLaMA-2-13B (Best quality, requires powerful GPU)
	# Requires: 24GB+ GPU VRAM with 4-bit quantization OR 48GB+ for FP16
	# Model size: ~26GB | Memory usage: ~16GB (4-bit) or ~52GB (FP16)
	# BASE_LLM_MODEL = 'meta-llama/Llama-2-13b-hf'
	
	# LoRA Adapters (for fine-tuning)
	# Assumes LoRA adapters are trained and saved in this directory
	LORA_ADAPTER_PATH = './lora_adapters/llama2-legal-tuned'
	
	# ============================================================================
	# INDEXING AND RETRIEVAL PARAMETERS
	# ============================================================================
	FAISS_INDEX_PATH = 'legal_faiss.index'
	TOP_K_BM25 = 5      # Number of documents retrieved by BM25 (sparse retrieval)
	TOP_K_FAISS = 5     # Number of documents retrieved by FAISS (dense retrieval)
	TOP_K_RERANKED = 3  # Number of documents after reranking
	
	# ============================================================================
	# DYNAMIC RETRIEVAL LOOP
	# ============================================================================
	RERANKER_CONFIDENCE_THRESHOLD = 0.5  # Minimum confidence score for context
	MAX_RETRIEVAL_LOOPS = 2               # Maximum number of retrieval attempts
	
	# ============================================================================
	# GPU OPTIMIZATION SETTINGS
	# ============================================================================
	DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
	USE_FP16 = True  # Use half precision (FP16) to reduce memory usage by 50%
	MAX_LENGTH = 2048  # Maximum context length for generation
	
	# ============================================================================
	# QUANTIZATION CONFIGURATION (for larger models)
	# ============================================================================
	# NOTE: Quantization is only used when loading larger models (7B+)
	# For TinyLlama, we use FP16 instead which is more efficient
	
	if BITSANDBYTES_AVAILABLE:
		# 4-bit quantization configuration (for models 7B+)
		# This reduces memory usage significantly (~8GB for 7B model vs ~28GB FP16)
		BNB_CONFIG = BitsAndBytesConfig(
			load_in_4bit=True,
			bnb_4bit_quant_type="nf4",
			bnb_4bit_compute_dtype=torch.bfloat16,
			bnb_4bit_use_double_quant=False,
		)
	else:
		# BitsAndBytes not available (common on Windows)
		# Will use FP16 or FP32 instead
		BNB_CONFIG = None
