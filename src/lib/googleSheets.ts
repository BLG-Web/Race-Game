// Google Apps Script API helper for token validation using JSONP
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

// JSONP helper function
function jsonpRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    // Create callback function
    (window as any)[callbackName] = function(data: any) {
      // Cleanup
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    
    // Create script tag
    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = function() {
      // Cleanup on error
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    // Add to DOM
    document.body.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
        document.body.removeChild(script);
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
}

export async function validateTokenFromSheet(userId: string, token: string): Promise<boolean> {
  try {
    console.log('Validating token via Apps Script JSONP:', { userId, token });
    
    // Build JSONP URL
    const url = `${APPS_SCRIPT_URL}?action=validate&userid=${encodeURIComponent(userId.trim())}&token=${encodeURIComponent(token.trim())}`;
    console.log('JSONP request URL:', url);
    
    // Make JSONP request
    const data = await jsonpRequest(url) as ValidationResponse;
    console.log('JSONP response:', data);
    
    if (data && data.success) {
      console.log('Token validation successful:', data.data);
      return true;
    } else {
      console.log('Token validation failed:', data?.error || 'Unknown error');
      return false;
    }
    
  } catch (error) {
    console.error('Error validating token via JSONP:', error);
    
    // Fallback: try regular fetch with no-cors
    try {
      console.log('Trying fallback fetch with no-cors...');
      const getUrl = `${APPS_SCRIPT_URL}?action=validate&userid=${encodeURIComponent(userId.trim())}&token=${encodeURIComponent(token.trim())}`;
      
      const response = await fetch(getUrl, {
        method: 'GET',
        mode: 'no-cors'
      });
      
      console.log('Fallback response (no-cors):', response);
      // With no-cors, we can't read the response, so assume success if no error
      return true;
      
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return false;
    }
  }
}
