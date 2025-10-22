// NotificationBadge.tsx - Badge component to show notification count
import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400 dark:ring-gray-800">
      {count > 1 && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
      )}
    </span>
  );
};

export default NotificationBadge;
