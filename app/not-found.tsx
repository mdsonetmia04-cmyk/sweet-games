import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-bold text-zinc-900 dark:text-white">404</p>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        The page you are looking for does not exist or has moved. Head back
        home and pick a game instead.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
      >
        Back to home
      </Link>
    </div>
  );
}
