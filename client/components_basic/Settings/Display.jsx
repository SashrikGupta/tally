import React , {useState} from 'react'
import { useContext } from 'react';
import { curr_context } from '../../contexts/background';

export default function Display() {
  
  const now_context = useContext(curr_context) ; 
  const tog = now_context.toggle
  const ind = now_context.ind 
  const setind = now_context.setind
  const mode = now_context.mode 
  const setmode = now_context.setmode
  const url = now_context.url
  console.log(tog) 

  console.log("yeee wala " + mode) ; 
  
  const onDarkHandel = () => {
     setmode(2)
     setind(-1)
     document.getElementById('root').style.backgroundImage = `url( )`  
     if(now_context.theme == '') tog() 
  }

  const onCustomHandel = ()=>{
   setmode(1)
   if(now_context.theme == '#333333') tog()
  }

  const photoHandler = (index)=>{
  console.log(index) ; 
  setind(index)
  document.getElementById('root').style.backgroundImage = `url(${url[index]})` 
  }



  return (
    <div>
      <h1 className='mb-4'> choose your theme  : </h1>
      <hr></hr>
      <div className='mt-2 flex justify-between'>
      <button className='btn btn-secondary' onClick = {onDarkHandel} > Dark mode</button>
      </div>
      {
         mode == 1 ? <></> :
         <>
         <hr className='mt-2'></hr>
          <p className='my-2'> you can also choose a background image </p>
          <hr className='mt-2'></hr>
         <div className="grid grid-cols-2 h-[60vh] overflow-auto md:grid-cols-3 gap-4 mt-2">
            {url.map((el, index)=>{
               return(
                  <button id = {`${index}`}>
                  <img className="h-[15vh] w-[30vw] rounded-lg" src={el} alt="" onClick = {()=>{photoHandler(index)}}/>
                  </button>
               ) 
            })}
    </div>
         </>

      }

    </div>
  )
}
