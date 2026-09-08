import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-ink-500">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={14} className="text-ink-300" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-navy-800">{item.label}</Link>
          ) : (
            <span className="font-medium text-ink-900">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
