import React, { useEffect, useRef, useState, useContext } from 'react';
import { curr_config } from '../../contexts/Conf';
import { Chart as ChartJS, Title, Tooltip, Legend, DoughnutController, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, DoughnutController, ArcElement);

const DoughnutChart = () => {
  const { logged_in_userid } = useContext(curr_config);
  const [total, set_total] = useState(0); 
  const [easy, set_easy] = useState(0); 
  const [medium, set_medium] = useState(0); 
  const [hard, set_hard] = useState(0); 
  const canvasRef = useRef(null);
  const chartRef = useRef(null); // Reference to the Chart instance

  useEffect(() => {
    (async () => {
      if (logged_in_userid) {
        const response = await fetch(`http://localhost:1934/contest/your/stats/${logged_in_userid}`);
        const data = await response.json();
        console.log(data.data);
        set_total(data.data.total);
        set_easy(data.data.solved.Easy);
        set_medium(data.data.solved.Medium);
        set_hard(data.data.solved.Hard);
      }
    })();
  }, [logged_in_userid]);

  useEffect(() => {
    if (canvasRef.current) {
      // Destroy the previous chart instance if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Easy', 'Medium', 'Hard', 'Remaining'],
          datasets: [{
            data: [easy, medium, hard, (total - hard - easy - medium)],
            backgroundColor: ['rgba(0, 255, 0, 0.5)', 'rgba(0, 255, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(255, 255, 255, 0)'],
            borderColor: ['rgba(0, 255, 0, 1)', 'rgba(0, 255, 255, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 255, 255, 0.5)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Allow the chart to fill the parent container
          plugins: {
            legend: {
              display: true, // Show the legend
              position: 'right', // Position of the legend (top, bottom, left, right)
              labels: {
                color: 'white', // Set the color of the legend labels
                font: {
                  size: 14 ,
                 
                  // Set the font size of the legend labels
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.label}: ${context.raw}`;
                }
              }
            }
          },
          cutout: '60%' // Adjust this value to change the thickness of the doughnut
        }
      });
    }
  }, [easy, medium, hard]);

  return (
    <div className="h-[30vh] w-[30vw] flex flex-col justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DoughnutChart;
