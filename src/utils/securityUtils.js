// Security utilities for input sanitization and validation
// Prevents XSS and SQL injection attacks

export const securityUtils = {
  // Sanitize input to prevent XSS attacks
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters and patterns
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
      .replace(/[;]/g, '') // Remove semicolons to prevent command injection
      .replace(/[()]/g, '') // Remove parentheses to prevent function calls
      .replace(/[{}]/g, '') // Remove braces to prevent object injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onload, etc.)
      .replace(/script/gi, '') // Remove script tags
      .replace(/iframe/gi, '') // Remove iframe tags
      .replace(/object/gi, '') // Remove object tags
      .replace(/embed/gi, '') // Remove embed tags
      .replace(/link/gi, '') // Remove link tags
      .replace(/meta/gi, '') // Remove meta tags
      .replace(/style/gi, '') // Remove style tags
      .replace(/expression/gi, '') // Remove CSS expressions
      .replace(/url\(/gi, '') // Remove CSS url() functions
      .replace(/data:/gi, '') // Remove data: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/onload/gi, '') // Remove onload events
      .replace(/onerror/gi, '') // Remove onerror events
      .replace(/onclick/gi, '') // Remove onclick events
      .replace(/onmouseover/gi, '') // Remove onmouseover events
      .replace(/onfocus/gi, '') // Remove onfocus events
      .replace(/onblur/gi, '') // Remove onblur events
      .replace(/onchange/gi, '') // Remove onchange events
      .replace(/onsubmit/gi, '') // Remove onsubmit events
      .replace(/onreset/gi, '') // Remove onreset events
      .replace(/onselect/gi, '') // Remove onselect events
      .replace(/onkeydown/gi, '') // Remove onkeydown events
      .replace(/onkeyup/gi, '') // Remove onkeyup events
      .replace(/onkeypress/gi, '') // Remove onkeypress events
      .replace(/onmousedown/gi, '') // Remove onmousedown events
      .replace(/onmouseup/gi, '') // Remove onmouseup events
      .replace(/onmousemove/gi, '') // Remove onmousemove events
      .replace(/onmouseout/gi, '') // Remove onmouseout events
      .replace(/ondblclick/gi, '') // Remove ondblclick events
      .replace(/oncontextmenu/gi, '') // Remove oncontextmenu events
      .replace(/onresize/gi, '') // Remove onresize events
      .replace(/onscroll/gi, '') // Remove onscroll events
      .replace(/onunload/gi, '') // Remove onunload events
      .replace(/onbeforeunload/gi, '') // Remove onbeforeunload events
      .replace(/onabort/gi, '') // Remove onabort events
      .replace(/onerror/gi, '') // Remove onerror events
      .replace(/onload/gi, '') // Remove onload events
      .replace(/onloadstart/gi, '') // Remove onloadstart events
      .replace(/onloadend/gi, '') // Remove onloadend events
      .replace(/onprogress/gi, '') // Remove onprogress events
      .replace(/ontimeout/gi, '') // Remove ontimeout events
      .replace(/onreadystatechange/gi, '') // Remove onreadystatechange events
      .replace(/onopen/gi, '') // Remove onopen events
      .replace(/onmessage/gi, '') // Remove onmessage events
      .replace(/onclose/gi, '') // Remove onclose events
      .replace(/onbeforeprint/gi, '') // Remove onbeforeprint events
      .replace(/onafterprint/gi, '') // Remove onafterprint events
      .replace(/onpagehide/gi, '') // Remove onpagehide events
      .replace(/onpageshow/gi, '') // Remove onpageshow events
      .replace(/onpopstate/gi, '') // Remove onpopstate events
      .replace(/onstorage/gi, '') // Remove onstorage events
      .replace(/onhashchange/gi, '') // Remove onhashchange events
      .replace(/ononline/gi, '') // Remove ononline events
      .replace(/onoffline/gi, '') // Remove onoffline events
      .replace(/onbeforeunload/gi, '') // Remove onbeforeunload events
      .replace(/onunload/gi, '') // Remove onunload events
      .replace(/onresize/gi, '') // Remove onresize events
      .replace(/onscroll/gi, '') // Remove onscroll events
      .replace(/oncontextmenu/gi, '') // Remove oncontextmenu events
      .replace(/ondblclick/gi, '') // Remove ondblclick events
      .replace(/onmouseout/gi, '') // Remove onmouseout events
      .replace(/onmousemove/gi, '') // Remove onmousemove events
      .replace(/onmouseup/gi, '') // Remove onmouseup events
      .replace(/onmousedown/gi, '') // Remove onmousedown events
      .replace(/onkeypress/gi, '') // Remove onkeypress events
      .replace(/onkeyup/gi, '') // Remove onkeyup events
      .replace(/onkeydown/gi, '') // Remove onkeydown events
      .replace(/onselect/gi, '') // Remove onselect events
      .replace(/onreset/gi, '') // Remove onreset events
      .replace(/onsubmit/gi, '') // Remove onsubmit events
      .replace(/onchange/gi, '') // Remove onchange events
      .replace(/onblur/gi, '') // Remove onblur events
      .replace(/onfocus/gi, '') // Remove onfocus events
      .replace(/onmouseover/gi, '') // Remove onmouseover events
      .replace(/onclick/gi, '') // Remove onclick events
      .replace(/onerror/gi, '') // Remove onerror events
      .replace(/onload/gi, '') // Remove onload events
      .trim();
  },

  // Validate username format
  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return false;
    }
    
    const sanitized = this.sanitizeInput(username);
    
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(sanitized);
  },

  // Validate password format
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return false;
    }
    
    const sanitized = this.sanitizeInput(password);
    
    // Password should be at least 3 characters
    return sanitized.length >= 3;
  },

  // Escape HTML entities to prevent XSS
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return '';
    }
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
  },

  // Rate limiting for login attempts
  rateLimit: {
    attempts: new Map(),
    
    isAllowed(ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
      const now = Date.now();
      const key = ip || 'default';
      
      if (!this.attempts.has(key)) {
        this.attempts.set(key, { count: 0, firstAttempt: now });
        return true;
      }
      
      const attempt = this.attempts.get(key);
      
      // Reset if window has passed
      if (now - attempt.firstAttempt > windowMs) {
        this.attempts.set(key, { count: 1, firstAttempt: now });
        return true;
      }
      
      // Check if under limit
      if (attempt.count < maxAttempts) {
        attempt.count++;
        return true;
      }
      
      return false;
    },
    
    reset(ip) {
      const key = ip || 'default';
      this.attempts.delete(key);
    }
  },

  // Generate CSRF token
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Validate CSRF token
  validateCSRFToken(token, storedToken) {
    return token && storedToken && token === storedToken;
  }
};
