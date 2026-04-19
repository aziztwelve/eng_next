'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes?: number;
  max_attempts: number;
  passing_score_percentage: number;
  is_required: boolean;
}

interface QuizCardProps {
  lessonId: string;
}

export default function QuizCard({ lessonId }: QuizCardProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadQuizzes();
  }, [lessonId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Load quizzes for lesson
      const response = await fetch(`/api/v1/lessons/${lessonId}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);

        // Load attempts for each quiz
        for (const quiz of data.quizzes || []) {
          const attemptsResponse = await fetch(`/api/v1/quizzes/${quiz.id}/attempts/my`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (attemptsResponse.ok) {
            const attemptsData = await attemptsResponse.json();
            setAttempts(prev => ({ ...prev, [quiz.id]: attemptsData.attempts || [] }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/v1/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/quiz/${quizId}/attempt/${data.id}`);
      } else {
        alert('Failed to start quiz');
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      alert('Failed to start quiz');
    }
  };

  const getAttemptStatus = (quizId: string) => {
    const quizAttempts = attempts[quizId] || [];
    if (quizAttempts.length === 0) return null;

    const lastAttempt = quizAttempts[quizAttempts.length - 1];
    const quiz = quizzes.find(q => q.id === quizId);

    return {
      count: quizAttempts.length,
      maxAttempts: quiz?.max_attempts || 0,
      lastScore: lastAttempt.score_percentage,
      passed: lastAttempt.is_passed,
      canRetry: quizAttempts.length < (quiz?.max_attempts || 0),
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600">Loading quizzes...</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Quizzes</h3>
      
      {quizzes.map((quiz) => {
        const status = getAttemptStatus(quiz.id);

        return (
          <div key={quiz.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                  {quiz.is_required && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mt-1">{quiz.description}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {quiz.time_limit_minutes && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.time_limit_minutes} minutes
                    </div>
                  )}
                  <div>Max attempts: {quiz.max_attempts}</div>
                  <div>Passing score: {quiz.passing_score_percentage}%</div>
                </div>

                {status && (
                  <div className="mt-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      status.passed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status.passed ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Passed ({status.lastScore?.toFixed(0)}%)
                        </>
                      ) : (
                        <>
                          Last attempt: {status.lastScore?.toFixed(0)}%
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Attempts: {status.count} / {status.maxAttempts}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {!status || status.canRetry ? (
                  <button
                    onClick={() => startQuiz(quiz.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {status ? 'Retry' : 'Start Quiz'}
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    No attempts left
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
