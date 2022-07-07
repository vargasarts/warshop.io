import PublicLayout, {
  loader,
} from "@dvargas92495/app/components/PublicLayout";

export { loader };

export default () => <PublicLayout pages={["player", "market"]} />;
