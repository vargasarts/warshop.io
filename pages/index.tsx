import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";

const Home: React.FunctionComponent = () => <div>Welcome!</div>;

fs.writeFileSync("index.html", ReactDOMServer.renderToString(<Home/>));
