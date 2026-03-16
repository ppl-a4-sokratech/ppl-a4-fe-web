import type { BehavioralFlags, BehavioralPayload } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";

export interface DemoTestCase {
  id: string;
  label: string;
  description: string;
  payload: BehavioralPayload;
  expectedTrueFlags: Array<keyof BehavioralFlags>;
}

const buildKeyEvents = (latencies: Array<number | null>, keydownStep = 100): BehavioralPayload["keyEvents"] =>
  latencies.map((latency, index) => {
    const keydownAt = index * keydownStep;

    return {
      sequence: index + 1,
      keydownAt,
      keyupAt: keydownAt + 40,
      duration: 40,
      flightTime: null,
      downDownLatency: latency,
    };
  });

const createPayload = (partial: Partial<BehavioralPayload>): BehavioralPayload => ({
  mouseEvents: [],
  keyEvents: [],
  pasteEvents: [],
  capturedAt: Date.now(),
  ...partial,
});

export const analyzerDemoTests: DemoTestCase[] = [
  {
    id: "mouse-jump",
    label: "Mouse Jump",
    description: "Memicu 1 mousemove dengan distance di atas 400.",
    expectedTrueFlags: ["isMouseJump"],
    payload: createPayload({
      mouseEvents: [
        { type: "mousemove", x: 20, y: 20, timestamp: 1000, distance: 25, angle: 0.2 },
        { type: "mousemove", x: 600, y: 20, timestamp: 1016, distance: 580, angle: 0.2 },
      ],
    }),
  },
  {
    id: "mouse-linear",
    label: "Mouse Linear",
    description: "Memicu 5 mousemove dengan angle nyaris identik.",
    expectedTrueFlags: ["isMouseLinearMovement"],
    payload: createPayload({
      mouseEvents: [
        { type: "mousemove", x: 10, y: 10, timestamp: 1000, distance: 20, angle: 0.21 },
        { type: "mousemove", x: 30, y: 14, timestamp: 1020, distance: 20, angle: 0.2105 },
        { type: "mousemove", x: 50, y: 18, timestamp: 1040, distance: 20, angle: 0.2095 },
        { type: "mousemove", x: 70, y: 22, timestamp: 1060, distance: 20, angle: 0.2102 },
        { type: "mousemove", x: 90, y: 26, timestamp: 1080, distance: 20, angle: 0.2098 },
      ],
    }),
  },
  {
    id: "click-too-fast",
    label: "Click Too Fast",
    description: "Memicu 2 click/contextmenu dengan interval di bawah 50 ms.",
    expectedTrueFlags: ["isClickTooFast"],
    payload: createPayload({
      mouseEvents: [
        { type: "click", x: 100, y: 100, timestamp: 2000 },
        { type: "contextmenu", x: 100, y: 100, timestamp: 2020 },
      ],
    }),
  },
  {
    id: "click-constant",
    label: "Click Constant",
    description: "Memicu 4 klik dengan interval yang hampir identik.",
    expectedTrueFlags: ["isClickIntervalConstant"],
    payload: createPayload({
      mouseEvents: [
        { type: "click", x: 120, y: 60, timestamp: 3000 },
        { type: "click", x: 120, y: 60, timestamp: 3500 },
        { type: "contextmenu", x: 120, y: 60, timestamp: 4000 },
        { type: "click", x: 120, y: 60, timestamp: 4500 },
      ],
    }),
  },
  {
    id: "typing-too-fast",
    label: "Typing Too Fast",
    description: "Memicu rata-rata downDownLatency di bawah 40 ms.",
    expectedTrueFlags: ["isTypingTooFast"],
    payload: createPayload({
      keyEvents: buildKeyEvents([null, 20, 25, 30, 20, 15], 30),
    }),
  },
  {
    id: "typing-constant",
    label: "Typing Constant",
    description: "Memicu variance downDownLatency sangat kecil.",
    expectedTrueFlags: ["isTypingConstantSpeed"],
    payload: createPayload({
      keyEvents: buildKeyEvents([null, 100, 101, 99, 100, 100], 120),
    }),
  },
];
