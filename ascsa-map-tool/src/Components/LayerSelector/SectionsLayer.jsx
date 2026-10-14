import { Fragment } from "react";
import { ImageOverlay } from "react-leaflet/ImageOverlay";
import { Marker } from "react-leaflet/Marker";

const SectionsLayer = ({ sectionImages = [], areTitlesEnabled }) => {
  
  // Label properties
  const offsetLat = 0.0000115;
  const offsetLon = 0.000005;
  function positionLabel(bound) {
    const lat = bound[0];
    const lon = bound[1];
    return [lat + offsetLat, lon + offsetLon];
  }

  return (
    <>
      {sectionImages
        .filter((a) => a.Checked)
        .map((section) => (
          <Fragment key={section.Name}>
            {/* ZIndex is set by the layer card's "Active Layers" order */}
            <ImageOverlay
              url={`./AgoraImages/${section.Path}${section.Title}.jpg`}
              bounds={section.WGS84Bounds}
              opacity={1}
              zIndex={section.ZIndex}
            />

            {areTitlesEnabled && (
              <Marker
                position={positionLabel(section.WGS84Bounds[0])}
                text={section.Title}
                textColor="blue"
                textMarker={true}
              />
            )}
          </Fragment>
        ))}
    </>
  );
};

export default SectionsLayer;


