import React  , {useState , useEffect, useContext}from 'react'
import {Link} from 'react-router-dom'
import { curr_config } from '../../contexts/Conf';

export default function Query({bg , id  , query  , type }) {

  const now_config = useContext(curr_config) ; 

  const description = query.problemStatment ; 
  const points = query.points ;
  const tag = query.tag ; 
  const title = query.title ; 
  const back_key = now_config.back_key ; 
  const routeUser = `${back_key}/getuser`

  const [sender , set_sender] = useState(query.author) ; 
  const [solver , set_solver] = useState(query.solver) ; 
   

  useEffect(()=>{
   fetch(routeUser, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
      // Add other headers as needed
    },
    body: JSON.stringify({ id: sender}), // Replace yourIdValue with the actual ID value
  })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          // Handle other status codes if needed
          throw new Error('Failed to fetch data');
        }
      })
      .then(data => {
        set_sender(data.data.user.username) ; 
      })
      .catch(error => console.error('Error fetching data:', error));
 
  }, [])

  useEffect(()=>{
    fetch(routeUser, {
       method: 'POST',
       headers: {
       'Content-Type': 'application/json',
       'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
       // Add other headers as needed
     },
     body: JSON.stringify({ id: solver}), // Replace yourIdValue with the actual ID value
   })
       .then(res => {
         if (res.ok) {
           return res.json();
         } else {
           // Handle other status codes if needed
           throw new Error('Failed to fetch data');
         }
       })
       .then(data => {
         set_solver(data.data.user.username) ; 
       })
       .catch(error => console.error('Error fetching data:', error));
  
   }, [])
   
  // as of now prop drilling has been implimeted but context api needs to be implimented 

  return (

      <div className={`bg-[${bg}] px-4 py-3 mb-2 backdrop-blur-3xl shadow-xl sm:px-6 shadow overflow-hidden sm:rounded-md max-w-[80vw] mx-auto `}>
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg leading-6 font-medium text-white mb-1">
               <span className=' rounded-lg px-2'>{title}</span>
               &nbsp; &nbsp;
               <span className=' rounded-lg px-2'>{tag}</span>
               &nbsp;&nbsp;&nbsp;&nbsp;
               </h3>
               <hr></hr>
               <p>{description}</p>
            </div>
            <div className="w-[10vw] flex items-center justify-center rounded-lg bg-[gold] text-black font-medium hover:text-indigo-500">
               {points} 🪙
            </div>
          </div>
          <div className="my-1 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Status: <span className={`${type.style_status}`}>{type.status}</span></p>
            <Link to={`/querydetail/${query._id}`} className={`${type.style_button}`}>{type.button}</Link>
          </div>
          <p> 
            <span className=' border-gray-800 rounded-lg '> &nbsp; author&nbsp; </span>  &nbsp; : &nbsp;
            <span className=' px-1 rounded-md  border-gray-800 '>{sender}</span> 
            <span className={`${type.solver}`}>
            &nbsp; |  &nbsp;
            <span className=' border-gray-800 rounded-lg '> &nbsp; solver&nbsp; </span>  &nbsp; : &nbsp;
            <span className=' px-1 rounded-md  border-gray-800 '>{solver}</span> 
            </span>
         </p>
    </div>
  )
}
