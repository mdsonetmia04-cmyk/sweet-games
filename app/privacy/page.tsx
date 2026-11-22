import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Sweet Games collects no personal information. Your favorites, recent games and high scores stay in your own browser.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: 22 November 2026
      </p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            No accounts, no personal data
          </h2>
          <p className="mt-2">
            Sweet Games does not ask you to register, log in, or provide any
            personal information. There is no account system, no payment
            system, and no newsletter sign-up.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            What is stored in your browser
          </h2>
          <p className="mt-2">
            Your game preferences are stored only on your own device, using
            your browser&apos;s local storage: your theme choice, sound
            preference, favourite games, recently played games, and high
            scores. This data never leaves your device and is never sent to
            any server. Clearing your browser data removes it.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Cookies and tracking
          </h2>
          <p className="mt-2">
            Sweet Games does not use tracking cookies or advertising trackers.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Children
          </h2>
          <p className="mt-2">
            The games on this site are free and family-friendly, and because
            no personal information is collected, the site is safe for players
            of all ages.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this policy can be sent to{" "}
            <a
              href="mailto:hello@sweetgames.app"
              className="font-medium text-mint-dark underline dark:text-mint"
            >
              hello@sweetgames.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
