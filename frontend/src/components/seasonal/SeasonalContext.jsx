import { createContext } from "react";
// Share the already-resolved, server-timed season with the header. No second
// request or separate date calculation that could disagree with the storefront.
export const SeasonalContext = createContext(null);
