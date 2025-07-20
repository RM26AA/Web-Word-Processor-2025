import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Save, FileText, Printer, Download, Type, Palette, 
  Undo, Redo, Copy, Scissors, Clipboard, Search, Replace, ZoomIn, ZoomOut, 
  Maximize, MoreHorizontal, PaintBucket, Shapes, Hash, Table, Plus, 
  FileImage, Highlighter, Pen, Eraser, Circle, Square, Triangle,
  Settings, Layout, Image, Droplets, Eye, RotateCcw, Minus, ChevronDown
} from 'lucide-react';

interface DocumentStats {
  words: number;
  characters: number;
  paragraphs: number;
}

interface DrawingState {
  isDrawing: boolean;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  size: number;
}

function App() {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [pageColor, setPageColor] = useState('#ffffff');
  const [marginSize, setMarginSize] = useState(1);
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [watermark, setWatermark] = useState('');
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [customFontSize, setCustomFontSize] = useState('');
  const [showCustomFontSize, setShowCustomFontSize] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    paragraphs: 0
  });

  const calculateStats = useCallback((text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0;
    setStats({ words, characters, paragraphs });
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      calculateStats(editorRef.current.innerText || '');
    }
  }, [content, calculateStats]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      // Apply letter spacing to the editor
      editorRef.current.style.letterSpacing = `${letterSpacing}px`;
    }
  };

  // Apply letter spacing whenever it changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.letterSpacing = `${letterSpacing}px`;
    }
  }, [letterSpacing]);

  const handleSave = (format: string) => {
    const element = document.createElement('a');
    let fileContent = '';
    let mimeType = '';
    let fileName = `${documentName}.${format}`;

    switch (format) {
      case 'html':
        fileContent = `<!DOCTYPE html><html><head><title>Document</title></head><body>${content}</body></html>`;
        mimeType = 'text/html';
        break;
      case 'txt':
        fileContent = editorRef.current?.innerText || '';
        mimeType = 'text/plain';
        break;
      case 'doc':
        // Create a proper HTML document that Word can read
        fileContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>${documentName}</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
                <w:DoNotPromptForConvert/>
                <w:DoNotShowInsertionsAndDeletions/>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              @page { margin: 1in; }
              body { font-family: ${fontFamily}; font-size: ${fontSize}pt; }
            </style>
          </head>
          <body>
            ${content}
          </body>
          </html>
        `;
        mimeType = 'application/msword';
        fileName = `${documentName}.doc`;
        break;
      default:
        fileContent = content;
        mimeType = 'text/html';
    }

    const file = new Blob([fileContent], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowSaveDropdown(false);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.log('Print cancelled or failed:', error);
    }
  };

  const handleExport = () => {
    // Create a comprehensive HTML document for PDF conversion
    const printContent = editorRef.current?.innerHTML || content;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentName}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { 
              font-family: ${fontFamily}; 
              font-size: ${fontSize}pt; 
              color: ${textColor};
              letter-spacing: ${letterSpacing}px;
              margin: ${marginSize}in;
              background-color: ${pageColor};
              line-height: 1.6;
            }
            @page { 
              size: ${paperSize} ${orientation}; 
              margin: ${marginSize}in;
            }
            ${watermark ? `
              body::before {
                content: "${watermark}";
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: ${watermarkSize}px;
                color: rgba(0,0,0,0.1);
                z-index: -1;
                pointer-events: none;
              }
            ` : ''}
          }
          body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}pt; 
            color: ${textColor};
            letter-spacing: ${letterSpacing}px;
            margin: ${marginSize}in;
            background-color: ${pageColor};
            line-height: 1.6;
            max-width: none;
          }
          ${watermark ? `
            body::before {
              content: "${watermark}";
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: ${watermarkSize}px;
              color: rgba(0,0,0,0.1);
              z-index: -1;
              pointer-events: none;
            }
          ` : ''}
        </style>
      </head>
      <body>
        ${printContent}
        ${showPageNumbers ? '<div style="position: fixed; bottom: 20px; right: 20px; font-size: 12px;">Page 1</div>' : ''}
      </body>
      </html>
    `;
    
    // Open in new window and trigger print dialog for PDF save
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Close the window after a delay to allow print dialog to open
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
    } else {
      // Fallback: create downloadable HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentName}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('HTML file downloaded! Open it in your browser and use Ctrl+P to save as PDF.');
    }
  };

  const handleShare = () => {
    if (navigator.share && navigator.canShare) {
      navigator.share({
        title: documentName,
        text: editorRef.current?.innerText || '',
        url: window.location.href
      }).catch((error) => {
        console.log('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(editorRef.current?.innerText || '').then(() => {
          alert('Document text copied to clipboard!');
        });
      });
    } else {
      // Fallback: copy document text to clipboard
      navigator.clipboard.writeText(editorRef.current?.innerText || '').then(() => {
        alert('Document text copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy to clipboard. Please select and copy the text manually.');
      });
    }
  };

  const handleHelp = () => {
    alert('Word Processor Help:\n\n• Use toolbar buttons for formatting\n• Ctrl+B for bold, Ctrl+I for italic\n• Ctrl+S to save\n• Ctrl+Z to undo, Ctrl+Y to redo\n• Use drawing tools when Draw mode is enabled');
  };

  const handleCustomFontSize = () => {
    const size = parseInt(customFontSize);
    if (size && size > 0 && size <= 200) {
      setFontSize(size);
      setShowCustomFontSize(false);
      setCustomFontSize('');
    } else {
      alert('Please enter a valid font size between 1 and 200');
    }
  };

  const handleSearch = () => {
    if (searchTerm && editorRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent || '';
        const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (index !== -1) {
          range.setStart(node, index);
          range.setEnd(node, index + searchTerm.length);
          selection?.removeAllRanges();
          selection?.addRange(range);
          break;
        }
      }
    }
  };

  const handleReplace = () => {
    if (searchTerm && editorRef.current) {
      const html = editorRef.current.innerHTML;
      const regex = new RegExp(searchTerm, 'gi');
      const newHtml = html.replace(regex, replaceTerm);
      editorRef.current.innerHTML = newHtml;
      setContent(newHtml);
    }
  };

  const handleCaseChange = (caseType: 'upper' | 'lower' | 'title') => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      let newText = '';
      
      switch (caseType) {
        case 'upper':
          newText = selectedText.toUpperCase();
          break;
        case 'lower':
          newText = selectedText.toLowerCase();
          break;
        case 'title':
          newText = selectedText.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
      }
      
      document.execCommand('insertText', false, newText);
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 2</td>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 3</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 4</td>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 5</td>
          <td style="padding: 8px; border: 1px solid #ccc;">Cell 6</td>
        </tr>
      </table>
    `;
    document.execCommand('insertHTML', false, tableHTML);
  };

  const insertShape = (shape: string) => {
    let shapeHTML = '';
    switch (shape) {
      case 'circle':
        shapeHTML = '<div style="width: 50px; height: 50px; border-radius: 50%; background-color: #0078d4; display: inline-block; margin: 5px;"></div>';
        break;
      case 'square':
        shapeHTML = '<div style="width: 50px; height: 50px; background-color: #0078d4; display: inline-block; margin: 5px;"></div>';
        break;
      case 'triangle':
        shapeHTML = '<div style="width: 0; height: 0; border-left: 25px solid transparent; border-right: 25px solid transparent; border-bottom: 50px solid #0078d4; display: inline-block; margin: 5px;"></div>';
        break;
    }
    document.execCommand('insertHTML', false, shapeHTML);
    setShowShapes(false);
  };

  const insertSymbol = (symbol: string) => {
    document.execCommand('insertText', false, symbol);
    setShowSymbols(false);
  };

  const symbols = ['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '‰', '′', '″', '‹', '›', '«', '»', '"', '"', "'", "'", '–', '—', '¡', '¿', '¢', '£', '¥', '€', '°', '±', '×', '÷', '≠', '≤', '≥', '∞', '∑', '∏', '∂', '∆', '∇', '∈', '∉', '∋', '∅', '∩', '∪', '⊂', '⊃', '⊆', '⊇', '⊕', '⊗', '⊥', '⊤', '⌐', '¬', '∧', '∨', '∀', '∃', '∴', '∵', '∝', '∼', '≅', '≈', '≡', '≢', '⊕', '⊖', '⊗', '⊘', '⊙', '⊚', '⊛', '⊜', '⊝', '⊞', '⊟', '⊠', '⊡', '⊢', '⊣', '⊤', '⊥', '⊦', '⊧', '⊨', '⊩', '⊪', '⊫', '⊬', '⊭', '⊮', '⊯', '⊰', '⊱', '⊲', '⊳', '⊴', '⊵', '⊶', '⊷', '⊸', '⊹', '⊺', '⊻', '⊼', '⊽', '⊾', '⊿', '⋀', '⋁', '⋂', '⋃', '⋄', '⋅', '⋆', '⋇', '⋈', '⋉', '⋊', '⋋', '⋌', '⋍', '⋎', '⋏', '⋐', '⋑', '⋒', '⋓', '⋔', '⋕', '⋖', '⋗', '⋘', '⋙', '⋚', '⋛', '⋜', '⋝', '⋞', '⋟', '⋠', '⋡', '⋢', '⋣', '⋤', '⋥', '⋦', '⋧', '⋨', '⋩', '⋪', '⋫', '⋬', '⋭', '⋮', '⋯', '⋰', '⋱', '⋲', '⋳', '⋴', '⋵', '⋶', '⋷', '⋸', '⋹', '⋺', '⋻', '⋼', '⋽', '⋾', '⋿'];

  const handleZoom = (direction: 'in' | 'out' | 'fit') => {
    if (direction === 'fit') {
      setZoom(100);
    } else if (direction === 'in' && zoom < 200) {
      setZoom(zoom + 10);
    } else if (direction === 'out' && zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const url = URL.createObjectURL(blob);
            const img = `<img src="${url}" style="max-width: 100%; height: auto;" />`;
            document.execCommand('insertHTML', false, img);
          } else if (type === 'text/plain') {
            const text = await clipboardItem.getType(type);
            const textContent = await text.text();
            document.execCommand('insertText', false, textContent);
          }
        }
      }
    } catch (err) {
      // Fallback to regular paste
      document.execCommand('paste');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`border-b px-6 py-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="flex items-center space-x-2">
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Word Processor</h1>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>-</span>
              <button 
                onClick={() => setShowRenameDialog(true)}
                className={`text-lg font-medium hover:text-blue-600 hover:underline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {documentName}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-1 text-sm border rounded hover:bg-opacity-80 ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              onClick={handleShare}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Share
            </button>
            <button 
              onClick={handleHelp}
              className={`px-3 py-1 text-sm border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* File Menu Bar */}
      <div className={`border-b px-6 py-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button 
              className={`flex items-center space-x-1 px-3 py-1 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Save</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSaveDropdown && (
              <div 
                className={`absolute top-full left-0 mt-1 border rounded shadow-lg z-50 min-w-[120px] ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
                onMouseLeave={() => setTimeout(() => setShowSaveDropdown(false), 300)}
              >
                <button 
                  onClick={() => handleSave('html')}
                  className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                >
                  Save as HTML
                </button>
                <button 
                  onClick={() => handleSave('txt')}
                  className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                >
                  Save as TXT
                </button>
                <button 
                  onClick={() => handleSave('doc')}
                  className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                >
                  Save as DOC
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handlePrint}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">Print</span>
          </button>
          <button 
            onClick={handleExport}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className={`border-b px-6 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-6 flex-wrap">
          {/* Font Controls */}
          <div className={`flex items-center space-x-2 border-r pr-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className={`text-sm border rounded px-2 py-1 min-w-[120px] ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="Arial">Arial</option>
              <option value="Arial Black">Arial Black</option>
              <option value="Calibri">Calibri</option>
              <option value="Cambria">Cambria</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Courier New">Courier New</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Impact">Impact</option>
              <option value="Palatino">Palatino</option>
              <option value="Garamond">Garamond</option>
              <option value="Bookman">Bookman</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Lucida Console">Lucida Console</option>
            </select>
            <div className="flex items-center space-x-1">
              <select 
                value={fontSize} 
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomFontSize(true);
                  } else {
                    setFontSize(Number(e.target.value));
                  }
                }}
                className={`text-sm border rounded px-2 py-1 w-20 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              >
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {showCustomFontSize && (
                <div className="flex items-center space-x-1">
                  <input 
                    type="number"
                    min="1"
                    max="200"
                    value={customFontSize}
                    onChange={(e) => setCustomFontSize(e.target.value)}
                    placeholder="Size"
                    className={`text-sm border rounded px-2 py-1 w-16 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    autoFocus
                  />
                  <button 
                    onClick={handleCustomFontSize}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    OK
                  </button>
                  <button 
                    onClick={() => {setShowCustomFontSize(false); setCustomFontSize('');}}
                    className={`px-2 py-1 text-xs border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Text Formatting */}
          <div className={`flex items-center space-x-1 border-r pr-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button 
              onClick={() => handleFormat('bold')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleFormat('italic')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleFormat('underline')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Colors */}
          <div className={`flex items-center space-x-2 border-r pr-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-1">
              <Type className={`w-4 h-4 ${darkMode ? 'text-white' : ''}`} />
              <input 
                type="color" 
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleFormat('foreColor', e.target.value);
                }}
                className="w-6 h-6 border-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Highlighter className={`w-4 h-4 ${darkMode ? 'text-white' : ''}`} />
              <input 
                type="color" 
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  handleFormat('hiliteColor', e.target.value);
                }}
                className="w-6 h-6 border-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-1">
              <PaintBucket className={`w-4 h-4 ${darkMode ? 'text-white' : ''}`} />
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleFormat('backColor', e.target.value);
                }}
                className="w-6 h-6 border-none cursor-pointer"
              />
            </div>
          </div>

          {/* Alignment */}
          <div className={`flex items-center space-x-1 border-r pr-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button 
              onClick={() => handleFormat('justifyLeft')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleFormat('justifyCenter')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleFormat('justifyRight')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleFormat('justifyFull')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Clipboard */}
          <div className={`flex items-center space-x-1 border-r pr-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button 
              onClick={() => document.execCommand('copy')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.execCommand('cut')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button 
              onClick={handlePaste}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => document.execCommand('undo')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.execCommand('redo')}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar */}
      <div className={`border-b px-6 py-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-4 flex-wrap">
          {/* Search & Replace */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
            >
              <Search className="w-4 h-4" />
              <span>Find</span>
            </button>
            <button 
              onClick={() => setShowReplace(!showReplace)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
            >
              <Replace className="w-4 h-4" />
              <span>Replace</span>
            </button>
          </div>

          {/* Case Controls */}
          <div className={`flex items-center space-x-1 border-l pl-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button 
              onClick={() => handleCaseChange('upper')}
              className={`px-2 py-1 text-xs border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-200'}`}
            >
              AA
            </button>
            <button 
              onClick={() => handleCaseChange('lower')}
              className={`px-2 py-1 text-xs border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-200'}`}
            >
              aa
            </button>
            <button 
              onClick={() => handleCaseChange('title')}
              className={`px-2 py-1 text-xs border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-200'}`}
            >
              Aa
            </button>
          </div>

          {/* Insert Tools */}
          <div className={`flex items-center space-x-2 border-l pl-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button 
              onClick={insertTable}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
            >
              <Table className="w-4 h-4" />
              <span>Table</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowShapes(!showShapes)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
              >
                <Shapes className="w-4 h-4" />
                <span>Shapes</span>
              </button>
              {showShapes && (
                <div className={`absolute top-full left-0 mt-1 border rounded shadow-lg z-50 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <button 
                    onClick={() => insertShape('circle')}
                    className={`flex items-center space-x-2 px-3 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Circle className="w-4 h-4" />
                    <span>Circle</span>
                  </button>
                  <button 
                    onClick={() => insertShape('square')}
                    className={`flex items-center space-x-2 px-3 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Square className="w-4 h-4" />
                    <span>Square</span>
                  </button>
                  <button 
                    onClick={() => insertShape('triangle')}
                    className={`flex items-center space-x-2 px-3 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Triangle className="w-4 h-4" />
                    <span>Triangle</span>
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSymbols(!showSymbols)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
              >
                <Hash className="w-4 h-4" />
                <span>Symbols</span>
              </button>
              {showSymbols && (
                <div className={`absolute top-full left-0 mt-1 border rounded shadow-lg z-50 w-64 max-h-48 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <div className="grid grid-cols-8 gap-1 p-2">
                    {symbols.map((symbol, index) => (
                      <button 
                        key={index}
                        onClick={() => insertSymbol(symbol)}
                        className={`p-1 rounded text-center ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className={`flex items-center space-x-2 border-l pl-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button 
              onClick={() => handleZoom('out')}
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-sm font-mono ${darkMode ? 'text-white' : ''}`}>{zoom}%</span>
            <button 
              onClick={() => handleZoom('in')}
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200'}`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleZoom('fit')}
              className={`px-2 py-1 text-xs border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-200'}`}
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className={`border-b px-6 py-3 ${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center space-x-4">
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-3 py-1 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
            <button 
              onClick={handleSearch}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Find
            </button>
            <button 
              onClick={() => setShowSearch(false)}
              className={`px-3 py-1 border rounded text-sm ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Replace Panel */}
      {showReplace && (
        <div className={`border-b px-6 py-3 ${darkMode ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center space-x-4">
            <input 
              type="text"
              placeholder="Find..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-3 py-1 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
            <input 
              type="text"
              placeholder="Replace with..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className={`px-3 py-1 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
            <button 
              onClick={handleReplace}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Replace All
            </button>
            <button 
              onClick={() => setShowReplace(false)}
              className={`px-3 py-1 border rounded text-sm ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Page Layout Controls */}
      <div className={`border-b px-6 py-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`flex items-center space-x-6 text-sm ${darkMode ? 'text-white' : ''}`}>
          <div className="flex items-center space-x-2">
            <label>Margins:</label>
            <select 
              value={marginSize} 
              onChange={(e) => setMarginSize(Number(e.target.value))}
              className={`border rounded px-2 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value={0.5}>Narrow (0.5")</option>
              <option value={1}>Normal (1")</option>
              <option value={1.5}>Wide (1.5")</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label>Size:</label>
            <select 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value)}
              className={`border rounded px-2 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
              <option value="Tabloid">Tabloid</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label>Orientation:</label>
            <select 
              value={orientation} 
              onChange={(e) => setOrientation(e.target.value)}
              className={`border rounded px-2 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label>Page Color:</label>
            <input 
              type="color" 
              value={pageColor}
              onChange={(e) => setPageColor(e.target.value)}
              className={`w-8 h-6 border rounded cursor-pointer ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={showPageNumbers}
              onChange={(e) => setShowPageNumbers(e.target.checked)}
              className="rounded"
            />
            <label>Page Numbers</label>
          </div>
          <div className="flex items-center space-x-2">
            <label>Watermark:</label>
            <input 
              type="text"
              placeholder="Enter watermark text"
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className={`px-2 py-1 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>Watermark Size:</label>
            <input 
              type="range"
              min="12"
              max="120"
              value={watermarkSize}
              onChange={(e) => setWatermarkSize(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-xs">{watermarkSize}px</span>
          </div>
          <div className="flex items-center space-x-2">
            <label>Letter Spacing:</label>
            <input 
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-xs">{letterSpacing}px</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 p-6 overflow-auto">
          <div 
            className="relative mx-auto bg-white shadow-lg"
            style={{
              width: paperSize === 'A4' ? '210mm' : paperSize === 'A3' ? '297mm' : paperSize === 'Letter' ? '8.5in' : paperSize === 'Legal' ? '8.5in' : '11in',
              minHeight: orientation === 'landscape' 
                ? (paperSize === 'A4' ? '210mm' : paperSize === 'A3' ? '297mm' : paperSize === 'Letter' ? '8.5in' : paperSize === 'Legal' ? '8.5in' : '11in')
                : (paperSize === 'A4' ? '297mm' : paperSize === 'A3' ? '420mm' : paperSize === 'Letter' ? '11in' : paperSize === 'Legal' ? '14in' : '17in'),
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              backgroundColor: pageColor,
              padding: `${marginSize}in`,
              position: 'relative',
              ...(orientation === 'landscape' && {
                width: paperSize === 'A4' ? '297mm' : paperSize === 'A3' ? '420mm' : paperSize === 'Letter' ? '11in' : paperSize === 'Legal' ? '14in' : '17in',
                minHeight: paperSize === 'A4' ? '210mm' : paperSize === 'A3' ? '297mm' : paperSize === 'Letter' ? '8.5in' : paperSize === 'Legal' ? '8.5in' : '11in'
              })
            }}
          >
            {/* Watermark */}
            {watermark && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  fontSize: `${watermarkSize}px`,
                  color: 'rgba(0,0,0,0.1)',
                  transform: 'rotate(-45deg)',
                  zIndex: 1
                }}
              >
                {watermark}
              </div>
            )}

            {/* Page Numbers */}
            {showPageNumbers && (
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                Page 1
              </div>
            )}

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-full outline-none relative z-20"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                color: textColor,
                letterSpacing: `${letterSpacing}px`,
                lineHeight: '1.6'
              }}
              onInput={(e) => {
                const target = e.target as HTMLDivElement;
                setContent(target.innerHTML);
                calculateStats(target.innerText || '');
              }}
              placeholder="Start typing your document..."
            />
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Rename Document</h3>
            <input 
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className={`w-full px-3 py-2 border rounded mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              autoFocus
            />
            <div className="flex space-x-2 justify-end">
              <button 
                onClick={() => setShowRenameDialog(false)}
                className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowRenameDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className={`border-t px-6 py-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="flex items-center space-x-6">
            <span>Words: {stats.words}</span>
            <span>Characters: {stats.characters}</span>
            <span>Paragraphs: {stats.paragraphs}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: {zoom}%</span>
            <span>Page 1 of 1</span>
            <span>{paperSize} - {orientation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;