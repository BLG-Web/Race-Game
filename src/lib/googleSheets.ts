// Google Sheets API helper for token validation
const GOOGLE_API_KEY = 'AIzaSyB3JwuNUJb3_UrRp92QMsBuNZcxGlBunPE';
const SHEET_ID = '1ABNrgqRAy_LbiAZAFVW2L4Cr1GbR0Z-x4nQacCMZS3E';
const SHEET_NAME = 'TOPI JERAMI';

export interface TokenData {
  userid: string;
  token: string;
  type: string;
  rowIndex: number;
}

export async function validateTokenFromSheet(userId: string, token: string): Promise<boolean> {
  try {
    const range = `${SHEET_NAME}!B:D`; // Read columns B, C, D (userid, token, type)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Sheets API error:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // Skip header row (row 1) and check from row 2 onwards
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const sheetUserId = row[0]?.trim(); // Column B
      const sheetToken = row[1]?.trim();  // Column C
      
      // Check if both userid and token match
      if (sheetUserId === userId.trim() && sheetToken === token.trim()) {
        console.log('Token validation successful:', { userId, token, type: row[2] });
        return true;
      }
    }
    
    console.log('Token validation failed: No matching userid/token found');
    return false;
    
  } catch (error) {
    console.error('Error validating token from Google Sheets:', error);
    return false;
  }
}

export async function getAllTokensFromSheet(): Promise<TokenData[]> {
  try {
    const range = `${SHEET_NAME}!B:D`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Sheets API error:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    const tokens: TokenData[] = [];
    
    // Skip header row and process data
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[1]) { // Make sure userid and token exist
        tokens.push({
          userid: row[0].trim(),
          token: row[1].trim(),
          type: row[2]?.trim() || '',
          rowIndex: i + 1 // 1-based row index
        });
      }
    }
    
    return tokens;
    
  } catch (error) {
    console.error('Error getting tokens from Google Sheets:', error);
    return [];
  }
}