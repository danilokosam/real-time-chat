export const UserCard = ({ connected, selected, isConnected }) => {
  // const isConnected = connected ? "text-green-500" : "text-gray-500";
  const isSelected = selected ? "hidden" : ""
  return (
    <div className="flex justify-between max-w-96">
      <div className="flex gap-4 ">
        <img
          className="rounded-full max-w-12"
          src="https://placehold.co/48x48@2x.png"
          alt="image profile"
        />
        <div className="flex flex-col justify-around">
          <h2>Leidy Alvarez</h2>
          <small className={`${isConnected} text-[10px]`}>
            {connected ? "On Line" : "Disconnected"}
          </small>
        </div>
      </div>

      {/* connection status */}
      <div className={`${isSelected} flex flex-col justify-around items-center` }>
        
        <span className={`rounded-full bg-red-notification size-4 py-0.5 text-[10px] text-center`} >
          2
        </span>
        <small className="text-gray-500 text-[10px]">2:30 pm</small>
      </div>
    </div>
  );
};
