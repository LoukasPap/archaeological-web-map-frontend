import { getMonumentIcon } from "./MarkerIconHelpers";
import { fetchPointData, pointQueryKey } from "../Queries";

const eraToColor = {
  Neolithic: "#3f3f46",
  "Bronze Age": "#92310a",
  Geometric: "#facc15",
  Protoattic: "#fef08a",
  Archaic: "#14204a",
  Classical: "#173da6",
  "Late Classical": "#3b82f6",
  Hellenistic: "#a3cfff",
  Roman: "#ef4444",
  "Late Roman": "#f87171",
  Byzantine: "#f97316",
  Frankish: "#22c55e",
  Ottoman: "#ca8a04",
  Modern: "#ec4899",
  Unknown: "#111111",
};

export function createMarker(point) {
  const coordinates = getCoordinates(point.geometry);
  const icon = getMarkerIcon(point);

  const marker = L.marker(coordinates, {
    title: point.Name,
    opacity: 1,
    icon: icon,
  });

  return marker;
}

export function attachEvents(marker, onMarkerClick, feature, qc) {

  function setStroke(e, color, width) {
    e.sourceTarget._icon.children[0].children[0].children[0].style.stroke = color;
    e.sourceTarget._icon.children[0].children[0].children[0].style.strokeWidth = width;
  }

  marker.on({
    click: async (e) => {
      const res = await qc.fetchQuery({queryKey: pointQueryKey(feature.Name), queryFn: () => fetchPointData(feature.Name)});
      const point = res.point;
      onMarkerClick({point})

      setStroke(e, "red", 1);
    },
    popupclose: (e) => {
      if (e.target._icon) setStroke(e, "", 0);
    },
  });

  marker.bindPopup(feature.Title || feature.Name || "-");
}

export function isMonument(type) {
  return type == "monument" ? true : false;
}

export function getCoordinates(geometry) {
  return [geometry.coordinates[1], geometry.coordinates[0]];
}

export function getMarkerIcon(props) {
  let markerContent = null;
  let icon = null;

  if (isMonument(props.Type)) {
    const markerIcon = getRectangleShape();
    const markerBackground = getRectangleBackgroundHtml();

    markerContent = getMonumentIcon();

    icon = new L.IconEx({
      contentHtml: markerContent,
      contentHtmlSize: [20, 20],

      iconHtml: markerIcon,
      iconFill: "#000",

      backgroundHtml: markerBackground,
      backgroundHtmlSize: [32, 40],
      backgroundHtmlAnchor: [16, 20],
      id: props.Name
    });
  } else {
    markerContent = props.InventoryNumberLetter || "?";
    icon = new L.IconEx({
      contentHtml: markerContent,
      contentHtmlSize: [16, 16],
      iconFill: eraToColor[props.Era],
      id: props.Name
    });
  }

  return icon;
}

export function getRectangleShape() {
  return `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path stroke-width="1" d="m 2.5,0.5 c -1.107998,0 -2,0.892002 -2,2 v 27 c 0,1.107998 0.892002,2 2,2 h 4.7044922 a 4.1676656,4.1676656 24.095192 0 1 3.1064288,1.38926 L 16,39.25 21.68908,32.88926 A 4.1676657,4.1676657 155.90481 0 1 24.795508,31.5 H 29.5 c 1.107998,0 2,-0.892002 2,-2 v -27 c 0,-1.107998 -0.892002,-2 -2,-2 z" />
    </svg>
    `;
}

export function getRectangleBackgroundHtml() {
  return `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path stroke-width="0" d="M 5.5483871,4 C 4.6905822,4 4,4.6905822 4,5.5483871 V 26.451613 C 4,27.309418 4.6905822,28 5.5483871,28 h 3.6421875 a 3.2265798,3.2265798 0 0 1 2.4049774,1.075556 L 16,34 20.404449,29.075556 A 3.2265799,3.2265799 0 0 1 22.809426,28 h 3.642187 C 27.309418,28 28,27.309418 28,26.451613 V 5.5483871 C 28,4.6905822 27.309418,4 26.451613,4 Z" />
    </svg>
    `;
}

export function showMonuments(filter) {
  if (filter != "No") return true;
}
