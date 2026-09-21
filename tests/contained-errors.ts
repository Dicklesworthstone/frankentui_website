/**
 * Filtering for console errors the pages raise on purpose and already handle.
 *
 * `react-tweet` iterates `tweet.entities.*` unguarded and the X syndication
 * payload sometimes omits an entity array, so an embed throws while rendering
 * (frankentui#82). components/tweet-wall.tsx handles that: every embed sits in
 * its own ErrorBoundary and degrades to a fallback card. React logs each error
 * a boundary catches and the boundary logs its own line, so a page carrying
 * eleven embeds reports twenty-two console errors while behaving exactly as
 * designed.
 *
 * Matching on the message text does not travel: V8 says "r is not iterable"
 * where JavaScriptCore says "undefined is not an object (evaluating 'r')", and
 * the identifier is minified so it changes with the build. Match on what the
 * application itself reports instead - the "Error boundary caught error:"
 * line it writes - and drop React's bare log of the same throw alongside it.
 *
 * This only ever drops errors a boundary announced it had caught. Anything
 * uncaught still fails, and the tests using this assert their own subject
 * directly (the canvas is attached, the widget re-initialises, the navigation
 * lands), so a real regression in what they cover cannot hide behind it.
 */

const BOUNDARY_PREFIX = "Error boundary caught error:";

export type ConsoleErrorLike = { type?: string; text: string };

/** Messages the app reported as caught by one of its error boundaries. */
function boundaryCaughtMessages(events: ConsoleErrorLike[]): string[] {
  const caught: string[] = [];
  for (const event of events) {
    const at = event.text.indexOf(BOUNDARY_PREFIX);
    if (at === -1) continue;
    // "…caught error: TypeError: whatever {componentStack: …}" - keep the
    // message, drop the React component-stack object that follows it.
    const message = event.text
      .slice(at + BOUNDARY_PREFIX.length)
      .split("{")[0]
      .trim();
    if (message) caught.push(message);
  }
  return caught;
}

/** Drop boundary-caught errors and React's own duplicate log of them. */
export function withoutContainedErrors<T extends ConsoleErrorLike>(events: T[]): T[] {
  const caught = boundaryCaughtMessages(events);
  return events.filter((event) => {
    if (event.text.includes(BOUNDARY_PREFIX)) return false;
    return !caught.some((message) => event.text.includes(message));
  });
}
