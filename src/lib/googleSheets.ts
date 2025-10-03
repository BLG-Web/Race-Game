// Google Apps Script API helper for token validation
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVEkyDtRvMhCpu5Ecmda90xBEdmO602N3tJSjceq-UHVQN1Bn_FwItoa38EgYoG8Sy/exec';

export interface TokenData {
  userid: string;
  token: string;
  type: string;
  rowNumber: number;
}

export interface ValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: TokenData;
  debug?: any;
}

export async function validateTokenFromSheet(userId: string, token: string): Promise<boolean> {
  try {
    console.log('Validating token via Apps Script:', { userId, token });
    
    // Method 1: POST request (recommended)
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: userId.trim(),
        token: token.trim()
      })
    });
    
    if (!response.ok) {
      console.error('Apps Script API error:', response.status, response.statusText);
      
      // Fallback to GET request
      const getUrl = `${APPS_SCRIPT_URL}?action=validate&userid=${encodeURIComponent(userId.trim())}&token=${encodeURIComponent(token.trim())}`;
      console.log('Trying GET fallback:', getUrl);
      
      const getResponse = await fetch(getUrl);
      
      if (!getResponse.ok) {
        console.error('Apps Script GET fallback also failed:', getResponse.status);
        return false;
      }
      
      const getData = await getResponse.json() as ValidationResponse;
      console.log('Apps Script GET response:', getData);
      
      return getData.success === true;
    }
    
    const data = await response.json() as ValidationResponse;
    console.log('Apps Script POST response:', data);
    
    if (data.success) {
      console.log('Token validation successful:', data.data);
      return true;
    } else {
      console.log('Token validation failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('Error validating token via Apps Script:', error);
    
    // Final fallback: try GET request
    try {
      const getUrl = `${APPS_SCRIPT_URL}?action=validate&userid=${encodeURIComponent(userId.trim())}&token=${encodeURIComponent(token.trim())}`;
      console.log('Final fallback GET request:', getUrl);
      
      const response = await fetch(getUrl);
      const data = await response.json() as ValidationResponse;
      
      console.log('Final fallback response:', data);
      return data.success === true;
      
    } catch (fallbackError) {
      console.error('All validation methods failed:', fallbackError);
      return false;
    }
  }
}
