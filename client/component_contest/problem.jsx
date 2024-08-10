import React , {useState , useContext, useEffect} from 'react'
import Card from '../components_basic/Card/Card';
import TextEditor from '../comoponent_code/QuerPost/TextEditor';
import { Link, useNavigate } from 'react-router-dom';
import { curr_context } from '../contexts/background';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python'
import 'codemirror/mode/clike/clike'
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import '../comoponent_code/QuerPost/TextEditor'
import codemirror from 'codemirror';
import {useParams} from 'react-router-dom'
import { curr_config } from '../contexts/Conf'; 
import { useLocation } from 'react-router-dom';




export default function Problem() {

  const navigate = useNavigate() ; 
  const now_config = useContext(curr_config)
  const back_key = now_config.back_key
  const {id} = useParams() ; 
  const cont = useContext(curr_context) ; 
  const bg  = cont.theme ; 
  const [mode , setmode] = useState('text/x-c++src') ; 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [node1 , setnode1] = useState('bg-gray-800 text-white') ; 
  const [node2 , setnode2] = useState('text-white') ; 
  const [run_btn , setrun_btn]= useState(false) ; 
  const [ed  , set_ed] = useState() ; 
  const [code , set_code] = useState() ; 
  const [ohm , set_ohm] = useState() ; 
  const [solved , set_solved] = useState(false) ; 
  const [program , set_program] = useState() ; 
  const [problemStatment , set_porblemstatment] = useState("") ; 
  const [query , set_query] = useState(false) ;  

   const [status , set_status] = useState("Submit Answer") ; 

   const [isModalOpen, setIsModalOpen] = useState(false);

   const location = useLocation() ; 
  


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const closeDropdown = () => {
    setDropdownOpen(false);
  };
  const language_python = ()=>{
      setmode('python') 
      document.getElementById('lang').innerText = "Python" ; 
  }
  const language_cpp = ()=>{
    setmode('text/x-c++src') 
    document.getElementById('lang').innerText = "C++" ; 
}
const language_java = ()=>{
  setmode('text/x-java') 
  document.getElementById('lang').innerText = "JAVA" ; 
}
const language_javascript = ()=>{
  setmode({name : 'javascript', mode :'json'}) 
  document.getElementById('lang').innerText = "javascript" ; 
}


useEffect(()=>{

   (async ()=>{
       fetch(`http://localhost:1934/contest/problem/${id}`)
      .then(res => {
          return res.json();
      })
      .then(data => {
        set_query(data.data.problem) ; 
        console.log(data.data.problem) ;
      })
      .catch(error => {console.error("bhai error  : " + error)});
   })()

},[])

useEffect(()=>{
console.log(query) ; 
if(query){
  if ("code" in query) set_program(query.code);
  if ("problemStatement" in query) set_porblemstatment(query.problemStatement);
  if ("status" in query){
    if(query.status == "solved") set_solved(true)
  }
}

console.log(program)
} , [query , program])



useEffect(()=>{
  if(bg=='') set_ohm('transparent')
  else  set_ohm("#333333") 
} , [bg])




const qid = now_config.logged_in_userid ; 
const routeUser = `${back_key}/getuser`
const [sender , set_sender] = useState() ; 

useEffect(()=>{
  fetch(routeUser, {
     method: 'POST',
     headers: {
     'Content-Type': 'application/json',
     'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
     // Add other headers as needed
   },
   body: JSON.stringify({ id: qid}), // Replace yourIdValue with the actual ID value
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
       set_sender(data.data.user) ; 
     })
     .catch(error => console.error('Error fetching data:', error));

 }, [])

 const [author , set_author] =useState() ; 
 
useEffect(()=>{
  if(query)
  {
    fetch(routeUser, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
      // Add other headers as needed
    },
    body: JSON.stringify({ id: query.author}), // Replace yourIdValue with the actual ID value
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
        set_author(data.data.user) ; 
      })
      .catch(error => console.error('Error fetching data:', error));
 
  }

 }, [query])

const handel_run = ()=>{
  
   let match = false ;

   const fetchData = async () => {
      if (ed) {
        const code = ed.getValue();
        console.log(document.getElementById("in2").value )
        set_code(code);
        console.log(code) ; 
  
        try {
           let comp_router = "py_router/"
           if(mode=="text/x-c++src") comp_router = "CPP_router/"
           if(mode=="text/x-java") comp_router = "JAVA_router/"
  
          const response = await fetch(`http://localhost:3145/${comp_router}`, {
            method: 'POST',
            body: JSON.stringify({
              code: code , 
              input : `${document.getElementById("in2").value}` 
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          let out = data.output
          if(!out){
            out = data.error
          }
          console.log(out) ;
          console.log(query.testcase_output[0])
          const normalizedOut = out.replace(/\r\n/g, '\n');
          const normalizedExpected = query.testcase_output[0].replace(/\r\n/g, '\n');
          
          if(normalizedOut === normalizedExpected){
             match = true;
             set_status("Accepted");
          }
          else{
            set_status("Wrong")
          }
            console.log(code)
           await fetch(`http://localhost:1934/contest/check`, {
            method: 'POST',
            body: JSON.stringify({
               userId: now_config.logged_in_userid, 
               problemId: id , 
               code : code, 
               solved : match
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });


          document.getElementById('out2').value = out ; 
  
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
  
    fetchData();
}


const handelsolve = async () => {
   const code = ed.getValue();
   
   const fetchData = async (input, output) => {
     if (ed) {
       
       try {
         let comp_router = "py_router/";
         if (mode === "text/x-c++src") comp_router = "CPP_router/";
         if (mode === "text/x-java") comp_router = "JAVA_router/";
 
         const response = await fetch(`http://localhost:3145/${comp_router}`, {
           method: "POST",
           body: JSON.stringify({
             code: code,
             input: input,
           }),
           headers: {
             "Content-Type": "application/json",
           },
         });
 
         if (!response.ok) {
           throw new Error("Network response was not ok");
         }
 
         const data = await response.json();
         let out = data.output;
         if (!out) {
           out = data.error;
         }
         console.log(out);
         console.log(output);
         const normalizedOut = out.replace(/\r\n/g, "\n");
         const normalizedExpected = output.replace(/\r\n/g, "\n");
 
         return normalizedOut === normalizedExpected;
       } catch (error) {
         console.error("Error:", error);
         return false;
       }
     }
   };
 
   let count = 0;
   for (let i = 0; i < query.testcase_input.length; i++) {
     let val = await fetchData(query.testcase_input[i], query.testcase_output[i]);
     if (val) count++;
   }
   const response2 = await fetch(`http://localhost:1934/contest/check`, {
      method: 'POST',
      body: JSON.stringify({
         userId: now_config.logged_in_userid, 
         problemId: id , 
         code : code, 
         solved : count === query.testcase_input.length
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response2.json() ; 
    console.log(data.data.code._id)
   if (count === query.testcase_input.length) {
     setIsModalOpen(true);
     if(location.state?.cid){
      await fetch(`http://localhost:1934/contest/addpoint`, {
         method: 'POST',
         body: JSON.stringify({
            contestId : location.state?.cid, 
            userId : now_config.logged_in_userid , 
            pointsToAdd : query.points
         }),
         headers: {
           'Content-Type': 'application/json'
         }
       });
     }

     console.log(location.state?.cid)
   }






 };

 
 const Modal = ({ isOpen, onClose }) => {
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
       <div className="bg-white rounded-lg shadow-lg p-6 w-[250px] h-[50vh] flex flex-col justify-around ">
         <h2 className="text-2xl font-bold text-green-500 mb-4">Congratulations!</h2>
         <h2 className="text-2xl font-bold text-rose-500 mb-4">points : + {query.points}</h2>
         <p className='text-[green]'>You have successfully solved the problem!</p>
         <button
           className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
           onClick={onClose}
         >
           go to other problem
         </button>
       </div>
     </div>
   );
 };
 



  return (
    <>
    <div className='flex '>
      <Card w = '35vw' h = '90vh' mx = '3'  my = '2'>
      <div className='w-[35vw] h-[90vh] flex flex-col items-center justify-start '>

      <div className="relative" onMouseLeave={closeDropdown}>
                  <div className='flex flex-wrap justify-center items-center '>
                  <button  className="text-gray-300 h-[4.5vh] my-1 flex items-center hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                      language
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 12a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 6a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div id = "lang" onClick={toggleDropdown} className={` w-[15vw] h-[1.5em] flex justify-center items-center rounded-xl  backdrop-blur-3xl shadow-xl border-2 border-[aqua] `}
                     style = {{
                      backgroundColor : `${bg}`
                     }}> enter language
                    </div>
                    </div>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-0 w-48 bg-gray-800 rounded-b-lg shadow-lg" style={{ zIndex: '10' }}>
                        <a onClick = {language_python} className="block px-4 py-2 text-[2vh] text-gray-200 hover:bg-gray-100 hover:text-gray-800">Python</a>
                        <a onClick = {language_cpp} className="block px-4 py-2 text-[2vh] text-gray-200 hover:bg-gray-100 hover:text-gray-800"> C++ </a>
                        <a onClick = {language_java} className="block px-4 py-2 text-[2vh] text-gray-200 hover:bg-gray-100 hover:text-gray-800"> JAVA </a>
                        <a onClick = {language_javascript} className="block px-4 py-2 text-[2vh] text-gray-200 hover:bg-gray-100 hover:text-gray-800"> javascript </a>
                </div>
               )}

<hr  className=' mt-1 mb-2'/>
          </div>
          <Card w='28vw' h='80vh' tailwind = 'shadow-lg overflow-y-auto hide-scrollbar' >
          <div
          className='p-2 w-[28vw] h-[74vh] mt-[2vh] backdrop-blur-6xl rounded-lg placeholder:text-white  oveflow-auto'
          style={{ background: ohm , backdropFilter: 'blur(10px)' }}
        >
         <div>
         <span className='text-[aqua] text-3xl font-bold'> {query.name} </span> 
         <span className = 'text-3xl'> | </span> 
         <span className='text-[red] font-bold text-3xl'> {query.points}</span>
         </div>

         <div
         className={`mt-2 border-2 w-[5vw] flex justify-center rounded-lg ${
            query.tag == 'Easy'
               ? 'border-green-500'
               : query.tag == 'Medium'
               ? 'border-[yellow]'
               : 'border-[red]'
         }`}
         >
         {query.tag}
         </div>
         <div className='py-4'>
            {query.desc}
         </div>

         <div>
            <span className='font-bold text-2xl'>sample test case : input </span>
            <textarea  placeholder = " input "  className=' w-[25vw] h-[25vh] px-4 rounded-lg bg-gray-800'
          value={query.testcase_input && query.testcase_input[0] ? query.testcase_input[0] : ""}
           ></textarea>
           <span className='font-bold text-2xl'>sample test case : output</span> 
            <textarea  placeholder = " output  " className= ' w-[25vw] h-[25vh] px-4 rounded-lg text-[2vh] bg-gray-800'
           value={query.testcase_output && query.testcase_output[0] ? query.testcase_output[0] : ""}
           ></textarea>       
         </div>

        </div>

          </Card>
      </div>

      </Card>

      <div className='flex flex-col'>
         <Card w = '65vw' h = '55vh' mx = '3'  mt = '2'>
          <TextEditor 
            id = "RTE"
            w='63vw' 
            h='52vh'
            tailwind = 'rounded-lg opacity-100'
            mode = {mode}
            run_btn = {run_btn}
            set = {set_ed}
            prog = {program}
         >
        
         </TextEditor>
         </Card>
         <Card w = '65vw' h = '33vh' mx = '3' mt='[2vh]' >
          <div className='h-[33vh] flex flex-col justify-around'>
            
          <div className='h-[5vh] flex justify-between'>
          <div className={`mt-1 ml-5 flex items-center h-[5vh] text-3xl mb-2 ${
            status == 'Accepted'
            ? 'btn btn-success'
            : status == 'Wrong'
            ? 'btn btn-danger'
            : 'btn btn-secondary'
           }`
          }
          
          
          >{status}</div>
          <div>
          <button onClick = {()=>{handel_run()}} className='btn btn-success text-[2vh] h-[4vh] mr-4 w-[6vw] py-0' > run </button>
          <button onClick = {()=>{handelsolve()}} className='btn btn-primary text-[2vh] h-[4vh] w-[6vw] py-0 mr-4' > submit </button>
          </div>
           
          </div>
          <div className='w-[65vw] flex justify-around items-center'>

           <textarea id = "in2" placeholder = " input "  className=' w-[31vw] h-[25vh] px-4 rounded-lg bg-gray-800'
          value={query.testcase_input && query.testcase_input[0] ? query.testcase_input[0] : ""}
           >
            
            </textarea>      
           <textarea id = "out2" placeholder = " output  " className= ' w-[31vw] h-[25vh] px-4 rounded-lg text-[2vh] bg-gray-800'
           
           ></textarea>         
          </div>

          </div>
            
          </Card>
      </div> 
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>

   

    </>
  )
}

