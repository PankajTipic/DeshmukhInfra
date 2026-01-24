import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CRow, 
  CCol, 
  CInputGroup, 
  CFormInput, 
  CButton,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilMicrophone, cilX } from '@coreui/icons';

const VoiceSearchComponent = ({ searchQuery, setSearchQuery, t, onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const recognitionRef = useRef(null);

  // Supported languages for multilingual search
  const supportedLanguages = [
    { code: 'en-US', name: 'EN', fullName: 'English' },
    { code: 'hi-IN', name: 'हि', fullName: 'हिंदी' },
    { code: 'mr-IN', name: 'मर', fullName: 'मराठी' }
  ];

  const checkMobile = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    setIsMobile(isMobileDevice);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const SpeechRecognition = window.SpeechRecognition || 
      window.webkitSpeechRecognition || 
      window.mozSpeechRecognition || 
      window.msSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const browserLang = navigator.language || 'en-US';
      if (browserLang.includes('hi')) {
        setCurrentLanguage('hi-IN');
      } else if (browserLang.includes('mr')) {
        setCurrentLanguage('mr-IN');
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript.trim());
      setIsListening(false);
      if (onSearch && transcript.trim()) {
        setTimeout(() => onSearch(transcript.trim()), 300);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = currentLanguage === 'mr-IN' ? 'आवाज ऐकू आला नाही' : 
                        currentLanguage === 'hi-IN' ? 'कोई आवाज़ नहीं सुनी' : 'No speech detected';
          break;
        case 'not-allowed':
          errorMessage = currentLanguage === 'mr-IN' ? 'मायक्रोफोन परवानगी नाही' : 
                        currentLanguage === 'hi-IN' ? 'माइक्रोफ़ोन की अनुमति नहीं' : 'Microphone permission denied';
          break;
        default:
          errorMessage = currentLanguage === 'mr-IN' ? 'आवाज शोध अयशस्वी' : 
                        currentLanguage === 'hi-IN' ? 'वॉइस सर्च असफल' : 'Voice search failed';
      }
      alert(errorMessage);
    };

    recognition.onend = () => setIsListening(false);
    return recognition;
  }, [currentLanguage, setSearchQuery, onSearch]);

  const startVoiceSearch = async () => {
    if (!isSupported) {
      const message = currentLanguage === 'mr-IN' ? 'आवाज शोध समर्थित नाही' : 
                     currentLanguage === 'hi-IN' ? 'वॉइस सर्च समर्थित नहीं है' : 'Voice search not supported';
      alert(message);
      return;
    }

    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      if (isMobile && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch {
          const message = currentLanguage === 'mr-IN' ? 'मायक्रोफोन परवानगी द्या' : 
                         currentLanguage === 'hi-IN' ? 'माइक्रोफ़ोन की अनुमति दें' : 'Please allow microphone access';
          alert(message);
          return;
        }
      }

      recognitionRef.current = initializeSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting voice search:', error);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  const handleKeyDown = (event) => {
    if (!isMobile && (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      startVoiceSearch();
    }
    if (event.key === 'Escape' && isListening) stopVoiceSearch();
    if (event.key === 'Enter' && searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isMobile, searchQuery, onSearch]);

  const getPlaceholder = () => {
    switch (currentLanguage) {
      case 'mr-IN': return 'उत्पादन शोधा...';
      case 'hi-IN': return 'उत्पाद खोजें...';
      default: return 'Search products...';
    }
  };

  const currentLangObj = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <>
      <CRow className="mb-3 justify-content-center">
        <CCol xs={12} sm={12} md={11} lg={10} xl={9}>
          {/* Main Search Container */}
          <div className="search-container">
            <div className="search-wrapper">
              <CInputGroup className="search-group">
                <CFormInput
                  placeholder={getPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  
                  className={`search-input ${isListening ? 'listening' : ''}`}
                />

                {searchQuery && (
                  <CButton
                    type="button"
                    color="light"
                    variant="ghost"
                    onClick={clearSearch}
                    className="action-btn clear-btn"
                    aria-label="Clear search"
                  >
                    <CIcon icon={cilX} size="sm" />
                  </CButton>
                )}

                {isSupported && (
                  <CButton
                    type="button"
                    color={isListening ? 'danger' : 'secondary'}
                    variant="ghost"
                    onClick={startVoiceSearch}
                    className={`action-btn voice-btn ${isListening ? 'listening' : ''}`}
                    aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                  >
                    <CIcon icon={cilMicrophone} size="sm" />
                  </CButton>
                )}

                <CButton
                  type="button"
                  color="primary"
                  onClick={() => onSearch && onSearch(searchQuery)}
                  className="action-btn search-btn"
                  aria-label="Search"
                >
                  <CIcon icon={cilSearch} size="sm" />
                </CButton>
              </CInputGroup>

              {/* Language Selector */}
              {isSupported && (
                <div className="language-selector">
                  <div className="lang-options">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang.code)}
                        className={`lang-btn ${currentLanguage === lang.code ? 'active' : ''}`}
                        title={lang.fullName}
                        type="button"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Listening Status */}
            {isListening && (
              <div className="listening-status">
                <CBadge color="danger" className="listening-badge">
                  <span className="pulse-dot"></span>
                  {currentLanguage === 'mr-IN' ? 'ऐकत आहे...' : 
                   currentLanguage === 'hi-IN' ? 'सुन रहे हैं...' : 'Listening...'}
                </CBadge>
              </div>
            )}
          </div>
        </CCol>
      </CRow>

      <style jsx>{`
        .search-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e3e6f0;
          padding: 2px;
          transition: all 0.2s ease;
        }

        .search-wrapper:focus-within {
          box-shadow: 0 2px 12px rgba(13, 110, 253, 0.12);
          border-color: #0d6efd;
        }

        .search-group {
          flex: 1;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .search-input {
          height: 36px;
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 400;
          padding: 0 12px;
          color: #2d3748;
        }

        .search-input:focus {
          box-shadow: none;
          border: none;
          background: transparent;
        }

        .search-input.listening {
          background: linear-gradient(90deg, #fff5f5 0%, #ffffff 100%);
        }

        .search-input::placeholder {
          color: #a0aec0;
          font-weight: 400;
        }

        .action-btn {
          height: 36px;
          width: 36px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          border-radius: 6px;
        }

        .clear-btn {
          color: #718096;
        }

        .clear-btn:hover {
          background: #f7fafc;
          color: #4a5568;
        }

        .voice-btn {
          color: #4299e1;
        }

        .voice-btn:hover {
          background: #ebf8ff;
          color: #2b6cb0;
        }

        .voice-btn.listening {
          background: #fed7d7;
          color: #e53e3e;
          animation: pulse-bg 1.5s infinite;
        }

        .search-btn {
          background: #0d6efd;
          color: white;
        }

        .search-btn:hover {
          background: #0b5ed7;
        }

        .language-selector {
          display: flex;
          align-items: center;
          padding: 0 8px;
          flex-shrink: 0;
        }

        .lang-options {
          display: flex;
          gap: 2px;
        }

        .lang-btn {
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 22px;
          text-align: center;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lang-btn:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .lang-btn.active {
          background: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }

        .listening-status {
          text-align: center;
          margin-top: 8px;
        }

        .listening-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          animation: pulse-dot 1.5s infinite;
        }

        @keyframes pulse-bg {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.9; }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .search-input {
            height: 40px;
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 0 12px;
          }
          
          .action-btn {
            height: 40px;
            width: 40px;
          }
          
          .search-wrapper {
            gap: 8px;
            padding: 3px;
          }
        }

        @media (max-width: 576px) {
          .search-wrapper {
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .search-group {
            min-width: 200px;
          }
          
          .language-selector {
            padding: 0 4px;
          }
          
          .lang-btn {
            padding: 2px 5px;
            font-size: 10px;
            min-width: 20px;
            height: 22px;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .voice-btn.listening,
          .pulse-dot {
            animation: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          .search-wrapper {
            background: #1a202c;
            border-color: #2d3748;
          }
          
          .search-input {
            color: #e2e8f0;
          }
          
          .search-input::placeholder {
            color: #718096;
          }
          
          .lang-btn {
            background: #2d3748;
            border-color: #4a5568;
            color: #e2e8f0;
          }
          
          .lang-btn:hover {
            background: #4a5568;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .search-wrapper {
            border: 2px solid #000;
          }
          
          .lang-btn {
            border: 1px solid #000;
          }
        }
      `}</style>
    </>
  );
};

export default VoiceSearchComponent;