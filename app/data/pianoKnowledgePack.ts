import type { CurriculumSection, KnowledgePack } from "../types/learning";

const activity = (id: string, title: string, order: number, minutes?: number) => ({
  id,
  title,
  order,
  ...(minutes ? { minutes } : {}),
});

const beginnerCurriculum = [
  {
    id: "piano-beginner-keyboard-reading",
    title: "Keyboard and Reading",
    description: "Connect the keyboard, finger numbers, and landmark notes.",
    order: 1,
    lessons: [
      {
        id: "piano-beginner-meet-keyboard", title: "Meet the keyboard", order: 1, estimatedMinutes: 30,
        description: "Use black-key groups to navigate the keyboard with relaxed posture.",
        focusHighlights: ["Keyboard map", "Finger numbers", "Relaxed posture"],
        practiceActivities: [activity("meet-keyboard-groups", "Find every two- and three-black-key group", 1, 8), activity("meet-keyboard-names", "Name the surrounding white keys", 2, 10), activity("meet-keyboard-posture", "Set bench distance and relaxed hand shape", 3, 7), activity("meet-keyboard-review", "Navigate without key labels", 4, 5)],
        readinessChecks: ["I can find any named white key without labels."],
      },
      {
        id: "piano-beginner-middle-c", title: "Find middle C", order: 2, estimatedMinutes: 30,
        description: "Use middle C as a reliable bridge between keyboard and staff.",
        focusHighlights: ["Middle C", "Staff direction", "Keyboard position"],
        practiceActivities: [activity("middle-c-find", "Find middle C from several starting places", 1, 8), activity("middle-c-staff", "Trace middle C between the two staves", 2, 7), activity("middle-c-patterns", "Play short stepwise patterns around middle C", 3, 10), activity("middle-c-recall", "Close with a no-label recall check", 4, 5)],
      },
      {
        id: "piano-beginner-treble-notes", title: "Read treble-clef notes", order: 3, estimatedMinutes: 30,
        description: "Read short right-hand melodies from landmarks, steps, and skips.",
        focusHighlights: ["Treble clef", "Right hand", "Steps and skips"],
        practiceActivities: [activity("treble-landmarks", "Review treble landmark notes", 1, 6), activity("treble-say-play", "Say then play short note groups", 2, 9), activity("treble-melody", "Read a five-note melody slowly", 3, 10), activity("treble-replay", "Replay once without stopping", 4, 5)],
        readinessChecks: ["I can read a short treble melody without writing note names."],
      },
      {
        id: "piano-beginner-bass-notes", title: "Read bass-clef notes", order: 4, estimatedMinutes: 30,
        description: "Read short left-hand patterns while keeping the wrist loose.",
        focusHighlights: ["Bass clef", "Left hand", "Landmark notes"],
        practiceActivities: [activity("bass-landmarks", "Review bass landmark notes", 1, 6), activity("bass-say-play", "Say then play short note groups", 2, 9), activity("bass-pattern", "Read a five-note bass pattern", 3, 10), activity("bass-replay", "Replay once with even tone", 4, 5)],
        readinessChecks: ["I can locate and play simple bass-clef notes around middle C."],
      },
    ],
  },
  {
    id: "piano-beginner-rhythm-timing",
    title: "Rhythm and Timing",
    description: "Build a steady inner pulse and read foundational note values.",
    order: 2,
    lessons: [
      {
        id: "piano-beginner-quarter-notes", title: "Quarter notes", order: 1, estimatedMinutes: 30,
        focusHighlights: ["Quarter notes", "Steady pulse", "Count aloud"],
        practiceActivities: [activity("quarter-clap", "Clap four-beat patterns", 1, 7), activity("quarter-count", "Count aloud with a metronome-free pulse", 2, 8), activity("quarter-play", "Play one note with each count", 3, 8), activity("quarter-melody", "Apply the pulse to a short melody", 4, 7)],
      },
      {
        id: "piano-beginner-long-notes", title: "Half and whole notes", order: 2, estimatedMinutes: 30,
        focusHighlights: ["Half notes", "Whole notes", "Held sound"],
        practiceActivities: [activity("long-compare", "Compare one-, two-, and four-beat notes", 1, 7), activity("long-clap", "Clap mixed note values", 2, 8), activity("long-hold", "Play and hold without adding tension", 3, 8), activity("long-line", "Read a mixed-value line", 4, 7)],
      },
      {
        id: "piano-beginner-rests", title: "Simple rests", order: 3, estimatedMinutes: 30,
        focusHighlights: ["Quarter rests", "Silent pulse", "Clean releases"],
        practiceActivities: [activity("rests-step", "Step the pulse through sound and silence", 1, 7), activity("rests-clap", "Clap patterns with quarter rests", 2, 8), activity("rests-release", "Practice clean note releases", 3, 7), activity("rests-read", "Play a short line without filling the rests", 4, 8)],
      },
      {
        id: "piano-beginner-steady-counting", title: "Steady counting", order: 4, estimatedMinutes: 30,
        focusHighlights: ["Four-beat meter", "Continuous count", "Recovery"],
        practiceActivities: [activity("steady-tap", "Tap an uninterrupted four-beat pulse", 1, 6), activity("steady-mix", "Count mixed notes and rests", 2, 8), activity("steady-play", "Play while counting aloud", 3, 10), activity("steady-recover", "Continue after one planned pause", 4, 6)],
        readinessChecks: ["I can keep counting when the music includes a rest."],
      },
    ],
  },
  {
    id: "piano-beginner-technique-coordination",
    title: "Technique and Coordination",
    description: "Develop even tone and dependable control in each hand.",
    order: 3,
    lessons: [
      {
        id: "piano-beginner-five-finger", title: "Five-finger position", order: 1, estimatedMinutes: 30,
        focusHighlights: ["Curved fingers", "Loose wrist", "Even tone"],
        practiceActivities: [activity("five-shape", "Set a balanced five-finger shape", 1, 6), activity("five-down-up", "Play slowly down and up", 2, 9), activity("five-dynamics", "Repeat softly and evenly", 3, 8), activity("five-release", "Pause and release tension", 4, 7)],
      },
      {
        id: "piano-beginner-right-control", title: "Right-hand control", order: 2, estimatedMinutes: 30,
        focusHighlights: ["Right hand", "Finger changes", "Even rhythm"],
        practiceActivities: [activity("right-pattern", "Play a five-note pattern slowly", 1, 8), activity("right-groups", "Repeat in small finger groups", 2, 8), activity("right-rhythm", "Keep an even pulse through changes", 3, 8), activity("right-line", "Connect one short melodic line", 4, 6)],
      },
      {
        id: "piano-beginner-left-control", title: "Left-hand control", order: 3, estimatedMinutes: 30,
        focusHighlights: ["Left hand", "Balanced tone", "Finger independence"],
        practiceActivities: [activity("left-pattern", "Play a five-note pattern slowly", 1, 8), activity("left-groups", "Repeat in small finger groups", 2, 8), activity("left-tone", "Match the tone across all fingers", 3, 8), activity("left-line", "Connect one short bass line", 4, 6)],
      },
      {
        id: "piano-beginner-both-hands", title: "Both hands together", order: 4, estimatedMinutes: 30,
        focusHighlights: ["Both hands", "Slow coordination", "Small sections"],
        practiceActivities: [activity("hands-separate", "Review each hand separately", 1, 7), activity("hands-pairs", "Combine two notes at a time", 2, 8), activity("hands-measures", "Connect one measure slowly", 3, 10), activity("hands-release", "Finish with a relaxed run", 4, 5)],
        readinessChecks: ["I can coordinate a short two-hand pattern without rushing."],
      },
    ],
  },
  {
    id: "piano-beginner-first-pieces",
    title: "First Pieces",
    description: "Bring reading, rhythm, and coordination into recognizable music.",
    order: 4,
    lessons: [
      {
        id: "piano-beginner-ode-to-joy", title: "Ode to Joy", order: 1, estimatedMinutes: 30,
        focusHighlights: ["Ode to Joy", "Melody shape", "Steady rhythm"],
        practiceActivities: [activity("ode-rhythm", "Clap the melody rhythm", 1, 6), activity("ode-phrases", "Practice one phrase at a time", 2, 10), activity("ode-connect", "Connect the opening phrases", 3, 9), activity("ode-play", "Play through at a calm tempo", 4, 5)],
      },
      {
        id: "piano-beginner-two-hand-melody", title: "Simple melody with both hands", order: 2, estimatedMinutes: 30,
        focusHighlights: ["Melody and bass", "Hand balance", "Phrase endings"],
        practiceActivities: [activity("melody-right", "Shape the melody alone", 1, 7), activity("melody-left", "Prepare the bass notes", 2, 7), activity("melody-combine", "Combine one phrase slowly", 3, 10), activity("melody-shape", "Soften each phrase ending", 4, 6)],
      },
      {
        id: "piano-beginner-fur-elise-intro", title: "Für Elise introduction", order: 3, estimatedMinutes: 30,
        description: "Explore the opening gesture without reproducing full notation.",
        focusHighlights: ["Für Elise", "Opening gesture", "Light touch"],
        practiceActivities: [activity("fur-listen", "Listen for the shape of the opening", 1, 5), activity("fur-notes", "Review the opening-note pattern", 2, 8), activity("fur-groups", "Practice in short right-hand groups", 3, 10), activity("fur-connect", "Connect the opening slowly", 4, 7)],
      },
      {
        id: "piano-beginner-fur-elise-1-8", title: "Für Elise — Measures 1–8", order: 4, estimatedMinutes: 30,
        description: "Coordinate the opening eight measures with control and continuity.",
        focusHighlights: ["Für Elise", "Measures 1–8", "Right hand"],
        practiceActivities: [activity("fur-eight-review", "Review the opening notes", 1, 5), activity("fur-eight-right", "Practice slowly with the right hand", 2, 9), activity("fur-eight-left", "Add the left-hand notes", 3, 8), activity("fur-eight-run", "Play measures 1–8 without stopping", 4, 8)],
        readinessChecks: ["I can play measures 1–8 slowly without losing the pulse."],
      },
    ],
  },
] as const satisfies readonly CurriculumSection[];

const intermediateCurriculum = [
  { id: "piano-intermediate-technique", title: "Scales and Harmony", order: 1, lessons: [
    { id: "piano-intermediate-major-scales", title: "Major scales", order: 1, estimatedMinutes: 45, focusHighlights: ["Major scales", "Even fingering", "Two hands"], practiceActivities: [activity("major-map", "Map the fingering slowly", 1, 12), activity("major-balance", "Balance both hands", 2, 15), activity("major-tempo", "Build a reliable tempo", 3, 18)] },
    { id: "piano-intermediate-inversions", title: "Chords and inversions", order: 2, estimatedMinutes: 45, focusHighlights: ["Triads", "Inversions", "Voice leading"], practiceActivities: [activity("inversions-build", "Build root-position triads", 1, 12), activity("inversions-turn", "Move through inversions", 2, 15), activity("inversions-connect", "Connect a short progression", 3, 18)] },
  ]},
  { id: "piano-intermediate-musicianship", title: "Reading and Color", order: 2, lessons: [
    { id: "piano-intermediate-sight-reading", title: "Sight reading", order: 1, estimatedMinutes: 45, focusHighlights: ["Pattern reading", "Steady pulse", "Forward motion"], practiceActivities: [activity("sight-scan", "Scan key, meter, and patterns", 1, 10), activity("sight-read", "Read without restarting", 2, 20), activity("sight-review", "Review two useful observations", 3, 15)] },
    { id: "piano-intermediate-pedaling", title: "Pedaling", order: 2, estimatedMinutes: 45, focusHighlights: ["Clean pedal", "Harmony changes", "Listening"], practiceActivities: [activity("pedal-change", "Coordinate pedal changes", 1, 12), activity("pedal-listen", "Listen for blurred harmony", 2, 15), activity("pedal-phrase", "Pedal a complete phrase", 3, 18)] },
  ]},
  { id: "piano-intermediate-repertoire", title: "Repertoire Development", order: 3, lessons: [
    { id: "piano-intermediate-repertoire-plan", title: "Develop a contrasting piece", order: 1, estimatedMinutes: 45, focusHighlights: ["Section map", "Technical focus", "Musical shape"], practiceActivities: [activity("rep-map", "Map the piece into sections", 1, 10), activity("rep-solve", "Solve one difficult passage", 2, 20), activity("rep-connect", "Reconnect it to the phrase", 3, 15)], readinessChecks: ["I can explain the next technical and musical priority."] },
  ]},
] as const satisfies readonly CurriculumSection[];

const advancedCurriculum = [
  { id: "piano-advanced-sound", title: "Sound and Interpretation", order: 1, lessons: [
    { id: "piano-advanced-voicing", title: "Voicing", order: 1, estimatedMinutes: 60, focusHighlights: ["Melodic layers", "Tone balance", "Listening"], practiceActivities: [activity("voicing-reduce", "Reduce the texture to its layers", 1, 15), activity("voicing-balance", "Rebuild with deliberate balance", 2, 25), activity("voicing-record", "Record and evaluate the result", 3, 20)] },
    { id: "piano-advanced-interpretation", title: "Interpretation", order: 2, estimatedMinutes: 60, focusHighlights: ["Form", "Phrase direction", "Style"], practiceActivities: [activity("interpret-map", "Map the formal direction", 1, 15), activity("interpret-choices", "Test two phrase choices", 2, 25), activity("interpret-run", "Perform a connected span", 3, 20)] },
  ]},
  { id: "piano-advanced-craft", title: "Technique and Creativity", order: 2, lessons: [
    { id: "piano-advanced-technique", title: "Advanced technique", order: 1, estimatedMinutes: 60, focusHighlights: ["Efficient movement", "Tone control", "Endurance"], practiceActivities: [activity("advanced-diagnose", "Diagnose one movement problem", 1, 15), activity("advanced-variants", "Test rhythmic and touch variants", 2, 25), activity("advanced-transfer", "Return to the musical passage", 3, 20)] },
    { id: "piano-advanced-improvisation", title: "Improvisation", order: 2, estimatedMinutes: 60, focusHighlights: ["Motif", "Harmony", "Spontaneity"], practiceActivities: [activity("improv-motif", "Create a short motif", 1, 15), activity("improv-develop", "Develop it over a progression", 2, 25), activity("improv-form", "Shape a complete short form", 3, 20)] },
  ]},
  { id: "piano-advanced-performance", title: "Performance Preparation", order: 3, lessons: [
    { id: "piano-advanced-performance-run", title: "Performance preparation", order: 1, estimatedMinutes: 60, focusHighlights: ["Complete run", "Recovery", "Reflection"], practiceActivities: [activity("performance-prepare", "Set performance conditions", 1, 10), activity("performance-run", "Play a complete uninterrupted span", 2, 35), activity("performance-reflect", "Choose one evidence-based revision", 3, 15)], readinessChecks: ["I can recover without abandoning the performance."] },
  ]},
] as const satisfies readonly CurriculumSection[];

export const pianoKnowledgePack = {
  id: "knowledge-pack-piano",
  slug: "piano",
  title: "Piano",
  subject: "Music",
  description:
    "A grounded path from first notes to expressive playing, built around regular practice, listening, and repertoire.",
  stages: [
    {
      id: "piano-beginner-foundation",
      level: "beginner",
      title: "Beginner Foundation",
      description:
        "Build relaxed technique, keyboard fluency, rhythmic steadiness, and the habits needed to learn simple music independently.",
      estimatedDuration: "12 weeks",
      recommendedSessionsPerWeek: 5,
      recommendedMinutesPerSession: 30,
      suggestedDays: ["Monday", "Tuesday", "Thursday", "Friday", "Sunday"],
      outcomes: [
        "Sit and move at the keyboard with relaxed, balanced technique.",
        "Read simple music in treble and bass clefs around middle C.",
        "Keep a steady pulse through common rhythms and simple meter.",
        "Play major five-finger patterns and basic I–V7–I progressions.",
        "Prepare and perform two short pieces with musical shape.",
      ],
      learningPath: [
        {
          id: "piano-beginner-01",
          title: "Meet the keyboard",
          description:
            "Find repeating two- and three-black-key groups, name every white key, and establish comfortable bench height, hand shape, and finger numbers.",
          estimatedMinutes: 90,
          outcomes: ["Navigate the keyboard without labels", "Use a relaxed playing posture"],
        },
        {
          id: "piano-beginner-02",
          title: "Pulse, rhythm, and coordination",
          description:
            "Clap and play quarter, half, whole, and paired eighth notes in 4/4 while counting aloud; begin simple hands-separate patterns.",
          estimatedMinutes: 150,
          outcomes: ["Maintain a steady pulse", "Count foundational rhythms aloud"],
        },
        {
          id: "piano-beginner-03",
          title: "Reading around middle C",
          description:
            "Connect staff direction and landmark notes to the keyboard, reading short five-note melodies in treble and bass clefs.",
          estimatedMinutes: 180,
          outcomes: ["Recognize landmark notes", "Read by step and skip"],
        },
        {
          id: "piano-beginner-04",
          title: "Five-finger patterns",
          description:
            "Play C, G, and F major five-finger patterns with even tone, first separately and then in simple contrary-motion exercises.",
          estimatedMinutes: 180,
          outcomes: ["Use consistent fingering", "Play evenly with either hand"],
        },
        {
          id: "piano-beginner-05",
          title: "First harmony",
          description:
            "Build tonic and dominant-seventh shapes in C, G, and F; use them to accompany melodies and hear movement away from and home to tonic.",
          estimatedMinutes: 180,
          outcomes: ["Play I–V7–I in three keys", "Hear basic harmonic resolution"],
        },
        {
          id: "piano-beginner-06",
          title: "Hands together",
          description:
            "Combine a melody with blocked chords or a simple bass, practicing in small sections at a slow, reliable tempo.",
          estimatedMinutes: 210,
          outcomes: ["Coordinate simple two-hand textures", "Use short, focused practice loops"],
        },
        {
          id: "piano-beginner-07",
          title: "Dynamics and phrasing",
          description:
            "Shape short phrases with legato, staccato, dynamic contrast, and a clear sense of arrival rather than only playing correct notes.",
          estimatedMinutes: 150,
          outcomes: ["Control two basic articulations", "Shape a phrase intentionally"],
        },
        {
          id: "piano-beginner-08",
          title: "Prepare two complete pieces",
          description:
            "Choose contrasting early-level pieces, solve difficult measures, connect sections, record run-throughs, and refine starts and endings.",
          estimatedMinutes: 300,
          outcomes: ["Perform two pieces from beginning to end", "Reflect on a recording and make one useful revision"],
        },
      ],
      curriculumSections: beginnerCurriculum,
      practiceTemplate: [
        { id: "beginner-arrive", title: "Arrive", minutes: 2, guidance: "Set posture, release shoulder tension, and hear the first sound before playing." },
        { id: "beginner-technique", title: "Technique", minutes: 6, guidance: "Play the current five-finger pattern slowly with an even tone and loose wrists." },
        { id: "beginner-reading", title: "Reading and rhythm", minutes: 6, guidance: "Clap one rhythm, then sight-read a short line without stopping." },
        { id: "beginner-repertoire", title: "Repertoire", minutes: 13, guidance: "Work on one small problem, then reconnect it to the surrounding phrase." },
        { id: "beginner-close", title: "Play and notice", minutes: 3, guidance: "Play something through, name one improvement, and choose the next starting point." },
      ],
      readinessChecks: [
        "I can find and name notes across the keyboard without key labels.",
        "I can count and play simple rhythms with a steady pulse.",
        "I can read short treble- and bass-clef passages by landmark, step, and skip.",
        "I can play C, G, and F five-finger patterns with relaxed hands.",
        "I can play two short pieces through and recover from a small mistake.",
      ],
      modifications: [
        { id: "beginner-gentle", title: "Gentle pace", description: "Shorter sessions with more recovery between them.", sessionsPerWeek: 4, minutesPerSession: 20, suggestedDays: ["Monday", "Wednesday", "Friday", "Sunday"] },
        { id: "beginner-weekend", title: "Weekend-weighted", description: "Keep weekday contact light and use the weekend for deeper practice.", sessionsPerWeek: 3, minutesPerSession: 40, suggestedDays: ["Wednesday", "Saturday", "Sunday"] },
      ],
    },
    {
      id: "piano-intermediate-development",
      level: "intermediate",
      title: "Intermediate Development",
      description: "Expand technique, harmony, reading range, and interpretive control across contrasting repertoire.",
      estimatedDuration: "16 weeks",
      recommendedSessionsPerWeek: 5,
      recommendedMinutesPerSession: 45,
      suggestedDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Sunday"],
      outcomes: ["Play major scales and arpeggios with reliable fingering", "Voice melody over accompaniment", "Learn contrasting pieces with independent practice strategies"],
      learningPath: [
        { id: "piano-intermediate-01", title: "Scale fluency", description: "Develop coordinated major scales, cadences, and arpeggios across common keys.", estimatedMinutes: 360, outcomes: ["Play selected scales hands together", "Connect technique to repertoire"] },
        { id: "piano-intermediate-02", title: "Texture and balance", description: "Practice melody projection, accompaniment balance, pedaling, and layered articulation.", estimatedMinutes: 420, outcomes: ["Voice between the hands", "Use pedal cleanly"] },
        { id: "piano-intermediate-03", title: "Harmony and reading", description: "Read broader textures and recognize progressions, inversions, and phrase structure.", estimatedMinutes: 420, outcomes: ["Identify common harmonic patterns", "Sight-read without frequent restarts"] },
        { id: "piano-intermediate-04", title: "Contrasting repertoire", description: "Prepare works from different styles with deliberate technical and musical goals.", estimatedMinutes: 600, outcomes: ["Perform contrasting works", "Explain interpretive choices"] },
      ],
      curriculumSections: intermediateCurriculum,
      practiceTemplate: [
        { id: "intermediate-arrive", title: "Listen and prepare", minutes: 3, guidance: "Choose a musical and technical intention for the session." },
        { id: "intermediate-technique", title: "Technique", minutes: 10, guidance: "Rotate scales, arpeggios, and a repertoire-linked technical pattern." },
        { id: "intermediate-reading", title: "Reading and harmony", minutes: 7, guidance: "Sight-read briefly or map the harmony of the current piece." },
        { id: "intermediate-repertoire", title: "Focused repertoire", minutes: 20, guidance: "Alternate slow problem-solving with connected musical passages." },
        { id: "intermediate-run", title: "Run and reflect", minutes: 5, guidance: "Record or perform a section, then note the next useful adjustment." },
      ],
      readinessChecks: ["I can maintain relaxed coordination at a moderate tempo.", "I can balance a melody against accompaniment.", "I can plan practice from musical and technical evidence."],
      modifications: [
        { id: "intermediate-compact", title: "Compact week", description: "Preserve consistency during a busy season.", sessionsPerWeek: 4, minutesPerSession: 35 },
        { id: "intermediate-performance", title: "Performance focus", description: "Use longer sessions for run-throughs and recording.", sessionsPerWeek: 5, minutesPerSession: 55 },
      ],
    },
    {
      id: "piano-advanced-expression",
      level: "advanced",
      title: "Advanced Expression",
      description: "Refine individual sound, stylistic understanding, technical freedom, and performance resilience.",
      estimatedDuration: "24 weeks",
      recommendedSessionsPerWeek: 6,
      recommendedMinutesPerSession: 60,
      suggestedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
      outcomes: ["Shape a distinctive interpretation from score evidence", "Solve complex technical demands efficiently", "Sustain a polished performance of substantial repertoire"],
      learningPath: [
        { id: "piano-advanced-01", title: "Technical freedom", description: "Diagnose movement, fingering, voicing, and endurance demands in advanced textures.", estimatedMinutes: 600, outcomes: ["Design targeted technical work", "Play with economy of movement"] },
        { id: "piano-advanced-02", title: "Style and interpretation", description: "Study form, harmony, sources, and performance traditions to make coherent choices.", estimatedMinutes: 720, outcomes: ["Support interpretation with score evidence", "Differentiate stylistic languages"] },
        { id: "piano-advanced-03", title: "Performance craft", description: "Build memory security, recovery strategies, recording practice, and complete-program stamina.", estimatedMinutes: 900, outcomes: ["Recover gracefully in performance", "Deliver a compelling complete program"] },
      ],
      curriculumSections: advancedCurriculum,
      practiceTemplate: [
        { id: "advanced-plan", title: "Plan", minutes: 5, guidance: "Prioritize from yesterday’s evidence and today’s physical state." },
        { id: "advanced-technique", title: "Technical inquiry", minutes: 15, guidance: "Use varied rhythms, groupings, touch, and tempo to solve one movement problem." },
        { id: "advanced-detail", title: "Score and detail", minutes: 20, guidance: "Refine voicing, timing, structure, and stylistic clarity in a focused passage." },
        { id: "advanced-performance", title: "Performance practice", minutes: 15, guidance: "Run a meaningful span under performance conditions without interruption." },
        { id: "advanced-reflect", title: "Reflect", minutes: 5, guidance: "Review evidence, release tension, and record the next experiment." },
      ],
      readinessChecks: ["I can diagnose the cause of a technical problem.", "I can maintain a long musical line through complex textures.", "I can perform substantial repertoire with reliable recovery strategies."],
      modifications: [
        { id: "advanced-maintenance", title: "Repertoire maintenance", description: "Maintain learned works with shorter, rotating sessions.", sessionsPerWeek: 5, minutesPerSession: 45 },
        { id: "advanced-recital", title: "Recital preparation", description: "Increase full runs, recording, and recovery time.", sessionsPerWeek: 6, minutesPerSession: 75 },
      ],
    },
  ],
} as const satisfies KnowledgePack;
