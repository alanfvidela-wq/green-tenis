// La pelota de la marca: círculo lima con sus dos costuras en negro, que la
// hacen legible también sobre blanco. Es el punto de «green.» y el favicon
// (app/icon.svg).
export default function Pelota({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11.25" fill="#dcf900" stroke="#000" strokeWidth="1.5" />
      <path
        d="M4.2 3.9c3.6 3.3 3.6 12.9 0 16.2M19.8 3.9c-3.6 3.3-3.6 12.9 0 16.2"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
