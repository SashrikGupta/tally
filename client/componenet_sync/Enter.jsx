import React, { useState } from 'react';
import Card from '../components_basic/Card/Card';
import {useNavigate} from 'react-router-dom'

export default function Enter() {
   const navigate = useNavigate() ; 
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const onJoinHandle = () => {

   // check values 


   // redirect 
   navigate(`/room/${roomId}` , {
      state : {
         username , 
      }
   })



    // Logic to handle joining the room
    // For now, just log the values
    console.log('Room ID:', roomId);
    console.log('Username:', username);
  };

  return (
    <>
      <div className="flex h-[90vh]">
        <Card w="55vh" h="60vh" tailwind="m-[auto] shadow-lg">
          <div className="flex h-[11vh] w-[50vh] justify-around">
            <img className="h-[11vh] rounded-lg border" src="./logo.png" alt="Logo" />
            <div style = {{border : "1px solid white" , heigth : "14vh"}}></div>
            <h1 className="fs-[bold]" style={{ fontSize: "5vh"  , fontWeight : "bold"}}>Code... <br /> ....Connect</h1>
            
            <hr /><hr />
            
          </div>
          
          <hr className="mt-4" />
          <hr />
          <div className='mt-3 w-[50vh] flex justify-center'> you <span style = {{color : "aqua"}}> &nbsp;code </span>&nbsp;we <span style = {{color : "aqua"}}> &nbsp;connect </span></div>
          <div className="h-[30vh] w-[50vh] flex flex-col justify-center items-center">
        
            <div className='mt-2'>
              Enter your room ID:
              <input
                className="w-[50vh] backdrop-blur bg-white/10 border rounded-lg"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>

            <div className="mt-3">
              Join the room as:
              <input
                className="w-[50vh] backdrop-blur bg-white/10 border rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className='flex justify-center items-center mt-4'>
              <button className="btn btn-primary" onClick={onJoinHandle}>Join the room</button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
