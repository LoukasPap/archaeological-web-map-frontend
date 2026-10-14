import { useRef, useState } from "react";
import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { LuGripVertical, LuX } from "react-icons/lu";

const GAP = 8;

// Layers enabled on the map, top of the list = drawn on top of the others.
// Reordered by dragging the handle (pointer events: works with mouse and touch)
// or with ArrowUp / ArrowDown while the handle is focused.
const ActiveLayersList = ({ layers, onReorder, onRemove }) => {
  const rowRefs = useRef({});
  const drag = useRef(null);
  const [view, setView] = useState(null); // { index, dy, to } while dragging

  const move = (from, to) => {
    if (to < 0 || to >= layers.length || from === to) return;
    const names = layers.map((l) => l.Name);
    const [moved] = names.splice(from, 1);
    names.splice(to, 0, moved);
    onReorder(names);
  };

  const handlePointerDown = (e, index) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rects = layers.map((l) =>
      rowRefs.current[l.Name].getBoundingClientRect()
    );
    drag.current = { index, startY: e.clientY, rects, to: index };
    setView({ index, dy: 0, to: index });
  };

  const handlePointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    const dragged = d.rects[d.index];
    const center = dragged.top + dragged.height / 2 + dy;
    // The other rows keep their order, so the target slot is the number of
    // them whose centre is above the dragged row's centre.
    d.to = d.rects.filter(
      (r, i) => i !== d.index && r.top + r.height / 2 < center
    ).length;
    setView({ index: d.index, dy, to: d.to });
  };

  const finishDrag = (commit) => {
    const d = drag.current;
    drag.current = null;
    setView(null);
    if (commit && d && d.to !== d.index) move(d.index, d.to);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      move(index, index - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      move(index, index + 1);
    }
  };

  const rowStyle = (index) => {
    if (!view) return {};
    if (index === view.index) {
      return { transform: `translateY(${view.dy}px)`, zIndex: 1 };
    }
    const shift = drag.current.rects[view.index].height + GAP;
    let offset = 0;
    if (view.index < index && index <= view.to) offset = -shift;
    if (view.to <= index && index < view.index) offset = shift;
    return {
      transform: `translateY(${offset}px)`,
      transition: "transform 0.15s ease",
    };
  };

  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor="gray.400"
      p={2}
      rounded="lg"
    >
      <Heading fontWeight="bold" fontSize="md" mb={1}>
        Active Layers
      </Heading>

      {layers.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          No layers enabled. Enable a layer below.
        </Text>
      ) : (
        <>
          <Text fontSize="xs" color="gray.500" mb={2}>
            Drag to reorder. The top of the list is drawn on top of the map.
          </Text>
          <Flex direction="column" gap={`${GAP}px`}>
            {layers.map((layer, index) => {
              const isDragging = view?.index === index;
              return (
                <Flex
                  key={layer.Name}
                  ref={(el) => {
                    if (el) rowRefs.current[layer.Name] = el;
                  }}
                  align="center"
                  gap={2}
                  px={2}
                  py={1.5}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  rounded="md"
                  position="relative"
                  boxShadow={isDragging ? "md" : "none"}
                  style={rowStyle(index)}
                >
                  <Box
                    as="button"
                    type="button"
                    aria-label={`Reorder ${layer.Title}. Use the up and down arrow keys.`}
                    title="Drag to reorder"
                    display="flex"
                    alignItems="center"
                    color="gray.500"
                    cursor={isDragging ? "grabbing" : "grab"}
                    // Stops the browser scrolling the page instead of dragging on touch
                    style={{ touchAction: "none" }}
                    onPointerDown={(e) => handlePointerDown(e, index)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => finishDrag(true)}
                    onPointerCancel={() => finishDrag(false)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  >
                    <LuGripVertical />
                  </Box>

                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {layer.Title}
                    </Text>
                    {layer.Date && (
                      <Text fontSize="xs" color="gray.500" truncate>
                        {layer.Date}
                      </Text>
                    )}
                  </Box>

                  <IconButton
                    size="2xs"
                    variant="ghost"
                    aria-label={`Disable ${layer.Title}`}
                    onClick={() => onRemove(layer.Name)}
                  >
                    <LuX />
                  </IconButton>
                </Flex>
              );
            })}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default ActiveLayersList;
