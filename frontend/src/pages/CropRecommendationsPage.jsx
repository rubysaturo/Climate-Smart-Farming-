const recommendations = [
  {
    crop: "Wheat",
    season: "Jun - Sep / Jan - Mar",
    soil: "Well-drained, pH 6.0-7.5",
    tip: "Apply NPK (23:23:0) at planting. Top-dress with CAN at 4-6 weeks. Use certified seed varieties like Kenya Fahari or Pta.",
  },
  {
    crop: "Maize",
    season: "Mar - Jul / Oct - Dec",
    soil: "Rich loam, pH 5.5-7.0",
    tip: "Plant at 75cm x 25cm spacing. Apply DAP at planting and CAN at 4 weeks. Ensure adequate rainfall (>600mm) during growing period.",
  },
  {
    crop: "Soybeans",
    season: "Mar - Jun / Oct - Jan",
    soil: "Well-drained, pH 5.8-6.5",
    tip: "Inoculate seeds with Rhizobium bacteria. Plant at 50cm x 5cm spacing. Intercrop with maize for nitrogen fixation benefits.",
  },
  {
    crop: "Beans",
    season: "Mar - May / Aug - Oct",
    soil: "Moderately fertile, pH 6.0-7.0",
    tip: "Use certified seeds. Apply DAP at planting. Common pests: bean fly and aphids. Harvest when pods turn brown and dry.",
  },
  {
    crop: "Tea",
    season: "Year-round (harvest monthly)",
    soil: "Deep acidic, pH 4.5-5.5",
    tip: "Prune every 3-4 years for rejuvenation. Apply NPK 20:10:10 every 4 months. Ensure drainage to prevent root rot.",
  },
];

const CropRecommendationsPage = () => (
  <div className="page">
    <div className="page-header">
      <h1>Crop Recommendations</h1>
      <p className="page-subtitle">Best practices for major Kenyan crops</p>
    </div>

    <div className="recommendations-grid">
      {recommendations.map((rec, i) => (
        <div key={i} className="card recommendation-card">
          <div className="rec-header">
            <span className="rec-icon">🌾</span>
            <h3>{rec.crop}</h3>
          </div>
          <div className="rec-body">
            <div className="rec-field">
              <strong>Best Season:</strong>
              <span>{rec.season}</span>
            </div>
            <div className="rec-field">
              <strong>Soil Needs:</strong>
              <span>{rec.soil}</span>
            </div>
            <div className="rec-field">
              <strong>Key Tip:</strong>
              <p>{rec.tip}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CropRecommendationsPage;
