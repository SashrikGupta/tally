import React , {useState} from 'react'
import Basic from './basic_info'
import Addq from './question';
export default function Add() {

  const [name , setname] = useState() ; 
  const [start , setstart] = useState() ; 
  const [end , setend] = useState() ;
  

  return (
    <div >
      {
        name && start && end ? (
          <Addq 
          name = {name} 
          start = {start} 
          end = {end} >
          </Addq>
        ): (
          <Basic
          setname = {setname}
          setstart = {setstart}
          setend = {setend}
         >
         </Basic>
        )
      }

    </div>
  )
}
