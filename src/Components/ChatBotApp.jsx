import { useEffect, useRef, useState } from "react";
import "./ChatBotApp.css";
import Picker from 'emoji-picker-react'

const ChatBotApp = ({
  onGoBack,
  chats,
  setChats,
  onNewChat,
  activeChat,
  setActiveChat,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(chats[0]?.messages || "");
  const [isTyping, setIsTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showList, setShowList] = useState(false)

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const sendMessage = async () => {
    if (inputValue.trim() === "") return;
    const newMessage = {
      type: "prompt",
      text: inputValue,
      timeStamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if (!activeChat) {
      onNewChat(inputValue);
      setInputValue("");
    } else {
      const updatedMessage = [...messages, newMessage];
      setMessages(updatedMessage);
      localStorage.setItem(activeChat, JSON.stringify(updatedMessage))
      setInputValue("");

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessage };
        } else {
          return chat;
        }
      });
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats))
      setIsTyping(true);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: inputValue }],
          }),
        }
      );

      if (!response.ok) {
        console.log("testinng");
      }
      const data = await response.json();
      console.log(data);
      const chatResponse = data.choices[0].message.content;
      const newResponse = {
        type: "response",
        text: chatResponse,
        timeStamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      const updatedMessageWithResponse = [...updatedMessage, newResponse];
      setMessages(updatedMessageWithResponse);
      localStorage.setItem(activeChat, JSON.stringify(updatedMessageWithResponse))
      setIsTyping(false);
      
      const updatedChatsWithResponse = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessageWithResponse };
        }
        return chat;
      });
      setChats(updatedChatsWithResponse);
      localStorage.setItem('chats', JSON.stringify(updatedChatsWithResponse))

    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleSelectChat = (id) => {
    setActiveChat(id);
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats))
    localStorage.removeItem(id)
    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      setActiveChat(newActiveChat);
    }
  };

  const handleEmojiClick = (emojiObj) => {
    setInputValue((prev) => prev + emojiObj.emoji);
  };

  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem(activeChat)) || []
    setMessages(storedMessages)
  }, [activeChat])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChat]);

  return (
    <div className="chat-app">
      <div className={`chat-list ${showList ? 'show' : ''}`}>
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => {
              onNewChat();
            }}
          ></i>
          <i className="bx bx-x-circle" onClick={() => setShowList(false)}></i>
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${
              chat.id === activeChat ? "active" : ""
            }`}
            onClick={() => handleSelectChat(chat.id)}
          >
            <h4>{chat.displayId}</h4>
            <i
              className="bx bx-x-circle"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
            ></i>
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat With AI</h3>
          <i className="bx bx-menu menu" onClick={() => setShowList(true)}></i>
          <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
        </div>
        <div className="chat">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${msg.type === "prompt" ? "prompt" : "response"}`}
            >
              {msg.text}
              <span>{msg.timeStamp}</span>
            </div>
          ))}
          {isTyping && <div className="typing">Typing...</div>}
          <div ref={chatEndRef}></div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i
            className="fa-solid fa-face-smile emoji"
            onClick={() => setShowPicker((prev) => !prev)}
          ></i>
          {showPicker && (
            <div className="picker">
              <Picker onEmojiClick={handleEmojiClick} theme="dark" width={350} height={400} />
            </div>
          )}

          <input
            type="text"
            placeholder="Type a message..."
            className="msg-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            onFocus={() => setShowPicker(false)}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
