import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {HNSWLib} from "langchain/vectorstores/hnswlib";           // local fallback

export async function remember(key, data) { /* upsert embedding */ }
export async function recall(key)    { /* similarity search   */ }