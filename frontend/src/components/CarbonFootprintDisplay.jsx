import React from 'react';
import { useCarbonFootprint } from 'react-carbon-footprint';

/**
 * Small floating widget showing an estimate of this session's network-transfer
 * carbon footprint, using the Sustainable Web Design (SWD) model from CO2.js.
 * Purely informational - for the project report's sustainability section.
 */
function CarbonFootprintDisplay() {
  const [gCO2, bytesTransferred] = useCarbonFootprint();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px 14px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        zIndex: 1000,
        fontSize: '0.75rem',
        maxWidth: '220px',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '0.8rem' }}>Network Carbon Footprint</h3>
      <p style={{ margin: '4px 0' }}>Bytes transferred: {bytesTransferred}</p>
      <p style={{ margin: '4px 0' }}>CO2 emissions: {gCO2.toFixed(2)} g CO2eq</p>
      <p style={{ margin: 0, fontSize: '0.7em', color: '#666' }}>
        (Estimate based on network data transfer during this session)
      </p>
    </div>
  );
}

export default CarbonFootprintDisplay;