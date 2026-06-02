// onboarding namespace — en
//
// MVP: re-export RU. EN-копи добавим в Sprint 6 (см. spec acceptance criteria).
// До этого — fallback на RU через `t()` всё равно работает, но лучше явно
// прокинуть тот же объект, чтобы a11y `<html lang="en">` не висел при
// отсутствии ключей.

export { ruOnboarding as enOnboarding } from '../ru/onboarding';
