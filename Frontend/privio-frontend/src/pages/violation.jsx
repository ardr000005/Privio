import React from 'react';
import { MapPin, User, FileText, Link, CheckCircle } from 'lucide-react';

const ViolationViewer = ({ violation }) => {
  if (!violation || !violation.id) {
    return <p>No violation data available.</p>;
  }

  return (
    <div>
      <h3>Violation #{violation.id} {violation.exists && <CheckCircle />}</h3>
      <p><MapPin /> Location: {violation.location}</p>
      <p><User /> Reporter: {violation.reporter}</p>
      <p><FileText /> Report: {violation.report}</p>
      <p><Link /> Evidence Link: <a href={violation.pinataLink} target="_blank" rel="noopener noreferrer">{violation.pinataLink}</a></p>
      {violation.pinataLink && (
        <iframe 
          src={violation.pinataLink} 
          title="Evidence" 
          width="100%" 
          height="400px" 
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
};

export default ViolationViewer;
