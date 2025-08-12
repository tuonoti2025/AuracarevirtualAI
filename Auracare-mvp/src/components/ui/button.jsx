// button.jsx
export function Button({ children, ...props }) {
  return (
    <button style={{ padding: '10px 20px', fontSize: '16px' }} {...props}>
      {children}
    </button>
  );
}
