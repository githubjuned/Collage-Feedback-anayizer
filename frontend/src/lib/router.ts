import { useEffect, useState } from "react";

export function useHashRoute(): [string, (to: string) => void] {
  const read = () => (window.location.hash.replace(/^#/, "") || "/");
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const nav = (to: string) => {
    window.location.hash = to;
  };
  return [route, nav];
}
