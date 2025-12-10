// Generate related questions based on the user's query and answer
export function generateRelatedQuestions(
  userQuestion: string,
  answer: string
): string[] {
  const questions: string[] = [];

  // Define legal topic patterns and their related questions
  const topicPatterns = [
    {
      keywords: ["divorce", "marriage", "separation", "custody"],
      questions: [
        "What are the grounds for divorce in India?",
        "How long does the divorce process typically take?",
        "What are the child custody laws in India?",
        "Can I file for divorce without mutual consent?"
      ]
    },
    {
      keywords: ["property", "land", "real estate", "inheritance", "will"],
      questions: [
        "What documents are required for property registration?",
        "How is property divided among legal heirs?",
        "Can agricultural land be sold to non-farmers?",
        "What are the stamp duty charges for property transfer?"
      ]
    },
    {
      keywords: ["criminal", "fir", "police", "arrest", "bail"],
      questions: [
        "How do I file an FIR online?",
        "What are my rights if I'm arrested?",
        "Can I get anticipatory bail?",
        "What is the difference between bailable and non-bailable offenses?"
      ]
    },
    {
      keywords: ["consumer", "complaint", "refund", "defective", "warranty"],
      questions: [
        "How do I file a consumer complaint?",
        "What is the time limit for filing a consumer case?",
        "Can I claim compensation for defective products?",
        "Where should I file a consumer complaint?"
      ]
    },
    {
      keywords: ["employment", "labor", "salary", "termination", "resignation"],
      questions: [
        "What are my rights if I'm terminated unfairly?",
        "Can my employer withhold my salary?",
        "What is the notice period required for resignation?",
        "How do I claim unpaid wages?"
      ]
    },
    {
      keywords: ["contract", "agreement", "breach", "dispute"],
      questions: [
        "What makes a contract legally valid?",
        "What are the remedies for breach of contract?",
        "Can an oral agreement be enforced?",
        "How do I draft a legal agreement?"
      ]
    },
    {
      keywords: ["tenant", "landlord", "rent", "eviction", "lease"],
      questions: [
        "What are the rights of a tenant in India?",
        "How can a landlord evict a tenant legally?",
        "Can rent be increased without notice?",
        "What is rent control act?"
      ]
    },
    {
      keywords: ["cyber", "online", "fraud", "scam", "digital"],
      questions: [
        "How do I report cybercrime?",
        "What legal action can I take against online fraud?",
        "Are social media posts legally protected?",
        "What are the penalties for cybercrime?"
      ]
    }
  ];

  // Find matching topic
  const lowerQuestion = userQuestion.toLowerCase();
  const lowerAnswer = answer.toLowerCase();

  for (const topic of topicPatterns) {
    const hasMatch = topic.keywords.some(
      (keyword) =>
        lowerQuestion.includes(keyword) || lowerAnswer.includes(keyword)
    );

    if (hasMatch) {
      // Filter out questions very similar to the original
      const filtered = topic.questions.filter(
        (q) => !isTooSimilar(q, userQuestion)
      );
      questions.push(...filtered.slice(0, 3));
      break;
    }
  }

  // If no specific topic matched, provide general legal questions
  if (questions.length === 0) {
    questions.push(
      "What are the legal remedies available in my case?",
      "What documents do I need to prepare?",
      "How long does this legal process typically take?"
    );
  }

  // Return up to 4 related questions
  return questions.slice(0, 4);
}

// Helper function to check if questions are too similar
function isTooSimilar(q1: string, q2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words1 = new Set(normalize(q1).split(/\s+/));
  const words2 = new Set(normalize(q2).split(/\s+/));

  let commonWords = 0;
  words1.forEach((word) => {
    if (words2.has(word) && word.length > 3) {
      commonWords++;
    }
  });

  // If more than 50% of words match, consider too similar
  const similarity = commonWords / Math.min(words1.size, words2.size);
  return similarity > 0.5;
}
