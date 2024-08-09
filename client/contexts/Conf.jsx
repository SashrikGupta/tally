import React, { createContext, useContext, useState, useEffect } from "react";

export const curr_config = createContext();

export default function Config(props) {
  const [logged_in_userid, sliu] = useState(null);
  const back_key = "http://localhost:1934";
  const sync_key = "https://mern-stack-devlopment.vercel.app/";
  const [user, set_user] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      sliu(storedUserId);
    }
  }, []); // Empty dependency array to run this effect only once on component mount

  return (
    <>
      <curr_config.Provider value={{ logged_in_userid, back_key, sync_key, sliu, set_user, user }}>
        {props.children}
      </curr_config.Provider>
    </>
  );
}
