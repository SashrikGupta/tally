import React , {useContext , useState , useEffect} from 'react'
import { curr_config } from '../../contexts/Conf';
import { curr_context } from '../../contexts/background';
import User from './User';

export default function Con() {

  const now_config = useContext(curr_config) ; 
  const back_key = now_config.back_key;
  const route = `${back_key}/query/getall`;
  const now_context = useContext(curr_context) ; 
  const bg = now_context.theme ;
  const [users , set_users] = useState([]) ; 
  

  useEffect(()=>{
    fetch(`${back_key}/users/all`, {
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
      set_users(data.data.users);
    })
    .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    console.log(users); // Log the fetched data after state update
  }, [users]);

  

   console.log("bhai hi dikh raha hu kya ? ")
  return (
    <>
        <> 
    <div className = "w-[100vw] flex flex-col  justigy-center">

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
        {users.map(el=>{
          if(el._id!= "65f9b0df8cf576d27969a832")
          {
            return(
              <User
              name = {el.username}
              points = {el.points}
              id = {el._id} 
              raiting = {el.rating}
              str = {el.description}
              >
              </User>
            )
          }
        })}
      </ul>
    </div>
    </div>
    </>

    </>
  )
}
