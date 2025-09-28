import React from 'react';

// Rich text renderer for blog content
export const renderRichText = (content: string): React.ReactElement[] => {
  // Split content into lines
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let key = 0;
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      // Check if it's a numbered list by looking at the first item's context
      const isNumberedList = listItems.some(item => item.match(/^\d+\.\s/));
      
      if (isNumberedList) {
        elements.push(
          <ol key={key++} className="list-decimal list-inside mb-4 space-y-1">
            {listItems.map((item, index) => (
              <li key={index} className="text-gray-800">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key++} className="list-disc list-inside mb-4 space-y-1">
            {listItems.map((item, index) => (
              <li key={index} className="text-gray-800">
                {item}
              </li>
            ))}
          </ul>
        );
      }
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (inList) {
        flushList();
        inList = false;
      }
      elements.push(<br key={key++} />);
      continue;
    }

    // Handle headers
    if (line.startsWith('# ')) {
      flushList();
      inList = false;
      elements.push(
        <h1 key={key++} className="text-3xl font-bold text-gray-900 mt-8 mb-4">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      inList = false;
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-gray-900 mt-6 mb-3">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      inList = false;
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-gray-900 mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      flushList();
      inList = false;
      elements.push(
        <h4 key={key++} className="text-lg font-semibold text-gray-900 mt-3 mb-2">
          {line.substring(5)}
        </h4>
      );
    } else if (line.startsWith('- ')) {
      // Handle bullet points
      inList = true;
      listItems.push(line.substring(2));
    } else if (line.match(/^\d+\.\s/)) {
      // Handle numbered lists
      inList = true;
      listItems.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Handle bold text
      flushList();
      inList = false;
      elements.push(
        <p key={key++} className="text-gray-800 mb-4 font-semibold">
          {line.substring(2, line.length - 2)}
        </p>
      );
    } else if (line.startsWith('*') && line.endsWith('*')) {
      // Handle italic text
      flushList();
      inList = false;
      elements.push(
        <p key={key++} className="text-gray-800 mb-4 italic">
          {line.substring(1, line.length - 1)}
        </p>
      );
    } else {
      // Regular paragraph
      flushList();
      inList = false;
      elements.push(
        <p key={key++} className="text-gray-800 mb-4 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  // Flush any remaining list items
  flushList();

  return elements;
};