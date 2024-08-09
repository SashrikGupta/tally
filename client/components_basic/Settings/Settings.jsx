import React, { useState } from 'react'
import Card from '../Card/Card'
import Display from './Display'

export default function Settings() {

  const [setting , setsetting] = useState('')


  return (
    <div className='flex justify-around'>
     <Card h = '90vh' w= '20vw' mt = '3'>
     <div className='w-[20vw] h-[90vh] flex flex-col items-center'>
      <h1 className='mt-3'>Settings </h1> 
      
      ________________________________________________________________

      <p class = "btn btn-primary mt-3"  onClick = {()=>{setsetting('display')}}> Display </p>
      <p class = "btn btn-primary mt-3"  onClick = {()=>{setsetting('user')}}> userinfo </p>
     </div>
     </Card>
     <Card h = '90vh' w= '70vw' mt = '3'>
      <div className='h-[90vh] w-[70vw] p-4'>
      {
         setting=='display' ? <Display/> : <></> 
      }
      </div>
     </Card>
    </div>
  )
}
