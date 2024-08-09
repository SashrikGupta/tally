async function fetchUserName(userId) {
  let name = '' ; 
  let back_key = "http://localhost:1934"
  const routeUser = `${back_key}/getuser`;

  
   await fetch(routeUser, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache', // Ensure fresh data is always fetched
      // Add other headers as needed
    },
    body: JSON.stringify({ id: userId}), // Replace yourIdValue with the actual ID value
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
        name = data.data.user.username;
      })
      .catch(error => console.error('Error fetching data:', error));
  

  return name;
}

export default fetchUserName;
