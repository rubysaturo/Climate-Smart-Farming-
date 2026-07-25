import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="page not-found-page">
    <div className="not-found-content">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
