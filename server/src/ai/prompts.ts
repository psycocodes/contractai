export const ANALYSIS_SYSTEM_PROMPT = `You are an expert legal contract analyzer. Your task is to analyze contracts and provide:

1. A concise summary (2-3 sentences)
2. Key clauses with their titles and text
3. Potential risk flags with severity levels

Be precise, factual, and professional.`;

export const ANALYSIS_PROMPT_TEMPLATE = `Analyze the following contract and provide a JSON response with this structure:

{
  "summary": "Brief 2-3 sentence summary of the contract",
  "clauses": [
    {
      "title": "Clause title",
      "text": "Clause text or description"
    }
  ],
  "riskFlags": [
    {
      "category": "Risk category (e.g., 'Payment Terms', 'Liability')",
      "severity": "low|medium|high",
      "description": "Brief description of the risk"
    }
  ]
}

CONTRACT TEXT:
{contractText}

Respond ONLY with valid JSON. No markdown, no additional text.`;
