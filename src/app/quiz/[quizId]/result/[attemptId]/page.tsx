'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ quizId: string; attemptId: string }>;
}

export default function QuizResultPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    loadResults();
  }, [resolvedParams.attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Load attempt with answers
      const attemptResponse = await fetch(`/api/v1/attempts/${resolvedParams.attemptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (attemptResponse.ok) {
        const attemptData = await attemptResponse.json();
        setAttempt(attemptData);
      }

      // Load quiz details
      const quizResponse = await fetch(`/api/v1/admin/quizzes/${resolvedParams.quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuiz(quizData.quiz);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Results not found</div>
      </div>
    );
  }

  const passed = attempt.attempt.is_passed;
  const scorePercentage = attempt.attempt.score_percentage || 0;
  const earnedPoints = attempt.attempt.earned_points || 0;
  const totalPoints = attempt.attempt.total_points || 0;
  const timeSpent = attempt.attempt.time_spent_seconds;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            {passed ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {passed
                ? 'You passed the quiz!'
                : `You need ${quiz.quiz.passing_score_percentage}% to pass`}
            </p>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {scorePercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Score</div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {earnedPoints}/{totalPoints}
                </div>
                <div className="text-sm text-gray-600 mt-1">Points</div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {timeSpent ? formatTime(timeSpent) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Time</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Dashboard
              </Link>
              {!passed && attempt.attempt.attempt_number < quiz.quiz.max_attempts && (
                <button
                  onClick={() => router.push(`/lesson/${quiz.quiz.lesson_id}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {quiz.quiz.show_correct_answers && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Answers</h2>

            <div className="space-y-6">
              {quiz.questions.map((q: any, index: number) => {
                const userAnswer = attempt.answers.find((a: any) => a.question_id === q.question.id);
                const isCorrect = userAnswer?.is_correct;

                return (
                  <div key={q.question.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-2">
                          {index + 1}. {q.question.question_text}
                        </div>

                        <div className="space-y-2">
                          {q.answers.map((answer: any) => {
                            const isUserAnswer = userAnswer?.selected_answer_ids?.includes(answer.id);
                            const isCorrectAnswer = answer.is_correct;

                            return (
                              <div
                                key={answer.id}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer
                                    ? 'border-green-500 bg-green-50'
                                    : isUserAnswer
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <span className="text-green-600 font-semibold">✓</span>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <span className="text-red-600 font-semibold">✗</span>
                                  )}
                                  <span className={isCorrectAnswer ? 'font-medium' : ''}>
                                    {answer.answer_text}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {q.question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-900 mb-1">Explanation:</div>
                            <div className="text-sm text-blue-800">{q.question.explanation}</div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600 mt-2">
                          Points: {userAnswer?.points_earned || 0} / {q.question.points}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
