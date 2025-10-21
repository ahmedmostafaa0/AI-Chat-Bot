import ChatBotStart from "./Components/ChatBotStart";
import ChatBotApp from "./Components/ChatBotApp";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const handleStartChat = () => {
    setIsChatting(true);

    if (chats.length === 0) {
      createNewChat();
    }
  };

  const handleGoBack = () => {
    setIsChatting(false);
  };

  const createNewChat = (msg = "") => {
    const newChat = {
      id: uuidv4(),
      displayId: `Chat ${new Date().toLocaleDateString("en-GB")}
       ${new Date().toLocaleTimeString([], {
         hour: "2-digit",
         minute: "2-digit",
       })}`,
      messages: msg
        ? [
            {
              type: "prompt",
              text: msg,
              timeStamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
            },
          ]
        : [],
    };
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats))
    localStorage.setItem(newChat.id, JSON.stringify(newChat.messages))
    setActiveChat(newChat.id);
  };

  useEffect(() => {
      const storedChats = JSON.parse(localStorage.getItem('chats')) || []
      setChats(storedChats) 
      if(storedChats.length > 0){
        setActiveChat(storedChats[0].id)
      }
  }, [])
  
  return (
    <div className="container">
      {isChatting ? (
        <ChatBotApp
          onGoBack={handleGoBack}
          chats={chats}
          setChats={setChats}
          onNewChat={createNewChat}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />
      ) : (
        <ChatBotStart onStartChat={handleStartChat} />
      )}
    </div>
  );
};

export default App;
