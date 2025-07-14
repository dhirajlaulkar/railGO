const axios = require('axios');

// Normalize the API response to match our schema
function normalizePNRStatus(apiData) {
  // TODO: Map apiData fields to our currentStatus schema
  return {
    status: apiData.passengerStatus ? apiData.passengerStatus[0]?.currentStatus : '',
    coach: apiData.passengerStatus ? apiData.passengerStatus[0]?.coach : '',
    seatNumber: apiData.passengerStatus ? apiData.passengerStatus[0]?.seatNumber : '',
    berthPreference: apiData.passengerStatus ? apiData.passengerStatus[0]?.berthPreference : '',
    currentLocation: apiData.boardingPoint || '',
    chartStatus: apiData.chartPrepared ? 'Chart Prepared' : 'Chart Not Prepared',
  };
}

exports.fetchPNRStatus = async (pnrNumber) => {
  try {
    const response = await axios.get(
      `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnrNumber}`,
      {
        headers: {
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
        timeout: 10000,
      }
    );
    if (!response.data || response.data.error) {
      throw new Error(response.data.error || 'Invalid response from PNR API');
    }
    return normalizePNRStatus(response.data);
  } catch (err) {
    throw new Error('Failed to fetch PNR status: ' + err.message);
  }
}; 