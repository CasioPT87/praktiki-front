import React, { useState } from 'react';

export default function Modal({ children, initiallyOpen = false }: { children: React.ReactNode, initiallyOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      {isOpen && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
          {children}
          </div>
        </div>
      )}
    </div>
  );
}
