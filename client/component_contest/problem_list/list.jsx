import React from 'react'
import Card from '../../components_basic/Card/Card'
import { Link } from 'react-router-dom'

export default function ProList() {
  return (
   <div className='h-[90vh] w-[100vw] flex justify-around items-center'>
   <Card w='70vw' h='80vh'>
   </Card>
   <Card h='80vh' w='20vw' tailwind='flex-col justify-between'>
      <div className='h-[2vh]'></div>
      <div className='text-[3vh] font-bold text-[aqua]'>The Arena</div>
      <hr />
      <div className='w-[16vw]'>
         <div className='h-[2vh]'></div>
         <div className='h-[2vh]'></div>
         Solving coding problems involves understanding the problem requirements, designing an efficient algorithm, and implementing the solution with clean, bug-free code. 
         <div className='h-[2vh]'></div>
         <hr />
         <div className='font-bold text-[aqua]'>
            Wanna develop your own question?
         </div>
         <div>
            Users with a rating over 800 can develop their own question.
         </div>
         <Link to="/add_contest" className='mt-2 h-[6vh] w-[16vw] btn btn-primary'>
            Create Now!
         </Link>
      </div>
      <div className='h-[2vh]'></div>
   </Card>
</div>
  )
}
