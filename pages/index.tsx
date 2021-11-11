import React from "react";
import Layout, { LayoutHead } from "./_common/Layout";
import Landing, {
  Showcase,
  Splash,
} from "@dvargas92495/ui/dist/components/Landing";

const Home: React.FC = () => (
  <Layout>
    <Landing>
      <Splash
        title={"Grow and Battle With Your Robot Army!"}
        subtitle={
          "Develop unique robots and battle against other players for reward in this play to earn ecosystem."
        }
        primaryHref={"login"}
        secondaryHref={"gameplay"}
        Logo={() => <svg />}
      />
      <Showcase
        header={"Develop, Battle, & Trade Robots as NFTs!"}
        showCards={[]}
      />
    </Landing>
  </Layout>
);

export const Head = (): React.ReactElement => <LayoutHead title={"Home"} />;

export default Home;
