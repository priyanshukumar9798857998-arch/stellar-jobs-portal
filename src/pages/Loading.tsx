import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--primary))] mx-auto mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
