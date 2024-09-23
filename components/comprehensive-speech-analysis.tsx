"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Pause } from "lucide-react";
import { toast } from "react-hot-toast";
import WaveLoading from "./ui/wave-loading";

interface AnalysisResult {
  topic: string;
  transcription: string;
  content: {
    depth: number;
    relevance: number;
    keyPoints: string[];
    suggestions: string[];
  };
  structure: {
    score: number;
    feedback: string;
  };
  tone: {
    score: number;
    feedback: string;
  };
  language: {
    score: number;
    feedback: string;
    notableExpressions: string[];
  };
  pronunciation: {
    score: number;
    issues: string[];
  };
  grammar: {
    score: number;
    errors: string[];
  };
  overallEffectiveness: {
    score: number;
    strengths: string[];
    areasForImprovement: string[];
  };
}

const topics = [
  "The importance of renewable energy",
  "The impact of social media on society",
  "The future of artificial intelligence",
  "The benefits of learning a second language",
  "The effects of climate change on biodiversity",
];

const analyzeAudio = async (
  audioBlob: Blob,
  topic: string
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");
  formData.append("topic", topic);

  const response = await fetch("/api/analyze-speech", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze audio");
  }

  return response.json();
};

export default function ComprehensiveSpeechAnalysis() {
  const [topic, setTopic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false)

  useEffect(() => {
    setTopic(topics[Math.floor(Math.random() * topics.length)]);
  }, []);

  const startRecording = async () => {
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAnalysis(null); // Reset analysis while processing
        // setIsAnalysing(true)
        try {
          const result = await analyzeAudio(audioBlob, topic);
          setAnalysis(result);
          setPreviousScores((prev) =>
            [...prev, result.overallEffectiveness.score].slice(-5)
          ); // Keep last 5 scores
        } catch (error) {
          console.error("Error analyzing audio:", error);
          toast.error(`Error analyzing audio: ${error.message}`);
        }
        // } finally {
        //   setIsAnalysing(false)
        // }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(`Error starting recording: ${error.message}`);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Comprehensive Speech Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Topic:</h2>
            <p className="text-lg p-4 bg-muted rounded-md">{topic}</p>
          </div>

          <div className="flex justify-center">
            {!isRecording ? (
              <Button onClick={startRecording}>
                <Mic className="mr-2 h-4 w-4" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <Square className="mr-2 h-4 w-4" /> Stop Recording
              </Button>
            )}
          </div>

          {audioUrl && (
            <div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <Button onClick={togglePlayback}>
                {isPlaying ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isPlaying ? "Pause" : "Play"} Recording
              </Button>
            </div>
          )}

          {analysis === null && audioUrl && (
            <div>
              <p className="text-center mb-4">Analyzing your speech...</p>
              <WaveLoading />
            </div>
          )}

          {analysis && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Your Answer (Transcription):
                </h3>
                <p className="bg-muted p-4 rounded-md">
                  {analysis.transcription}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Feedback:</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Overall Effectiveness:
                    </h4>
                    <Progress
                      value={analysis.overallEffectiveness.score}
                      className="w-full"
                    />
                    <p className="mt-2">
                      {analysis.overallEffectiveness.score}/100
                    </p>
                    <h5 className="font-semibold mt-2">Strengths:</h5>
                    <ul className="list-disc pl-5">
                      {analysis.overallEffectiveness.strengths.map(
                        (strength, index) => (
                          <li key={index}>{strength}</li>
                        )
                      )}
                    </ul>
                    <h5 className="font-semibold mt-2">
                      Areas for Improvement:
                    </h5>
                    <ul className="list-disc pl-5">
                      {analysis.overallEffectiveness.areasForImprovement.map(
                        (area, index) => (
                          <li key={index}>{area}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Content:</h4>
                    <p>Depth: {analysis.content.depth}/100</p>
                    <p>Relevance: {analysis.content.relevance}/100</p>
                    <h5 className="font-semibold mt-2">Key Points:</h5>
                    <ul className="list-disc pl-5">
                      {analysis.content.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                    <h5 className="font-semibold mt-2">
                      Suggestions for Improvement:
                    </h5>
                    <ul className="list-disc pl-5">
                      {analysis.content.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Structure:</h4>
                    <Progress
                      value={analysis.structure.score}
                      className="w-full"
                    />
                    <p className="mt-2">{analysis.structure.score}/100</p>
                    <p>{analysis.structure.feedback}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Tone:</h4>
                    <Progress value={analysis.tone.score} className="w-full" />
                    <p className="mt-2">{analysis.tone.score}/100</p>
                    <p>{analysis.tone.feedback}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Language:</h4>
                    <Progress
                      value={analysis.language.score}
                      className="w-full"
                    />
                    <p className="mt-2">{analysis.language.score}/100</p>
                    <p>{analysis.language.feedback}</p>
                    <h5 className="font-semibold mt-2">Notable Expressions:</h5>
                    <ul className="list-disc pl-5">
                      {analysis.language.notableExpressions.map(
                        (expression, index) => (
                          <li key={index}>{expression}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Pronunciation:
                    </h4>
                    <Progress
                      value={analysis.pronunciation.score}
                      className="w-full"
                    />
                    <p className="mt-2">{analysis.pronunciation.score}/100</p>
                    <h5 className="font-semibold mt-2">Issues:</h5>
                    <ul className="list-disc pl-5">
                      {analysis.pronunciation.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2">Grammar:</h4>
                    <Progress
                      value={analysis.grammar.score}
                      className="w-full"
                    />
                    <p className="mt-2">{analysis.grammar.score}/100</p>
                    <h5 className="font-semibold mt-2">Errors:</h5>
                    <ul className="list-disc pl-5">
                      {analysis.grammar.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Progress Tracking:
                </h3>
                <div className="flex items-center space-x-2">
                  {previousScores.map((score, index) => (
                    <div key={index} className="text-center">
                      <div className="w-8 h-20 bg-gray-200 relative">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-blue-500"
                          style={{ height: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{index + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm">Last 5 attempts</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
