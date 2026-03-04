import { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={styles.toast}>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "linear-gradient(90deg,#22c55e,#16a34a)",
    padding: "14px 22px",
    borderRadius: "10px",
    fontWeight: 500,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    zIndex: 100,
  },
};