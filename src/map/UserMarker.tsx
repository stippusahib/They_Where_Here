import React from 'react';

interface UserMarkerProps {
  accuracy?: number;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ accuracy = 20 }) => {
  // Clamp accuracy size for display between 30px and 120px
  const pixelSize = Math.max(30, Math.min(120, accuracy * 2.5));

  return (
    <div
      className="user-marker-wrap"
      style={{ '--acc-size': `${pixelSize}px` } as React.CSSProperties}
    >
      {/* Accuracy ring */}
      <div className="accuracy-ring" />
      {/* Dot */}
      <div className="user-dot">
        <div className="user-dot-core" />
      </div>
    </div>
  );
};
