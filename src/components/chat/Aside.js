import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { globalPath } from "globalPaths";
import { useSelector } from "react-redux";
import InviteFriends from "./InviteFriends"; // Import the InviteFriends component

const url = globalPath.path;

const Aside = ({ setSelectedRoom }) => {
  const authSlice = useSelector((state) => state.authSlice);
  const uid = authSlice.uid;
  const [newChatRoomTitle, setNewChatRoomTitle] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedRoom, setSelectedRoomState] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${url}/user/${uid}`);
        setChatRooms(response.data);
      } catch (error) {
        console.error("Error fetching chat rooms", error);
      }
    };

    fetchChatRooms();
  }, [uid]);

  const handleDeleteRoom = async (chatNo) => {
    await axios
      .delete(`${url}/chatroom`, {
        params: {
          uid: uid,
          chatNo: chatNo,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    setChatRooms(chatRooms.filter((room) => room.chatNo !== chatNo));
  };

  const handleAddChatRoom = async () => {
    try {
      console.log("아아아" + uid);
      const response = await axios.post(
        `${url}/chatroom/${uid}`,
        { title: newChatRoomTitle, status: "active" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setNewChatRoomTitle("");
      setChatRooms([...chatRooms, response.data]);
      setSelectedRoomState(response.data);
    } catch (error) {
      console.error("Error creating chat room", error);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoomState(room);
    setSelectedRoom(room);
  };

  return (
    <aside className="chatAside">
      <ul>
        {chatRooms.length === 0 ? (
          <li>참여중인 채팅방 없음</li>
        ) : (
          chatRooms.map((room, index) => (
            <li key={index}>
              <Link to="#" onClick={() => handleSelectRoom(room)}>
                {room.title}
              </Link>
              <button onClick={() => handleDeleteRoom(room.chatNo)}>
                나가기
              </button>
            </li>
          ))
        )}
        <li>
          <input
            type="text"
            value={newChatRoomTitle}
            onChange={(e) => setNewChatRoomTitle(e.target.value)}
            placeholder="New Chat Room Title"
          />
          <button onClick={handleAddChatRoom} className="btnChatPlus">
            {" "}
            +{" "}
          </button>
        </li>
      </ul>
      {selectedRoom && <InviteFriends selectedRoom={selectedRoom} />}
    </aside>
  );
};

export default Aside;
