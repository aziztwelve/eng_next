/**
 * CollapsibleOptions — wrapper, который после выбора первой опции
 * сворачивает остальные с fade-out. После `clearTimeout`-механики
 * можно вернуться обратно в "все видны" — для этого OptionCard на
 * выбранной позиции tap'ается ещё раз и handler сбрасывает selectedId.
 *
 * Реализация без зависимости — CSS Grid `grid-template-rows: 1fr ↔ 0fr`
 * + `overflow-hidden`. Стандартный паттерн для collapse без `height: auto`
 * хака.
 */

"use client";

import { Children, isValidElement, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CollapsibleOptionsProps {
  /** ID текущей выбранной опции; null/undefined → все опции видны. */
  selectedId: string | null | undefined;
  /** Дочерние элементы — обычно `<OptionCard id="...">`. */
  children: ReactNode;
  /** Прозрачность gap'а между карточками. Default 12px (3 в Tailwind). */
  gapClass?: string;
}

export function CollapsibleOptions({
  selectedId,
  children,
  gapClass = 'gap-3',
}: CollapsibleOptionsProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    id?: string;
    'data-id'?: string;
  }>[];

  return (
    <div className={cn('flex flex-col', gapClass)}>
      {items.map((child, index) => {
        const id = child.props.id ?? child.props['data-id'];
        const isSelected = !!selectedId && id === selectedId;
        const isHidden = !!selectedId && !isSelected;

        return (
          <div
            key={id ?? index}
            className={cn(
              'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
              isHidden
                ? 'grid-rows-[0fr] opacity-0 pointer-events-none -mt-3 first:mt-0'
                : 'grid-rows-[1fr] opacity-100',
            )}
          >
            <div className="overflow-hidden">{child}</div>
          </div>
        );
      })}
    </div>
  );
}
