import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    const topic = formData.get('topic') as string;

    if (!audio || !topic) {
      return NextResponse.json({ error: 'Missing audio or topic' }, { status: 400 });
    }

    console.log('Received audio file:', audio.name, 'Size:', audio.size, 'bytes');
    console.log('Topic:', topic);

    // Transcribe audio
    console.log('Starting transcription...');
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
    });

    const transcription = transcriptionResponse.text;
    console.log('Transcription completed:', transcription);

    // Analyze the transcription
    console.log('Starting analysis...');
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes speech. Provide a detailed analysis of the given transcription based on the topic. Your analysis should be thorough, constructive, and tailored to the specific topic."
        },
        {
          role: "user",
          content: `Topic: ${topic}

Transcription: ${transcription}

Please analyze the transcription based on the given topic. Provide a comprehensive assessment covering the following aspects:

1. Content:
   - Evaluate the depth and relevance of the content in relation to the topic.
   - Assess the speaker's understanding and knowledge of the subject matter.
   - Identify any key points or arguments made.
   - Suggest areas where the content could be improved or expanded.

2. Structure and Coherence:
   - Evaluate the overall organization and flow of ideas.
   - Assess the clarity and logical progression of the speech.

3. Tone and Delivery:
   - Analyze the speaker's tone and how well it suits the topic.
   - Evaluate the effectiveness of the delivery in engaging the audience.

4. Language Use:
   - Assess the vocabulary and language complexity in relation to the topic.
   - Identify any notable phrases or expressions used.

5. Pronunciation and Fluency:
   - Evaluate the speaker's pronunciation and articulation.
   - Assess the overall fluency and smoothness of speech.

6. Grammar and Syntax:
   - Identify any grammatical errors or awkward sentence structures.
   - Suggest improvements for better clarity and correctness.

7. Overall Effectiveness:
   - Provide an overall assessment of how well the speech addresses the given topic.
   - Suggest key areas for improvement.

Please provide your analysis in the following JSON format:

{
  "content": {
    "depth": <number 0-100>,
    "relevance": <number 0-100>,
    "keyPoints": [<string>, <string>, ...],
    "suggestions": [<string>, <string>, ...]
  },
  "structure": {
    "score": <number 0-100>,
    "feedback": <string>
  },
  "tone": {
    "score": <number 0-100>,
    "feedback": <string>
  },
  "language": {
    "score": <number 0-100>,
    "feedback": <string>,
    "notableExpressions": [<string>, <string>, ...]
  },
  "pronunciation": {
    "score": <number 0-100>,
    "issues": [<string>, <string>, ...]
  },
  "grammar": {
    "score": <number 0-100>,
    "errors": [<string>, <string>, ...]
  },
  "overallEffectiveness": {
    "score": <number 0-100>,
    "strengths": [<string>, <string>, ...],
    "areasForImprovement": [<string>, <string>, ...]
  }
}`
        }
      ]
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
    console.log('Analysis completed:', analysis);

    return NextResponse.json({
      topic,
      transcription,
      ...analysis
    });
  } catch (error) {
    console.error('Error in analyze-speech API route:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}