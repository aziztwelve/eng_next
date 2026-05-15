/**
 * Общий контракт редакторов phase-2 step content.
 *
 * Каждый редактор принимает текущий content (объект, уже распарсенный
 * из JSON) и колбэк onChange. StepManager ответственен за
 * `JSON.stringify` при сохранении.
 */
export interface StepContentEditorProps<T> {
  value: Partial<T>;
  onChange: (value: T) => void;
}

/** Безопасный парс JSON — возвращает {} вместо null. */
export function safeParseContent<T>(raw: string): Partial<T> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<T>;
  } catch {
    return {};
  }
}
