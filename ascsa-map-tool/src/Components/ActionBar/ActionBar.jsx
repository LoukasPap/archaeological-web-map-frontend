import { ActionBar, IconButton, Box } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import useIsMobile from "../../CustomHooks/useIsMobile";

import {
  BiPointer,
  BiEdit,
  BiShapeCircle,
  BiShapeSquare,
  BiShapePolygon,
} from "react-icons/bi";

import { handleDrawShape, deactivateHandlers } from "../../Helpers/ShapeHandlers";

import ActionButton from "./Button";

const Bar = ({ activeTool, setTool, mapRef }) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsed = isMobile && collapsed;

  // The natural width of the tools is measured so the collapse can animate a real width
  const toolsRef = useRef(null);
  const [toolsWidth, setToolsWidth] = useState(null);
  useLayoutEffect(() => {
    if (toolsRef.current) setToolsWidth(toolsRef.current.scrollWidth);
  }, [isMobile]);

  const customStyle = isMobile
    ? { width: "1.9em", height: "1.9em" }
    : { width: "2.5em", height: "2.5em" };

  const MainActionBar = () => {
    return (
      <>
        <ActionButton
          icon={<BiPointer style={customStyle} />}
          event={() => {
            if (activeTool != "Select") {
              setTool("Select");
              deactivateHandlers(mapRef);
            }
          }}
          isActive={activeTool === "Select"}
          id="select-action"
        />

        <ActionButton
          icon={<BiShapeCircle style={customStyle} />}
          event={() => {
            setTool("Circle");
            handleDrawShape(mapRef, "Circle");
          }}
          isActive={activeTool === "Circle"}
          id="circle-action"
        />

        <ActionButton
          icon={<BiShapeSquare style={customStyle} />}
          event={() => {
            setTool("Rectangle");
            handleDrawShape(mapRef, "Rectangle");
          }}
          isActive={activeTool === "Rectangle"}
          id="rect-action"
        />

        <ActionButton
          icon={<BiShapePolygon style={customStyle} />}
          event={() => {
            setTool("Polygons");
            handleDrawShape(mapRef, "Polygons");
          }}
          isActive={activeTool === "Polygons"}
          id="poly-action"
        />

        <ActionButton
          icon={<BiEdit style={customStyle} />}
          event={() => {
            setTool("Edit");
            handleDrawShape(mapRef, "Edit");
          }}
          isActive={activeTool === "Edit"}
          id="edit-action"
        />
      </>
    );
  };

  return (
    <>
      <ActionBar.Root open={true}>
          <ActionBar.Positioner zIndex="15" justifyContent={isMobile ? "flex-end" : "center"} px="3">
            <ActionBar.Content
              border="1px solid #C6C6C6"
              rounded="lg"
              boxShadow="0px 2px 4px 0px rgba(0, 0, 0, 0.25)"
              overflow="hidden"
              alignItems="flex-end"
            >
              {/* the tools slide in/out by animating their width */}
              <Box
                alignSelf="stretch"
                overflow="hidden"
                style={{
                  width:
                    toolsWidth == null ? "auto" : isCollapsed ? 0 : toolsWidth,
                  opacity: isCollapsed ? 0 : 1,
                  transition:
                    "width 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s ease",
                }}
                aria-hidden={isCollapsed}
                inert={isCollapsed}
              >
                <Box
                  ref={toolsRef}
                  display="flex"
                  alignItems="flex-end"
                  w="max-content"
                >
                  <MainActionBar />
                </Box>
              </Box>

              {isMobile && (
                <IconButton
                  aria-label={isCollapsed ? "Show tools" : "Hide tools"}
                  title={isCollapsed ? "Show tools" : "Hide tools"}
                  variant="ghost"
                  rounded="sm"
                  alignSelf="stretch"
                  h="auto"
                  minW="8"
                  px="1"
                  onClick={() => setCollapsed((c) => !c)}
                >
                  <LuChevronRight
                    style={{
                      transform: isCollapsed ? "rotate(180deg)" : "none",
                      transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </IconButton>
              )}
            </ActionBar.Content>
          </ActionBar.Positioner>
      </ActionBar.Root>
    </>
  );
};

export default Bar;
