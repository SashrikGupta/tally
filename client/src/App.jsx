import './App.css'
import Card from '../components_basic/Card/Card';
import Navbari from '../components_basic/Navbar/Navbar'
import UserCard from '../components_basic/UserCard/UserCard'
import Querylist from '../components_basic/Querylist/Querylist'
import Settings from '../components_basic/Settings/Settings'
import BG from '../contexts/background'
import QueryPost from '../comoponent_code/QuerPost/QueryPost';
import { Routes  , Route} from 'react-router-dom';
import QDL from '../components_basic/Querylist/QDL'; 
import Config from '../contexts/Conf';
import Con from '../components_basic/Connect/Conn';
import Enter from '../componenet_sync/Enter'
import Room from '../componenet_sync/Room';
import Signup from '../component_auth/Signup'
import Login from '../component_auth/Login'
import { useAuth0 } from "@auth0/auth0-react";
import { curr_config } from '../contexts/Conf';
import { useEffect  , useContext , createContext} from 'react';
import Blog from '../components_basic/Blog/Blog';
import Redirect from '../components_basic/Redirect/Redirect';
import Chatbot from '../components_basic/Chatbot/Chatbot'


function App() {
  const now_config = useContext(curr_config) ; 
  const sliu= now_config.sliu ; 
  const set_user = now_config.set_user
  const back_key = now_config.back_key ; 
  const { user, isAuthenticated, isLoading } = useAuth0();

  console.log(user) ; 
  useEffect(() => {
    if (user) {
      fetch(`${back_key}/checkuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email: user.email }),
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Failed to fetch data');
          }
        })
        .then(data => {
          sliu(data.userId);
          set_user(user)
          localStorage.setItem('userId', data.userId); // Store userId in local storage
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [user]);
  
    
  const currentPath = window.location.pathname;

  const shouldRenderNavbar = !['/signup', '/login'].includes(currentPath);

  return (
    <>
      
      <BG>
          {shouldRenderNavbar && <Navbari />}
          <Routes>
           <Route path=   "/"                  element = { <Redirect/>  } />
           <Route path=   "/signup"            element = { <Signup/>    } />
           <Route path=   "/settings"          element = { <Settings /> } /> 
           <Route path=   "/solve-query"       element = { <Querylist/> } /> 
           <Route path=   "/post-query"        element = { <QueryPost/> } /> 
           <Route path=   "/:id"               element = { <UserCard /> } />
           <Route path=   "/querydetail/:id"   element = { <QDL/>       } />
           <Route path=   "/con/con"           element = { <Con/>       } />
           <Route path=   "/code"              element = { <Enter/>     } />
           <Route path=   "/room/:id"          element = { <Room/>      } /> 
           <Route path=   '/login'             element = { <Login/>     } />
           <Route path=   '/blog'              element = { <Blog/>      } /> 
          </Routes>

      </BG>
      


    </>
  )
}

export default App



