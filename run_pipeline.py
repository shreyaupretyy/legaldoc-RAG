import os
import torch
from legaldocrag import PipelineConfig, LegalRAGPipeline


def main():
	print("=" * 80)
	print("Legal RAG Pipeline - Legal Document Question Answering")
	print("=" * 80)
	
	# Display GPU information
	if torch.cuda.is_available():
		gpu_name = torch.cuda.get_device_name(0)
		gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
		print(f"\n✓ GPU Detected: {gpu_name}")
		print(f"✓ Total VRAM: {gpu_memory:.2f} GB")
	else:
		print("\n⚠ No GPU detected. Running on CPU (slower).")
	
	# Display model configuration
	print(f"\n📚 Model Configuration:")
	print(f"   • LLM Model: {PipelineConfig.BASE_LLM_MODEL}")
	print(f"   • Embedding Model: {PipelineConfig.EMBEDDING_MODEL}")
	print(f"   • Reranker Model: {PipelineConfig.RERANKER_MODEL}")
	
	# Show which model is active
	if 'TinyLlama' in PipelineConfig.BASE_LLM_MODEL:
		print(f"\n   ℹ️  Using TinyLlama-1.1B (Optimized for 6GB GPU)")
		print(f"   ℹ️  For larger models, see MODEL_SELECTION.md")
	elif 'Llama-2-7b' in PipelineConfig.BASE_LLM_MODEL:
		print(f"\n   ⚠️  Using LLaMA-2-7B (Requires 16GB+ GPU)")
	elif 'Llama-2-13b' in PipelineConfig.BASE_LLM_MODEL:
		print(f"\n   ⚠️  Using LLaMA-2-13B (Requires 24GB+ GPU)")
	
	print("=" * 80)
	
	# Create a dummy LoRA adapter directory for demonstration if it doesn't exist
	if not os.path.exists(PipelineConfig.LORA_ADAPTER_PATH):
		os.makedirs(PipelineConfig.LORA_ADAPTER_PATH)
		print(f"Created dummy LoRA adapter directory at '{PipelineConfig.LORA_ADAPTER_PATH}'.")
		print("NOTE: The generator will use the base LLaMA model as no real adapters are present.")

	# Initialize Pipeline
	config = PipelineConfig()
	pipeline = LegalRAGPipeline(config)

	# Load and Process Documents (Simulated)
	legal_documents = {
		"doc_id_1": "Article 90 of the Japanese Civil Law states that a juridical act with a purpose which is against public policy is void. This includes acts related to illegal gambling.",
		"doc_id_2": "In the case of Smith v. Jones (Federal Court of Canada, 2021), the court ruled that contract termination requires a clear and unambiguous notice period as specified in the agreement.",
		"doc_id_3": "The principle of judicial review allows the Federal Court of Canada to assess the lawfulness of a decision or action made by a public body.",
		"doc_id_4": "Under Japanese Civil Law, a contract is formed upon the meeting of minds (offer and acceptance), and does not necessarily require written form unless specified by statute.",
		"doc_id_5": "Canadian intellectual property law protects creations of the mind, such as inventions, literary and artistic works, designs, and symbols, names and images used in commerce.",
	}
	pipeline.process_documents(legal_documents)

	# Answer a Query
	user_query = "What is required for contract termination according to the Federal Court of Canada?"
	result = pipeline.answer_query(user_query)

	# Display Results
	print("\n\n================ FINAL RESULT ================")
	print(f"Query: {result['query']}")
	print("\nAnswer:")
	print(result['answer'])
	print("\nSources:")
	for source in result['sources']:
		print(f"- ID: {source['id']}, Score: {source['score']:.4f}")
	print("\nCorrection Check:")
	print(f"  - Consistent: {result['correction_check']['is_consistent']}")
	print(f"  - Reasoning: {result['correction_check']['reasoning']}")
	print("============================================")


if __name__ == "__main__":
	main()
