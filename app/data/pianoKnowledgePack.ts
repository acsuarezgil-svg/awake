import type { KnowledgePack } from "../types/learning";

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
