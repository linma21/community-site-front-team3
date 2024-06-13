import React, { useState, useEffect } from 'react';
import ChatLayout from '../../layouts/ChatLayout';
import Chat from 'components/chat/Chat';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { globalPath } from 'globalPaths';

const url = globalPath.path;
const ChatPage = () => {
    const authSlice = useSelector((state) => state.authSlice);
    const uid = authSlice.uid;
    const name = authSlice.name;
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isMessageSent, setIsMessageSent] = useState(false);
    const [chatNo, setChatNo] = useState('');

    console.log('selectedRoom: ' + JSON.stringify(selectedRoom));

    useEffect(() => {
        if (selectedRoom) {
            setChatNo(JSON.stringify(selectedRoom.chatNo));
        }
    }, [selectedRoom]);

    // WebSocket 연결 설정
    useEffect(() => {
        const socket = new SockJS(`${url}/ws/chat`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });
        client.onConnect = () => {
            console.log('Connected');
            setStompClient(client);
        };
        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
        client.activate();
        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [uid]);

    // 채팅방 선택 시 메시지 구독 설정 및 초기 메시지 로드
    useEffect(() => {
        if (stompClient && selectedRoom) {
            const subscription = stompClient.subscribe(`/topic/chatroom/${selectedRoom.chatNo}`, (message) => {
                const msg = JSON.parse(message.body);
                console.log('WebSocket message received:', msg); // WebSocket 메시지 확인
                setMessages((prevMessages) => {
                    // 중복 메시지 방지
                    if (!prevMessages.some((m) => m.cmNo === msg.cmNo)) {
                        return [...prevMessages, msg];
                    }
                    return prevMessages;
                });
            });

            // 초기 메시지 로드
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`${url}/chat/messages?chatNo=${selectedRoom.chatNo}`);

                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching chat room messages', error);
                }
            };

            fetchMessages();

            // 유저 이름을 포함하여 전송
            stompClient.publish({
                destination: '/app/chat.addUser',
                body: JSON.stringify({ uid, name }),
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [selectedRoom, stompClient, uid, name]);

    // 채팅방 조회 및 메시지 초기화
    const handleSelectChatRoom = async (room) => {
        setSelectedRoom(room);
        setMessages([]);
        try {
            console.log('Fetching messages for chatNo:', room.chatNo);
            const response = await axios.get(`${url}/chatroom/${room.chatNo}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat room messages', error);
        }
    };

    // 메시지 전송
    const onSendMessage = (text) => {
        if (stompClient && stompClient.connected && selectedRoom) {
            const chatMessage = {
                uid: uid,
                name: name,
                message: text,
                chatNo: selectedRoom.chatNo,
                cDate: new Date().toISOString(),
            };
            console.log(chatMessage);
            stompClient.publish({
                destination: `/app/chat.sendMessage/${selectedRoom.chatNo}`,
                body: JSON.stringify(chatMessage),
            });
            setIsMessageSent(true);
        }
    };

    useEffect(() => {
        if (isMessageSent) {
            setIsMessageSent(false);
        }
    }, [isMessageSent, messages]);

    return (
        <div className="chat-layout-container">
            <ChatLayout setSelectedRoom={handleSelectChatRoom}>
                {!selectedRoom ? (
                    <div className="chatPage-choice"></div>
                ) : (
                    <>
                        <Chat
                            messages={messages}
                            name={name}
                            onSendMessage={onSendMessage}
                            uid={uid}
                            chatNo={chatNo}
                            roomTitle={selectedRoom ? selectedRoom.title : 'Chat'}
                        />
                    </>
                )}
            </ChatLayout>
        </div>
    );
};
export default ChatPage;
