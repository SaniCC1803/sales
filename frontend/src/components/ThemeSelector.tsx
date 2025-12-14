import { changeTheme, colors } from "../lib/utils";

export function ThemeSelector() {
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
