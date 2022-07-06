import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import listMarket from "~/data/listMarket.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import Button from "@dvargas92495/app/components/Button";
import Title from "@dvargas92495/app/components/Title";
import buyFromMarket from "~/data/buyFromMarket.server";
import SuccessfulActionToast from "@dvargas92495/app/components/SuccessfulActionToast";

type LoaderData = Awaited<ReturnType<typeof listMarket>>;

const MarketPage = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="grid grid-cols-4 gap-8">
      {data.map((e) => (
        <div
          className="shadow-lg rounded-xl bg-gray-100 max-h-56 p-8"
          key={e.uuid}
        >
          <Title>{e.name}</Title>
          <Form method={"post"}>
            <input type={"hidden"} value={e.uuid} name={"model"} />
            <Button>Buy</Button>
          </Form>
        </div>
      ))}
      <SuccessfulActionToast />
    </div>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, listMarket);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, { POST: buyFromMarket });
};

export default MarketPage;
