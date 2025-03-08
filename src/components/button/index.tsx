import React from 'react';

const Button: React.FC<{
  onClick: (e: React.SyntheticEvent) => void;
  text: string;
}> = ({ onClick, text }) => {
  return (
    <button
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        backgroundColor: 'red',
        color: 'white',
        marginTop: '10px',
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
