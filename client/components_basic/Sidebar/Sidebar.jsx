import React, { useState } from 'react';

const Sidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stat , setstat] = useState('') ; 
  const openNav = () => {
    setSidebarOpen(true);
    setstat('none')
  };

  const closeNav = () => {
    setSidebarOpen(false);
    setstat('')
  };

  return (
    <div>
      <div
        id="mySidebar"
        style={{
          height: '100%',
          width: isSidebarOpen ? '125px' : '0',
          position: 'fixed',
          zIndex: 1,
          top: 0,
          left: 0,
          backgroundColor: '#111',
          overflowX: 'hidden',
          transition: '0.5s',
          paddingTop: '2.4vh',
        }}
      >
        <a
          href="javascript:void(0)"
          className="closebtn"
          onClick={closeNav}
          style={{
            position: 'absolute',
            top: 0,
            right: '25px',
            fontSize: '3.8vh',
            marginLeft: '50px',
            color: 'white',
            textDecoration: 'none',
            marginBottom : '1.4vh'
          }}
        >
          &times;
        </a>
        <a
          href="#"
          style={{
            padding: ' 8px 8px 32px',
            textDecoration: 'none',
            fontSize: '2vh',
            color: '#818181',
            display: 'block',
            transition: '0.01s',
            marginTop : '2vh'
          }}
        >
          
          <hr></hr>
          
          <br></br>
      
          About
        </a>
        {/* Add similar styles for other links */}
      </div>

      <div
        id="main"
        style={{
          transition: 'margin-left .5s',
          marginLeft: isSidebarOpen ? '250px' : '0',
        }}
      >
        <button
          className="openbtn m-1"
          onClick={openNav}
          style={{
            fontSize: '2.5vh',
            cursor: 'pointer',
            backgroundColor: '#111',
            color: 'white',
            padding: '0.5vh 1vw',
            border: 'none',
            borderRadius :'15%' , 
            margin : 'auto' , 
            display : stat ,
          }}
        >
          &#9776;
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
