/**
 * Single entry point for LLM calls. Prefers Groq (fast + free tier), falls back
 * to OpenAI, and reports when neither is configured so callers can degrade to
 * the local ML models instead of throwing.
 */

const Groq = require('groq-sdk');
const OpenAI = require('openai');
const config = require('../config/config');

let groqClient = null;
let openaiClient = null;

if (config.groqApiKey) groqClient = new Groq({ apiKey: config.groqApiKey });
if (config.openaiApiKey) openaiClient = new OpenAI({ apiKey: config.openaiApiKey });

const isEnabled = () => Boolean(groqClient || openaiClient);

/**
 * Extracts the first JSON object/array from a model response, tolerating
 * markdown fences and leading prose.
 */
function parseJsonResponse(content) {
  const text = String(content || '').replace(/```json|```/g, '').trim();
  const start = text.search(/[[{]/);
  if (start === -1) throw new Error('No JSON found in model response');

  const opening = text[start];
  const closing = opening === '[' ? ']' : '}';
  const end = text.lastIndexOf(closing);
  if (end <= start) throw new Error('Malformed JSON in model response');

  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Runs a chat completion, trying each configured provider in order.
 * Returns parsed JSON when `json` is true.
 */
async function complete({ system, prompt, temperature = 0.5, maxTokens = 1200, json = true }) {
  const attempts = [];
  if (groqClient) attempts.push({ client: groqClient, model: config.groqModel });
  if (openaiClient) attempts.push({ client: openaiClient, model: config.openaiModel });

  if (!attempts.length) {
    const error = new Error('No AI provider configured (set GROQ_API_KEY or OPENAI_API_KEY)');
    error.code = 'AI_DISABLED';
    throw error;
  }

  let lastError;
  for (const { client, model } of attempts) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      });

      const content = completion.choices[0].message.content;
      return json ? parseJsonResponse(content) : content;
    } catch (error) {
      lastError = error;
      console.error(`AI provider failed (${model}):`, error.message);
    }
  }

  throw lastError;
}

module.exports = { complete, parseJsonResponse, isEnabled };
