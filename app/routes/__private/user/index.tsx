export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import { UserProfile } from "@clerk/clerk-react";

const UserIndex = () => {
  return (
    <div className="border-dashed border-r-4 border-gray-400 border-4 text-center py-8">
      <UserProfile />
    </div>
  );
};

export default UserIndex;
