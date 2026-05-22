'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { HEARTS_KEY } from '@/hooks/use-hearts';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

interface Props {
  params: Promise<{ quizId: string; attemptId: string }>;
}

interface Question {
  question: {
    id: string;
    question_type: string;
    question_text: string;
    explanation: string;
    points: number;
    order_index: number;
  };
  answers: Array<{
    id: string;
    answer_text: string;
    order_index: number;
  }>;
}

interface QuizDetail {
  quiz: {
    id: string;
    title: string;
    time_limit_minutes?: number;
    shuffle_questions?: boolean;
    passing_score_percentage: number;
    max_attempts: number;
    lesson_id: string;
    show_correct_answers: boolean;
  };
  questions: Question[];
}

interface HeartsPayload {
  hearts?: number;
  unlimited?: boolean;
}

export default function QuizAttemptPage({ params }: Props) {
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`/api/v1/admin/quizzes/${resolvedParams.quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const q: QuizDetail = data.quiz;
        setQuiz(q);

        // Shuffle questions if needed
        let qs: Question[] = q.questions || [];
        if (q.quiz.shuffle_questions) {
          qs = [...qs].sort(() => Math.random() - 0.5);
        }
        setQuestions(qs);

        // Инициализируем таймер сразу при загрузке quiz'а, чтобы не делать
        // setState в отдельном useEffect (см. react-hooks/set-state-in-effect).
        if (q.quiz.time_limit_minutes) {
          setTimeLeft(q.quiz.time_limit_minutes * 60);
        }
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.quizId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuiz();
  }, [loadQuiz]);

  const submitAnswer = useCallback(async (questionId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const selectedAnswers = answers[questionId] || [];

      const resp = await fetch(`/api/v1/attempts/${resolvedParams.attemptId}/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attempt_id: resolvedParams.attemptId,
          question_id: questionId,
          selected_answer_ids: selectedAnswers,
        }),
      });

      // Ответ имеет shape { answer, hearts? }. hearts заполняется только
      // когда ответ был неверным и gamification-service интегрирован.
      if (resp.ok) {
        const body = await resp.json().catch(() => null);
        if (body?.hearts) {
          const hearts = body.hearts as HeartsPayload;
          qc.setQueryData(HEARTS_KEY, hearts);
          const left = hearts.hearts ?? 0;
          if (!hearts.unlimited) {
            toast.error(
              left > 0
                ? t('quiz.livesLeft').replace('{n}', String(left))
                : t('quiz.livesGone')
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [answers, resolvedParams.attemptId, qc, t]);

  const handleComplete = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Submit current answer
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        await submitAnswer(currentQuestion.question.id);
      }

      // Complete attempt
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/v1/attempts/${resolvedParams.attemptId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await response.json();
        router.push(`/quiz/${resolvedParams.quizId}/result/${resolvedParams.attemptId}`);
      } else {
        alert(t('quiz.failedToComplete'));
      }
    } catch (err) {
      console.error('Failed to complete quiz:', err);
      alert(t('quiz.failedToComplete'));
    } finally {
      setSubmitting(false);
    }
  }, [submitting, questions, currentQuestionIndex, submitAnswer, resolvedParams.attemptId, resolvedParams.quizId, router, t]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleComplete]);

  const handleAnswerChange = (questionId: string, answerId: string, checked: boolean) => {
    const question = questions.find(q => q.question.id === questionId);
    if (!question) return;

    if (question.question.question_type === 'multiple_choice' || question.question.question_type === 'true_false') {
      // Single answer
      setAnswers(prev => ({
        ...prev,
        [questionId]: checked ? [answerId] : [],
      }));
    } else {
      // Multiple answers
      setAnswers(prev => {
        const current = prev[questionId] || [];
        if (checked) {
          return { ...prev, [questionId]: [...current, answerId] };
        } else {
          return { ...prev, [questionId]: current.filter((id: string) => id !== answerId) };
        }
      });
    }
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    await submitAnswer(currentQuestion.question.id);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">{t('quiz.loading')}</div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">{t('quiz.notFound')}</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.quiz.title}</h1>
            {timeLeft !== null && (
              <div className={`text-lg font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {t('quiz.questionOf')
              .replace('{current}', String(currentQuestionIndex + 1))
              .replace('{total}', String(questions.length))}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question.question_text}
            </div>

            <div className="space-y-3">
              {currentQuestion.answers.map((answer) => {
                const isSelected = (answers[currentQuestion.question.id] || []).includes(answer.id);
                const isMultiple = currentQuestion.question.question_type === 'multiple_select';

                return (
                  <label
                    key={answer.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type={isMultiple ? 'checkbox' : 'radio'}
                      name={currentQuestion.question.id}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(currentQuestion.question.id, answer.id, e.target.checked)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-900">{answer.answer_text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('quiz.prev')}
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[questions[index].question.id]?.length > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? t('quiz.submitting') : t('quiz.complete')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('quiz.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
