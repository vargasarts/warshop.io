import React from "react";
import DefaultLayout from "@dvargas92495/ui/dist/components/Layout";
import { Head as DefaultHead } from "@dvargas92495/ui/dist/components/Document";

const Layout: React.FC = ({ children }) => {
  return (
    <DefaultLayout
      homeIcon={"Home"}//<img src="/logo.png" width={48} height={48} />}
      pages={["gameplay", "blog"]}
    //  themeProps={{ primary: "#9c27b0", secondary: "#81c784" }}
    >
      {children}
    </DefaultLayout>
  );
};

type HeadProps = Omit<Parameters<typeof DefaultHead>[0], "title">;

export const LayoutHead = ({
  title = "Welcome",
  ...rest
}: HeadProps & { title?: string }): React.ReactElement => {
  return <DefaultHead title={`${title} | Warshop`} {...rest} />;
};

export default Layout;
