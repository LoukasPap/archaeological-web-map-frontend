import { useEffect, useState } from "react";

// Phones (narrow viewport) and landscape phones (short, touch viewport).
const MOBILE_QUERY =
  "(max-width: 767px), (max-height: 500px) and (pointer: coarse)";

const getMatch = () =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia(MOBILE_QUERY).matches
    : false;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export default useIsMobile;
