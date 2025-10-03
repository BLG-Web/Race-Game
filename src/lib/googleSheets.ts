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
    
    // Try GET request only (avoid CORS preflight)
    const getUrl = `${APPS_SCRIPT_URL}?action=validate&userid=${encodeURIComponent(userId.trim())}&token=${encodeURIComponent(token.trim())}`;
    console.log('Apps Script GET request:', getUrl);
    
    const response = await fetch(getUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      console.error('Apps Script GET request failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json() as ValidationResponse;
    console.log('Apps Script GET response:', data);
    
    if (data.success) {
      console.log('Token validation successful:', data.data);
      return true;
    } else {
      console.log('Token validation failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('Error validating token via Apps Script:', error);
    return false;
  }
}
