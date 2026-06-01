import { useState, useRef, useEffect, createRef } from "react";

import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  ScaleControl,
  ZoomControl,
} from "react-leaflet";

import Bar from "./ActionBar/ActionBar";
import FilterCard from "./FilterBar/FilterCard";
import CollectionsCard from "./Collections/CollectionsCard";
import EasyButtons from "./FilterBar/EasyButtons";

import SingleMarkerCard from "./MarkerCards/SingleMarkerCard";
import MultipleMarkersCard from "./MarkerCards/MultipleMarkersCard";

import { Box, VStack } from "@chakra-ui/react";
import MarkerClusterLayer from "./MarkerClusterLayer";

import {
  applySectionFilter,
  applyMonumentFilter,
  applyPeriodFilter,
  applyInventoryFilter,
  hasTextSearchFilterChanged,
  isTextSearchFilterEmpty,
  calculateBounds,
  getCurrentDateTime,
  generateRandomIdUrlSafe,
  setOpacityOfDOMMarkers,
} from "../Helpers/Helpers";

import {
  getShapeProperties,
  restoreShape,
  removeShapeLayer,
} from "../Helpers/ShapeHelpers";

import { onShapeCreated } from "../Helpers/GeometryOperations";
import {
  deactivateHandlers,
  handleDrawShape,
  handleEvent,
} from "../Helpers/ShapeHandlers";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import usePrevious from "../CustomHooks/usePrevious";
import SectionsLayer from "./LayerSelector/SectionsLayer";
import SectionsLayerCard from "./LayerSelector/SectionsLayerCard";

import {
  deleteCollectionDB,
  fetchFromTextSearch,
  fetchPoints,
  getCollectionsDB,
  updateCollectionDB,
} from "../Queries";

export const globalMIBRef = createRef([]); // MIB: MarkersInBound

const emptyFiltersState = {
  textSearch: {
    includeInput: "",
    excludeInput: "",
    limit: "",
  },
  periods: [],
  inventory: [],
  section: {
    SectionNumber: "",
    SectionNumberLetter: "",
    SectionNumberNumber: "",
  },
  monument: {
    ShowMonuments: "No",
    Condition: [],
  },
};

const initialBounds = [
  [37.972834, 23.721197], // Southwest corner
  [37.976726, 23.724362], // Northeast corner
];

const CLOSE = false;
const OPEN = true;

const FILTER_CARD = "filters";
const COLLECTIONS_CARD = "collections";
const LAYERS_CARD = "layers";
const NONE = "";

const iconExHTMLClass = ".leaflet-iconex";

const MapLayer = () => {
  console.log("[LOG] - Render Map Layer");

  const currentShape = useRef(null);

  const [filters, setFilters] = useState(emptyFiltersState);
  const prevFilter = usePrevious(filters);

  const [bounds, setBounds] = useState(null);

  const mapRef = useRef();
  const [activeData, setActiveData] = useState([]);

  const [markersInBounds, setMarkersInBounds] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState({});

  const [activeTool, setActiveTool] = useState("select");

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const [zoom, setZoom] = useState(13);

  const [markersCard, toggleMarkersCard] = useState("");
  const [userCardOpen, setUserCardOpen] = useState(NONE);

  const [savedCollections, setSavedCollections] = useState([]);
  const allCollectionsRef = useRef([]);
  const isSavedInCollection = useRef(false);

  const savedIDS = useRef([]);
  const tempIDS = useRef([]);

  const [visibleCollections, setVisibleCollections] = useState([]);

  const [sectionImages, setSectionImages] = useState([]);
  const [titlesVisibility, setTitlesVisibility] = useState(true);

  const cidRef = useRef(0);
  const qc = useQueryClient();

  const token = localStorage.getItem("token");
  const cachedUser = qc.getQueryData(["verifyToken", token]); // may be undefined
  const currentUser = cachedUser;

  const textSearchMutation = useMutation({
    mutationFn: () => fetchFromTextSearch(filters.textSearch),
    onSuccess: (data, variables, context) => {
      console.log("[LOG] Success!");
      qc.setQueryData(["data"], data);
      console.log("[LOG] Changed Query data", qc.getQueryData(["data"]));
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.log(`[LOG] Error! --> ${error}`);
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (id, values) => updateCollectionDB(id, values),
    onMutate: () => console.log("LOG] Updating initialization"),
    onSuccess: () => console.log("[LOG] Success updating collection."),
    onError: (error) =>
      console.log(`[LOG] Error updating collection! --> ${error}`),
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id) => deleteCollectionDB(id),
    onMutate: () => console.log("LOG] Deleting initialization"),
    onSuccess: () => console.log("[LOG] Success deleting collection."),
    onError: (error) =>
      console.log(`[LOG] Error deleting collection! --> ${error}`),
  });

  let { data } = useQuery({
    queryKey: ["data"],
    queryFn: fetchPoints,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  let {
    isLoading: collectionLoading,
    data: collectionData,
    isSuccess,
  } = useQuery({
    queryKey: ["collectionData"],
    queryFn: () => getCollectionsDB(currentUser.user?.username),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });

  useEffect(() => {
    if (isSuccess && collectionData) {
      let dbcollections = collectionData.data.map((collection) => {
        const restoredShape = restoreShape(collection.shape);

        return {
          ...collection,
          // type: collection.shape,
          shape: restoredShape,
        };
      });

      dbcollections.forEach((collection) => {
        collection.shape.on("click", () => onShapeClick(collection));
        return collection.shape.on(
          "pm:edit",
          async () => await onShapeEdit(collection)
        );
      });

      allCollectionsRef.current = dbcollections;
      setSavedCollections(dbcollections);

      savedIDS.current.push(...dbcollections.map((x) => x.id));
    }
  }, [isSuccess, collectionData]);

  if (collectionLoading) console.log("LOADING COLLECTIONS");

  const ZoomTracker = () => {
    useMapEvents({
      zoomend: (e) => {
        setMarkersOpacity();
      },
    });
    return null;
  };

  function setMarkersOpacity() {
    console.log("enters");
    if (globalMIBRef.current != null && globalMIBRef.current.length != 0) {
      console.log("works");
      
      const selectedMarkersNames = markersInBounds.map((m) => m.Name);
      const domIconElements = document.querySelectorAll(iconExHTMLClass);

      domIconElements.forEach((icon) => {
        const markerName = icon.id;
        if (!selectedMarkersNames.includes(markerName)) {
          icon.style.opacity = "0.2";
        } else {
          icon.style.opacity = "1";
        }
      });
    }
  }
  useEffect(() => {
    setMarkersOpacity();
  }, [markersInBounds]);

  async function runTextSearchMutation() {
    if ((typeof prevFilter !== "undefined") && hasTextSearchFilterChanged(filters.textSearch, prevFilter.textSearch)) {
      if (isTextSearchFilterEmpty(filters.textSearch)) {
        await qc.refetchQueries({ queryKey: ["data"] });
      } else {
        await textSearchMutation.mutateAsync();
      }
      return qc.getQueryData(["data"]);
    }

    return null;
  }

  useEffect(() => {
    console.log("[LOG] Filters applied:", filters);

    (async () => {
      let updated = await runTextSearchMutation();

      if (updated) {
        applyClientSideFilters(updated);
      } else {
        let current = qc.getQueryData(["data"]) || data;
        applyClientSideFilters(current);
      }

      console.log("[LOG] Finished updated markers in map.");
    })();
  }, [filters]);

  // on create shape
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.on("pm:create", (e) => {
      currentShape.current = e;
      e.layer._path.style.strokeDasharray = "10px";
      onShapeCreated(e, activeData, onEditEvents);

      createCollection({
        name: `Temporary #${cidRef.current}`,
        description: "-",
        type: e.shape,
      });

      toggleMarkersCard("multi");
      setTool("Edit");
    });

    return () => {
      map.off("pm:create");
    };
  }, [mapReady, activeData]);

  function applyClientSideFilters(newActiveData) {
    if (typeof newActiveData === "undefined") return;
    // drop data without coordinates
    let monumentData = newActiveData.features.filter(
      (m) => m.Type == "monument" && m.geometry != null
    );
    newActiveData = newActiveData.features.filter(
      (m) => m.geometry != null && m.Type != "monument"
    );

    const monumentsVisibility = filters.monument.ShowMonuments;

    if (monumentsVisibility != "Only") {
      newActiveData = applyPeriodFilter(newActiveData, filters);
    }

    newActiveData = applyInventoryFilter(newActiveData, filters);
    // We push the monuments_data second to be more efficient (they are just ~50 allocations)
    newActiveData = applyMonumentFilter(newActiveData, monumentData, monumentsVisibility, filters);
    newActiveData = applySectionFilter(newActiveData, filters);

    setActiveData(newActiveData);
  }

  function onShapeClick(c) {
    isSavedInCollection.current = isCollectionSaved(c.id);

    setSelectedCollection(
      allCollectionsRef.current.find((col) => col.id === c.id)
    );
    toggleMarkersCard("multi");
  }

  async function onShapeEdit(collection) {
    const currentCollectionState = allCollectionsRef.current.find(
      (c) => c.id == collection.id
    );

    if (currentCollectionState.isSaved) {
      await updateCollection({
        ...currentCollectionState,
        shape: collection.shape,
        type: collection.type || collection.shape.shape,
      });
    }

    setSelectedCollection((prev) => ({
      ...prev,
      markers: globalMIBRef.current,
    }));

    allCollectionsRef.current = allCollectionsRef.current.map((col) =>
      col.id === collection.id
        ? {
            ...col,
            markers: globalMIBRef.current,
            date: getCurrentDateTime(),
          }
        : col
    );

    setSavedCollections((prev) => {
      const next = prev.map((col) =>
        col.id === collection.id
          ? {
              ...col,
              markers: globalMIBRef.current,
              date: getCurrentDateTime(),
            }
          : col
      );
      return next;
    });

  }


  function onEditEvents(e) {
    setMarkersInBounds(e);
  }

  function displayMarkerCard(e) {
    setSelectedMarker({ feature: e.point });
    toggleMarkersCard("single");
  }

  function createCollection(c) {
    console.log("[DEBUG] - [CREATE COLLECTION] - ENTER", c);

    const rid = generateRandomIdUrlSafe();
    const newCollection = {
      id: rid,
      name: c.name,
      description: c.description,
      markers: globalMIBRef.current,
      shape: currentShape.current,
      date: getCurrentDateTime(),
      isSaved: false,
      type: currentShape.current.shape,
    };
    console.log("[DEBUG] - [CREATE COLLECTION] - newCollection", newCollection);

    allCollectionsRef.current = [...allCollectionsRef.current, newCollection];
    setSavedCollections((prev) => [...prev, newCollection]);

    if (newCollection.shape) {
      newCollection.shape.layer.on("click", () => onShapeClick(newCollection));
      newCollection.shape.layer.on(
        "pm:edit",
        async () => await onShapeEdit(newCollection)
      );
    }

    setSelectedCollection(newCollection);
    setVisibleCollections((prev) =>
      prev.includes(newCollection.id) ? prev : [...prev, newCollection.id]
    );

    pushAndIncreaseTempsId(rid);

    console.log("[DEBUG] - [CREATE COLLECTION] - EXIT");
  }

  function saveCollection(c) {
    console.log("[DEBUG] - [SAVE COLLECTION] - ENTER", c);

    const savedCollection = {
      id: c.id,
      name: c.name,
      description: c.description,
      markers: markersInBounds,
      date: getCurrentDateTime(),
      shape: c.shape,
      isSaved: true,
    };

    allCollectionsRef.current = allCollectionsRef.current.map((col) =>
      col.id == c.id ? savedCollection : col
    );

    setSavedCollections(allCollectionsRef.current);
    c.shape.layer._path.style.strokeDasharray = "";

    savedIDS.current.push(c.id);
    removeTempId(c.id);
    setSelectedCollection(savedCollection);

    console.log("[DEBUG] - [SAVE COLLECTION] - EXIT");
  }

  function viewCollection(c) {
    console.log("[DEBUG] - [VIEW COLLECTION] - ENTER");
    console.log("[DEBUG] - param 'c' is", c);

    if (c.shape.layer) {
      c.shape.layer.addTo(mapRef.current);
    } else {
      c.shape.addTo(mapRef.current);
    }
    console.log("[DEBUG] - [VIEW COLLECTION] - MAP REF", mapRef.current);

    globalMIBRef.current = c.markers;
    isSavedInCollection.current = isCollectionSaved(c.id);

    setVisibleCollections((prev) =>
      prev.includes(c.id) ? prev : [...prev, c.id]
    );
    setMarkersInBounds([...c.markers]);

    console.log("[DEBUG] - [VIEW COLLECTION] - EXIT");
  }

  function hideCollection(c) {
    console.log("[DEBUG] - [HIDE COLLECTION] - ENTER", c);

    removeShapeLayer(c);

    currentShape.current = null;
    globalMIBRef.current = [];

    console.log("visibelCollections", visibleCollections);

    setVisibleCollections((prev) => prev.filter((id) => id !== c.id));

    toggleMarkersCard("");
    setMarkersInBounds([]);
    setOpacityOfDOMMarkers(1);
    console.log("[DEBUG] - [HIDE COLLECTION] - EXIT");
  }

  async function updateCollection(c) {
    const shapeProps = getShapeProperties(c.type, c.shape);

    const collectionUpdateFields = {
      markers: globalMIBRef.current,
      shape: shapeProps,
      type: c.type,
      date: getCurrentDateTime(),
    };

    await updateCollectionMutation.mutateAsync({
      id: c.id,
      values: collectionUpdateFields,
    });
  }

  async function deleteCollection(c) {
    allCollectionsRef.current = allCollectionsRef.current.filter(
      (col) => col.id != c.id
    );

    await deleteCollectionMutation.mutateAsync(c.id);
    setSavedCollections((prev) => prev.filter((col) => col.id !== c.id));

    currentShape.current = null;
    removeShapeLayer(c);
    globalMIBRef.current = [];
    isSavedInCollection.current = false;

    // delete ID
    const index = savedIDS.current.indexOf(c.id);
    if (index > -1) savedIDS.current.splice(index, 1);
    removeTempId(c.id);

    setVisibleCollections((prev) => prev.filter((id) => id !== c.id));

    toggleMarkersCard("");
    setMarkersInBounds([]);
    setOpacityOfDOMMarkers(1);
  }

  function setTool(tool) {
    setActiveTool(tool);

    switch (tool) {
      case "Select":
        deactivateHandlers(mapRef.current);
        break;
      case "Edit":
      case "Remove":
        handleEvent(mapRef.current, tool);
        break;
      case "Circle":
      case "Rectangle":
      case "Polygon":
        handleDrawShape(mapRef.current, tool);
        break;
      default:
        console.log("setTool() - Default case", tool);
    }
  }

  function isCollectionSaved(id) {
    return savedIDS.current.find((cid) => cid == id) != undefined;
  }

  function pushAndIncreaseTempsId(id) {
    tempIDS.current.push(id);
    cidRef.current = cidRef.current + 1; // increase id
  }

  function removeTempId(id) {
    const tempId = tempIDS.current.indexOf(id);
    tempIDS.current = tempIDS.current.filter((cid) => cid != tempId);
  }

  return (
    <>
      <MapContainer
        center={[37.974724, 23.722502]}
        zoom={17}
        minZoom={0}
        maxZoom={24}
        zoomControl={false}
        scrollWheelZoom={true}
        whenReady={({ target }) => {
          setMapReady(true);
          mapRef.current = target;
          mapRef.current.fitBounds(initialBounds);
          setBounds(mapRef.current.getBounds());
        }}
      >
        <TileLayer
          maxZoom="24"
          zoom="17"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterLayer
          data={activeData}
          onMarkerClick={displayMarkerCard}
        />

        <ZoomTracker />
        <ScaleControl position="bottomleft" />
        <ZoomControl position="bottomright" />

        <SectionsLayer
          sectionImages={sectionImages}
          areTitlesEnabled={titlesVisibility}
        />
      </MapContainer>

      <SingleMarkerCard
        marker={
          selectedMarker != null ? selectedMarker.feature : selectedMarker
        }
        toggleCard={toggleMarkersCard}
        isVisible={markersCard == "single"}
      />

      <MultipleMarkersCard
        collection={selectedCollection}
        markers={markersInBounds}
        saveCollection={saveCollection}
        isSavedInCollection={isSavedInCollection.current}
        isVisible={markersCard == "multi"}
        onMarkerClick={displayMarkerCard}
      />

      {mapReady && (
        <Bar
          setTool={setTool}
          activeTool={activeTool}
          mapRef={mapRef.current}
        />
      )}

      <Box w="fit" m="12px" pos="relative" h="100%" pointerEvents="none">
        <VStack w="22.5vw">
          <EasyButtons openUserCard={setUserCardOpen}></EasyButtons>

          {/* The User Cards*/}

          <CollectionsCard
            areCollectionsOpen={userCardOpen == COLLECTIONS_CARD}
            savedCollections={savedCollections}
            viewCollection={viewCollection}
            hideCollection={hideCollection}
            deleteCollection={deleteCollection}
            visibleCollections={visibleCollections}
          />

          <FilterCard
            areFiltersOpen={userCardOpen == FILTER_CARD}
            setFilters={setFilters}
            filterLoading={qc.isMutating() + qc.isFetching() > 0}
          />

          <SectionsLayerCard
            areLayersOpen={userCardOpen == LAYERS_CARD}
            setImages={setSectionImages}
            toggleTitles={setTitlesVisibility}
          />
        </VStack>
      </Box>
    </>
  );
};

export default MapLayer;
