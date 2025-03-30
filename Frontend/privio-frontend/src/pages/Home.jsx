// Home.jsx (pages/Home.jsx)
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, Beer, Users, Gauge, AlertOctagon, FileWarning, Shield, StopCircle, Delete as Helmet, FileCheck, Baby } from 'lucide-react';

const Home = () => {
  const violations = [
    { icon: <Beer className="violation-icon" />, title: "Drunk Driving", penalty: "Rs.10,000 and/or 6 months in prison", repeat: "Rs.15,000 and/or 2 years in prison for repeat offense" },
    { icon: <Users className="violation-icon" />, title: "Overloading Pillion Riders", penalty: "Rs.2,000 plus disqualification of licence", repeat: "Community service for three months" },
    { icon: <Gauge className="violation-icon" />, title: "Over Speeding", penalty: "Rs.1,000 for LMV", repeat: "Rs.2,000 for MMV" },
    { icon: <AlertOctagon className="violation-icon" />, title: "Dangerous Driving", penalty: "First Offense: Rs.1,000 to Rs.5,000, licence seizure, and/or 6 months to 1 year in prison", repeat: "Second Offense: Rs.10,000, licence seizure, and up to 2 years in prison" },
    { icon: <FileWarning className="violation-icon" />, title: "Driving without Licence", penalty: "Rs.5,000", repeat: null },
    { icon: <Shield className="violation-icon" />, title: "Driving without Insurance", penalty: "Rs.2,000 and/or 3 months in prison, community service", repeat: "Rs.4,000 for repeat offense" },
    { icon: <StopCircle className="violation-icon" />, title: "Signal Jumping", penalty: "Rs.1,000 to Rs.5,000, licence seizure, and/or 6 months to 1 year in prison", repeat: null },
    { icon: <Helmet className="violation-icon" />, title: "Riding without Helmet", penalty: "Rs.1,000 plus licence scrapping for three months", repeat: null },
    { icon: <FileCheck className="violation-icon" />, title: "Riding without Permit", penalty: "Up to Rs.10,000 and/or up to 6 months imprisonment", repeat: null },
    { icon: <Baby className="violation-icon" />, title: "Juvenile Driving", penalty: "Rs.25,000 with three years imprisonment", repeat: "Cancellation of registration for 1 year, ineligible for licence until 25 years of age" },
  ];

  return (
    <main className="main-content">
      <div className="content-container">
        <div className="hero-section">
          <h1 className="hero-title">
            PRIVIO<span className="red-dot">.</span>
          </h1>
          <p className="hero-description">
            Help make our roads safer by reporting traffic violations in your area.
            Together we can create a safer community for everyone.
          </p>
          <div className="cta-buttons">
            <Link to="/report-violation" className="cta-button report-button">
              <AlertTriangle className="cta-icon" />
              <span>Report a Violation</span>
            </Link>
            <button className="cta-button learn-button">
              <ChevronDown className="cta-icon" />
              <span>Learn More</span>
            </button>
          </div>
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <h3 className="feature-title">Quick Reporting</h3>
            <p className="feature-description">Submit traffic violation reports easily with our streamlined process.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Anonymous Tips</h3>
            <p className="feature-description">Report violations anonymously to help maintain road safety.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">Follow up on your reported violations and see the impact.</p>
          </div>
        </div>
        <div className="violations-section">
          <h2 className="violations-title">
            Traffic Violations and Penalties<span className="red-dot">.</span>
          </h2>
          <div className="violations-grid">
            {violations.map((violation, index) => (
              <div key={index} className="violation-card">
                <div className="violation-header">
                  {violation.icon}
                  <h3 className="violation-title">{violation.title}</h3>
                </div>
                <div className="violation-details">
                  <p className="penalty">{violation.penalty}</p>
                  {violation.repeat && <p className="repeat-penalty">{violation.repeat}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;