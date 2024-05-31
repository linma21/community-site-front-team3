import React from "react";
import Avatar from "@mui/material/Avatar";
import { deepOrange, deepPurple } from "@mui/material/colors";

const ChatMessage = ({ position, text, name }) => {
  return (
    <div className={`chat-message ${position}`}>
      <div className="chat-user">
        <span className="chat-username">{name}</span>
        <Avatar
          sx={{ bgcolor: deepOrange[400] }}
          alt={name}
          src="../../images/icon/BigOrage.jpg"
        />
      </div>
      <div className="chat-text">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
