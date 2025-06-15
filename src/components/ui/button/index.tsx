import React from 'react';

const Button: React.FC<{
  id?: string
  onClick: (e: React.SyntheticEvent) => void;
  text: string;
  disabled?: boolean;
}> = ({ id, onClick, text, disabled = false }) => {
  return (
    <button
      {...(id && { id })}
      disabled={disabled}
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        backgroundColor: 'red',
        color: 'white',
        marginTop: '10px',
        opacity: disabled ? 0.5 : 1
      }}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {text}
    </button>
  );
};

export default Button;
