import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => (
  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-space-md">
      {icon && <div className="mr-2">{icon}</div>}
      <div>
        <h3 className="font-label-lg text-label-lg text-on-surface font-bold">{title}</h3>
        {description && <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>}
      </div>
    </div>
    <span className="font-headline-lg text-headline-lg text-primary">{value}</span>
  </div>
);

export default StatCard;
