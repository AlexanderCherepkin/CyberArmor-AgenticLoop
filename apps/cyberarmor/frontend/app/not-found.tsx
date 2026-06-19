import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-6xl font-bold text-cyan">404</h1>
      <p className="mt-4 text-xl text-platinum/80">Page not found. Access denied or moved.</p>
      <Link
        href="/en"
        className="mt-8 inline-flex items-center rounded border border-cyan/30 px-6 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/10"
      >
        Return to base
      </Link>
    </div>
  );
}
