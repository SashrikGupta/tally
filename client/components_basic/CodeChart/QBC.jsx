import React, { useEffect, useRef } from 'react';
import styles from "./QBC.module.css"
const QBC = ({ data }) => {
 
   useEffect(()=>{
    console.log(data) ; 
   } , [data])

  return (
    <div style={{ width: '14vw', height: '16vh' , fontSize:'1.7vh' }}>
      <div>
      {data[0].category} &nbsp;&nbsp;: {data[0].value}
      <progress id="file1" value={`${data[0].value}`} max={`${data[0].value + 10}`}/>
      </div>
      <div>
      {data[2].category} : {data[1].value}
      <progress id="file2" value={`${data[1].value}`} max={`${data[0].value}`}/>
      </div>
      <div>
      {data[1].category}&nbsp;&nbsp; : {data[2].value}
      <progress id="file2" value={`${data[2].value}`} max={`${data[0].value}`}/>
      </div>
    </div>
  );
};

export default QBC;
