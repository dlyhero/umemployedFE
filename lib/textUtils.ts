/**
 * Utility functions for text processing
 */

/**
 * Strip HTML tags from text content
 * @param htmlString - String that may contain HTML tags
 * @returns Clean text without HTML tags
 */
export const stripHtmlTags = (htmlString: string | null | undefined): string => {
  if (!htmlString) return '';
  
  // Remove HTML tags and decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace and non-breaking spaces
  return textContent
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with regular spaces
    .trim();
};

/**
 * Get country name from country code
 * @param countryCode - Two-letter country code (e.g., 'US', 'CA')
 * @returns Full country name
 */
export const getCountryName = (countryCode: string): string => {
  const countryNames: { [key: string]: string } = {
    'US': 'United States',
    'CA': 'Canada',
    'UK': 'United Kingdom',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'AU': 'Australia',
    'JP': 'Japan',
    'SG': 'Singapore',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'CN': 'China',
    'KR': 'South Korea',
    'RU': 'Russia',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'EG': 'Egypt',
    'KE': 'Kenya',
    'GH': 'Ghana',
    'MA': 'Morocco',
    'TN': 'Tunisia',
    'DZ': 'Algeria',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'ZW': 'Zimbabwe',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'AO': 'Angola',
    'CM': 'Cameroon',
    'CI': 'Ivory Coast',
    'SN': 'Senegal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'NE': 'Niger',
    'TD': 'Chad',
    'SD': 'Sudan',
    'LY': 'Libya',
    'SO': 'Somalia',
    'DJ': 'Djibouti',
    'ER': 'Eritrea',
    'SS': 'South Sudan',
    'CF': 'Central African Republic',
    'CD': 'Democratic Republic of the Congo',
    'CG': 'Republic of the Congo',
    'GA': 'Gabon',
    'GQ': 'Equatorial Guinea',
    'ST': 'São Tomé and Príncipe',
    'CV': 'Cape Verde',
    'GM': 'Gambia',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'SL': 'Sierra Leone',
    'LR': 'Liberia',
    'TG': 'Togo',
    'BJ': 'Benin',
    'MR': 'Mauritania',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KM': 'Comoros',
    'YT': 'Mayotte',
    'RE': 'Réunion',
    'SH': 'Saint Helena',
    'AC': 'Ascension Island',
    'TA': 'Tristan da Cunha',
    'BI': 'Burundi',
    'RW': 'Rwanda',
    'LS': 'Lesotho',
    'SZ': 'Eswatini'
  };
  
  return countryNames[countryCode.toUpperCase()] || countryCode;
};

/**
 * Get country flag emoji from country code
 * @param countryCode - Two-letter country code
 * @returns Flag emoji
 */
export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};