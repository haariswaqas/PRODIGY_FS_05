// src/components/ui/card/Card.js
import React from 'react';

// Main Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

// Card Header Component
const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

// Card Title Component
const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-gray-900 ${className}`}>
    {children}
  </h3>
);

// Card Content Component
const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };
