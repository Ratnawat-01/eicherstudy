import React, { useState } from 'react';
import { submitFormData } from '../api';
import { Save, CheckCircle2 } from 'lucide-react';

const attributes = [
  "Fuel mileage",
  "Engine power / pickup",
  "Reliability (fewer breakdowns)",
  "Service network / distance",
  "Spare parts cost & availability",
  "Resale value",
  "Purchase price / EMI",
  "Cabin comfort",
  "Brand trust",
  "Load carrying capacity"
];

function TelephonicForm() {
  const [formData, setFormData] = useState({
    interviewer: '',
    customerName: '',
    phoneNo: '',
    brand: '',
    model: '',
    competitionModel: '',
    role: '',
    yearsRunning: '',
    purchaseReason: '',
    switchedBrand: '',
    switchReason: '',
    breakdowns: '',
    decisionMaker: '',
    ratings: attributes.reduce((acc, attr) => ({ ...acc, [attr]: { importance: '', score: '' } }), {}),
    quote: ''
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
      await submitFormData('telephonic', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reset form
      setFormData({
        interviewer: formData.interviewer, // keep interviewer selected between submissions
        customerName: '', phoneNo: '', brand: '', model: '', competitionModel: '', role: '', yearsRunning: '',
        purchaseReason: '', switchedBrand: '', switchReason: '', breakdowns: '',
        decisionMaker: '', ratings: attributes.reduce((acc, attr) => ({ ...acc, [attr]: { importance: '', score: '' } }), {}),
        quote: ''
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
      
      <h2>Telephonic Interview</h2>
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
                border: `2px solid ${formData.interviewer === name ? 'var(--primary-color)' : 'var(--border-color)'}`,
                background: formData.interviewer === name
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
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
        {/* Quick Background */}
        <div className="form-section">
          <h3>A. Quick Background</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone No.</label>
              <input type="text" name="phoneNo" value={formData.phoneNo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <select name="brand" value={formData.brand} onChange={handleChange} required>
                <option value="">Select Brand</option>
                <option value="Eicher">Eicher</option>
                <option value="Tata">Tata</option>
                <option value="Ashok Leyland">Ashok Leyland</option>
              </select>
            </div>
            <div className="form-group">
              <label>Model Name</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g. Pro 3019" />
            </div>
            <div className="form-group">
              <label>Competition Model</label>
              <input type="text" name="competitionModel" value={formData.competitionModel} onChange={handleChange} required placeholder="e.g. Tata LPT 1916" />
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q1. Role</label>
            <div className="radio-group">
              {['Owner-Operator', 'Fleet Owner', 'Driver'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="role" value={opt} checked={formData.role === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q2. Years running this brand</label>
            <div className="radio-group">
              {['< 1 yr', '1-3 yrs', '3-5 yrs', '5+ yrs'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="yearsRunning" value={opt} checked={formData.yearsRunning === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase Trigger & Switching */}
        <div className="form-section">
          <h3>B. Purchase Trigger & Switching</h3>
          <div className="form-group">
            <label>Q3. Single biggest reason for buying this truck?</label>
            <select name="purchaseReason" value={formData.purchaseReason} onChange={handleChange} required>
              <option value="">Select Reason</option>
              <option value="Old truck broke down">Old truck broke down</option>
              <option value="Business grew">Business grew</option>
              <option value="New route/contract">New route/contract</option>
              <option value="Unhappy with previous truck">Unhappy with previous truck</option>
              <option value="Good offer/discount">Good offer/discount</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Q4. Have you ever switched brands, or considered switching?</label>
            <div className="radio-group">
              {['Yes - switched', 'Yes - considered, didn\'t', 'No'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="switchedBrand" value={opt} checked={formData.switchedBrand === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {(formData.switchedBrand && formData.switchedBrand !== 'No') && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>If Yes, the main reason:</label>
              <select name="switchReason" value={formData.switchReason} onChange={handleChange}>
                <option value="">Select Reason</option>
                <option value="Service/parts issue">Service/parts issue</option>
                <option value="Low mileage">Low mileage</option>
                <option value="Frequent breakdowns">Frequent breakdowns</option>
                <option value="Low resale value">Low resale value</option>
                <option value="Cheaper price">Cheaper price</option>
                <option value="Someone's advice">Someone's advice</option>
              </select>
            </div>
          )}
        </div>

        {/* Reliability Check */}
        <div className="form-section">
          <h3>C. Reliability Check</h3>
          <div className="form-group">
            <label>Q5. Breakdowns or major repairs in the last 1 year?</label>
            <div className="radio-group">
              {['Never', '1-2 times', '3-5 times', '5+ times'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="breakdowns" value={opt} checked={formData.breakdowns === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Influence */}
        <div className="form-section">
          <h3>D. Decision Influence</h3>
          <div className="form-group">
            <label>Q6. Who makes the final decision?</label>
            <div className="radio-group">
              {['Myself alone', 'With driver\'s input', 'With family\'s input'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="decisionMaker" value={opt} checked={formData.decisionMaker === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Rapid Rating */}
        <div className="form-section">
          <h3>E. Rapid Rating</h3>
          <p className="subtitle">Scale 1 to 5 (1 = Lowest, 5 = Highest)</p>
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
                      <select value={formData.ratings[attr].importance} onChange={(e) => handleRatingChange(attr, 'importance', e.target.value)} required>
                        <option value="">-</option>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={formData.ratings[attr].score} onChange={(e) => handleRatingChange(attr, 'score', e.target.value)} required>
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

        {/* Quote */}
        <div className="form-section">
          <h3>G. One-Line Quote + Note</h3>
          <div className="form-group">
            <textarea name="quote" rows="3" value={formData.quote} onChange={handleChange} placeholder="Capture respondent's quote..."></textarea>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <Save size={20} />
          Save Telephonic Data
        </button>
      </form>
    </div>
  );
}

export default TelephonicForm;
