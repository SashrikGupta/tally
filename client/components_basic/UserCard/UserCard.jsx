import React, { useState, useEffect, useContext } from 'react';
import Card from '../Card/Card';
import Timeline from '../Timeline/Timeline';
import moment from 'https://cdn.skypack.dev/moment?min';
import RadarChart from '../CodeChart/CodeChart';
import styles from "./UserCard.module.css";
import QBC from '../CodeChart/QBC';
import { useParams } from 'react-router-dom';
import { curr_config } from '../../contexts/Conf';
import { useNavigate } from 'react-router-dom';
function formating(dateString) {
  let dateObject = new Date(dateString);
  let formattedDate = dateObject.toISOString().split('T')[0];
  return formattedDate;
}

export default function UserCard() {



  const { id } = useParams();
  const [user, set_user] = useState({});
  const [dates, set_dates] = useState([]);

  if(!id){
    //redirect 
    navigate(`/login`)
  }
 
  const now_config = useContext(curr_config);
  const logged_in_userid = now_config.logged_in_userid
  const back_key = now_config.back_key;
  const user_detail = now_config.user ; 

  const navigate = useNavigate() ;

  if(!now_config.logged_in_userid){
    //redirect 
    navigate(`/login`)
  }



  const [name, set_name] = useState("Sashrik");
  const [points , set_points] = useState(500) ; 
  const [nickname, set_nickname] = useState("sash🫠");
  const [year, set_year] = useState("2nd year");
  const [tag, set_tag] = useState("react_dev");
  const [raiting, set_raiting] = useState("65476693534756");
  const [link, set_link] = useState("https://source.unsplash.com/random/?blue");
  const [n_query, set_n_query] = useState([
    { category: 'Total query', value: 5 },
    { category: 'query solved', value: 3 },
    { category: 'query asked', value: 2 }
  ]);
  const [rank, set_rank] = useState("na");
  const [followed, set_followed] = useState(0);
  const [following, set_following] = useState(0);
  const [post, set_post] = useState(30);
  const [str, set_str] = useState(`
    Lorem Ipsum is simply dummy text of the printing 
    and typesetting industry. Lorem Ipsum has been the 
    industry's standard dummy text ever since the 
    1500s, when an unknown printer took...`) ;    
   const [q_type , set_q_type] = useState([0,0,0,0,0,0])
   //comp , webdev , academic , machinelearning , cyber , others 
  const [temp_obj , set_temp_obj] = useState({}) ; 
  const [temp_obj_2 , set_temp_obj_2] = useState({}) ; 
  
    let startDate = moment().add(-365, 'days');
    let dateRange = [startDate, moment().add(1, 'days')];
  

    const example = ["2023-09-03", "2023-09-08", "2024-04-13"];
  const [data , set_data] = useState(
   Array.from(new Array(366)).map((_, index) => {
      let value = 0;
      let currentDate = moment(startDate).add(index, 'day').format('YYYY-MM-DD');
      if (example.includes(currentDate)) value = 50;
      return {
        date: moment(startDate).add(index, 'day'),
        value: value + 10
      };
    })
  );
  
  const [follower_list , set_followe_list] = useState([]) ; 


  








 //













  


  const [you, set_you] = useState(now_config.logged_in_userid == id);
  

  useEffect(() => {
    fetch(`${back_key}/getuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .then(data => {
        set_user(data.data.user);
        const dates_temp = [];
        set_dates(data.data.user.activity.map(el => formating(el.date)));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  useEffect(() => {
   console.log(user) ; 
   console.log(dates) ; 
   set_data(
      Array.from(new Array(366)).map((_, index) => {
         let value = 0;
         let currentDate = moment(startDate).add(index, 'day').format('YYYY-MM-DD');
         if (dates.includes(currentDate)) value = 50;
         return {
           date: moment(startDate).add(index, 'day'),
           value: value + 10
         };
       })
   )
   set_name(user.username) ; 
   set_nickname(user.nickname) ; 
   set_year(user.year)
   set_tag(user.tag) ; 
   set_raiting(user.rating) ; 
   set_str(user.description) ; 
   set_points(user.points) ; 
   
   if(user.followed) set_followed(user.followed.length) ;
   if(user.following){ set_following(user.following.length)  ; set_followe_list(user.following)}
   
     
 }, [dates]); // Include startDate in the dependency array
 
 useEffect(() => {
   console.log(data);
 }, [data]); // Log data whenever it changes
 


// user area ----------------------------------------------------------------


     //activity----------------------------------------------------

      // 1 year range


  useEffect(()=>{
    fetch(`${back_key}/rank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .then(data => {
        set_rank(data.data.rank)
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  

      

  useEffect(()=>{
    fetch(`${back_key}/userquerylist` , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .then(data => {
        set_temp_obj(data.data.tagCounts)
        set_temp_obj_2([
          data.data.totalQueries , 
          data.data.totalAskedQueries , 
          data.data.totalSolvedQueries
        ])
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  useEffect(()=>{
  // populate the query type 
  console.log(temp_obj)   ; 
  if(temp_obj){
    const q_arr = [0,0,0,0,0,0] ; 
    //comp , webdev , academic , machinelearning , cyber , others 
    q_arr[0] = temp_obj["competetive"] ; 
    q_arr[1] = temp_obj["web dev"] ; 
    q_arr[2] = temp_obj["acedemic"] ; 
    q_arr[3] = temp_obj["machine learning"] ; 
    q_arr[4] = temp_obj["cyber security"] ; 
    q_arr[5] = temp_obj["others"] ; 
    console.log(q_arr) ; 
    set_q_type(q_arr) ; 
    console.log(q_type)
  }
  if(temp_obj_2){
    const q_obj = [
      { category: 'Total query', value: temp_obj_2[0] },
      { category: 'query solved', value: temp_obj_2[1] },
      { category: 'query asked', value: temp_obj_2[2] }
    ]
    set_n_query(q_obj) ; 
  }
  } , [temp_obj , temp_obj_2])

  useEffect(
    ()=>{
      console.log(q_type) ; 
      console.log(n_query) ; 
    } , [q_type , temp_obj , temp_obj_2]
  )
//------------------------------------------------------------------------------


function followhandler(){
  
  fetch(`${back_key}/follow` , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ f1 : now_config.logged_in_userid  , f2 : id }),
  })
    .catch(error => console.error('Error fetching data:', error));
}



  return (
    <div className = "flex flex-row">

      {/* ------------------------------------------------------------------- */}
      <div id = "outer1" 
      className='flex flex-col justify-center'
      style = {{
         width : '27vw' , 
         hiegth : '96vh'
      }} 
      >
         <Card w = '25vw' h = '60vh' mt = '[2vh]'ml = '3vw'>
            
            <div className = "flex flex-col items-center justify-center"
             style = {{
               whidth : '25vw' , 
               height : '60vh'
             }}
            >
            <div className='flex flex-col items-center mb-2 justiy-center bg-[rgb(0,0,0,0.3)] rounded-lg'
            style = {{width : '20vw' , height :'35vh'}}
            >
               
            <div className = "bg-white rounded-lg my-2"
               style={{
                  width : '15vw',
                  height : '40vh' , 
                  backgroundImage : `url(${link})`,
                  backgroundSize : 'cover'
               }}
            >
             </div>   
             <div style ={{
               fontSize : '4vh' ,
               color : 'aqua' , 
               marginBottom : '1.vh'
             }}>
             {nickname}
               </div>           
            </div>   



             <div className = "bg"
               style={{
                  width : '20vw',
                  height : '20vh' , 
                  fontSize : '1vw',
                  color : 'rgb(0,225,225)' , 
               }}
            >
               <div className='px-2 bg-[#222222] rounded-lg text-center mb-2'
               style = {{
                   fontSize : '4vh' ,   
                   color : 'white' 
                  }}
               >
               points : <span style={{color : 'yellow'}}>{points}</span> 🪙
               </div>


               <div className='px-2 bg-[#222222] rounded-lg text-center mb-2 flex items-center'
               style = {{
                   fontSize : '1.5vh' ,   
                   color : 'white'  , 
                   fontFamily : 'sans-serif' ,
                   height : ' 14vh'
                  }}
               >
               {str}
               </div>

               
               
               
             </div>

            </div>

         </Card>

         <Card w = '25vw' h = '27vh' mt='[2vh]' ml = '3vw'>

         <div className = {`${styles.codeEditor} opacity-60`}
                 style = {{
                  fontSize : '2vh'
                 }}
               >
               <div className={styles.lineNumbering}>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
               </div>
               <div className={styles.codeBlock}>
                  <span className={styles.keyword}>class</span> <span className={styles.className}>{tag}</span> {'{'}
                  <br />
                  &nbsp;&nbsp;&nbsp;<span className={styles.variable}>String <span className={styles.variableName}>name = </span></span><span className={styles.value}>{`"${name}"`}</span>;
                  <br />
                  &nbsp;&nbsp;&nbsp;<span className={styles.variable}>String </span><span className={styles.variableName}>year = </span> <span className={styles.value}>{`"${year}"`}</span>;
                  <br />
                  &nbsp;&nbsp;&nbsp;<span className={`${styles.dataType}`}>object<span className={styles.variableName}> id = </span></span> <span className={styles.value} style = {{
                     fontSize : "8px"
                  }}>{user._id}</span>;
                  <br />
                  {'}'}
               </div>
               </div>
         </Card>
      </div>


      {/* ------------------------------------------------------------------- */}

            <div id = "outer2" style = {{width : '73vw'}}>

            <div className='flex justify-center ' >

               <Card w = '31vw' h = '38vh' mt = '[2vh]' mr = '1vw'>
                  <h1 className='ml-[4vw]'
                  style = {{fontSize : '5vh',}}
                  > RANK  : {rank}</h1>
                  <hr className='w-[30vw] my-3'/>

                  <div className = "flex ">

                  <div className='flex flex-col ml-[4vw]'
                  style = {{
                     //width : '20vw',
                     gap : '0.01vw'
                  }}
                  >
                  
                  <p> following : {following}<br></br>
                   followed by : {followed}<br></br>
                   avergae raiting : {raiting}<br></br>
                   posts : {post} <br></br>
                   {user && !you && !follower_list.includes(id) && (
  <button className="btn bg-[aqua] h-[1.5em] w-[10em] flex justify-center items-center" onClick={followhandler}>
    Follow
  </button>
)}
                   </p>
                  </div>
                  
                  
                   </div>
               </Card>

               <Card w = '31vw' h = '38vh' mt = '[2vh]' ml = '1vw'>
               <RadarChart qt = {q_type}/>
               </Card>

            </div>

            {/* ------------------------------------------------ */}  

            <div className='flex justify-center items-center'>
               <Card w = '44vw' h = '20vh' mt = '[2vh]' p = '4'>
                  <div className = "flex ">
                     <Timeline range={dateRange} data={data} colorFunc={({ alpha }) => `rgba(0 , 225 , 225 , ${alpha})`} />
                     </div>
                  </Card> 
                  <Card w = '18vw' h = '20vh' mt = '[2vh]'ml = '2vw'>
                     <div className="flex justify-center items-center ">
                     <div className = "flex flex-col justify-cennter items-center flex-wrap p-2 m-2"
                      style  ={{
                        backgroundRepeat : 'no-repeat' , 
                        width : '15vw',
                        height : '16vh'
                      }}
                      >
                     <QBC data = {n_query}/>
                     </div>
                     </div>


                      
               </Card>
            </div>

            {/* ------------------------------------------------ */}  
            <div className='flex justify-center items-center'>
               <Card w = '64vw' h = '27vh' mt = '[2vh]'>
                  <div className='flex justify-between'>
                  <span><p style = {{display :"inline"}}> previous queries</p></span>
                  <span>
                  <a className='btn bg-[aqua] h-[1.5em] w-[10em] flex justify-center items-center ' 
                  style = {{
                     border : '2px black solid'
                  }}
                  > go to queries </a>
                  </span>
                  </div>

                  <hr className='w-[60vw]'></hr>
               </Card>
            </div>
            {/* ------------------------------------------------ */} 
            </div>
      {/* ------------------------------------------------------------------- */}

    </div>
  )
}
