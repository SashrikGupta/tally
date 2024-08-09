import React, { useState, useContext, useEffect } from 'react';
import chatboxIcon from './chatbox-icon.svg';
import { curr_context } from '../../contexts/background';

const Chatbot = () => {
  const now_context = useContext(curr_context);
  console.log(now_context.theme == '#333333');
  const [dark, set_dark] = useState(false);
  const [bg, st_bg] = useState('#333333');
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([{ name: "Sam", message: "how can I help?" }]);
  const [inputValue, setInputValue] = useState('');

  const toggleState = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    if (now_context.theme === '#333333') {
      st_bg('#333333');
    } else {
      st_bg('');
    }
  }, [now_context.theme]);

  const onSendButton = () => {
    if (inputValue === "") return;

    const userMessage = { name: "User", message: inputValue };
    setMessages([...messages, userMessage]);
    document.getElementById('oj').value = '';
    fetch('https://chatbot-ydma.onrender.com/predict', {
      method: 'POST',
      body: JSON.stringify({ message: inputValue }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(r => r.json())
      .then(r => {
        const botMessage = { name: "Sam", message: r.answer };
        setMessages([...messages, userMessage, botMessage]);
        setInputValue('');
      })
      .catch((error) => {
        console.error('Error:', error);
        setInputValue('');
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onSendButton();
    }
  };

  return (
    <div className="fixed bottom-6 right-1 z-50">
      <div className={`flex mb-[5vh] flex-col bg-[${bg}] backdrop-blur-2xl w-[20vw] h-[50vh] opacity-0 rounded-lg transition-opacity duration-500 ${isActive ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="bg-white/10 sticky top-0 rounded-t-lg flex justify-center items-center py-1">
          <div className="mr-2">
            <img src="https://i.gifer.com/origin/71/71a32055ba174b23a7279ec84d4c44db_w200.gif" className="w-[40px] h-[40px] rounded-[50%] animation-speed-up backdrop-blur" alt="image" />
          </div>
          <div className="text-black w-[calc(18vw-50px)]">
            <h4 className="text-[2vh] font-semibold text-[aqua]">Chat support</h4>
            <p className="text-[2vh] text-white">Hi. My name is <span className="font-bold text-[aqua]">Codebot</span>. How can I help you?</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 text-[2vh] my-0">
          <div>
            {messages.map((item, index) => (
              <div key={index} className="flex">
                {item.name === "Sam" ? null : <div className="w-[7vw] h-[2vh]"></div>}
                <div className={`bg-white/10 rounded-md w-[12vw] pb-1 pl-2 mb-1 my-0 ${item.name === "Sam" ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  <div className="text-[1vh] flex">
                    {item.name === "Sam" ? (
                      <div className="flex pt-1 h-[3vh] w-[3vw] align-center justify-left gap-1">
                        <img src="https://i.gifer.com/origin/71/71a32055ba174b23a7279ec84d4c44db_w200.gif" className="w-[1vw] h-[1vw] rounded-lg" alt="Sam" />
                        <div className="h-[3vh] w-[1vw] mt-[0.05vh] align-center font-bold text-[aqua] text-[1vh]">codebot</div>
                      </div>
                    ) : (
                      <>@User</>
                    )}
                  </div>
                  {item.message}
                </div>
                {item.name === "Sam" ? <div className="w-[7vw] h-[2vh]"></div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/10 sticky bottom-0 rounded-b-lg px-1 py-2 flex justify-between items-center">
          <input
            type="text"
            placeholder="Write a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            id="oj"
            className="bg-white/10 placeholder-white w-5/6 py-2 px-1 text-[2vh] rounded-lg text-center focus:outline-none"
          />
          <button
            className="bg-primary text-[2vh] text-white px-4 py-2 rounded-lg ml-2 focus:outline-none"
            onClick={onSendButton}
          >
            Send
          </button>
        </div>
      </div>
      <div className="fixed bottom-1 right-1">
        <button
          className={`bg-[${bg}] p-1 backdrop-blur-2xl border-[aqua] border-2 rounded-full shadow-md`}
          onClick={toggleState}
        >
          <img src={chatboxIcon} alt="Chatbox Icon" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
