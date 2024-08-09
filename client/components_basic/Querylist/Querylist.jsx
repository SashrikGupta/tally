import React, { useEffect , useContext } from 'react';
import Query from './Query';
import { useState } from 'react'
import { curr_context } from '../../contexts/background'
import Card from '../Card/Card';
import fetchUserName from '../../NON_HTML/fetchuser';
import { curr_config } from '../../contexts/Conf';

const Querylist = () => {

  const now_config = useContext(curr_config) ; 
  const back_key = now_config.back_key;
  const route = `${back_key}/query/getall`;
  const [queries, set_queries] = useState([]);

  useEffect(() => {
    fetch(route, {
      headers: {
        'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
        // Add other caching-related headers if needed
      }
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        // Handle other status codes if needed
        throw new Error('Failed to fetch data');
      }
    })
    .then(data => {
      set_queries(data.data.users);
    })
    .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    console.log(queries); // Log the fetched data after state update
  }, [queries]); // Run this effect only when queries state changes

 
console.log(queries)




  const now_context = useContext(curr_context) ; 
  const bg = now_context.theme ;
  

  const option = {
    unsolved: {
      status: 'unsolved',
      style_status: 'text-green-600',
      button: 'solve',
      style_button: 'w-[10vw] flex items-center justify-center text-black rounded-lg bg-green-600 font-medium hover:text-indigo-500',
      link: '#',
      solver: 'hidden',
    },
    solved: {
      status: 'solved',
      style_status: 'text-red-600',
      button: 'details',
      style_button: 'w-[10vw] flex items-center justify-center text-white rounded-lg bg-red-600 font-medium hover:text-indigo-500',
      link: '#',
      solver: '',
    },
    inprocess: {
      status: 'inprocess',
      style_status: 'text-yellow-600',
      button: 'details',
      style_button: 'w-[10vw] flex items-center justify-center text-white rounded-lg bg-yellow-600  font-medium hover:text-indigo-500',
      link: '#',
      solver: '',
    },
  };

  const temp = [1, 2, 3, 1,2 , 1 , 2, 1, 3 , 3 , 2 , 1];
  return (
    <> 
    <div className = "w-[100vw] flex flex-col  justigy-center">
      <div className='m-[auto] mt-4 flex flex-col items-center justify-center w-[80vw] h-[10vh]'>
        <Card w = "80vw" h = "10vh">
          <div className='flex w-[80vw] justify-around'>
          <hr></hr>
          <span>sort by options : </span>  
          <div className= 'overflow-x-auto '>
          <button id="sort" className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> Date </button>
          <button id="unsolved" className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1 " style = {{fontSize: "2.5vh" }}> Points </button>
          <button id="solved" className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> unsolved </button>
          <button id="solved" className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> solved </button>
          <button id="process"className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> process </button>
          <button id="process"className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> your asked </button>
          <button id="process"className = "btn bg-[aqua] opacity-[1] mx-1 p-0 px-1" style = {{fontSize: "2.5vh" }}> your solve </button>
          </div>
          <hr className='mt-1'></hr>           
          </div>
        </Card>
      </div>
    <div style={{ overflow: 'hidden' }}>
      <ul
        className='mt-10'
        style={{
          overflowY: 'auto',
          maxHeight: '70vh',
          scrollbarWidth: 'none', 
          WebkitScrollbar: {
            display: 'none', 
          },
        }}
      >
        {queries.map((el) => {
          let tem = '';
          if (el.status == "unsolved") tem = option.unsolved;
          if (el.status == "solved") tem = option.solved;
          return (
            <Query
              key={el._id}
              bg={bg}
              query = {el}
              type = {tem}
            />
          );
        })}
      </ul>
    </div>
    </div>
    </>

  );
};

export default Querylist;
