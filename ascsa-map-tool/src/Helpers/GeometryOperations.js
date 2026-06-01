// for spatial operations
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { bboxPolygon } from "@turf/bbox-polygon";
import { point, polygon } from "@turf/helpers";

import { globalMIBRef } from "../Components/MapLayer";

export const checkIntersectingMarkers = (
  shapeType,
  layer,
  activeData,
  setMarkersInBounds
) => {
  let intersectingMarkers = [];
  if (shapeType === "Circle") {
    const center = layer.getLatLng();
    const radius = layer.getRadius();
    intersectingMarkers = activeData.filter((marker) => {
      const [lng, lat] = marker.geometry["coordinates"];
      const markerLatLng = L.latLng(lat, lng);
      return center.distanceTo(markerLatLng) <= radius;
    });
    setMarkersInBounds(intersectingMarkers);
  } else if (shapeType === "Rectangle") {
    const bounds = layer.getBounds();
    intersectingMarkers = activeData.filter((marker) => {
      const [lng, lat] = marker.geometry["coordinates"];
      const markerLatLng = L.latLng(lat, lng);
      return bounds.contains(markerLatLng);
    });
    setMarkersInBounds(intersectingMarkers);
  } else if (shapeType === "Polygon") {
    const bounds = layer.getLatLngs()[0].map((m) => [m.lng, m.lat]);
    const closedBounds = [...bounds, bounds[0]];
    const polygonBounds = polygon([closedBounds]);
    intersectingMarkers = activeData.filter((marker) => {
      const p = point([
        marker.geometry["coordinates"][0],
        marker.geometry["coordinates"][1],
      ]);
      return booleanPointInPolygon(p, polygonBounds);
    });
    setMarkersInBounds(intersectingMarkers);
  }
  globalMIBRef.current = intersectingMarkers;

};

export const onShapeCreated = (
  e,
  activeData,
  setMarkersInBounds,
) => {
  switch (e.shape) {
    case "Circle":
      onCircleCreated(e, activeData, setMarkersInBounds);
      break;
    case "Rectangle":
      onRectangleCreated(e, activeData, setMarkersInBounds);
      break;
    case "Polygon":
      onPolygonCreated(e, activeData, setMarkersInBounds);
      break;
    default:
  }
};

export const onCircleCreated = (
  e,
  activeData,
  setMarkersInBounds,
) => {
  if (e.shape === "Circle") {
    const circleLayer = e.layer;

    circleLayer.on("pm:edit", () => {
      checkIntersectingMarkers(
        "Circle",
        circleLayer,
        activeData,
        setMarkersInBounds
      );
    });
    
    checkIntersectingMarkers(
      "Circle",
      circleLayer,
      activeData,
      setMarkersInBounds
    );
  }
};

export const onRectangleCreated = (
  e,
  activeData,
  setMarkersInBounds,
  clickShape
) => {
  if (e.shape === "Rectangle") {
    const rectangleLayer = e.layer;

    rectangleLayer.on("pm:edit", () => {
      checkIntersectingMarkers(
        "Rectangle",
        rectangleLayer,
        activeData,
        setMarkersInBounds
      );
    });

    checkIntersectingMarkers(
      "Rectangle",
      rectangleLayer,
      activeData,
      setMarkersInBounds
    );
  }
};

export const onPolygonCreated = (
  e,
  activeData,
  setMarkersInBounds,
  clickShape
) => {
  if (e.shape === "Polygon") {
    const polygonLayer = e.layer;

    polygonLayer.on("pm:edit", () => {
      checkIntersectingMarkers(
        "Polygon",
        polygonLayer,
        activeData,
        setMarkersInBounds
      );
    });

    checkIntersectingMarkers(
      "Polygon",
      polygonLayer,
      activeData,
      setMarkersInBounds
    );
  }
};
