import { useState } from "react";
import { SendIcon } from "../assets/Icons";

export const SendMessageInput = () => {
    const [message, setMessage]= useState('')

  return (
    <>
      <form  action="" className="flex  gap-2">
        <input
          className="bg-white text-xs rounded-xl w-full p-2 border-2  border-gray-chat-response focus:border-violet-primary focus:outline-none"
          type="text"
          placeholder="write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" ><SendIcon classList={' bg-violet-primary text-gray-800 rounded-sm size-8 p-1'}/></button>
      </form>
    </>
  );
};
