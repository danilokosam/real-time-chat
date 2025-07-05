export const GroupCard = ({ conecction }) => {
  const isConnected = conecction ? "text-green-500" : "text-gray-500";
  return (
    <div className="flex justify-between max-w-96 ">
      <div className="flex gap-4 ">
        <img
          className="rounded-full max-w-12"
          src="https://placehold.co/48x48@2x.png"
          alt="image profile"
        />
        <div className="flex flex-col justify-around">
          <h2>Anime group</h2>
          {/* <small className={isConnected}>
            {conecction === true ? "On Line" : "Disconnected"}
          </small> */}
        </div>
      </div>

      {/* connection status */}
      <div className="flex flex-col justify-around items-center">
        <span className="rounded-full bg-red-notification size-4 py-0.5 text-[10px] text-center">
          2
        </span>
        <small className="text-gray-500 text-[10px]">2:30 pm</small>
      </div>
    </div>
  );
};
