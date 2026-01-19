import { useState, useEffect, useRef } from 'react';
import { LogOut, User2 } from 'lucide-react';

export default function UserDropdown({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-center h-10 w-10 rounded-full border border-input bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        type="button"
        style={{ fontSize: 24 }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
          }}
        >
          <User2 className="h-6 w-6 text-foreground mx-auto" />
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
          <div className="px-4 py-2 text-sm text-muted-foreground border-b bg-white">{email}</div>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-gray-100 text-destructive"
            onClick={onLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
