import React, { createContext, useContext, useState, useEffect } from "react";

export const curr_context = createContext();

export default function BG(props) {
 
  const storedTheme = localStorage.getItem("theme"); 
  const storedind = localStorage.getItem("ind") ; 
  const storedmode = localStorage.getItem("mode") ; 
  const [theme, setTheme] = useState('#333333');
  const [ind , setind] = useState(storedind || -1)
  const [mode , setmode] = useState(storedmode || 2)

  const url = [
    "https://images.alphacoders.com/104/1049857.jpg" , 
    "https://www.pixground.com/wp-content/uploads/2023/09/Mountain-Range-Italy-4K-Wallpaper-jpg.webp" , 
    "https://images.unsplash.com/photo-1546552768-2e5b568b0680?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" , 
    "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?ixlib=rb-4.0.3" , 
    "https://wallpapercave.com/wp/wp2757880.gif" , 
    "https://i.pinimg.com/originals/1d/a3/66/1da3663ce1d7d0f6098a31a667e862b4.gif" , 
    "https://images.unsplash.com/photo-1480374178950-b2c449be122e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://i.makeagif.com/media/4-26-2023/0VRwQ8.gif",
    "https://wallpapers.com/images/hd/interstellar-pink-planet-endurance-fx8bxxbed45vemai.jpg"
   ]


  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("ind", ind);
    localStorage.setItem("mode", mode);
    if(ind!=-1) {
    document.getElementById('root').style.backgroundImage = `url(${url[ind]})`
    setTheme('') ; 
    }
    else{
      document.getElementById('root').style.backgroundImage = `url( )`
      setTheme('#333333')
    }
  }, [ mode  , ind]);


  const toggle = () => {
    setTheme((prevTheme) => (prevTheme === "#333333" ? "k" : "#333333"));
  };

  return (
    <>
      <curr_context.Provider value={{ theme, toggle , ind , setind , mode , setmode  , url}}>
        {props.children}
      </curr_context.Provider>
    </>
  );
}
