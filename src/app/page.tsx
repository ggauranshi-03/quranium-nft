import "react-toastify/dist/ReactToastify.css";

import NFTWrapper from "./component/NFTWrapper/NFTWrapper";
export default async function Home() {
  return (
    <main className="flex flex-col gap-10 max-w-[100vw] overflow-x-hidden">
      <NFTWrapper />
    </main>
  );
}
