export function Input({ ...props }) {
  return (
    <input
      style={{
        padding: '10px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box'
      }}
      {...props}
    />
  );
}
