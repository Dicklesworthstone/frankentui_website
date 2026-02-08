export interface JargonTerm {
  term: string;
  short: string;
  long: string;
  analogy?: string;
  why?: string;
  related?: string[];
}

const jargonMap: Record<string, JargonTerm> = {
  // ---------------------------------------------------------------------------
  // Core Types
  // ---------------------------------------------------------------------------
  "cell": {
    term: "Cell",
    short: "The smallest addressable unit on a terminal grid, holding one grapheme and its attributes.",
    long: "A Cell represents a single character position in a terminal buffer. It stores a grapheme identifier (pointing into the GraphemePool) along with display attributes such as foreground color, background color, and style flags. Every frame the terminal renders is ultimately a grid of Cells.",
    analogy: "Think of a Cell like a single pixel on a screen, except instead of an RGB value it holds a character and its styling.",
    related: ["cell-content", "cell-attrs", "buffer", "grapheme-id"],
  },
  "cell-content": {
    term: "CellContent",
    short: "The payload inside a Cell: a grapheme identifier plus a display width.",
    long: "CellContent pairs a GraphemeId with the number of columns the grapheme occupies. Wide characters such as CJK ideographs consume two columns, so the width field lets the renderer know to skip the following cell. A CellContent of width zero indicates a continuation cell that belongs to the preceding wide character.",
    related: ["cell", "grapheme-id", "display-width"],
  },
  "cell-attrs": {
    term: "CellAttrs",
    short: "Style metadata attached to a Cell: colors, weight, decoration, and other SGR attributes.",
    long: "CellAttrs is a compact struct that encodes foreground color, background color, and a set of StyleFlags (bold, italic, underline, strikethrough, and so on). It is compared during diffing to decide whether an SGR reset or partial update sequence is needed when writing to the terminal.",
    related: ["cell", "sgr", "style-flags", "packed-rgba"],
  },
  "buffer": {
    term: "Buffer",
    short: "A 2D grid of Cells representing one complete screen state.",
    long: "A Buffer is the fundamental data structure backing the front and back buffers in the rendering pipeline. It owns a flat Vec of Cells addressed by (column, row) and provides methods for writing text, setting styles, and filling rectangular regions. Buffers are diffed against each other to produce the minimal set of escape sequences needed to update the real terminal.",
    analogy: "Like a framebuffer in GPU rendering -- an off-screen image you draw into before presenting it.",
    related: ["front-buffer", "back-buffer", "frame", "diff"],
  },
  "frame": {
    term: "Frame",
    short: "A single rendered snapshot of the UI, produced by the view function each cycle.",
    long: "A Frame is the output of one call to the application's view function. It contains a fully populated Buffer along with optional metadata such as cursor position and title. The Presenter diffs consecutive Frames to produce terminal output. Frames are ephemeral: once diffed, the old frame is discarded and the new one becomes the front buffer.",
    related: ["buffer", "presenter", "diff"],
  },
  "diff": {
    term: "Diff",
    short: "The comparison between two Buffers that yields the minimal set of terminal writes.",
    long: "Diffing walks the old (front) and new (back) buffers cell by cell. Contiguous runs of changed cells are collected into ChangeRuns, each of which becomes a cursor-move plus character-write sequence. Unchanged regions are skipped entirely. This minimizes I/O and avoids visible flicker, especially over slow connections or inside multiplexers.",
    analogy: "Like a video codec that only transmits the pixels that changed between frames.",
    related: ["change-run", "front-buffer", "back-buffer", "presenter"],
  },
  "change-run": {
    term: "ChangeRun",
    short: "A contiguous sequence of cells that differ between the front and back buffers.",
    long: "During the diff pass, adjacent dirty cells are merged into ChangeRuns to reduce the number of cursor-movement escape sequences. Each ChangeRun records its starting position, length, and the new cell data. The terminal writer iterates over ChangeRuns, moves the cursor once to the start, and streams out the characters and attributes for the entire run.",
    related: ["diff", "buffer", "terminal-writer"],
  },

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  "presenter": {
    term: "Presenter",
    short: "The component that orchestrates rendering: diffs buffers, emits escape sequences, and flushes output.",
    long: "The Presenter owns the front and back buffers, drives the diff algorithm, and writes the resulting escape sequences through the TerminalWriter. It also manages cursor visibility, screen clearing on resize, and synchronization markers (DEC 2026). The Presenter is the single chokepoint for all terminal output in FrankenTUI.",
    related: ["diff", "terminal-writer", "front-buffer", "back-buffer", "dec-2026"],
  },
  "terminal-model": {
    term: "TerminalModel",
    short: "An in-memory simulation of a real terminal, used for headless testing.",
    long: "TerminalModel parses the same escape sequences a real terminal would and updates an internal cell grid accordingly. Tests render into a TerminalModel instead of stdout, then assert on the resulting cell contents and attributes. This allows full integration-level testing without needing a PTY or screen-scraping.",
    analogy: "A flight simulator for terminals -- it behaves like the real thing but runs entirely in memory.",
    related: ["terminal-model-test", "pty", "snapshot-test"],
  },
  "front-buffer": {
    term: "Front Buffer",
    short: "The buffer holding the currently displayed terminal state.",
    long: "The front buffer represents what the user is seeing right now. After a diff is computed against the new back buffer and the resulting changes are flushed to the terminal, the back buffer is swapped into the front position. The old front buffer is then reused as the next back buffer to avoid repeated allocations.",
    analogy: "The canvas that is currently facing the audience in a double-buffered painting setup.",
    related: ["back-buffer", "buffer", "diff", "presenter"],
  },
  "back-buffer": {
    term: "Back Buffer",
    short: "The buffer the application draws into before it is diffed and presented.",
    long: "Each render cycle, the view function writes into the back buffer. Once drawing is complete, the Presenter diffs the back buffer against the front buffer to determine what changed. The back buffer then becomes the new front buffer. Double-buffering prevents the user from ever seeing a half-drawn frame.",
    analogy: "The hidden canvas an artist paints on before swapping it to the display easel.",
    related: ["front-buffer", "buffer", "diff", "presenter"],
  },
  "scissor": {
    term: "Scissor",
    short: "A clipping rectangle that restricts drawing operations to a sub-region of the buffer.",
    long: "When compositing nested widgets, a Scissor rect is pushed onto a stack so that child draws cannot write outside their allocated area. Any cell write whose coordinates fall outside the active scissor is silently discarded. This is essential for scrollable containers, overlays, and any layout where a child may be larger than its visible viewport.",
    analogy: "Like the clipping mask in a graphics editor that hides everything outside a selected region.",
    related: ["rect", "buffer", "opacity-stack"],
  },
  "opacity-stack": {
    term: "Opacity Stack",
    short: "A stack of alpha values applied during compositing to control layer transparency.",
    long: "FrankenTUI supports layered rendering where widgets can be semi-transparent. The Opacity Stack tracks nested opacity contexts: when a container sets 50% opacity and a child within it also sets 50% opacity, the effective opacity for that child is 25%. The stack is consulted during alpha blending when cells are composited onto the back buffer.",
    related: ["alpha-blending", "porter-duff", "source-over", "scissor"],
  },

  // ---------------------------------------------------------------------------
  // Text
  // ---------------------------------------------------------------------------
  "grapheme": {
    term: "Grapheme",
    short: "A user-perceived character, which may consist of multiple Unicode code points.",
    long: "A grapheme cluster is the smallest unit of text a human would call a character. For example, an emoji with a skin-tone modifier or a letter followed by a combining accent is a single grapheme even though it is multiple code points. FrankenTUI segments all input text into graphemes before measuring or rendering.",
    analogy: "A grapheme is to Unicode what a letter is to the alphabet -- the thing you actually see, regardless of how many bytes make it up.",
    related: ["grapheme-id", "grapheme-pool", "combining-character", "zwj", "display-width"],
  },
  "grapheme-id": {
    term: "GraphemeId",
    short: "A compact integer handle referencing a grapheme string stored in the GraphemePool.",
    long: "Rather than storing variable-length strings in every Cell, FrankenTUI interns grapheme strings into a global GraphemePool and stores a fixed-size GraphemeId in each Cell. Common ASCII characters are pre-interned so their IDs are known at compile time. This keeps Cell size small and comparisons fast.",
    related: ["grapheme", "grapheme-pool", "cell-content"],
  },
  "grapheme-pool": {
    term: "GraphemePool",
    short: "An interning table that maps grapheme strings to unique GraphemeIds.",
    long: "The GraphemePool deduplicates grapheme storage across the entire application. When text is segmented, each grapheme cluster is looked up in the pool; if it already exists, the existing ID is returned, otherwise a new entry is allocated. This dramatically reduces memory usage for screens full of repeated characters and speeds up cell comparisons during diffing.",
    analogy: "Like a dictionary where every unique word gets a number, and from then on you just pass around the number.",
    related: ["grapheme", "grapheme-id"],
  },
  "segment": {
    term: "Segment",
    short: "A run of text sharing the same style attributes.",
    long: "A Segment is the lowest-level styled text primitive. It pairs a string slice with a set of CellAttrs. Segments are grouped into Spans and Lines to build up complex styled text. During rendering, each Segment is broken into graphemes that are written into Cells with the Segment's attributes applied.",
    related: ["span", "line", "text", "cell-attrs"],
  },
  "span": {
    term: "Span",
    short: "A sequence of styled Segments forming an inline text run.",
    long: "A Span is a convenience wrapper around one or more Segments. It represents a contiguous horizontal piece of text that may contain mixed styles -- for example, a Span might contain a bold word followed by a normal word. Spans are collected into Lines for layout.",
    related: ["segment", "line", "text"],
  },
  "line": {
    term: "Line",
    short: "A single row of styled text composed of one or more Spans.",
    long: "A Line represents one horizontal row of text content. It holds a vector of Spans and metadata such as alignment. Lines are the unit of vertical stacking inside a Text widget. During rendering, each Line is measured for width, potentially truncated or wrapped, and then written into the buffer at its designated row.",
    related: ["span", "text", "width-cache"],
  },
  "text": {
    term: "Text",
    short: "A block of styled text made up of multiple Lines, ready for measurement and rendering.",
    long: "Text is the high-level text primitive in FrankenTUI. It aggregates Lines, supports alignment and wrapping modes, and integrates with the Width Cache for efficient measurement. Widgets that display text (paragraphs, labels, list items) typically build a Text value and hand it to the rendering pipeline.",
    related: ["line", "span", "segment", "width-cache"],
  },
  "width-cache": {
    term: "Width Cache",
    short: "A memoization layer that caches the measured display width of text for a given constraint.",
    long: "Computing the display width of text is non-trivial because of grapheme clustering, wide characters, and wrapping. The Width Cache stores previously computed (constraint, width) pairs so that repeated layouts of the same text with the same constraints skip the measurement work. It is invalidated when text content changes.",
    related: ["text", "display-width", "measurement", "constraint"],
  },

  // ---------------------------------------------------------------------------
  // Terminal
  // ---------------------------------------------------------------------------
  "terminal-session": {
    term: "TerminalSession",
    short: "The top-level object managing the lifetime of a terminal UI application.",
    long: "TerminalSession ties together the TerminalWriter, the Presenter, input handling, and the raw-mode lifecycle. It enters raw mode on creation, runs the main event loop, and guarantees cleanup (restoring cooked mode, showing the cursor, leaving the alternate screen) on drop via RAII. All user interaction with the terminal flows through the session.",
    related: ["terminal-writer", "presenter", "raw-mode", "raii"],
  },
  "terminal-writer": {
    term: "TerminalWriter",
    short: "The I/O layer that writes escape sequences to the terminal file descriptor.",
    long: "TerminalWriter abstracts over the actual output sink (stdout, a file, or a TerminalModel for tests). It provides buffered writing, flush control, and optional synchronization output (BEGIN/END sync markers). The Presenter feeds it escape sequence bytes; the writer handles buffering and flushing in an efficient manner.",
    related: ["terminal-session", "presenter", "ansi", "csi"],
  },
  "terminal-capabilities": {
    term: "TerminalCapabilities",
    short: "A detected feature set describing what the host terminal supports (colors, hyperlinks, sync, etc.).",
    long: "At startup, FrankenTUI probes the environment to determine the terminal's capabilities: color depth (mono, 256, true color), support for hyperlinks (OSC 8), synchronized output (DEC 2026), Unicode version, and more. Components consult TerminalCapabilities to decide which escape sequences are safe to emit and which features require fallback behavior.",
    related: ["color-profile", "color-downgrade", "osc-8", "dec-2026", "screen-mode"],
  },
  "screen-mode": {
    term: "ScreenMode",
    short: "Whether the application uses the alternate screen buffer or renders inline.",
    long: "Terminal applications can either switch to the alternate screen (a blank canvas that is discarded on exit) or render inline within the existing scrollback. FrankenTUI supports both modes. Alternate screen is the default for full-screen TUIs; inline mode is used for prompts, progress bars, and tools that should leave output visible after exit.",
    related: ["terminal-session", "inline-strategy", "ui-anchor"],
  },
  "ui-anchor": {
    term: "UiAnchor",
    short: "The fixed edge (top or bottom) of an inline-mode UI within the terminal viewport.",
    long: "When rendering inline (not in the alternate screen), UiAnchor determines whether the UI region is pinned to the top or bottom of its allocated space. A bottom anchor is common for command-line spinners and progress bars that grow upward; a top anchor suits inline selection lists that grow downward.",
    related: ["screen-mode", "inline-strategy"],
  },
  "inline-strategy": {
    term: "InlineStrategy",
    short: "The policy controlling how an inline-mode UI claims and manages terminal rows.",
    long: "InlineStrategy governs row allocation for inline rendering: how many rows to request, whether to grow dynamically, and how to handle content that overflows the allocated region. Different strategies trade off between visual stability (fixed height) and content completeness (auto-growing). The strategy works together with UiAnchor to position the UI region.",
    related: ["screen-mode", "ui-anchor"],
  },
  "raw-mode": {
    term: "Raw Mode",
    short: "A terminal mode where input is delivered byte-by-byte with no line editing or signal handling.",
    long: "In raw mode, the terminal driver stops buffering input by line, disables echo, and stops intercepting control characters like Ctrl-C. This gives the application full control over input processing. FrankenTUI enters raw mode at session start and restores the original (cooked) mode on exit. Failure to restore cooked mode leaves the terminal in an unusable state, which is why RAII cleanup is critical.",
    related: ["terminal-session", "raii", "sanitization"],
  },

  // ---------------------------------------------------------------------------
  // Escape Sequences
  // ---------------------------------------------------------------------------
  "ansi": {
    term: "ANSI",
    short: "The family of escape-sequence standards (ECMA-48 / ISO 6429) used to control terminal display.",
    long: "ANSI escape sequences are special byte strings that instruct the terminal to perform actions: move the cursor, change text colors, clear the screen, and much more. They begin with the ESC character (0x1B) and are followed by a sequence type identifier. FrankenTUI generates ANSI sequences as its sole mechanism for controlling the terminal display.",
    related: ["csi", "sgr", "osc", "dcs"],
  },
  "csi": {
    term: "CSI",
    short: "Control Sequence Introducer (ESC [) -- the prefix for the most common terminal commands.",
    long: "CSI sequences start with ESC [ and are followed by numeric parameters and a final command byte. They cover cursor movement (CUP, CUU, CUD), scrolling, erasing, and mode setting. Most of the escape sequences FrankenTUI emits during rendering are CSI sequences, making the CSI encoder one of the hottest code paths.",
    related: ["ansi", "sgr", "dec-2026"],
  },
  "sgr": {
    term: "SGR",
    short: "Select Graphic Rendition (CSI ... m) -- the escape sequence for setting text style and color.",
    long: "SGR sequences control visual attributes: bold, italic, underline, strikethrough, foreground color, background color, and resets. FrankenTUI's diff engine tracks which SGR attributes are currently active and emits only the delta needed to transition from one cell's style to the next, minimizing the bytes written per frame.",
    related: ["csi", "ansi", "cell-attrs", "style-flags", "color-profile"],
  },
  "osc": {
    term: "OSC",
    short: "Operating System Command (ESC ]) -- escape sequences for out-of-band features like titles and hyperlinks.",
    long: "OSC sequences communicate with the terminal emulator at a higher level than CSI. They set the window title, define color palettes, emit hyperlinks (OSC 8), and trigger clipboard operations. OSC sequences are terminated by ST (String Terminator) or BEL. FrankenTUI uses OSC primarily for window titles and hyperlink support.",
    related: ["ansi", "osc-8", "dcs"],
  },
  "dcs": {
    term: "DCS",
    short: "Device Control String (ESC P) -- escape sequences for device-level communication like Sixel graphics.",
    long: "DCS sequences are used for device-specific data transfer such as Sixel image data, DECRQSS queries, and tmux passthrough wrapping. They are less commonly used than CSI or OSC but are important for advanced features. FrankenTUI encounters DCS primarily when wrapping sequences for multiplexer passthrough.",
    related: ["ansi", "osc", "mux"],
  },
  "osc-8": {
    term: "OSC 8",
    short: "The hyperlink escape sequence that makes terminal text clickable.",
    long: "OSC 8 wraps a range of text in a hyperlink, similar to an <a> tag in HTML. The sequence encodes a URI and optional ID parameter. When the user hovers or clicks the text, the terminal emulator opens the linked URL. FrankenTUI conditionally emits OSC 8 based on detected TerminalCapabilities, falling back to plain text in terminals that lack support.",
    related: ["osc", "terminal-capabilities"],
  },
  "dec-2026": {
    term: "DEC 2026",
    short: "Synchronized Output mode -- tells the terminal to batch updates and present them atomically.",
    long: "DEC 2026 (also known as Mode 2026 or Synchronized Output) brackets a frame's escape sequences between a BEGIN and END marker. The terminal buffers all output between the markers and renders it in one pass, eliminating tearing and flicker. FrankenTUI enables this mode when TerminalCapabilities reports support, which most modern terminals do.",
    why: "Without synchronized output, partial frames can be visible to the user as flicker, especially for large screen updates.",
    related: ["csi", "presenter", "terminal-capabilities"],
  },

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  "rect": {
    term: "Rect",
    short: "An axis-aligned rectangle defined by position and size, used for layout regions.",
    long: "Rect is the fundamental geometric primitive in FrankenTUI's layout system. It stores x, y, width, and height as unsigned integers representing terminal columns and rows. Every widget receives a Rect describing its available area and returns a Rect describing its actual consumed area. Rects are also used for scissor regions and hit testing.",
    related: ["sides", "measurement", "constraint", "scissor"],
  },
  "sides": {
    term: "Sides",
    short: "A four-valued struct (top, right, bottom, left) representing padding, margin, or border widths.",
    long: "Sides is a generic struct parameterized over its value type. It is used for padding, margin, and border thickness. Layout nodes subtract Sides from their available Rect to compute the inner content area. The struct provides convenience constructors for uniform, symmetric, and per-side values.",
    related: ["rect", "measurement"],
  },
  "measurement": {
    term: "Measurement",
    short: "The process of determining a widget's desired size given a set of constraints.",
    long: "Measurement is the first phase of layout. Each widget is given a Constraint describing the min and max available width and height, and returns its preferred size. Measurements can be cached by the Width Cache for text-heavy widgets. The layout engine uses measurement results to allocate space before the final positioning pass.",
    related: ["constraint", "rect", "width-cache", "flex"],
  },
  "constraint": {
    term: "Constraint",
    short: "A min/max bounding box that tells a widget how much space it may occupy.",
    long: "A Constraint provides minimum and maximum values for both width and height. During layout, parent widgets generate Constraints for their children based on the parent's own allocated space and layout policy. Constraints flow downward through the widget tree; measurements flow back upward. This two-pass protocol is similar to Flutter's box constraint model.",
    analogy: "Like telling a child widget: you must be at least this big, and at most this big.",
    related: ["measurement", "rect", "flex"],
  },
  "flex": {
    term: "Flex",
    short: "A layout model that distributes space among children according to flexible weight factors.",
    long: "Flex layout divides available space along a primary axis (horizontal or vertical) among children that each declare a flex factor. A child with flex factor 2 gets twice the space of a child with factor 1. Children can also be fixed-size, in which case they are allocated first and the remaining space is distributed among flexible children. This is directly inspired by CSS Flexbox.",
    analogy: "Like CSS Flexbox but for terminal cells instead of pixels.",
    related: ["constraint", "measurement", "rect"],
  },

  // ---------------------------------------------------------------------------
  // Colors
  // ---------------------------------------------------------------------------
  "packed-rgba": {
    term: "PackedRgba",
    short: "A 32-bit packed representation of an RGBA color value.",
    long: "PackedRgba stores red, green, blue, and alpha channels in a single u32. This compact representation keeps Cell and CellAttrs small, enables fast equality comparison (a single integer compare), and aligns well with SIMD operations. Conversion to and from (r, g, b, a) tuples is provided via bitwise operations.",
    related: ["cell-attrs", "color-profile", "alpha-blending"],
  },
  "color-profile": {
    term: "ColorProfile",
    short: "The detected color depth of the terminal: monochrome, 16-color, 256-color, or true color.",
    long: "ColorProfile describes the maximum color fidelity the terminal supports. FrankenTUI detects this at startup from environment variables (COLORTERM, TERM), terminal responses, and explicit overrides. All colors in the rendering pipeline are downgraded to match the active ColorProfile before being emitted as SGR sequences.",
    related: ["color-downgrade", "terminal-capabilities", "sgr", "packed-rgba"],
  },
  "color-downgrade": {
    term: "Color Downgrade",
    short: "The process of converting a true-color value to the nearest color in a smaller palette.",
    long: "When the detected ColorProfile is less than true color, every RGB value must be mapped to the closest available color. For 256-color mode, FrankenTUI uses a perceptual distance metric over the xterm-256 palette. For 16-color mode, it maps to the basic ANSI palette. Downgrading happens transparently during escape sequence generation so that widget code always works in full color.",
    related: ["color-profile", "packed-rgba", "sgr"],
  },
  "style-flags": {
    term: "StyleFlags",
    short: "A bitfield encoding boolean text attributes: bold, italic, underline, strikethrough, etc.",
    long: "StyleFlags packs multiple boolean style properties into a single integer using one bit per flag. This allows fast comparison, combination (bitwise OR), and difference (bitwise XOR) operations. The diff engine uses XOR to determine exactly which SGR attributes need to be toggled when transitioning between two cells.",
    related: ["cell-attrs", "sgr"],
  },

  // ---------------------------------------------------------------------------
  // Runtime
  // ---------------------------------------------------------------------------
  "program": {
    term: "Program",
    short: "The top-level entry point that wires together the Model, view, and update loop.",
    long: "A Program is the runtime harness for a FrankenTUI application. It initializes the TerminalSession, runs the Elm-architecture event loop (update, view, diff, present), manages Subscriptions and Cmds, and handles graceful shutdown. Users implement their application logic by providing a Model type, an update function, and a view function to the Program.",
    related: ["model", "cmd", "subscription"],
  },
  "model": {
    term: "Model",
    short: "The application state type, updated by the update function in response to messages.",
    long: "In the Elm architecture used by FrankenTUI, the Model is the single source of truth for application state. The update function receives the current Model and a message, and returns a new Model (plus optional Cmds). The view function transforms the Model into a Frame. This unidirectional data flow makes state changes predictable and testable.",
    analogy: "Like the state object in Redux or the model in Elm -- a single immutable snapshot of everything the app knows.",
    related: ["program", "cmd", "subscription"],
  },
  "cmd": {
    term: "Cmd",
    short: "A side-effect descriptor returned by the update function: async I/O, timers, quit signals, etc.",
    long: "Cmds represent effects that should happen outside the pure update cycle. The runtime executes them asynchronously and feeds their results back as messages. Examples include HTTP requests, file I/O, clipboard operations, and delayed ticks. Cmds keep the update function pure: it describes what should happen rather than doing it directly.",
    analogy: "Like an action creator in Redux-Saga or an Elm Cmd -- a description of a side effect, not the side effect itself.",
    related: ["program", "model", "subscription"],
  },
  "subscription": {
    term: "Subscription",
    short: "A declarative subscription to an ongoing event source: keyboard input, timers, resize signals.",
    long: "Subscriptions are long-lived event sources declared as a function of the current Model. When the Model changes, the runtime diffs the old and new subscription sets, starting new sources and stopping removed ones. This declarative approach prevents leaked listeners and makes it easy to conditionally subscribe to events.",
    related: ["program", "model", "cmd"],
  },
  "render-budget": {
    term: "RenderBudget",
    short: "A time or byte budget that caps how much work the renderer does per frame.",
    long: "RenderBudget prevents the rendering pipeline from monopolizing the event loop. If a frame's diff or write exceeds the budget, the renderer can skip low-priority updates or defer them to the next cycle. This keeps input handling responsive even during expensive redraws, such as when a large log buffer is scrolled rapidly.",
    related: ["presenter", "diff", "program"],
  },

  // ---------------------------------------------------------------------------
  // Unicode
  // ---------------------------------------------------------------------------
  "zwj": {
    term: "ZWJ",
    short: "Zero-Width Joiner (U+200D) -- an invisible character that fuses adjacent graphemes into one.",
    long: "The ZWJ is used extensively in emoji sequences to combine multiple emoji into a single glyph. For example, the family emoji is composed of individual person emoji joined by ZWJs. FrankenTUI's grapheme segmentation must correctly identify ZWJ sequences as single grapheme clusters so they occupy the right number of cells.",
    related: ["grapheme", "combining-character", "display-width"],
  },
  "combining-character": {
    term: "Combining Character",
    short: "A Unicode character that modifies the preceding base character (accents, diacritics, etc.).",
    long: "Combining characters (such as U+0301 COMBINING ACUTE ACCENT) attach to the previous base character to form a single grapheme cluster. They have zero display width on their own. FrankenTUI's text segmentation groups combining characters with their base, ensuring they are stored as a single GraphemeId and rendered in a single Cell.",
    related: ["grapheme", "zwj", "display-width"],
  },
  "display-width": {
    term: "Display Width",
    short: "The number of terminal columns a grapheme occupies: typically 1 (narrow) or 2 (wide/fullwidth).",
    long: "Display width determines how many cells a character consumes in the terminal grid. Most Latin characters are width 1; CJK ideographs and certain emoji are width 2. Some characters (combining marks, ZWJ) are width 0. FrankenTUI uses Unicode East Asian Width tables and emoji data to compute display widths, with the Width Cache memoizing results.",
    related: ["grapheme", "cell-content", "width-cache", "zwj", "combining-character"],
  },
  "wtf-8": {
    term: "WTF-8",
    short: "A superset of UTF-8 that allows unpaired surrogates, used for lossless OS string round-tripping.",
    long: "WTF-8 (Wobbly Transformation Format) extends UTF-8 to encode unpaired UTF-16 surrogates, which can appear in Windows file paths and other OS interfaces. FrankenTUI may encounter WTF-8 data when reading environment variables or file paths on Windows. Handling it correctly prevents panics or data loss when the terminal application interacts with the OS.",
    related: ["grapheme", "display-width"],
  },

  // ---------------------------------------------------------------------------
  // Compositing
  // ---------------------------------------------------------------------------
  "porter-duff": {
    term: "Porter-Duff",
    short: "A family of compositing operators that define how two layers with alpha are combined.",
    long: "Porter-Duff compositing (from the 1984 paper by Thomas Porter and Tom Duff) defines 12 operators for combining a source image with a destination based on their alpha channels. FrankenTUI uses these operators when compositing translucent widgets onto the back buffer. The most common operator is Source Over.",
    related: ["alpha-blending", "source-over", "opacity-stack"],
  },
  "alpha-blending": {
    term: "Alpha Blending",
    short: "Mixing two colors proportionally based on an alpha (opacity) value.",
    long: "Alpha blending computes the final color of a cell by interpolating between the source (new) and destination (existing) colors according to the source's alpha channel. FrankenTUI performs alpha blending in linear color space to avoid perceptual artifacts, then converts back to sRGB for the final SGR color value.",
    related: ["porter-duff", "source-over", "opacity-stack", "packed-rgba"],
  },
  "source-over": {
    term: "Source Over",
    short: "The default Porter-Duff operator: draw the source on top of the destination, respecting alpha.",
    long: "Source Over is the compositing operation people intuitively expect: the source is drawn on top of the destination, with translucent source pixels blending with whatever is underneath. It is the default and most frequently used operator in FrankenTUI's compositing pipeline. Fully opaque source pixels completely replace the destination; fully transparent ones leave it unchanged.",
    related: ["porter-duff", "alpha-blending", "opacity-stack"],
  },

  // ---------------------------------------------------------------------------
  // Testing
  // ---------------------------------------------------------------------------
  "pty": {
    term: "PTY",
    short: "Pseudo-terminal -- an OS primitive that emulates a hardware terminal for programmatic I/O.",
    long: "A PTY consists of a master/slave pair of file descriptors. The master side is held by the controlling process; the slave side looks like a real terminal to the child process. FrankenTUI uses PTYs in integration tests and the PtyCapture harness to run a real application instance and capture its output, including all escape sequences.",
    related: ["terminal-model", "pty-capture", "snapshot-test"],
  },
  "snapshot-test": {
    term: "Snapshot Test",
    short: "A test that renders a UI state and compares the output against a saved reference file.",
    long: "Snapshot tests capture the rendered output (either raw escape sequences or the parsed cell grid from a TerminalModel) and compare it against a previously approved snapshot file. If the output differs, the test fails and shows a diff. This catches visual regressions automatically. Snapshots are updated explicitly when intentional changes are made.",
    related: ["terminal-model", "property-test", "pty"],
  },
  "property-test": {
    term: "Property Test",
    short: "A test that verifies invariants over randomly generated inputs (also called fuzzing or QuickCheck-style testing).",
    long: "Property tests generate thousands of random inputs and check that certain properties always hold -- for example, that rendering any valid Model never panics, or that diffing and applying a diff to the front buffer yields the back buffer. FrankenTUI uses property testing extensively for the buffer, diff, and text-measurement subsystems.",
    related: ["snapshot-test", "terminal-model-test"],
  },
  "terminal-model-test": {
    term: "Terminal Model Test",
    short: "An integration test that renders through the full pipeline into a TerminalModel and asserts on cell state.",
    long: "Terminal Model Tests run the complete rendering pipeline -- view, layout, diff, escape sequence generation -- into a TerminalModel instead of a real terminal. The test then inspects individual cells for expected content and attributes. This provides high-confidence integration coverage without any real terminal dependency.",
    related: ["terminal-model", "snapshot-test", "pty"],
  },

  // ---------------------------------------------------------------------------
  // Multiplexers
  // ---------------------------------------------------------------------------
  "mux": {
    term: "Mux",
    short: "Short for terminal multiplexer -- software that manages multiple terminal sessions in one window.",
    long: "A mux (terminal multiplexer) like tmux, screen, or zellij sits between the terminal emulator and the shell. It intercepts and reinterprets escape sequences, which can alter behavior: some sequences are filtered, passthrough is needed for others, and capability detection can be confused. FrankenTUI includes specific workarounds for running inside multiplexers.",
    related: ["tmux", "screen", "zellij", "dcs"],
  },
  "tmux": {
    term: "tmux",
    short: "A widely-used terminal multiplexer with its own escape-sequence passthrough mechanism (DCS tmux;).",
    long: "tmux is the most popular terminal multiplexer. It intercepts escape sequences and only forwards recognized ones to the outer terminal. Unrecognized sequences must be wrapped in a DCS passthrough envelope. FrankenTUI detects tmux via the TMUX environment variable and adjusts its output accordingly, wrapping OSC 8 hyperlinks and DEC 2026 sync markers for passthrough.",
    related: ["mux", "screen", "zellij", "dcs", "osc-8", "dec-2026"],
  },
  "screen": {
    term: "screen",
    short: "GNU Screen -- one of the oldest terminal multiplexers, with limited modern escape-sequence support.",
    long: "GNU Screen predates most modern terminal features and has limited passthrough support compared to tmux. FrankenTUI detects screen via the TERM variable and disables features like OSC 8 and DEC 2026 that screen cannot forward. It is less commonly used today but still found in legacy environments.",
    related: ["mux", "tmux", "zellij"],
  },
  "zellij": {
    term: "zellij",
    short: "A modern terminal multiplexer written in Rust, with growing escape-sequence passthrough support.",
    long: "zellij is a newer multiplexer that aims to be more user-friendly than tmux. It has its own plugin system and layout engine. Its escape-sequence passthrough support has been improving rapidly. FrankenTUI detects zellij via the ZELLIJ environment variable and adjusts capabilities accordingly.",
    related: ["mux", "tmux", "screen"],
  },

  // ---------------------------------------------------------------------------
  // Safety
  // ---------------------------------------------------------------------------
  "one-writer-rule": {
    term: "One-Writer Rule",
    short: "The invariant that only one component may write to the terminal output at a time.",
    long: "Concurrent writes to a terminal can interleave escape sequences, producing corrupted output or broken state. FrankenTUI enforces the One-Writer Rule by funneling all output through a single TerminalWriter owned by the Presenter. No other component is allowed to write to stdout while the session is active. This prevents a broad class of rendering bugs.",
    why: "Interleaved escape sequences can leave the terminal in an unpredictable state -- wrong colors, broken cursor position, or even invisible text.",
    related: ["terminal-writer", "presenter", "sanitization", "raw-passthrough"],
  },
  "sanitization": {
    term: "Sanitization",
    short: "Stripping or escaping dangerous control sequences from untrusted content before rendering.",
    long: "User-provided or external text may contain embedded escape sequences that could manipulate the terminal in unintended ways (changing colors, moving the cursor, or worse). FrankenTUI sanitizes all untrusted input by stripping or replacing control characters before they enter the rendering pipeline. This is critical for applications displaying user-generated content.",
    related: ["one-writer-rule", "raw-passthrough", "ansi"],
  },
  "raw-passthrough": {
    term: "Raw Passthrough",
    short: "Injecting pre-formed escape sequences directly into the output stream, bypassing the diff engine.",
    long: "Raw Passthrough is an escape hatch for features that cannot be expressed through the Cell/Buffer abstraction, such as Sixel graphics or custom DCS sequences. It bypasses diffing entirely and writes raw bytes at a designated position. Use is discouraged because it breaks the One-Writer Rule's guarantees and can corrupt the front buffer state if not carefully managed.",
    why: "Sometimes the abstraction must be pierced for advanced features, but it should be done with explicit opt-in and clear documentation of the risks.",
    related: ["one-writer-rule", "sanitization", "dcs"],
  },
  "raii": {
    term: "RAII",
    short: "Resource Acquisition Is Initialization -- a pattern ensuring cleanup happens automatically when a value is dropped.",
    long: "RAII is a Rust (and C++) idiom where resources are tied to object lifetimes. In FrankenTUI, the TerminalSession uses RAII to guarantee that raw mode is exited, the cursor is restored, and the alternate screen is left when the session value goes out of scope -- even if the application panics. This prevents leaving the user's terminal in a broken state.",
    analogy: "Like a self-closing door: no matter how you leave the room, the door always shuts behind you.",
    related: ["terminal-session", "raw-mode"],
  },

  // ---------------------------------------------------------------------------
  // Project
  // ---------------------------------------------------------------------------
  "ftui": {
    term: "ftui",
    short: "The shorthand name for the FrankenTUI project and its primary crate.",
    long: "ftui is the colloquial and crate-level name for FrankenTUI. It appears in import paths, CLI tool names, and documentation references. The name FrankenTUI reflects the project's philosophy of stitching together well-understood parts into a cohesive terminal UI framework.",
    related: ["kernel", "harness"],
  },
  "kernel": {
    term: "Kernel",
    short: "The core rendering and layout engine of FrankenTUI, independent of any runtime or I/O.",
    long: "The Kernel contains the pure, platform-independent logic: buffer management, diffing, layout, text measurement, and compositing. It has no dependencies on terminal I/O, async runtimes, or OS APIs. This separation allows the Kernel to be tested exhaustively with unit and property tests and reused across different runtime harnesses.",
    related: ["ftui", "harness", "presenter", "buffer"],
  },
  "harness": {
    term: "Harness",
    short: "A runtime wrapper that connects the Kernel to a real terminal, event loop, and I/O layer.",
    long: "The Harness provides the runtime environment the Kernel needs: terminal I/O, input event parsing, signal handling, async task execution, and the Elm-architecture event loop. Different harnesses can target different async runtimes (tokio, async-std) or environments (real terminal, headless test, web via WASM). The Harness is the glue between pure rendering logic and the messy real world.",
    related: ["ftui", "kernel", "program", "terminal-session"],
  },
  "log-sink": {
    term: "LogSink",
    short: "A logging backend that captures diagnostic output without corrupting the terminal display.",
    long: "Writing log messages to stdout while a TUI is running would corrupt the display. LogSink redirects log output to a safe destination: a file, an in-memory ring buffer, or a dedicated pane within the TUI itself. FrankenTUI provides a LogSink implementation that integrates with the standard Rust logging facade (the log crate).",
    why: "printf-debugging a TUI is impossible if your prints destroy the screen you are trying to debug.",
    related: ["terminal-session", "one-writer-rule"],
  },
  "pty-capture": {
    term: "PtyCapture",
    short: "A test utility that runs a FrankenTUI program in a real PTY and records its output.",
    long: "PtyCapture spawns the application under test in a pseudo-terminal, feeds it scripted input events, and captures all output bytes including escape sequences. The captured output can then be replayed through a TerminalModel for assertions or saved as a snapshot. PtyCapture is the highest-fidelity testing tool in the FrankenTUI test suite.",
    related: ["pty", "terminal-model", "snapshot-test", "harness"],
  },
};

export function getJargon(key: string): JargonTerm | undefined {
  return jargonMap[key];
}

export function getAllJargon(): [string, JargonTerm][] {
  return Object.entries(jargonMap).sort(([a], [b]) => a.localeCompare(b));
}

export function searchJargon(query: string): [string, JargonTerm][] {
  const q = query.toLowerCase();
  return getAllJargon().filter(
    ([key, term]) =>
      key.includes(q) ||
      term.term.toLowerCase().includes(q) ||
      term.short.toLowerCase().includes(q)
  );
}
