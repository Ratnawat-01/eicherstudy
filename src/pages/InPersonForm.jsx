import React, { useState } from 'react';
import { submitFormData } from '../api';
import { Save, CheckCircle2 } from 'lucide-react';

const attributes = [
  "Fuel economy / mileage",
  "Engine power & pickup (loaded)",
  "Load / payload capacity vs claimed",
  "Reliability — frequency of breakdowns",
  "Engine & gearbox durability (long-term)",
  "Service centre network & distance",
  "Service turnaround time (TAT)",
  "Spare parts availability & cost",
  "Resale value after 3-5 years",
  "On-road purchase price",
  "Finance / EMI flexibility & down payment",
  "Driver cabin comfort & space",
  "Brand trust / reputation",
  "Tyre life & brake performance",
  "Body / chassis strength & load durability"
];

function InPersonForm() {
  const [formData, setFormData] = useState({
    interviewer: '',
    date: '', time: '', interviewerName: '', brand: '', respondentCode: '',
    model: '',
    competitionModel: '',
    reasonOfLossData: '',
    actualReasonOfLoss: '',
    role: '', trucksOwned: '', yearsWithBrand: '', previousBrand: '', truckAge: '', routeType: '', goodsCarried: '', avgKm: '',
    purchaseTrigger: '', triggerOther: '', switchedBrand: '', switchReason: '',
    breakdowns: '', brokenPart: '',
    decisionMaker: '', decisionFocus: '',
    ratings: attributes.reduce((acc, attr) => ({ ...acc, [attr]: { importance: '', score: '' } }), {}),
    verbatimQuote: '', interviewerNote: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (attr, field, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [attr]: { ...prev.ratings[attr], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFormData('in-person', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        interviewer: formData.interviewer, // keep interviewer selected
        date: '', time: '', interviewerName: '', brand: '', respondentCode: '',
        model: '',
        competitionModel: '',
        reasonOfLossData: '', actualReasonOfLoss: '',
        role: '', trucksOwned: '', yearsWithBrand: '', previousBrand: '', truckAge: '', routeType: '', goodsCarried: '', avgKm: '',
        purchaseTrigger: '', triggerOther: '', switchedBrand: '', switchReason: '',
        breakdowns: '', brokenPart: '',
        decisionMaker: '', decisionFocus: '',
        ratings: attributes.reduce((acc, attr) => ({ ...acc, [attr]: { importance: '', score: '' } }), {}),
        verbatimQuote: '', interviewerNote: ''
      });
    } catch (err) {
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <h2>In-Person Field Interview</h2>
      <p className="subtitle">18 – 18.5 Tonne GVW Segment</p>

      {/* Interviewer Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Who is taking this interview? *</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Kartik', 'Harsh'].map(name => (
            <button
              key={name}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, interviewer: name }))}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${formData.interviewer === name ? 'var(--accent-color)' : 'var(--border-color)'}`,
                background: formData.interviewer === name
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))'
                  : 'rgba(255,255,255,0.03)',
                color: formData.interviewer === name ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {name === 'Kartik' ? '👤 Kartik' : '👤 Harsh'}
            </button>
          ))}
        </div>
        {!formData.interviewer && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Please select an interviewer before submitting.</p>}
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} /> Data successfully saved!
        </div>
      )}

      <form onSubmit={(e) => { if (!formData.interviewer) { e.preventDefault(); alert('Please select who is taking the interview (Kartik or Harsh).'); return; } handleSubmit(e); }}>
        {/* Header Section */}
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Time Start/End</label>
              <input type="text" name="time" value={formData.time} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Interviewer Name</label>
              <input type="text" name="interviewerName" value={formData.interviewerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Respondent Code</label>
              <input type="text" name="respondentCode" value={formData.respondentCode} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Brand Being Surveyed</label>
              <select name="brand" value={formData.brand} onChange={handleChange}>
                <option value="">Select Brand</option>
                <option value="Eicher">Eicher</option>
                <option value="Tata">Tata</option>
                <option value="Ashok Leyland">Ashok Leyland</option>
              </select>
            </div>
            <div className="form-group">
              <label>Model Name</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Pro 3019" />
            </div>
          </div>
        </div>

        {/* Respondent Background */}
        <div className="form-section">
          <h3>A. Respondent Background</h3>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Role</label>
            <div className="radio-group">
              {['Owner-Operator', 'Fleet Owner', 'Driver (decision-influencer)'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="role" value={opt} checked={formData.role === opt} onChange={handleChange} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>No. of trucks owned/operated</label>
              <input type="number" name="trucksOwned" value={formData.trucksOwned} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Years with current brand</label>
              <input type="number" name="yearsWithBrand" value={formData.yearsWithBrand} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Previous brand owned (if any)</label>
              <input type="text" name="previousBrand" value={formData.previousBrand} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Competition Model</label>
              <input type="text" name="competitionModel" value={formData.competitionModel} onChange={handleChange} placeholder="e.g. Tata LPT 1916" />
            </div>
            <div className="form-group">
              <label>Truck age (years)</label>
              <input type="number" name="truckAge" value={formData.truckAge} onChange={handleChange} />
            </div>
          </div>

          {/* Loss Reason Fields */}
          <div className="form-grid" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Reason of Loss (in given data)</label>
              <select name="reasonOfLossData" value={formData.reasonOfLossData} onChange={handleChange}>
                <option value="">Select Reason</option>
                <optgroup label="🔴 Competition">
                  <option value="AFTER MARKET ISSUES">AFTER MARKET ISSUES</option>
                  <option value="BLIND SPOT">BLIND SPOT</option>
                  <option value="BRAND IMAGE">BRAND IMAGE</option>
                  <option value="COMPETITION LOYALIST">COMPETITION LOYALIST</option>
                  <option value="DELIVERY TIME">DELIVERY TIME</option>
                  <option value="DISCOUNT - PRICING">DISCOUNT - PRICING</option>
                  <option value="FINANCE ISSUE">FINANCE ISSUE</option>
                  <option value="LOST TO CO DEALER">LOST TO CO DEALER</option>
                  <option value="NETWORK ISSUES">NETWORK ISSUES</option>
                  <option value="PAST PRODUCT EXPERIENCE">PAST PRODUCT EXPERIENCE</option>
                  <option value="SPECIFIC MODEL NOT AVAILAB">SPECIFIC MODEL NOT AVAILAB</option>
                </optgroup>
                <optgroup label="🟡 Non-Competition">
                  <option value="DUPLICATE ENQUIRY">DUPLICATE ENQUIRY</option>
                  <option value="MODEL/FERT CODE CHANGE">MODEL/FERT CODE CHANGE</option>
                  <option value="OTHERS">OTHERS</option>
                  <option value="PURCHASE DEFERRED">PURCHASE DEFERRED</option>
                  <option value="PURCHASED OLD VEHICLE">PURCHASED OLD VEHICLE</option>
                  <option value="REQUIREMENT DROPPED">REQUIREMENT DROPPED</option>
                  <option value="WEAK FINANCE PROFILE">WEAK FINANCE PROFILE</option>
                  <option value="WRONG ALLOCATION">WRONG ALLOCATION</option>
                  <option value="COCO CUTOVER">COCO CUTOVER</option>
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label>Actual Reason of Loss (currently)</label>
              <input type="text" name="actualReasonOfLoss" value={formData.actualReasonOfLoss} onChange={handleChange} placeholder="Enter the actual reason..." />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <label>Primary Route Type</label>
            <div className="radio-group">
              {['Local / City', 'State Highway', 'National Highway', 'Mixed'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="routeType" value={opt} checked={formData.routeType === opt} onChange={handleChange} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Goods typically carried</label>
              <input type="text" name="goodsCarried" value={formData.goodsCarried} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Avg. km run / month</label>
              <input type="number" name="avgKm" value={formData.avgKm} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Purchase Trigger */}
        <div className="form-section">
          <h3>B. Purchase Trigger & Switching Behaviour</h3>
          <div className="form-group">
            <label>Q1. Single biggest trigger for buying THIS truck?</label>
            <select name="purchaseTrigger" value={formData.purchaseTrigger} onChange={handleChange}>
              <option value="">Select Reason</option>
              <option value="Old truck broke down / aged out">Old truck broke down / aged out</option>
              <option value="Business grew, needed more capacity">Business grew, needed more capacity</option>
              <option value="Got a new route / contract">Got a new route / contract</option>
              <option value="Unhappy with previous truck">Unhappy with previous truck</option>
              <option value="Good offer / discount">Good offer / discount</option>
              <option value="Other">Other</option>
            </select>
            {formData.purchaseTrigger === 'Other' && (
              <input type="text" name="triggerOther" placeholder="Specify other..." value={formData.triggerOther} onChange={handleChange} style={{ marginTop: '0.5rem' }} />
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q2. Have you ever switched, or considered switching, your truck brand?</label>
            <div className="radio-group">
              {['Yes — already switched', 'Yes — considered, not done', 'No — never considered'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="switchedBrand" value={opt} checked={formData.switchedBrand === opt} onChange={handleChange} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {(formData.switchedBrand && formData.switchedBrand !== 'No — never considered') && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>If YES, the main reason:</label>
              <select name="switchReason" value={formData.switchReason} onChange={handleChange}>
                <option value="">Select Reason</option>
                <option value="Service / spare parts issue">Service / spare parts issue</option>
                <option value="Low mileage">Low mileage</option>
                <option value="Frequent breakdowns">Frequent breakdowns</option>
                <option value="Low resale value">Low resale value</option>
                <option value="New brand cheaper">New brand cheaper</option>
                <option value="Friend's / driver's advice">Friend's / driver's advice</option>
              </select>
            </div>
          )}
        </div>

        {/* Breakdowns */}
        <div className="form-section">
          <h3>C. Breakdown & Service Experience</h3>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q3. Breakdowns or major service in the last 1 year?</label>
            <div className="radio-group">
              {['Never', '1-2 times', '3-5 times', 'More than 5'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="breakdowns" value={opt} checked={formData.breakdowns === opt} onChange={handleChange} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {(formData.breakdowns && formData.breakdowns !== 'Never') && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Part most often responsible:</label>
              <div className="radio-group">
                {['Engine', 'Gearbox / Clutch', 'Brakes', 'Suspension / Tyres', 'Electrical', 'Body / Chassis'].map(opt => (
                  <label key={opt} className="radio-label">
                    <input type="radio" name="brokenPart" value={opt} checked={formData.brokenPart === opt} onChange={handleChange} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decision-Making */}
        <div className="form-section">
          <h3>D. Decision-Making</h3>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q4. Who takes the final decision when buying a new truck?</label>
            <div className="radio-group">
              {['Myself alone', 'With driver\'s input', 'With family\'s / partner\'s input'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="decisionMaker" value={opt} checked={formData.decisionMaker === opt} onChange={handleChange} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {(formData.decisionMaker && formData.decisionMaker !== 'Myself alone') && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>What do THEY focus on most:</label>
              <div className="radio-group">
                {['Cabin comfort', 'Engine power / pickup', 'Brand name / trust', 'Fuel economy'].map(opt => (
                  <label key={opt} className="radio-label">
                    <input type="radio" name="decisionFocus" value={opt} checked={formData.decisionFocus === opt} onChange={handleChange} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Structured Rating */}
        <div className="form-section">
          <h3>E. Structured Attribute Rating</h3>
          <p className="subtitle">Scale: 1 = Not important / Very poor, 3 = Neutral, 5 = Extremely important / Excellent</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="rating-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Importance (1-5)</th>
                  <th>Brand Score (1-5)</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map(attr => (
                  <tr key={attr}>
                    <td>{attr}</td>
                    <td>
                      <select value={formData.ratings[attr].importance} onChange={(e) => handleRatingChange(attr, 'importance', e.target.value)}>
                        <option value="">-</option>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={formData.ratings[attr].score} onChange={(e) => handleRatingChange(attr, 'score', e.target.value)}>
                        <option value="">-</option>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quotes */}
        <div className="form-section">
          <h3>F. Closing</h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Verbatim Quote Capture</label>
            <textarea name="verbatimQuote" rows="2" value={formData.verbatimQuote} onChange={handleChange} placeholder="One strong, quotable line..."></textarea>
          </div>
          <div className="form-group">
            <label>Interviewer's Note (observation, body language, etc.)</label>
            <textarea name="interviewerNote" rows="2" value={formData.interviewerNote} onChange={handleChange}></textarea>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <Save size={20} />
          Save In-Person Data
        </button>
      </form>
    </div>
  );
}

export default InPersonForm;
