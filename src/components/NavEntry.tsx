import type { NavigationEntry } from "../types/navigation";

interface NavEntryProps {
  entry: NavigationEntry;
}

function NavEntry({ entry }: NavEntryProps) {
  return (
    <a className="nav-entry" href={entry.href}>
      <span>{entry.title}</span>
      <small>{entry.description}</small>
    </a>
  );
}

export default NavEntry;
