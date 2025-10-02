export function getRelativeDateText(dateString: string): {
  text: string;
  variant: 'neutral' | 'warning' | 'danger';
} {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: absDays === 1 ? 'Overdue 1d' : `Overdue ${absDays}d`,
      variant: 'danger',
    };
  } else if (diffDays === 0) {
    return {
      text: 'Due today',
      variant: 'warning',
    };
  } else if (diffDays === 1) {
    return {
      text: 'Due tomorrow',
      variant: 'warning',
    };
  } else if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays}d`,
      variant: 'warning',
    };
  } else {
    return {
      text: `Due in ${diffDays}d`,
      variant: 'neutral',
    };
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}