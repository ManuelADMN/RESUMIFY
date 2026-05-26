import React, { useState } from 'react';

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function SortableList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className = 'space-y-3',
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === index) return;

    const newItems = [...items];
    const [dragged] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, dragged);
    onReorder(newItems);
    setDragIndex(null);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={() => setDragIndex(null)}
          className={`transition-opacity ${dragIndex === index ? 'opacity-30' : 'opacity-100'}`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
