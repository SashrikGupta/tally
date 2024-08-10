import React, { useState } from 'react';
import Card from '../../components_basic/Card/Card';

export default function Basic({ setname, setstart, setend }) {
  const [name, setNameInput] = useState('');
  const [start, setStartInput] = useState('');
  const [end, setEndInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setname(name);
    setstart(start);
    setend(end);
  };

  return (
    <div className='h-[90vh] w-[100vw] flex justify-center items-center'>
      <Card h='80vh' w='50vh'>
        <div className='text-[4vh] font-bold text-[aqua]'>
          Contest Details
        </div>
        <hr />
        <div>
          <form onSubmit={handleSubmit} className='flex flex-col gap-1'>
            <div>
              <label className='text-[3vh] '>Name</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setNameInput(e.target.value)}
                className='border p-2 w-full bg-white/30 backdrop-blur rounded-lg'
                required
              />
            </div>
            <div>
              <label className='text-[3vh] font-medium'>Start Date & Time</label>
              <input
                type='datetime-local'
                value={start}
                onChange={(e) => setStartInput(e.target.value)}
                className='border p-2 w-full bg-white/30 backdrop-blur rounded-lg'
                required
              />
            </div>
            <div>
              <label className='text-[3vh] font-medium'>End Date & Time</label>
              <input
                type='datetime-local'
                value={end}
                onChange={(e) => setEndInput(e.target.value)}
                className='border p-2 w-full bg-white/30 backdrop-blur rounded-lg'
                required
              />
            </div>
            <button
              type='submit'
              className='mt-4 p-2 bg-[aqua] text-white font-bold rounded-lg'
            >
              Let's Create !
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
