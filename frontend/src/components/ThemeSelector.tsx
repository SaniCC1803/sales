import { changeTheme, colors } from "../lib/utils";
import { useState } from "react";
import { Palette } from "lucide-react";

type ThemeSelectorProps = {
  dropdown?: boolean;
  onSelect?: () => void;
};

export function ThemeSelector({ dropdown, onSelect }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);

  if (!dropdown) {
    return (
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c.name}
            className={`h-8 w-8 rounded-full border-2`}
            style={{ background: c.primary }}
            onClick={() => changeTheme(c.class)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center h-10 w-10 rounded-full border border-input bg-background hover:bg-muted transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select theme"
        type="button"
        style={{ fontSize: 24 }}
      >
        {/* Palette icon with emoji fallback */}
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
          <Palette className="h-6 w-6 text-foreground mx-auto" />
          <span style={{ position: 'absolute', left: -9999 }}>🎨</span>
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg p-3 flex flex-wrap gap-2 z-50 min-w-[120px] max-w-xs w-auto">
          {colors.map((c) => (
            <button
              key={c.name}
              className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform`}
              style={{ background: c.primary }}
              onClick={() => {
                changeTheme(c.class);
                setOpen(false);
                onSelect?.();
              }}
              aria-label={c.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
