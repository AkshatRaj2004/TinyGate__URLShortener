const UAParser = require('ua-parser-js');

/**
 * Extracts browser, OS, and device type from a User-Agent string.
 * @param {string} uaString - Value of the `user-agent` request header
 * @returns {{ browser: string, os: string, device: string }}
 */
const parseUserAgent = (uaString) => {
  const parser = new UAParser(uaString || '');
  const result = parser.getResult();

  const browser = result.browser.name || 'unknown';
  const os = result.os.name || 'unknown';

  let device = 'desktop';
  if (result.device.type === 'mobile') device = 'mobile';
  else if (result.device.type === 'tablet') device = 'tablet';
  else if (result.device.type === 'bot') device = 'bot';

  return { browser, os, device };
};

module.exports = parseUserAgent;
