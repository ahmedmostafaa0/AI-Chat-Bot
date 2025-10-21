import './ChatBotStart.css'

const ChatBotStart = ({onStartChat}) => {
  return <div className="start-page">
    <button className="start-page-btn" onClick={onStartChat}>chat ai</button>
  </div>;
};

export default ChatBotStart;
