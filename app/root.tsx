import RemixRoot, {
  getRootLinks,
  getRootMeta,
  RootCatchBoundary,
} from "@dvargas92495/app/components/RemixRoot";
import type { LoaderFunction } from "@remix-run/node";
import remixRootLoader from "@dvargas92495/app/backend/remixRootLoader.server";
import styles from "./tailwind.css";

export const loader: LoaderFunction = (args) =>
  remixRootLoader({ ...args, data: { hideLiveReload: true }, env: {} });
export const meta = getRootMeta({ title: "App" });
export const links = getRootLinks([{ rel: "stylesheet", href: styles }]);
export const CatchBoundary = RootCatchBoundary;
export default RemixRoot;
