# Legal RAG Pipeline 🏛️⚖️

A **modular Retrieval-Augmented Generation (RAG) system** for legal document analysis, featuring hybrid retrieval, cross-encoder reranking, and LLM-based generation with quality assurance.

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)

---

## 🎯 Overview

The Legal RAG Pipeline is designed to answer complex legal queries by:

1. **Preprocessing** queries with Named Entity Recognition (NER)
2. **Expanding** queries using a knowledge graph
3. **Retrieving** relevant documents using hybrid search (BM25 + FAISS)
4. **Reranking** results with cross-encoder models
5. **Generating** answers using fine-tuned LLMs
6. **Validating** responses for hallucinations and consistency

This system is particularly useful for:
- Legal research and case law analysis
- Contract review and interpretation
- Compliance checking
- Legal question answering systems

---

## ✨ Features

- 🔍 **Hybrid Retrieval**: Combines BM25 (sparse) and FAISS (dense) retrieval for optimal coverage
- 🧠 **Knowledge Graph Expansion**: Expands queries using legal domain knowledge
- 🎯 **Cross-Encoder Reranking**: Reranks retrieved documents for better relevance
- 🤖 **LoRA-tuned Generation**: Uses fine-tuned LLaMA models for legal text generation
- ✅ **Quality Assurance**: Built-in hallucination detection and consistency checking
- 📚 **Citation Tracking**: Automatic citation linking to source documents
- 🏗️ **Modular Architecture**: Easy to extend and customize individual components
- 💻 **Windows Compatible**: Works on Windows without bitsandbytes complications

---

## 📁 Project Structure

```
FuseProject/
├── legaldocrag/                # Main package
│   ├── __init__.py             # Package initialization
│   ├── pipeline.py             # Main orchestration pipeline
│   ├── preprocessing.py        # NER and entity extraction (spaCy)
│   ├── knowledge.py            # Knowledge graph query expansion
│   ├── retrieval.py            # Hybrid BM25 + FAISS retrieval
│   ├── reranker.py             # Cross-encoder reranking
│   ├── generator.py            # LLM-based answer generation
│   ├── corrective.py           # Hallucination detection & quality assurance
│   ├── citations.py            # Citation formatting utilities
│   └── config.py               # Pipeline configuration & settings
├── Model/                      # Original implementation
│   └── model.py                # Original monolithic file (preserved for reference)
├── frontend/                   # React frontend application
│   ├── src/                    # Frontend source code
│   ├── public/                 # Static assets
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   └── README.md               # Frontend documentation
├── docs/                       # Documentation files
├── lora_adapters/              # LoRA fine-tuned adapters (gitignored)
├── run_pipeline.py             # Main entry point (full pipeline)
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

**Note**: The `lora_adapters/` directory contains LoRA fine-tuned model weights and is excluded from version control due to large file sizes. See [.gitignore](.gitignore) for details.



