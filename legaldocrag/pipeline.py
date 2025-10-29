from .config import PipelineConfig
from .preprocessing import PreprocessingEngine
from .knowledge import KnowledgeGraphExpander
from .retrieval import HybridRetriever
from .reranker import Reranker
from .generator import Generator
from .corrective import CorrectiveLayer
from .citations import CitationParser


class LegalRAGPipeline:
	"""Orchestrates the entire RAG pipeline."""
	def __init__(self, config: PipelineConfig):
		self.config = config
		self.documents = {}

		# Initialize all components
		self.preprocessor = PreprocessingEngine()
		self.kg_expander = KnowledgeGraphExpander()
		self.retriever = HybridRetriever(self.config.EMBEDDING_MODEL)
		self.reranker = Reranker(self.config.RERANKER_MODEL)
		self.generator = Generator(
			self.config.BASE_LLM_MODEL,
			self.config.LORA_ADAPTER_PATH,
			self.config.BNB_CONFIG,
		)
		self.corrective_layer = CorrectiveLayer(self.generator)
		self.citation_parser = CitationParser()

		self.audit_log = []

	def process_documents(self, documents: dict):
		"""Loads and indexes the legal documents."""
		print("\n--- Starting Document Processing ---")
		self.documents = documents
		self.retriever.build_indexes(self.documents)
		print("--- Document Processing Complete ---\n")

	def answer_query(self, query: str):
		"""Main method to answer a user query, following the full pipeline."""
		print(f"\n--- Answering Query: '{query}' ---")
		self.audit_log.append(f"INITIAL_QUERY: {query}")

		# Layer 1: Query Ingestion & Expansion
		entities = self.preprocessor.extract_entities(query)
		expanded_query = self.kg_expander.expand_query(query, entities)
		self.audit_log.append(f"EXPANDED_QUERY: {expanded_query}")

		# Dynamic Retrieval Loop
		reranked_docs = []
		context_is_sufficient = False
		current_loop = 0

		while not context_is_sufficient and current_loop < self.config.MAX_RETRIEVAL_LOOPS:
			current_loop += 1
			print(f"\n--- Retrieval Loop #{current_loop} ---")
			self.audit_log.append(f"LOOP_{current_loop}_QUERY: {expanded_query}")

			# Layer 2: Hybrid Retrieval & Reranking
			candidate_ids = self.retriever.retrieve(
				expanded_query,
				self.config.TOP_K_BM25,
				self.config.TOP_K_FAISS,
			)

			if not candidate_ids:
				print("No documents retrieved. Aborting.")
				return {"answer": "Could not find any relevant documents to answer the query."}

			reranked_docs = self.reranker.rerank(query, self.documents, candidate_ids)
			self.audit_log.append(f"LOOP_{current_loop}_RERANKED_IDS: {[d['id'] for d in reranked_docs]}")

			# Check for sufficiency
			if reranked_docs and reranked_docs[0]['score'] >= self.config.RERANKER_CONFIDENCE_THRESHOLD:
				context_is_sufficient = True
				print(
					f"Context deemed sufficient. Top score {reranked_docs[0]['score']:.4f} >= {self.config.RERANKER_CONFIDENCE_THRESHOLD}"
				)
			else:
				print("Context may be insufficient. Reformulating query for next loop.")
				# Simple reformulation for demonstration
				expanded_query += " legal precedent"

		# Prepare context for generator
		final_docs = reranked_docs[: self.config.TOP_K_RERANKED] if reranked_docs else []
		context = "\n\n".join([f"Content from [{doc['id']}]:\n{doc['text']}" for doc in final_docs])
		self.audit_log.append(f"FINAL_CONTEXT_DOCS: {[d['id'] for d in final_docs]}")

		# Layer 3: Generation
		generated_answer = self.generator.generate(query, context)
		self.audit_log.append(f"GENERATED_ANSWER: {generated_answer}")

		# Layer 4: Quality Assurance & Finalization
		correction_result = self.corrective_layer.check(generated_answer, context)
		self.audit_log.append(f"CORRECTION_RESULT: {correction_result}")

		final_answer = generated_answer
		if not correction_result['is_consistent']:
			final_answer += "\n\n"

		# Add citation links
		final_answer_with_citations = self.citation_parser.link_citations(final_answer, final_docs)

		# Final Output
		output = {
			"query": query,
			"answer": final_answer_with_citations,
			"sources": final_docs,
			"correction_check": correction_result,
		}

		print("\n--- Query Processing Complete ---")
		return output
