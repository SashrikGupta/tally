import React  , {useContext} from 'react'
import { curr_config } from '../../contexts/Conf'
import { curr_context } from '../../contexts/background'
import {Link} from 'react-router-dom'
export default function User(props) {

   
  const now_config = useContext(curr_config) ; 
  const now_context = useContext(curr_context) ; 
  const bg = now_context.theme ;

  return (
    <>
          <div className={`bg-[${bg}] px-4 py-3 mb-2 backdrop-blur-3xl shadow-xl sm:px-6 shadow overflow-hidden sm:rounded-md max-w-[80vw] mx-auto `}>
          <div className="flex items-center ">
            <div className = "" >
               <h3 className="text-lg leading-6 font-medium text-white mb-1">

            <div className="flex justify-between h-[5vh] w-[75vw] ">
               <div className = "flex ">
                  <div className='bg-primary rounded-lg px-2 w-[10vw] flex  justify-center'>{props.name}</div>
                  &nbsp; &nbsp;
                  <span className='bg-danger rounded-lg px-2'>{props.raiting} ⭐ </span>
                  &nbsp; &nbsp;
                  <div className="px-2 w-[10vw] flex items-center justify-center rounded-lg bg-[gold] text-black font-medium hover:text-indigo-500">
                     {props.points} 🪙
                  </div>
               </div>
               <Link to={`/${props.id}`} className="btn btn-success flex items-center justify-center">connect</Link>
         </div>



               &nbsp;&nbsp;&nbsp;&nbsp;
               </h3>
               <hr></hr>
               <p>{props.str}</p>
            </div>

          </div>

    </div>
    </>
  )
}
