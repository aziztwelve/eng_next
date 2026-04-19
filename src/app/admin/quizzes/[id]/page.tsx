'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/admin-api';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditQuizPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    loadQuiz();
  }, [resolvedParams.id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getQuiz(resolvedParams.id);
      setQuiz(data.quiz);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      await adminAPI.updateQuiz(resolvedParams.id, {
        title: quiz.quiz.title,
        description: quiz.quiz.description,
        time_limit_minutes: quiz.quiz.time_limit_minutes || undefined,
        max_attempts: quiz.quiz.max_attempts,
        passing_score_percentage: quiz.quiz.passing_score_percentage,
        shuffle_questions: quiz.quiz.shuffle_questions,
        show_correct_answers: quiz.quiz.show_correct_answers,
        is_required: quiz.quiz.is_required,
      });

      router.push('/admin/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;

    try {
      await adminAPI.deleteQuestion(questionId);
      loadQuiz(); // Reload to refresh
    } catch (err: any) {
      alert('Failed to delete question: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
        <p className="text-gray-600 mt-1">{quiz.quiz.title}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Quiz Settings */}
      <form onSubmit={handleUpdateQuiz} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={quiz.quiz.title}
            onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, title: e.target.value } })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={quiz.quiz.description}
            onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, description: e.target.value } })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={quiz.quiz.time_limit_minutes || ''}
              onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              min="1"
              placeholder="No limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts *
            </label>
            <input
              type="number"
              value={quiz.quiz.max_attempts}
              onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, max_attempts: parseInt(e.target.value) } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Score (%) *
          </label>
          <input
            type="number"
            value={quiz.quiz.passing_score_percentage}
            onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, passing_score_percentage: parseInt(e.target.value) } })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            min="0"
            max="100"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quiz.quiz.shuffle_questions}
              onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, shuffle_questions: e.target.checked } })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Shuffle questions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quiz.quiz.show_correct_answers}
              onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, show_correct_answers: e.target.checked } })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show correct answers after completion</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quiz.quiz.is_required}
              onChange={(e) => setQuiz({ ...quiz, quiz: { ...quiz.quiz, is_required: e.target.checked } })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Required to complete lesson</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Questions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Questions ({quiz.questions?.length || 0})
          </h2>
          <button
            onClick={() => router.push(`/admin/quizzes/${resolvedParams.id}/add-question`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Question
          </button>
        </div>

        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="space-y-4">
            {quiz.questions.map((q: any, index: number) => (
              <div key={q.question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {index + 1}. {q.question.question_text}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Type: {q.question.question_type} • Points: {q.question.points}
                    </div>
                    {q.question.explanation && (
                      <div className="text-sm text-gray-500 mt-1 italic">
                        Explanation: {q.question.explanation}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.question.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  {q.answers.map((a: any) => (
                    <div
                      key={a.id}
                      className={`text-sm px-3 py-2 rounded ${
                        a.is_correct
                          ? 'bg-green-50 text-green-900 font-medium'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {a.is_correct && '✓ '}
                      {a.answer_text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No questions yet. Add your first question to get started.
          </p>
        )}
      </div>
    </div>
  );
}
