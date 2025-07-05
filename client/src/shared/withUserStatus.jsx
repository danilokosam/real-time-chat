export const withUserStatus = (Component) => {
  return (props) => {
    const isConnected = props.connected ? "text-green-500" : "text-gray-500";

    return <Component {...props} isConnected={isConnected} />;
  };
};
