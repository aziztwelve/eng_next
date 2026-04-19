'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/admin-api';

interface QuizFormData {
  lesson_id: string;
  title: string;
  description: string;
  time_limit_minutes: number | null;
  max_attempts: number;
  passing_score_percentage: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  is_required: boolean;
}

interface Question {
  id?: string;
  question_type: string;
  question_text: string;
  explanation: string;
  points: number;
  order_index: number;
  answers: Answer[];
}

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

export default function NewQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<QuizFormData>({
    lesson_id: '',
    title: '',
    description: '',
    time_limit_minutes: null,
    max_attempts: 3,
    passing_score_percentage: 70,
    shuffle_questions: false,
    show_correct_answers: true,
    is_required: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question_type: 'multiple_choice',
    question_text: '',
    explanation: '',
    points: 1,
    order_index: 1,
    answers: [
      { answer_text: '', is_correct: false, order_index: 1 },
      { answer_text: '', is_correct: false, order_index: 2 },
    ],
  });

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      // Load all courses and extract lessons
      const coursesData = await adminAPI.listCourses();
      const allLessons: any[] = [];
      
      for (const course of coursesData.courses || []) {
        const courseDetail = await adminAPI.getCourse(course.id);
        courseDetail.modules?.forEach((module: any) => {
          module.lessons?.forEach((lesson: any) => {
            allLessons.push({
              ...lesson,
              course_title: course.title,
              module_title: module.title,
            });
          });
        });
      }
      
      setLessons(allLessons);
    } catch (err: any) {
      console.error('Failed to load lessons:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lesson_id) {
      setError('Please select a lesson');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create quiz
      const quiz = await adminAPI.createQuiz({
        ...formData,
        time_limit_minutes: formData.time_limit_minutes || undefined,
      });

      // Add questions
      for (const question of questions) {
        await adminAPI.addQuestion(quiz.id, {
          quiz_id: quiz.id,
          ...question,
        });
      }

      router.push('/admin/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const addAnswer = () => {
    setCurrentQuestion({
      ...currentQuestion,
      answers: [
        ...currentQuestion.answers,
        {
          answer_text: '',
          is_correct: false,
          order_index: currentQuestion.answers.length + 1,
        },
      ],
    });
  };

  const removeAnswer = (index: number) => {
    if (currentQuestion.answers.length <= 2) {
      alert('A question must have at least 2 answers');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      answers: currentQuestion.answers.filter((_, i) => i !== index),
    });
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      alert('Please enter question text');
      return;
    }

    if (currentQuestion.answers.some(a => !a.answer_text.trim())) {
      alert('All answers must have text');
      return;
    }

    if (!currentQuestion.answers.some(a => a.is_correct)) {
      alert('At least one answer must be marked as correct');
      return;
    }

    setQuestions([
      ...questions,
      { ...currentQuestion, order_index: questions.length + 1 },
    ]);

    // Reset form
    setCurrentQuestion({
      question_type: 'multiple_choice',
      question_text: '',
      explanation: '',
      points: 1,
      order_index: questions.length + 2,
      answers: [
        { answer_text: '', is_correct: false, order_index: 1 },
        { answer_text: '', is_correct: false, order_index: 2 },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
        <p className="text-gray-600 mt-1">Add a new quiz to a lesson</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson *
            </label>
            <select
              value={formData.lesson_id}
              onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select a lesson</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.course_title} → {lesson.module_title} → {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.time_limit_minutes || ''}
                onChange={(e) => setFormData({ ...formData, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
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
                value={formData.max_attempts}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
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
              value={formData.passing_score_percentage}
              onChange={(e) => setFormData({ ...formData, passing_score_percentage: parseInt(e.target.value) })}
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
                checked={formData.shuffle_questions}
                onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Shuffle questions</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.show_correct_answers}
                onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show correct answers after completion</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required to complete lesson</span>
            </label>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions ({questions.length})</h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {index + 1}. {q.question_text}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {q.answers.length} answers • {q.points} point(s)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Question Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Question</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={currentQuestion.question_type}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="multiple_choice">Multiple Choice (single answer)</option>
              <option value="multiple_select">Multiple Select (multiple answers)</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={currentQuestion.question_text}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (optional)
            </label>
            <textarea
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Explain the correct answer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points *
            </label>
            <input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              min="1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Answers *
              </label>
              <button
                type="button"
                onClick={addAnswer}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Answer
              </button>
            </div>
            <div className="space-y-2">
              {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={answer.is_correct}
                    onChange={(e) => updateAnswer(index, 'is_correct', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={answer.answer_text}
                    onChange={(e) => updateAnswer(index, 'answer_text', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder={`Answer ${index + 1}`}
                  />
                  {currentQuestion.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Check the box next to correct answer(s)
            </p>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Question to Quiz
          </button>
        </div>

        {/* Submit */}
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
            disabled={loading || questions.length === 0}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
