import { Box, Card } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PEEK = "peek";
const FULL = "full";

const TAP_THRESHOLD = 6; // px of movement before a press is treated as a drag
const FLICK_VELOCITY = 0.4; // px/ms
const CLOSE_DISTANCE = 50; // px dragged below the peek position that dismisses the sheet

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/**
 * Mobile bottom drawer.
 * - `header` (plus the grab handle) is always visible and is the draggable area:
 *   tap it to toggle, drag it up to expand, drag it down to collapse / dismiss.
 * - `children` is the rest of the card (body, footer), only reachable when expanded.
 * Content is expected to be Card.Header / Card.Body / Card.Footer so the layout is
 * the same as the desktop sidebar card.
 */
const BottomSheet = ({ isVisible, resetKey, onClose, header, children }) => {
  const [snap, setSnap] = useState(PEEK);
  const [dragY, setDragY] = useState(null); // translateY in px while dragging
  const [peekHeight, setPeekHeight] = useState(140);

  const sheetRef = useRef(null);
  const topRef = useRef(null);
  const drag = useRef(null);

  // Always open in the peek position for a new selection
  useEffect(() => {
    if (isVisible) setSnap(PEEK);
  }, [isVisible, resetKey]);

  // The peek height follows the size of the handle + header
  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const update = () => setPeekHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Let other floating UI (map controls, action bar) stay above the peeking sheet
  useEffect(() => {
    if (!isVisible) return;
    const root = document.documentElement;
    root.style.setProperty("--bottom-sheet-offset", `${peekHeight}px`);
    return () => root.style.setProperty("--bottom-sheet-offset", "0px");
  }, [isVisible, peekHeight]);

  const sheetHeight = () => sheetRef.current?.offsetHeight ?? 0;
  const peekTranslate = () => Math.max(sheetHeight() - peekHeight, 0);

  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    // Let buttons (close, copy, pagination...) behave normally
    if (e.target.closest("button, a, input, select, textarea")) return;

    drag.current = {
      startY: e.clientY,
      startTranslate: snap === FULL ? 0 : peekTranslate(),
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is only a convenience */
    }
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;

    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < TAP_THRESHOLD) return;
    d.moved = true;

    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;

    // Allow a little over-drag below the peek position so "drag down to dismiss" feels natural
    const max = peekTranslate() + peekHeight;
    d.translate = clamp(d.startTranslate + dy, 0, max);
    setDragY(d.translate);
  };

  const endDrag = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* not captured */
    }

    if (!d.moved) {
      setSnap((s) => (s === FULL ? PEEK : FULL)); // tap
      return;
    }

    const peekT = peekTranslate();
    const t = d.translate ?? d.startTranslate;
    setDragY(null);

    if (d.velocity < -FLICK_VELOCITY) {
      setSnap(FULL);
    } else if (d.velocity > FLICK_VELOCITY) {
      if (t > peekT - 10) onClose?.();
      else setSnap(PEEK);
    } else if (t > peekT + CLOSE_DISTANCE) {
      onClose?.();
    } else if (t < peekT / 2) {
      setSnap(FULL);
    } else {
      setSnap(PEEK);
    }
  };

  const onKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSnap((s) => (s === FULL ? PEEK : FULL));
    } else if (e.key === "ArrowUp") {
      setSnap(FULL);
    } else if (e.key === "ArrowDown") {
      setSnap(PEEK);
    }
  };

  let transform;
  if (dragY != null) transform = `translateY(${dragY}px)`;
  else if (!isVisible) transform = "translateY(calc(100% + 24px))";
  else if (snap === FULL) transform = "translateY(0)";
  else transform = `translateY(calc(100% - ${peekHeight}px))`;

  return (
    <Card.Root
      ref={sheetRef}
      aria-hidden={!isVisible}
      style={{
        transform,
        transition: dragY != null ? "none" : "transform 0.3s cubic-bezier(.2,.8,.2,1)",
        pointerEvents: isVisible ? "auto" : "none",
        visibility: isVisible || dragY != null ? "visible" : undefined,
      }}
      position="fixed"
      left="0"
      right="0"
      bottom="0"
      h="90vh"
      css={{ height: "90dvh" }}
      zIndex="25"
      rounded="xl"
      borderBottomRadius="0"
      border="1px solid"
      borderColor="gray.300"
      borderBottom="none"
      boxShadow="0px -4px 16px rgba(0, 0, 0, 0.2)"
      overflow="hidden"
    >
      <Box
        ref={topRef}
        flexShrink={0}
        cursor="grab"
        userSelect="none"
        style={{ touchAction: "none" }}
        role="button"
        tabIndex={isVisible ? 0 : -1}
        aria-expanded={snap === FULL}
        aria-label={snap === FULL ? "Collapse details" : "Expand details"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        _focusVisible={{ outline: "2px solid", outlineColor: "gray.900", outlineOffset: "-2px" }}
      >
        <Box pt="2.5" pb="1" display="flex" justifyContent="center">
          <Box w="40px" h="5px" rounded="full" bg="gray.400" />
        </Box>
        {header}
      </Box>

      {children}
    </Card.Root>
  );
};

export default BottomSheet;
