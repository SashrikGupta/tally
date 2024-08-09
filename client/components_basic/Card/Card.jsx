import { useContext } from "react";
import { curr_context } from "../../contexts/background";
import React from 'react';

export default function Card(props) {
  
  const now_context = useContext(curr_context); 
  let bg = now_context.theme;
  console.log(now_context);
  
  return (
    <>
      <div id="card" className={`flex justify-center items-center rounded-xl  backdrop-blur-3xl shadow-xl  p-${props.p} mx-${props.mx} my-${props.my} mt-${props.mt} mb-${props.mb} ${props.tailwind}`}
        style={{
          backgroundColor: `${bg}`,
          width: props.w,
          height: props.h,
          marginRight: props.mr,
          marginLeft: props.ml,
          overflow: 'hidden',
        }}
      >
        <div className="z-index-1">{props.children}</div>
      </div>
    </>
  );
}
