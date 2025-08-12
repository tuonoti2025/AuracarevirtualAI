export function Card({ children, ...props }) {
  return (
    <div
      style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
