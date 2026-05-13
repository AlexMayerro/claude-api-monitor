import React from 'react';
import { escapeRegExp } from '@renderer/lib/utils';

interface Props {
  text: string;
  query: string;
  className?: string;
}

export const HighlightText: React.FC<Props> = ({ text, query, className }) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
  const parts = text.split(re);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        re.test(p) && p.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i}>{p}</mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </span>
  );
};
