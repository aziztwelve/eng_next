/**
 * Onboarding API client.
 *
 * Все методы — обёртки над `ApiClient.*`, типизированные на `types/onboarding`.
 * Базовый URL отвечает gateway-роутам (см. `services/gateway/internal/app/app.go`):
 *   GET    /api/v1/onboarding
 *   PATCH  /api/v1/onboarding
 *   POST   /api/v1/onboarding/complete
 *
 * Auth — через `ApiClient`, который сам подставляет Bearer из localStorage.
 * Для guest JWT работает идентично — gateway на этих endpoint'ах принимает
 * любой валидный JWT (включая `is_guest=true`).
 */

import { ApiClient } from '@/lib/api-client';
import type {
  OnboardingState,
  PatchOnboardingRequest,
} from '@/types/onboarding';

export const OnboardingApi = {
  getState: () => ApiClient.get<OnboardingState>('/onboarding'),
  patchState: (patch: PatchOnboardingRequest) =>
    ApiClient.patch<OnboardingState>('/onboarding', patch),
  complete: () => ApiClient.post<OnboardingState>('/onboarding/complete'),
};
