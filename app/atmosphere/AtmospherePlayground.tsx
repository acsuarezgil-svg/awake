"use client";

import { useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { atmospheres, type AtmosphereTokens } from "./atmospheres";
import styles from "./atmosphere.module.css";

type Mode = "light" | "dark";

const SEGMENT_ANGLE = 360 / atmospheres.length;
const PRESET_IDS = ["growth", "calm", "warmth", "reflection", "depth"] as const;
const PRESET_MARKS: Record<(typeof PRESET_IDS)[number], string> = {
  growth: "↗",
  calm: "≈",
  warmth: "☼",
  reflection: "◒",
  depth: "◇",
};

function normalizeIndex(value: number) {
  return (value + atmospheres.length) % atmospheres.length;
}

function nearestIndex(rotation: number) {
  return normalizeIndex(Math.round(-rotation / SEGMENT_ANGLE));
}

function snapRotation(index: number) {
  return -index * SEGMENT_ANGLE;
}

function tokenStyles(tokens: AtmosphereTokens): CSSProperties {
  return {
    "--atmosphere-background": tokens.background,
    "--atmosphere-paper": tokens.paper,
    "--atmosphere-surface": tokens.surface,
    "--atmosphere-surface-strong": tokens.surfaceStrong,
    "--atmosphere-text": tokens.text,
    "--atmosphere-muted": tokens.muted,
    "--atmosphere-border": tokens.border,
    "--atmosphere-primary": tokens.primary,
    "--atmosphere-primary-soft": tokens.primarySoft,
    "--atmosphere-complement": tokens.complement,
    "--atmosphere-complement-soft": tokens.complementSoft,
  } as CSSProperties;
}

export default function AtmospherePlayground() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<Mode>("light");
  const drag = useRef<{
    startAngle: number;
    startRotation: number;
  } | null>(null);

  const atmosphere = atmospheres[selectedIndex];
  const tokens =
    mode === "light" ? atmosphere.lightTokens : atmosphere.darkTokens;

  function pointerAngle(event: ReactPointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      Math.atan2(
        event.clientY - (rect.top + rect.height / 2),
        event.clientX - (rect.left + rect.width / 2),
      ) *
      (180 / Math.PI)
    );
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startAngle: pointerAngle(event),
      startRotation: rotation,
    };
    setDragging(true);
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const next =
      drag.current.startRotation +
      pointerAngle(event) -
      drag.current.startAngle;
    setRotation(next);
    setSelectedIndex(nearestIndex(next));
  }

  function finishDrag() {
    const nextIndex = nearestIndex(rotation);
    setSelectedIndex(nextIndex);
    setRotation(snapRotation(nextIndex));
    drag.current = null;
    setDragging(false);
  }

  function selectIndex(index: number) {
    const next = normalizeIndex(index);
    setSelectedIndex(next);
    setRotation(snapRotation(next));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectIndex(selectedIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(selectedIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectIndex(atmospheres.length - 1);
    }
  }

  return (
    <main
      className={styles.playground}
      style={tokenStyles(tokens)}
      data-mode={mode}
    >
      <div className={styles.paperTexture} aria-hidden="true" />
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Awake experiment 01</p>
          <h1>Awake Atmosphere Wheel</h1>
        </div>
        <div className={styles.modeSwitch} aria-label="Preview brightness">
          {(["light", "dark"] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={mode === option ? styles.modeSelected : ""}
            >
              {option === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.workspace}>
        <section className={styles.editor} aria-labelledby="wheel-heading">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Choose a feeling</p>
            <h2 id="wheel-heading">Rotate toward what feels right</h2>
            <p>
              Drag the painted wheel to choose the atmosphere that feels right
              for you.
            </p>
          </div>

          <div className={styles.wheelStage}>
            <div className={styles.selectionMark} aria-hidden="true" />
            <div className={`${styles.wheelColor} ${styles.primaryColor}`}>
              <i style={{ background: tokens.primary }} aria-hidden="true" />
              <span>Primary</span>
              <strong>{atmosphere.primaryName}</strong>
              <small>{tokens.primary.toUpperCase()}</small>
            </div>
            <div className={`${styles.wheelColor} ${styles.complementColor}`}>
              <i style={{ background: tokens.complement }} aria-hidden="true" />
              <span>Complement</span>
              <strong>{atmosphere.complementName}</strong>
              <small>{tokens.complement.toUpperCase()}</small>
            </div>
            <div
              className={`${styles.wheel} ${
                dragging ? styles.wheelDragging : ""
              }`}
              style={{
                "--wheel-rotation": `${rotation}deg`,
                "--wheel-pigments": atmospheres
                  .map(
                    (item, index) =>
                      `${item.pigment} ${index * SEGMENT_ANGLE}deg ${
                        (index + 1) * SEGMENT_ANGLE
                      }deg`,
                  )
                  .join(", "),
              } as CSSProperties}
              role="slider"
              tabIndex={0}
              aria-label="Atmosphere wheel"
              aria-valuemin={1}
              aria-valuemax={atmospheres.length}
              aria-valuenow={selectedIndex + 1}
              aria-valuetext={atmosphere.name}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onKeyDown={handleKeyDown}
            >
              <div className={styles.pigmentWash} aria-hidden="true" />
              {atmospheres.map((item, index) => {
                const angle = index * SEGMENT_ANGLE;
                return (
                  <span
                    key={item.id}
                    className={styles.wheelLabel}
                    style={
                      {
                        "--label-angle": `${angle}deg`,
                        "--label-counter": `${-rotation - angle}deg`,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    <span>{item.name}</span>
                  </span>
                );
              })}
              <div className={styles.wheelCenter} aria-hidden="true">
                <span className={styles.awakeMark}>A</span>
              </div>
            </div>
          </div>

          <div className={styles.atmosphereDetails} aria-live="polite">
            <p className={styles.eyebrow}>{atmosphere.emotion}</p>
            <h3>Balanced harmony</h3>
            <p className={styles.description}>
              {atmosphere.primaryName} and {atmosphere.complementName} create
              a{" "}
              {atmosphere.description
                .map((line) => line.replace(".", "").toLowerCase())
                .join(", ")}{" "}
              atmosphere.
            </p>
            <div className={styles.pairing}>
              <div>
                <span>Primary</span>
                <strong>
                  <i
                    style={{ background: atmosphere.pigment }}
                    aria-hidden="true"
                  />
                  {atmosphere.primaryName}
                </strong>
              </div>
              <span className={styles.pairArrow} aria-hidden="true">
                ⇄
              </span>
              <div>
                <span>Complement</span>
                <strong>
                  <i
                    style={{ background: atmosphere.complementPigment }}
                    aria-hidden="true"
                  />
                  {atmosphere.complementName}
                </strong>
              </div>
            </div>
          </div>

          <nav className={styles.presetRail} aria-label="Atmosphere presets">
            {PRESET_IDS.map((id) => {
              const index = atmospheres.findIndex((item) => item.id === id);
              const item = atmospheres[index];
              return (
              <button
                type="button"
                key={item.id}
                onClick={() => selectIndex(index)}
                aria-label={`Select ${item.name}`}
                aria-current={selectedIndex === index ? "true" : undefined}
              >
                <span aria-hidden="true">{PRESET_MARKS[id]}</span>
                {item.name}
              </button>
              );
            })}
          </nav>
          <p className={styles.exploreHint}>Drag the wheel or choose a mood to explore.</p>
        </section>

        <section className={styles.previewColumn} aria-labelledby="preview-title">
          <div className={styles.previewLabel}>
            <div>
              <p className={styles.eyebrow}>Live study</p>
              <h2 id="preview-title">Awake in {atmosphere.name}</h2>
            </div>
            <span>{mode} expression</span>
          </div>

          <div className={styles.expressionNote}>
            <span aria-hidden="true">{mode === "light" ? "☼" : "◒"}</span>
            <p>
              <strong>Same atmosphere, different light.</strong>
              {mode === "light"
                ? " Paper and pigment become airy and clear."
                : " The same colors settle into a quieter depth."}
            </p>
          </div>

          <div className={styles.phonePreview}>
            <div className={styles.previewWash} aria-hidden="true" />
            <header className={styles.previewHeader}>
              <div>
                <p>Awake</p>
                <h3>Your World</h3>
              </div>
              <button type="button" aria-label="Preview appearance">
                ◐
              </button>
            </header>

            <div className={styles.worldOrbs} aria-label="Foundation preview">
              <div className={styles.smallOrb}>
                <span />
                <strong>Growth</strong>
              </div>
              <div className={styles.mainOrb}>
                <span>Breathe</span>
              </div>
              <div className={styles.smallOrb}>
                <span />
                <strong>Health</strong>
              </div>
            </div>

            <section className={styles.healthCard}>
              <div className={styles.healthOrb}>
                <span>♡</span>
              </div>
              <div>
                <p>Foundation</p>
                <h4>Health</h4>
                <span>5 systems supporting you</span>
              </div>
            </section>

            <section className={styles.sleepCard}>
              <div className={styles.sleepMark}>◔</div>
              <div>
                <p>Sleep</p>
                <span>Last supported yesterday</span>
              </div>
              <button type="button">Open</button>
            </section>

            <button type="button" className={styles.previewPrimary}>
              Add a system
            </button>

            <nav className={styles.previewNavigation} aria-label="Preview navigation">
              <span className={styles.navActive}>World</span>
              <span>Journey</span>
              <span>Reflect</span>
            </nav>
          </div>
        </section>
      </div>

      <footer className={styles.prototypeNote}>
        <span>Prototype only</span>
        No preferences are saved. Nothing here changes Awake.
      </footer>
    </main>
  );
}
