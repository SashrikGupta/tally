import React , {useState , useEffect , useContext} from 'react'
import { Link  , useParams} from 'react-router-dom'
import Card from '../components_basic/Card/Card';
export default function Rank() {

   const { id } = useParams();
   const [rankings , set_rankings] = useState() ; 
   const [loading , setLoading] = useState(false);
   const [contest , set_contest] = useState() ; 
   const [relate , set_relate] = useState() ; 

   useEffect(() => {
      (async () => {
        setLoading(true);
        const contest = await fetch(`http://localhost:1934/contest/${id}`);
         const data = await contest.json();
         console.log(data)
         set_contest(data.data.contest)
         const prob_index_map = {}
         data.data.contest.problems.forEach((element , index)  => {
            prob_index_map[element._id] = index ; 
         });
         set_relate(prob_index_map) ; 
         console.log(prob_index_map)
        setLoading(false);
      })();
    }, [id]);



   useEffect(() => {
      (async ()=>{
         const response = await fetch(`http://localhost:1934/contest/rank/${id}`) ;
         const data = await response.json() ; 
         set_rankings(data.data) 
      })()
   }, [])

   useEffect(
    () => {
      console.log(rankings)
    },
    [rankings]
   )

  return (
   <div className='h-[90vh] w-[100vw] flex flex-col justify-around items-center'>
   <Card h='10vh' w='80vw' tailwind='border-2'>
     <Link to ={`/contest/${id}`}><span className='text-white text-3xl '>Problems | </span></Link>
     <span className='text-white text-3xl font-bold'>Global rankings  </span>
   </Card>
   <Card h='70vh' w='80vw' tailwind='border-2'>
        <div className='h-[70vh] w-[80vw] flex p-4 justify-center overflow-y-auto'>
          {loading ? (
            <div className='text-white text-center text-2xl'>Loading...</div>
          ) : (
            <div className='w-[77vw] h-[67vh]'>
              <table className='w-full text-white border-collapse'>
                <thead>
                  <tr className='bg-gray-700'>
                    <th className='border border-gray-600 px-4 py-2'>rank</th>
                    <th className='border border-gray-600 px-4 py-2'>name</th>
                    {contest?.problems.map((element , index)=>{
                     return (
                        <>
                          <th className='border border-gray-600 px-4 py-2'>{index+1}</th>
                          </>
                     )
                    })}
                    <th className='border border-gray-600 px-4 py-2'>points</th>
                  </tr>
                </thead>
                <tbody>
                  {
                     rankings?.map((element , index)=>{
                        return (
                           <>
                           <tr>
                              <td className='border border-gray-600 px-4 py-2'>{element.rank}</td>
                              <td className='border border-gray-600 px-4 py-2'>{element.name}</td>
                              {contest?.problems.map((prob , index)=>{
                                 console.log(prob._id);
                                 const problem = element.problemStatuses.find(p => p.problemId === prob._id);
                                 console.log(problem)
                                 let isSolve = false
                                 if(problem){
                                    isSolve = problem.solved
                                 }
                                 return (
                                       <>
                                       {isSolve ? (
                                          <th className='border border-gray-600 px-4 py-2 bg-[#90ee90]'> ✅ </th>
                                       ) : (
                                          <th className='border border-gray-600 px-4 py-2 bg-[red]/40'> ❌ </th>
                                       )}
                                       </>
                                    )
                                 })}
                                 <td className='border border-gray-600 px-4 py-2'>{element.resultPoints}</td>
                           </tr>
                           </>
                        )
                     }) 
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
 </div>
  )
}
