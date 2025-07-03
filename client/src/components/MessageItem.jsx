import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";

export const MessageItem = ({ message, userName, isPrivate, selectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  // Debug: Log message data to see what we're receiving
  useEffect(() => {
    console.log("MessageItem received message:", message);
    console.log("Current userName:", userName);
    console.log("Current userID:", currentUserID);
  }, [message, userName, currentUserID]);

  useEffect(() => {
    if (
      isPrivate &&
      inView &&
      !message.fromSelf &&
      (!message.readBy || !message.readBy.includes(currentUserID))
    ) {
      socket.emit("markMessageRead", {
        messageID: message.id,
        userID: currentUserID,
      });
    }
  }, [inView, isPrivate, message, currentUserID, socket]);

  const formatTimestamp = (timestamp) => {
    try {
      if (timestamp && timestamp.includes("T")) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }
      return timestamp || new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", timestamp, error);
      return timestamp || "";
    }
  };

  const getSenderName = () => {
    // Para mensajes privados
    if (isPrivate) {
      return message.fromSelf ? "Tú" : (message.fromUsername || selectedUser?.username);
    }
    
    // Para mensajes públicos - verificar si es mensaje propio
    const isOwnMessage = message.from === currentUserID || 
                         message.fromUsername === userName ||
                         message.name === userName ||
                         message.fromSelf;
    
    if (isOwnMessage) {
      return "Tú";
    }
    
    // Para mensajes de otros usuarios, usar fromUsername del backend
    // El backend envía fromUsername que debería contener el nombre real del usuario
    return message.fromUsername || message.name || "Usuario Desconocido";
  };

  const isOwnMessage = () => {
    if (isPrivate) {
      return message.fromSelf;
    }
    
    // Verificar si es el mensaje del usuario actual
    return message.from === currentUserID || 
           message.fromUsername === userName ||
           message.name === userName ||
           message.fromSelf;
  };

  const messageContent = message.content || message.text || "";

  return (
    <div className="mb-8 px-6" ref={ref}>
      {/* Sender name */}
      <div className={`mb-3 ${isOwnMessage() ? 'text-right' : 'text-left'}`}>
        <span className={`text-sm font-medium ${
          isOwnMessage() ? 'text-indigo-600' : 'text-slate-600'
        }`}>
          {getSenderName()}
        </span>
      </div>

      {/* Message bubble */}
      <div className={`flex ${isOwnMessage() ? 'justify-end' : 'justify-start'} px-2`}>
        <div className={`inline-block max-w-xs lg:max-w-md px-5 py-4 rounded-xl shadow-sm ${
          isOwnMessage()
            ? 'bg-indigo-500 text-white'
            : 'bg-white border border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-start gap-3">
            <p className="text-sm leading-relaxed break-words flex-1">
              {messageContent}
            </p>
            
            {/* Read indicators for sent private messages */}
            {isPrivate && isOwnMessage() && (
              <span
                className={`text-xs flex-shrink-0 mt-1 ${
                  message.readBy && message.readBy.includes(selectedUser?.userID)
                    ? 'text-blue-200'
                    : 'text-white opacity-70'
                }`}
                title={
                  message.readBy && message.readBy.includes(selectedUser?.userID)
                    ? "Leído"
                    : "Enviado"
                }
              >
                {message.readBy && message.readBy.includes(selectedUser?.userID)
                  ? "✔✔"
                  : "✔"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className={`mt-2 px-2 ${isOwnMessage() ? 'text-right' : 'text-left'}`}>
        <span className="text-xs text-slate-400">
          {formatTimestamp(message.timestamp || message.time)}
        </span>
      </div>
    </div>
  );
};